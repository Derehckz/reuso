/** Valida que exista destino antes de cotizar o crear la orden. */
export function assertCheckoutShippingDestination(
  region: string | undefined,
  commune: string | undefined,
): void {
  if (!region?.trim() || !commune?.trim()) {
    throw new Error("Región y comuna son obligatorias para calcular el envío");
  }
}
