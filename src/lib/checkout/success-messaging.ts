import type { OrderStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";

export type CheckoutSuccessCopy = {
  title: string;
  description: string;
  showPaymentPending: boolean;
};

export function getCheckoutSuccessCopy(
  status: OrderStatus,
  orderNumber: string,
  total: number,
): CheckoutSuccessCopy {
  const formattedTotal = formatPrice(total);

  if (status === "AWAITING_PAYMENT" || status === "PENDING") {
    return {
      title: "Pedido registrado",
      description: `Tu pedido ${orderNumber} (${formattedTotal}) está pendiente de pago. Revisa tu correo o completa el pago en Mercado Pago si no terminaste el proceso.`,
      showPaymentPending: true,
    };
  }

  if (status === "CANCELLED") {
    return {
      title: "Pedido cancelado",
      description: `El pedido ${orderNumber} fue cancelado. Si crees que es un error, contáctanos.`,
      showPaymentPending: false,
    };
  }

  return {
    title: "¡Gracias por tu compra!",
    description: `Tu pedido ${orderNumber} fue confirmado. Total: ${formattedTotal}. Te enviaremos novedades por email.`,
    showPaymentPending: false,
  };
}
