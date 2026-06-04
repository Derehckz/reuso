type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Límite en memoria (una instancia). En producción multi-réplica usar Redis. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function rateLimitMessage(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  return `Demasiadas solicitudes. Intenta en ${seconds} segundos.`;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
