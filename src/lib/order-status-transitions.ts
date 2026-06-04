import type { OrderStatus } from "@/generated/prisma/client";

export const PAID_ORDER_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export function isPaidOrderStatus(status: OrderStatus): boolean {
  return PAID_ORDER_STATUSES.includes(status);
}

const ALLOWED: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PAID", "CANCELLED", "PENDING"],
  PAID: ["PROCESSING", "REFUNDED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "REFUNDED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function validateAdminOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): string | null {
  if (from === to) return null;

  if (isPaidOrderStatus(from) && to === "CANCELLED") {
    return "Para pedidos pagados usa el estado Reembolsado, no Cancelado";
  }

  if (
    (from === "AWAITING_PAYMENT" || from === "PENDING") &&
    to === "REFUNDED"
  ) {
    return "No se puede reembolsar un pedido que no fue pagado";
  }

  if (!canTransitionOrderStatus(from, to)) {
    return `No se puede cambiar de ${from} a ${to}`;
  }

  return null;
}
