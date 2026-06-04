import { createHmac, timingSafeEqual } from "crypto";
import { getMercadoPagoWebhookSecret } from "./config";

export type WebhookSignatureInput = {
  xSignature: string | null;
  xRequestId: string | null;
  /** `data.id` del query string o body (payment id, etc.) */
  dataId: string | null;
};

function parseXSignature(header: string): { ts: string | null; v1: string | null } {
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of header.split(",")) {
    const [key, ...rest] = part.split("=");
    const value = rest.join("=").trim();
    const k = key?.trim();
    if (k === "ts") ts = value;
    if (k === "v1") v1 = value;
  }

  return { ts, v1 };
}

function buildSignatureManifest(input: WebhookSignatureInput): string {
  const parts: string[] = [];

  if (input.dataId) {
    const id = /^[a-z]/i.test(input.dataId)
      ? input.dataId.toLowerCase()
      : input.dataId;
    parts.push(`id:${id}`);
  }
  if (input.xRequestId) {
    parts.push(`request-id:${input.xRequestId}`);
  }
  const { ts } = input.xSignature
    ? parseXSignature(input.xSignature)
    : { ts: null };
  if (ts) {
    parts.push(`ts:${ts}`);
  }

  return parts.length > 0 ? `${parts.join(";")};` : "";
}

/**
 * Valida la firma HMAC-SHA256 del header `x-signature` según documentación MP.
 * @see https://www.mercadopago.cl/developers/en/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoWebhookSignature(
  input: WebhookSignatureInput,
): boolean {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) return false;

  const { v1 } = input.xSignature
    ? parseXSignature(input.xSignature)
    : { v1: null };

  if (!v1) return false;

  const manifest = buildSignatureManifest(input);
  if (!manifest) return false;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const a = Buffer.from(v1, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function extractWebhookDataId(
  url: URL,
  body: unknown,
): string | null {
  const fromQuery =
    url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (fromQuery) return fromQuery;

  if (body && typeof body === "object") {
    const b = body as { data?: { id?: string | number }; id?: string | number };
    const id = b.data?.id ?? b.id;
    if (id != null) return String(id);
  }

  return null;
}

export function extractWebhookTopic(
  request: Request,
  url: URL,
  body: unknown,
): string {
  const fromHeader = request.headers.get("x-topic");
  if (fromHeader) return fromHeader;

  const fromQuery =
    url.searchParams.get("topic") ?? url.searchParams.get("type");
  if (fromQuery) return fromQuery;

  if (body && typeof body === "object") {
    const b = body as { type?: string; action?: string; topic?: string };
    return b.type ?? b.action ?? b.topic ?? "";
  }

  return "";
}
