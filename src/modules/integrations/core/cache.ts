import type { ResolvedBlueExpressConfig } from "../blueexpress/resolve";
import type { ResolvedMercadoPagoConfig } from "../mercadopago/resolve";

let mercadoPagoCache: ResolvedMercadoPagoConfig | null = null;
let blueExpressCache: ResolvedBlueExpressConfig | null = null;

export function getCachedMercadoPagoConfig(): ResolvedMercadoPagoConfig | null {
  return mercadoPagoCache;
}

export function setCachedMercadoPagoConfig(
  config: ResolvedMercadoPagoConfig,
): void {
  mercadoPagoCache = config;
}

export function invalidateMercadoPagoConfigCache(): void {
  mercadoPagoCache = null;
}

export function getCachedBlueExpressConfig(): ResolvedBlueExpressConfig | null {
  return blueExpressCache;
}

export function setCachedBlueExpressConfig(
  config: ResolvedBlueExpressConfig,
): void {
  blueExpressCache = config;
}

export function invalidateBlueExpressConfigCache(): void {
  blueExpressCache = null;
}

export function invalidateAllIntegrationCaches(): void {
  invalidateMercadoPagoConfigCache();
  invalidateBlueExpressConfigCache();
}
