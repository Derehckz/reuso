/** Parámetros que Mercado Pago agrega al volver del checkout (back_urls). */
export type MercadoPagoReturnParams = {
  paymentId: string | null;
  collectionStatus: string | null;
  status: string | null;
};

export function parseMercadoPagoReturnParams(
  params: Record<string, string | string[] | undefined>,
): MercadoPagoReturnParams {
  const pick = (key: string) => {
    const v = params[key];
    if (Array.isArray(v)) return v[0] ?? null;
    return v?.trim() || null;
  };

  return {
    paymentId: pick("payment_id") ?? pick("collection_id"),
    collectionStatus: pick("collection_status"),
    status: pick("status"),
  };
}
