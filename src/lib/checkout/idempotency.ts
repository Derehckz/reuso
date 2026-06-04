type Entry = { orderNumber: string; expiresAt: number };

const TTL_MS = 5 * 60_000;
const store = new Map<string, Entry>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

export function rememberCheckoutIdempotency(
  key: string,
  orderNumber: string,
): void {
  prune();
  store.set(key, { orderNumber, expiresAt: Date.now() + TTL_MS });
}

export function lookupCheckoutIdempotency(key: string): string | null {
  prune();
  const entry = store.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.orderNumber;
}
