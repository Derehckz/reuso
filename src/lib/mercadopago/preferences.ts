import { Preference } from "mercadopago";
import { absoluteUrl } from "@/lib/utils";
import { getMercadoPagoClient } from "./client";
import {
  getMercadoPagoEnvironment,
  resolvePayerEmailForCheckout,
} from "./config";
import { toMercadoPagoError } from "./errors";

export type CheckoutItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
};

export type CheckoutPreferenceResult = {
  preferenceId: string | undefined;
  initPoint: string | undefined;
  sandboxInitPoint: string | undefined;
  checkoutUrl: string | undefined;
  environment: "sandbox" | "production";
};

export function resolveCheckoutUrl(preference: {
  initPoint?: string | null;
  sandboxInitPoint?: string | null;
}): string | undefined {
  const env = getMercadoPagoEnvironment();
  if (env === "sandbox") {
    // Nunca usar init_point en sandbox: redirige a mercadopago.com y provoca
    // bucles con sandbox.mercadopago.cl si hay sesión mezclada.
    const url = preference.sandboxInitPoint ?? undefined;
    if (!url) {
      throw new Error(
        "Mercado Pago no devolvió sandbox_init_point. Verifica credenciales de prueba y MERCADOPAGO_ENV=sandbox.",
      );
    }
    return url;
  }
  return preference.initPoint ?? preference.sandboxInitPoint ?? undefined;
}

export async function createCheckoutPreference(params: {
  orderId: string;
  orderNumber: string;
  items: CheckoutItem[];
  payerEmail: string;
  payerName?: string;
  totalAmount: number;
}): Promise<CheckoutPreferenceResult> {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const env = getMercadoPagoEnvironment();

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const itemsTotal = params.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  if (Math.abs(itemsTotal - params.totalAmount) > 2) {
    throw new Error(
      `Total MP (${itemsTotal}) no coincide con orden (${params.totalAmount})`,
    );
  }

  try {
    const result = await preference.create({
      body: {
        external_reference: params.orderId,
        items: params.items.map((item) => ({
          id: item.id,
          title: item.title.slice(0, 256),
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "CLP",
        })),
        payer: {
          email: resolvePayerEmailForCheckout(params.payerEmail),
          name: params.payerName,
        },
        back_urls: {
          success: absoluteUrl(`/checkout/exito?order=${params.orderNumber}`),
          failure: absoluteUrl(`/checkout/error?order=${params.orderNumber}`),
          pending: absoluteUrl(
            `/checkout/pendiente?order=${params.orderNumber}`,
          ),
        },
        // auto_return en sandbox suele provocar bucles de redirección en MP.
        ...(env === "production" ? { auto_return: "approved" as const } : {}),
        notification_url: absoluteUrl(
          "/api/webhooks/mercadopago?source_news=webhooks",
        ),
        statement_descriptor: "REUSO",
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: expiresAt.toISOString(),
        metadata: {
          order_number: params.orderNumber,
          order_id: params.orderId,
          environment: env,
        },
        binary_mode: false,
      },
    });

    const initPoint = result.init_point;
    const sandboxInitPoint = result.sandbox_init_point;

    return {
      preferenceId: result.id,
      initPoint,
      sandboxInitPoint,
      checkoutUrl: resolveCheckoutUrl({
        initPoint,
        sandboxInitPoint,
      }),
      environment: env,
    };
  } catch (error) {
    throw toMercadoPagoError(error);
  }
}
