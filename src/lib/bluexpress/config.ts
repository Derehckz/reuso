import { getResolvedBlueExpressConfig } from "@/modules/integrations/blueexpress";

export function isBluexpressConfigured(): boolean {
  const cfg = getResolvedBlueExpressConfig();
  return cfg.enabled && Boolean(cfg.apiKey?.trim() && cfg.apiUrl?.trim());
}

export function getBluexpressApiUrl(): string {
  return getResolvedBlueExpressConfig().apiUrl.replace(/\/$/, "");
}

export function getBluexpressApiKey(): string | null {
  return getResolvedBlueExpressConfig().apiKey;
}

export function getBluexpressAccountId(): string | null {
  return getResolvedBlueExpressConfig().accountId;
}

/** Origen del almacén / tienda (configurable). */
export function getOriginAddress(): {
  region: string;
  commune: string;
  regionCode: string;
} {
  const origin = getResolvedBlueExpressConfig().origin;
  return {
    region: origin.region,
    commune: origin.commune,
    regionCode: origin.regionCode,
  };
}

export function getBluexpressPickupContact(): {
  fullName: string;
  phone: string;
  street: string;
} {
  const origin = getResolvedBlueExpressConfig().origin;
  return {
    fullName: origin.name,
    phone: origin.phone,
    street: origin.street,
  };
}

export function getLabelEndpoint(): string {
  return getResolvedBlueExpressConfig().labelPath;
}

export function getQuoteEndpoint(): string {
  return getResolvedBlueExpressConfig().quotePath;
}

export function getTrackingEndpoint(): string {
  return getResolvedBlueExpressConfig().trackingPath;
}
