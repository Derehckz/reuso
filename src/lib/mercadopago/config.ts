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

/**
 * Email del comprador de prueba (panel MP → Cuentas de prueba → Comprador).
 * En sandbox evita bucles en /login/ si el cliente puso su email real en checkout.
 */
export function getMercadoPagoSandboxPayerEmail(): string | null {
  const email = process.env.MERCADOPAGO_SANDBOX_PAYER_EMAIL?.trim();
  return email || null;
}

/** En sandbox solo enviamos payer si hay email de comprador de prueba explícito. */
export function buildPayerForPreference(params: {
  payerEmail: string;
  payerName?: string;
}): { email: string; name?: string } | undefined {
  if (getMercadoPagoEnvironment() === "sandbox") {
    const testEmail = getMercadoPagoSandboxPayerEmail();
    if (!testEmail) return undefined;
    return { email: testEmail };
  }
  return {
    email: params.payerEmail,
    name: params.payerName,
  };
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
