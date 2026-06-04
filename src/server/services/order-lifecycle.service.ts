import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  finalizeInventoryForOrderItems,
  releaseCouponReservation,
  releaseInventoryReservations,
  reserveCouponAtomic,
  reserveInventoryAtomic,
  restockInventoryItems,
} from "@/server/services/inventory.service";

type Tx = Prisma.TransactionClient;

/** Cancela orden pendiente de pago y libera reservas + cupón. */
export async function cancelAwaitingPaymentOrder(
  orderId: string,
  note = "Orden cancelada",
) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;
    if (order.status !== "AWAITING_PAYMENT" && order.status !== "PENDING") {
      return;
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    await tx.orderStatusHistory.create({
      data: { orderId, status: "CANCELLED", note },
    });

    await releaseInventoryReservations(tx, order.items);
    if (order.couponId) {
      await releaseCouponReservation(tx, order.couponId);
    }
  });
}

export async function expireStaleAwaitingPaymentOrders(
  olderThanHours = 48,
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const stale = await prisma.order.findMany({
    where: {
      status: { in: ["AWAITING_PAYMENT", "PENDING"] },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    take: 200,
  });

  for (const { id } of stale) {
    await cancelAwaitingPaymentOrder(
      id,
      `Cancelada automáticamente tras ${olderThanHours}h sin pago`,
    );
  }

  return stale.length;
}

export {
  reserveInventoryAtomic,
  reserveCouponAtomic,
  finalizeInventoryForOrderItems,
  releaseInventoryReservations,
  restockInventoryItems,
};
