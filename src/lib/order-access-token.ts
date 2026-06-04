import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function getSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET no configurado");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/**
 * Token firmado para ver pedido en éxito de checkout y seguimiento sin sesión.
 */
export function createOrderAccessToken(orderNumber: string, email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${orderNumber}|${normalizedEmail}|${exp}`;
  const sig = signPayload(payload);
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyOrderAccessToken(
  token: string,
  orderNumber: string,
): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 4) return { valid: false };

    const [tokenOrder, email, expStr, sig] = parts;
    const payload = `${tokenOrder}|${email}|${expStr}`;
    const expected = signPayload(payload);

    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    if (tokenOrder !== orderNumber) return { valid: false };
    if (Date.now() > Number(expStr)) return { valid: false };

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}
