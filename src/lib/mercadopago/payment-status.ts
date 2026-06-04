import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

/** Estados oficiales del recurso Payment en MercadoPago. */
export type MercadoPagoPaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export function mapMercadoPagoPaymentStatus(
  status: string | undefined,
): PaymentStatus {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "cancelled":
      return "CANCELLED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "pending":
    case "in_process":
    case "authorized":
    case "in_mediation":
    default:
      return "PENDING";
  }
}

export function resolveOrderStatusFromPayment(
  paymentStatus: PaymentStatus,
  currentOrderStatus: OrderStatus,
): OrderStatus | null {
  switch (paymentStatus) {
    case "APPROVED":
      if (
        currentOrderStatus === "AWAITING_PAYMENT" ||
        currentOrderStatus === "PENDING"
      ) {
        return "PAID";
      }
      return null;

    case "REJECTED":
    case "CANCELLED":
      if (currentOrderStatus === "AWAITING_PAYMENT") {
        return "CANCELLED";
      }
      return null;

    case "REFUNDED":
      if (
        currentOrderStatus === "PAID" ||
        currentOrderStatus === "PROCESSING"
      ) {
        return "REFUNDED";
      }
      return null;

    case "PENDING":
      if (currentOrderStatus === "PENDING") {
        return "AWAITING_PAYMENT";
      }
      return null;

    default:
      return null;
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    REFUNDED: "Reembolsado",
    CANCELLED: "Cancelado",
  };
  return labels[status];
}

export function orderStatusFromPaymentLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    AWAITING_PAYMENT: "Esperando pago",
    PAID: "Pagado",
    PROCESSING: "En preparación",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status];
}
