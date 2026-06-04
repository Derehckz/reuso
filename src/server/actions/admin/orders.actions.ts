"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-admin";
import { orderStatusSchema } from "@/lib/validations/admin";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  finalizeInventoryForOrderItems,
  releaseCouponReservation,
  releaseInventoryReservations,
  restockOrderInventoryOnce,
} from "@/server/services/inventory.service";
import {
  isPaidOrderStatus,
  validateAdminOrderTransition,
} from "@/lib/order-status-transitions";
import { writeAuditLog } from "@/shared/audit/audit.service";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await requirePermission("orders:write");

  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false as const, message: "Estado inválido" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    return { success: false as const, message: "Orden no encontrada" };
  }

  const nextStatus = parsed.data;
  const transitionError = validateAdminOrderTransition(order.status, nextStatus);
  if (transitionError) {
    return { success: false as const, message: transitionError };
  }

  const wasPaid = isPaidOrderStatus(order.status);
  const willCancel =
    nextStatus === "CANCELLED" &&
    (order.status === "AWAITING_PAYMENT" || order.status === "PENDING");
  const willRefund = nextStatus === "REFUNDED" && wasPaid;
  const willPay =
    nextStatus === "PAID" &&
    (order.status === "AWAITING_PAYMENT" || order.status === "PENDING");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    if (willPay) {
      await tx.payment.updateMany({
        where: { orderId },
        data: { status: "APPROVED", paidAt: new Date() },
      });
    }
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: nextStatus,
        note: "Actualizado desde panel admin",
      },
    });

    if (willPay) {
      await finalizeInventoryForOrderItems(tx, order.items);
    }

    if (willCancel) {
      await releaseInventoryReservations(tx, order.items);
      if (order.couponId) {
        await releaseCouponReservation(tx, order.couponId);
      }
    }

    if (willRefund) {
      await restockOrderInventoryOnce(
        tx,
        orderId,
        order.status,
        order.items,
      );
    }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "order.status_update",
    entity: "Order",
    entityId: orderId,
    metadata: { from: order.status, to: nextStatus },
  });

  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/inventario");
  return { success: true as const };
}
