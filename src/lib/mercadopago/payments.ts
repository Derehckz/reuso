import { Payment } from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { getMercadoPagoClient } from "./client";
import { toMercadoPagoError } from "./errors";

export async function getPaymentById(
  paymentId: string,
): Promise<PaymentResponse> {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);

  try {
    return await payment.get({ id: paymentId });
  } catch (error) {
    throw toMercadoPagoError(error);
  }
}

export function getPaymentAmount(payment: PaymentResponse): number {
  return Math.round(payment.transaction_amount ?? 0);
}

export function getPaymentOrderId(payment: PaymentResponse): string | null {
  return payment.external_reference ?? null;
}
