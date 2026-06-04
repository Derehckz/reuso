import {
  getCachedBlueExpressConfig,
  setCachedBlueExpressConfig,
} from "../core/cache";
import { INTEGRATION_SETTING_KEYS } from "../core/keys";
import { pickSecret, secretFieldView } from "../core/secrets";
import type { IntegrationStore, SecretFieldView } from "../core/types";
import { createPrismaIntegrationStore } from "../core/store-prisma";
import { DEFAULT_BLUEEXPRESS_STORED } from "./defaults";
import {
  blueExpressStoredSchema,
  type BlueExpressStoredConfig,
} from "./schema";

export type ResolvedBlueExpressConfig = {
  enabled: boolean;
  apiUrl: string;
  apiKey: string | null;
  accountId: string | null;
  quotePath: string;
  trackingPath: string;
  labelPath: string;
  origin: {
    region: string;
    commune: string;
    regionCode: string;
    name: string;
    phone: string;
    street: string;
  };
};

function pickString(
  stored: string | null | undefined,
  envValue: string | undefined,
  fallback: string,
): string {
  const fromEnv = envValue?.trim();
  if (fromEnv) return fromEnv;
  const fromDb = stored?.trim();
  if (fromDb) return fromDb;
  return fallback;
}

export function resolveBlueExpressFromEnvOnly(): ResolvedBlueExpressConfig {
  const d = DEFAULT_BLUEEXPRESS_STORED;
  return {
    enabled: true,
    apiUrl: pickString(d.apiUrl, process.env.BLUEXPRESS_API_URL, d.apiUrl!),
    apiKey: pickSecret(d.apiKey, process.env.BLUEXPRESS_API_KEY),
    accountId: pickSecret(d.accountId, process.env.BLUEXPRESS_ACCOUNT_ID),
    quotePath: pickString(
      d.quotePath,
      process.env.BLUEXPRESS_QUOTE_PATH,
      d.quotePath!,
    ),
    trackingPath: pickString(
      d.trackingPath,
      process.env.BLUEXPRESS_TRACKING_PATH,
      d.trackingPath!,
    ),
    labelPath: pickString(
      d.labelPath,
      process.env.BLUEXPRESS_LABEL_PATH,
      d.labelPath!,
    ),
    origin: {
      region: pickString(
        d.originRegion,
        process.env.BLUEXPRESS_ORIGIN_REGION,
        d.originRegion!,
      ),
      commune: pickString(
        d.originCommune,
        process.env.BLUEXPRESS_ORIGIN_COMMUNE,
        d.originCommune!,
      ),
      regionCode: pickString(
        d.originRegionCode,
        process.env.BLUEXPRESS_ORIGIN_REGION_CODE,
        d.originRegionCode!,
      ),
      name: pickString(
        d.originName,
        process.env.BLUEXPRESS_ORIGIN_NAME,
        d.originName!,
      ),
      phone: pickString(
        d.originPhone,
        process.env.BLUEXPRESS_ORIGIN_PHONE,
        d.originPhone!,
      ),
      street: pickString(
        d.originStreet,
        process.env.BLUEXPRESS_ORIGIN_STREET,
        d.originStreet!,
      ),
    },
  };
}

export async function resolveBlueExpressConfig(
  store: IntegrationStore = createPrismaIntegrationStore(),
): Promise<ResolvedBlueExpressConfig> {
  const raw = await store.get(INTEGRATION_SETTING_KEYS.blueexpress);
  const parsed = blueExpressStoredSchema.safeParse(raw);
  const stored: BlueExpressStoredConfig = parsed.success
    ? parsed.data
    : DEFAULT_BLUEEXPRESS_STORED;
  const d = DEFAULT_BLUEEXPRESS_STORED;

  return {
    enabled: stored.enabled !== false,
    apiUrl: pickString(
      stored.apiUrl,
      process.env.BLUEXPRESS_API_URL,
      d.apiUrl!,
    ).replace(/\/$/, ""),
    apiKey: pickSecret(stored.apiKey, process.env.BLUEXPRESS_API_KEY),
    accountId: pickSecret(stored.accountId, process.env.BLUEXPRESS_ACCOUNT_ID),
    quotePath: pickString(
      stored.quotePath,
      process.env.BLUEXPRESS_QUOTE_PATH,
      d.quotePath!,
    ),
    trackingPath: pickString(
      stored.trackingPath,
      process.env.BLUEXPRESS_TRACKING_PATH,
      d.trackingPath!,
    ),
    labelPath: pickString(
      stored.labelPath,
      process.env.BLUEXPRESS_LABEL_PATH,
      d.labelPath!,
    ),
    origin: {
      region: pickString(
        stored.originRegion,
        process.env.BLUEXPRESS_ORIGIN_REGION,
        d.originRegion!,
      ),
      commune: pickString(
        stored.originCommune,
        process.env.BLUEXPRESS_ORIGIN_COMMUNE,
        d.originCommune!,
      ),
      regionCode: pickString(
        stored.originRegionCode,
        process.env.BLUEXPRESS_ORIGIN_REGION_CODE,
        d.originRegionCode!,
      ),
      name: pickString(
        stored.originName,
        process.env.BLUEXPRESS_ORIGIN_NAME,
        d.originName!,
      ),
      phone: pickString(
        stored.originPhone,
        process.env.BLUEXPRESS_ORIGIN_PHONE,
        d.originPhone!,
      ),
      street: pickString(
        stored.originStreet,
        process.env.BLUEXPRESS_ORIGIN_STREET,
        d.originStreet!,
      ),
    },
  };
}

export type BlueExpressAdminView = {
  enabled: boolean;
  apiUrl: string;
  accountId: string;
  quotePath: string;
  trackingPath: string;
  labelPath: string;
  originRegion: string;
  originCommune: string;
  originRegionCode: string;
  originName: string;
  originPhone: string;
  originStreet: string;
  apiKey: SecretFieldView;
  status: "ready" | "partial" | "disabled" | "unconfigured";
  envOverrides: {
    apiKey: boolean;
    apiUrl: boolean;
    accountId: boolean;
  };
};

export async function getBlueExpressAdminView(
  store?: IntegrationStore,
): Promise<BlueExpressAdminView> {
  const s = store ?? createPrismaIntegrationStore();
  const raw = await s.get(INTEGRATION_SETTING_KEYS.blueexpress);
  const parsed = blueExpressStoredSchema.safeParse(raw);
  const stored = parsed.success ? parsed.data : DEFAULT_BLUEEXPRESS_STORED;
  const resolved = await resolveBlueExpressConfig(s);

  let status: BlueExpressAdminView["status"] = "unconfigured";
  if (!resolved.enabled) status = "disabled";
  else if (resolved.apiKey && resolved.apiUrl) status = "ready";
  else if (resolved.apiUrl) status = "partial";

  return {
    enabled: stored.enabled !== false,
    apiUrl: resolved.apiUrl,
    accountId: resolved.accountId ?? "",
    quotePath: resolved.quotePath,
    trackingPath: resolved.trackingPath,
    labelPath: resolved.labelPath,
    originRegion: resolved.origin.region,
    originCommune: resolved.origin.commune,
    originRegionCode: resolved.origin.regionCode,
    originName: resolved.origin.name,
    originPhone: resolved.origin.phone,
    originStreet: resolved.origin.street,
    apiKey: secretFieldView(
      resolved.apiKey,
      stored.apiKey,
      process.env.BLUEXPRESS_API_KEY,
    ),
    status,
    envOverrides: {
      apiKey: Boolean(process.env.BLUEXPRESS_API_KEY?.trim()),
      apiUrl: Boolean(process.env.BLUEXPRESS_API_URL?.trim()),
      accountId: Boolean(process.env.BLUEXPRESS_ACCOUNT_ID?.trim()),
    },
  };
}

export async function loadBlueExpressConfig(
  store?: IntegrationStore,
): Promise<ResolvedBlueExpressConfig> {
  const config = await resolveBlueExpressConfig(store);
  setCachedBlueExpressConfig(config);
  return config;
}

export function getResolvedBlueExpressConfig(): ResolvedBlueExpressConfig {
  return getCachedBlueExpressConfig() ?? resolveBlueExpressFromEnvOnly();
}
