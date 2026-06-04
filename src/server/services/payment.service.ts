import type { Order, OrderItem, Payment } from "@/generated/prisma/client";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { prisma } from "@/lib/prisma";
import {
  getPaymentById,
  getPaymentAmount,
  getPaymentOrderId,
  mapMercadoPagoPaymentStatus,
  MercadoPagoError,
  resetMercadoPagoClient,
  resolveOrderStatusFromPayment,
} from "@/lib/mercadopago";
import { loadMercadoPagoConfig } from "@/modules/integrations/mercadopago";
import { isPaidOrderStatus } from "@/lib/order-status-transitions";
import { runAsync } from "@/server/jobs/run-async";
import { markShipmentReadyForLabel } from "@/server/services/shipping.service";
import {
  finalizeInventoryForOrderItems,
  releaseInventoryReservations,
  restockOrderInventoryOnce,
  releaseCouponReservation,
} from "@/server/services/inventory.service";

type OrderWithRelations = Order & {
  items: OrderItem[];
  payment: Payment | null;
};

function buildPaymentNote(payment: PaymentResponse, status: string): string {
  const parts = [
    `MercadoPago #${payment.id}`,
    `estado: ${payment.status}`,
  ];
  if (payment.status_detail) {
    parts.push(`detalle: ${payment.status_detail}`);
  }
  if (payment.payment_method_id) {
    parts.push(`método: ${payment.payment_method_id}`);
  }
  return parts.join(" · ");
}

export type ProcessPaymentResult = {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  skipped: boolean;
};

/**
 * Sincroniza un pago de MercadoPago con la orden local (idempotente).
 */
export async function syncMercadoPagoPayment(
  paymentId: string,
): Promise<ProcessPaymentResult> {
  await loadMercadoPagoConfig();
  resetMercadoPagoClient();

  const payment = await getPaymentById(paymentId);
  const orderId = getPaymentOrderId(payment);

  if (!orderId) {
    throw new MercadoPagoError(
      "El pago no tiene referencia de orden (external_reference)",
      "MISSING_ORDER_REFERENCE",
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });

  if (!order) {
    throw new MercadoPagoError(
      `Orden no encontrada: ${orderId}`,
      "ORDER_NOT_FOUND",
    );
  }

  const mpAmount = getPaymentAmount(payment);
  if (mpAmount > 0 && Math.abs(mpAmount - order.total) > 1) {
    console.warn("[MercadoPago] Monto del pago no coincide con la orden", {
      orderId,
      orderNumber: order.orderNumber,
      expected: order.total,
      received: mpAmount,
      paymentId,
    });
  }

  const paymentStatus = mapMercadoPagoPaymentStatus(payment.status);
  const newOrderStatus = resolveOrderStatusFromPayment(
    paymentStatus,
    order.status,
  );

  const existingExternalId = order.payment?.externalId;
  const isDuplicateApproved =
    order.payment?.status === "APPROVED" &&
    paymentStatus === "APPROVED" &&
    existingExternalId === String(payment.id);

  if (isDuplicateApproved && !newOrderStatus) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus,
      orderStatus: order.status,
      skipped: true,
    };
  }

  const paidAt =
    paymentStatus === "APPROVED"
      ? payment.date_approved
        ? new Date(payment.date_approved)
        : new Date()
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        status: paymentStatus,
        externalId: String(payment.id),
        rawResponse: payment as object,
        paidAt,
      },
      update: {
        externalId: String(payment.id),
        status: paymentStatus,
        rawResponse: payment as object,
        paidAt: paidAt ?? undefined,
      },
    });

    if (paymentStatus === "APPROVED" && order.status === "AWAITING_PAYMENT") {
      await finalizeInventoryForOrderItems(tx, order.items);
    }

    if (
      (paymentStatus === "REJECTED" || paymentStatus === "CANCELLED") &&
      order.status === "AWAITING_PAYMENT"
    ) {
      await releaseInventoryReservations(tx, order.items);
      if (order.couponId) {
        await releaseCouponReservation(tx, order.couponId);
      }
    }

    if (paymentStatus === "REFUNDED" && isPaidOrderStatus(order.status)) {
      await restockOrderInventoryOnce(
        tx,
        order.id,
        order.status,
        order.items,
      );
    }

    if (newOrderStatus) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: newOrderStatus,
          note: buildPaymentNote(payment, paymentStatus),
        },
      });
    }
  });

  if (paymentStatus === "APPROVED") {
    runAsync("markShipmentReadyForLabel", () =>
      markShipmentReadyForLabel(order.id),
    );
  }

  const updated = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    select: { status: true },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus,
    orderStatus: updated.status,
    skipped: false,
  };
}
