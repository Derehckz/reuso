import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export const orderRepository = {
  findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        guestEmail: true,
        userId: true,
        payment: { select: { status: true } },
      },
    });
  },

  findByOrderNumberWithShipment(code: string) {
    const normalized = code.trim().toUpperCase();
    return prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: normalized },
          { orderNumber: code.trim() },
          { shipment: { trackingNumber: code.trim() } },
        ],
      },
      include: { shipment: true },
    });
  },

  findForAccount(userId: string, options?: { limit?: number }) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        shipment: {
          select: { trackingNumber: true, status: true },
        },
      },
    });
  },

  findByIdForUser(orderId: string, userId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
  },

  matchesGuestEmail(
    order: { guestEmail: string | null; userId: string | null },
    email: string,
  ): boolean {
    if (!order.guestEmail) return false;
    return order.guestEmail.toLowerCase() === email.toLowerCase().trim();
  },
};

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    AWAITING_PAYMENT: "Pendiente de pago",
    PAID: "Pagado",
    PROCESSING: "En preparación",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] ?? status;
}
