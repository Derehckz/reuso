import {
  getResolvedMercadoPagoConfig,
  type MercadoPagoEnvironment,
} from "@/modules/integrations/mercadopago";

export type { MercadoPagoEnvironment };

export function getMercadoPagoEnvironment(): MercadoPagoEnvironment {
  return getResolvedMercadoPagoConfig().environment;
}

export function isMercadoPagoConfigured(): boolean {
  const cfg = getResolvedMercadoPagoConfig();
  return cfg.enabled && Boolean(cfg.accessToken);
}

export function getMercadoPagoAccessToken(): string {
  const token = getResolvedMercadoPagoConfig().accessToken;
  if (!token) {
    throw new MercadoPagoNotConfiguredError();
  }
  return token;
}

export function getMercadoPagoPublicKey(): string | null {
  return getResolvedMercadoPagoConfig().publicKey;
}

export function getMercadoPagoWebhookSecret(): string | null {
  return getResolvedMercadoPagoConfig().webhookSecret;
}

export function shouldEnforceWebhookSignature(): boolean {
  return Boolean(getMercadoPagoWebhookSecret());
}

/** En producción el webhook debe rechazarse si no hay secret configurado. */
export function isWebhookMisconfiguredInProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    !getMercadoPagoWebhookSecret()
  );
}

export class MercadoPagoNotConfiguredError extends Error {
  readonly code = "MERCADOPAGO_NOT_CONFIGURED";

  constructor() {
    super("MERCADOPAGO_ACCESS_TOKEN no configurado");
    this.name = "MercadoPagoNotConfiguredError";
  }
}
