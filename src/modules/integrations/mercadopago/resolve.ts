import {
  getCachedMercadoPagoConfig,
  setCachedMercadoPagoConfig,
} from "../core/cache";
import { INTEGRATION_SETTING_KEYS } from "../core/keys";
import { pickSecret, secretFieldView } from "../core/secrets";
import type { IntegrationStore, SecretFieldView } from "../core/types";
import { createPrismaIntegrationStore } from "../core/store-prisma";
import { DEFAULT_MERCADOPAGO_STORED } from "./defaults";
import {
  mercadoPagoStoredSchema,
  type MercadoPagoEnvironment,
  type MercadoPagoStoredConfig,
} from "./schema";

export type ResolvedMercadoPagoConfig = {
  enabled: boolean;
  environment: MercadoPagoEnvironment;
  accessToken: string | null;
  publicKey: string | null;
  webhookSecret: string | null;
};

function inferEnvironmentFromToken(token: string | null): MercadoPagoEnvironment {
  if (token?.startsWith("TEST-")) return "sandbox";
  return "production";
}

function resolveEnvironment(
  stored: MercadoPagoStoredConfig,
  accessToken: string | null,
): MercadoPagoEnvironment {
  const explicitEnv = process.env.MERCADOPAGO_ENV?.toLowerCase();
  if (explicitEnv === "sandbox" || explicitEnv === "production") {
    return explicitEnv;
  }
  if (stored.environment) return stored.environment;
  return inferEnvironmentFromToken(accessToken);
}

export function resolveMercadoPagoFromEnvOnly(): ResolvedMercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || null;
  return {
    enabled: true,
    environment: resolveEnvironment(DEFAULT_MERCADOPAGO_STORED, accessToken),
    accessToken,
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY?.trim() || null,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || null,
  };
}

export async function resolveMercadoPagoConfig(
  store: IntegrationStore = createPrismaIntegrationStore(),
): Promise<ResolvedMercadoPagoConfig> {
  const raw = await store.get(INTEGRATION_SETTING_KEYS.mercadopago);
  const parsed = mercadoPagoStoredSchema.safeParse(raw);
  const stored = parsed.success ? parsed.data : DEFAULT_MERCADOPAGO_STORED;

  const accessToken = pickSecret(
    stored.accessToken,
    process.env.MERCADOPAGO_ACCESS_TOKEN,
  );
  const publicKey = pickSecret(
    stored.publicKey,
    process.env.MERCADOPAGO_PUBLIC_KEY,
  );
  const webhookSecret = pickSecret(
    stored.webhookSecret,
    process.env.MERCADOPAGO_WEBHOOK_SECRET,
  );

  return {
    enabled: stored.enabled !== false,
    environment: resolveEnvironment(stored, accessToken),
    accessToken,
    publicKey,
    webhookSecret,
  };
}

export type MercadoPagoAdminView = {
  enabled: boolean;
  environment: MercadoPagoEnvironment;
  publicKey: string;
  accessToken: SecretFieldView;
  webhookSecret: SecretFieldView;
  status: "ready" | "partial" | "disabled" | "unconfigured";
  envOverrides: {
    accessToken: boolean;
    publicKey: boolean;
    webhookSecret: boolean;
    environment: boolean;
  };
};

export async function getMercadoPagoAdminView(
  store?: IntegrationStore,
): Promise<MercadoPagoAdminView> {
  const s = store ?? createPrismaIntegrationStore();
  const raw = await s.get(INTEGRATION_SETTING_KEYS.mercadopago);
  const parsed = mercadoPagoStoredSchema.safeParse(raw);
  const stored = parsed.success ? parsed.data : DEFAULT_MERCADOPAGO_STORED;
  const resolved = await resolveMercadoPagoConfig(s);

  let status: MercadoPagoAdminView["status"] = "unconfigured";
  if (!resolved.enabled) status = "disabled";
  else if (resolved.accessToken) status = "ready";
  else if (resolved.publicKey) status = "partial";

  return {
    enabled: stored.enabled !== false,
    environment: resolved.environment,
    publicKey: resolved.publicKey ?? "",
    accessToken: secretFieldView(
      resolved.accessToken,
      stored.accessToken,
      process.env.MERCADOPAGO_ACCESS_TOKEN,
    ),
    webhookSecret: secretFieldView(
      resolved.webhookSecret,
      stored.webhookSecret,
      process.env.MERCADOPAGO_WEBHOOK_SECRET,
    ),
    status,
    envOverrides: {
      accessToken: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
      publicKey: Boolean(process.env.MERCADOPAGO_PUBLIC_KEY?.trim()),
      webhookSecret: Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()),
      environment: Boolean(process.env.MERCADOPAGO_ENV?.trim()),
    },
  };
}

export async function loadMercadoPagoConfig(
  store?: IntegrationStore,
): Promise<ResolvedMercadoPagoConfig> {
  const config = await resolveMercadoPagoConfig(store);
  setCachedMercadoPagoConfig(config);
  return config;
}

export function getResolvedMercadoPagoConfig(): ResolvedMercadoPagoConfig {
  return getCachedMercadoPagoConfig() ?? resolveMercadoPagoFromEnvOnly();
}
