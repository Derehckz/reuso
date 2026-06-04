import { NextResponse } from "next/server";
import {
  extractWebhookDataId,
  extractWebhookTopic,
  isWebhookMisconfiguredInProduction,
  MercadoPagoError,
  resetMercadoPagoClient,
  shouldEnforceWebhookSignature,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago";
import { loadMercadoPagoConfig } from "@/modules/integrations/mercadopago";
import { syncMercadoPagoPayment } from "@/server/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAYMENT_TOPICS = new Set([
  "payment",
  "payments",
  "payment.updated",
]);

async function handleNotification(request: Request, body: unknown) {
  await loadMercadoPagoConfig();
  resetMercadoPagoClient();

  if (isWebhookMisconfiguredInProduction()) {
    console.error(
      "[MercadoPago Webhook] MERCADOPAGO_WEBHOOK_SECRET requerido en producción",
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const topic = extractWebhookTopic(request, url, body);
  const dataId = extractWebhookDataId(url, body);

  if (!dataId) {
    return NextResponse.json({ received: true, skipped: "no_resource_id" });
  }

  const isPaymentTopic =
    PAYMENT_TOPICS.has(topic.toLowerCase()) ||
    topic === "" ||
    (body &&
      typeof body === "object" &&
      (body as { type?: string }).type === "payment");

  if (!isPaymentTopic) {
    return NextResponse.json({
      received: true,
      skipped: `topic_${topic || "unknown"}`,
    });
  }

  if (shouldEnforceWebhookSignature()) {
    const valid = verifyMercadoPagoWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });

    if (!valid) {
      console.error("[MercadoPago Webhook] Firma inválida", {
        dataId,
        topic,
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }
  } else if (process.env.NODE_ENV === "development") {
    console.warn(
      "[MercadoPago Webhook] Firma no verificada (configura MERCADOPAGO_WEBHOOK_SECRET)",
    );
  } else {
    return NextResponse.json(
      { error: "Signature required" },
      { status: 401 },
    );
  }

  try {
    const result = await syncMercadoPagoPayment(dataId);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof MercadoPagoError) {
      if (error.code === "ORDER_NOT_FOUND") {
        console.error("[MercadoPago Webhook]", error.message, { dataId });
        return NextResponse.json({ received: true, error: error.code });
      }
    }

    console.error("[MercadoPago Webhook] Error procesando pago", {
      dataId,
      error,
    });
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 },
    );
  }
}

/** MercadoPago puede enviar notificaciones vía GET (query) o POST (JSON). */
export async function GET(request: Request) {
  return handleNotification(request, null);
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    body = null;
  }

  return handleNotification(request, body);
}
