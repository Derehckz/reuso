import { parseMercadoPagoReturnParams } from "@/lib/mercadopago/return-params";
import {
  syncMercadoPagoPayment,
  type ProcessPaymentResult,
} from "@/server/services/payment.service";

export type CheckoutReturnSync = {
  attempted: boolean;
  result: ProcessPaymentResult | null;
  mpStatus: string | null;
};

/**
 * Al volver de Checkout Pro, MP envía payment_id en la URL.
 * En sandbox el webhook a veces no llega; sincronizamos aquí también.
 */
export async function syncOrderFromMercadoPagoReturn(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CheckoutReturnSync> {
  const { paymentId, collectionStatus, status } =
    parseMercadoPagoReturnParams(searchParams);

  if (!paymentId) {
    return { attempted: false, result: null, mpStatus: collectionStatus ?? status };
  }

  try {
    const result = await syncMercadoPagoPayment(paymentId);
    return {
      attempted: true,
      result,
      mpStatus: collectionStatus ?? status ?? result.paymentStatus,
    };
  } catch (error) {
    console.warn("[checkout-return] No se pudo sincronizar pago MP", {
      paymentId,
      error: error instanceof Error ? error.message : error,
    });
    return {
      attempted: true,
      result: null,
      mpStatus: collectionStatus ?? status,
    };
  }
}
