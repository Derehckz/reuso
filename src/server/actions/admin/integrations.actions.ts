"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOnly, requirePermission } from "@/lib/auth-admin";
import { quoteShipping } from "@/lib/bluexpress/quotes";
import { resetMercadoPagoClient } from "@/lib/mercadopago/client";
import {
  INTEGRATION_SETTING_KEYS,
  blueExpressAdminFormSchema,
  blueExpressStoredSchema,
  getBlueExpressAdminView,
  invalidateBlueExpressConfigCache,
  invalidateMercadoPagoConfigCache,
  loadBlueExpressConfig,
  loadMercadoPagoConfig,
  mercadoPagoAdminFormSchema,
  mercadoPagoStoredSchema,
  DEFAULT_MERCADOPAGO_STORED,
  DEFAULT_BLUEEXPRESS_STORED,
  getMercadoPagoAdminView,
} from "@/modules/integrations";
import { createPrismaIntegrationStore } from "@/modules/integrations/core/store-prisma";
import { writeAuditLog } from "@/shared/audit/audit.service";

const store = createPrismaIntegrationStore();

function mergeSecret(
  incoming: string | undefined,
  current: string | undefined,
  envSet: boolean,
): string | undefined {
  const next = incoming?.trim();
  if (next) return next;
  if (envSet) return current;
  return current;
}

export async function getIntegrationsOverview() {
  await requirePermission("settings:read");
  const [mp, bx] = await Promise.all([
    getMercadoPagoAdminView(store),
    getBlueExpressAdminView(store),
  ]);
  return { mercadopago: mp, blueexpress: bx };
}

export async function saveMercadoPagoIntegration(formData: FormData) {
  const session = await requireAdminOnly();

  const parsed = mercadoPagoAdminFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { success: false as const, message: "Datos de Mercado Pago inválidos" };
  }

  const raw = await store.get(INTEGRATION_SETTING_KEYS.mercadopago);
  const existing = mercadoPagoStoredSchema.safeParse(raw);
  const prev = existing.success ? existing.data : DEFAULT_MERCADOPAGO_STORED;

  const d = parsed.data;
  const payload = {
    enabled: d.enabled,
    environment: d.environment,
    accessToken: mergeSecret(
      d.accessToken,
      prev.accessToken,
      Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
    ),
    publicKey: mergeSecret(
      d.publicKey,
      prev.publicKey,
      Boolean(process.env.MERCADOPAGO_PUBLIC_KEY?.trim()),
    ),
    webhookSecret: mergeSecret(
      d.webhookSecret,
      prev.webhookSecret,
      Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()),
    ),
  };

  await store.set(INTEGRATION_SETTING_KEYS.mercadopago, payload);
  invalidateMercadoPagoConfigCache();
  resetMercadoPagoClient();

  await writeAuditLog({
    userId: session.user.id,
    action: "integration.update",
    entity: "StoreSetting",
    metadata: { integration: "mercadopago" },
  });

  revalidatePath("/admin/integraciones");
  revalidatePath("/admin/integraciones/mercado-pago");
  return { success: true as const, message: "Mercado Pago guardado" };
}

export async function saveBlueExpressIntegration(formData: FormData) {
  const session = await requireAdminOnly();

  const parsed = blueExpressAdminFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { success: false as const, message: "Datos de Blue Express inválidos" };
  }

  const raw = await store.get(INTEGRATION_SETTING_KEYS.blueexpress);
  const existing = blueExpressStoredSchema.safeParse(raw);
  const prev = existing.success ? existing.data : DEFAULT_BLUEEXPRESS_STORED;

  const d = parsed.data;
  const payload = {
    enabled: d.enabled,
    apiUrl: d.apiUrl.replace(/\/$/, ""),
    apiKey: mergeSecret(
      d.apiKey,
      prev.apiKey,
      Boolean(process.env.BLUEXPRESS_API_KEY?.trim()),
    ),
    accountId: mergeSecret(
      d.accountId,
      prev.accountId,
      Boolean(process.env.BLUEXPRESS_ACCOUNT_ID?.trim()),
    ),
    quotePath: d.quotePath?.trim() || undefined,
    trackingPath: d.trackingPath?.trim() || undefined,
    labelPath: d.labelPath?.trim() || undefined,
    originRegion: d.originRegion,
    originCommune: d.originCommune,
    originRegionCode: d.originRegionCode,
    originName: d.originName?.trim() || undefined,
    originPhone: d.originPhone?.trim() || undefined,
    originStreet: d.originStreet?.trim() || undefined,
  };

  await store.set(INTEGRATION_SETTING_KEYS.blueexpress, payload);
  invalidateBlueExpressConfigCache();

  await writeAuditLog({
    userId: session.user.id,
    action: "integration.update",
    entity: "StoreSetting",
    metadata: { integration: "blueexpress" },
  });

  revalidatePath("/admin/integraciones");
  revalidatePath("/admin/integraciones/blue-express");
  return { success: true as const, message: "Blue Express guardado" };
}

export async function testMercadoPagoIntegration() {
  await requirePermission("settings:read");

  const cfg = await loadMercadoPagoConfig(store);
  resetMercadoPagoClient();

  if (!cfg.enabled) {
    return { success: false as const, message: "Integración desactivada" };
  }
  if (!cfg.accessToken) {
    return {
      success: false as const,
      message: "Falta access token (admin o MERCADOPAGO_ACCESS_TOKEN)",
    };
  }

  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${cfg.accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        success: false as const,
        message: `API respondió ${res.status}: ${text.slice(0, 120)}`,
      };
    }
    const data = (await res.json()) as { id?: number; nickname?: string };
    return {
      success: true as const,
      message: `Conexión OK (${cfg.environment}) — usuario ${data.nickname ?? data.id ?? "?"}`,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Error de red",
    };
  }
}

export async function testBlueExpressIntegration() {
  await requirePermission("settings:read");

  const cfg = await loadBlueExpressConfig(store);

  if (!cfg.enabled) {
    return { success: false as const, message: "Integración desactivada" };
  }
  if (!cfg.apiKey) {
    return {
      success: false as const,
      message: "Falta API key (admin o BLUEXPRESS_API_KEY)",
    };
  }

  try {
    const quote = await quoteShipping({
      originRegion: cfg.origin.region,
      originCommune: cfg.origin.commune,
      destination: {
        region: cfg.origin.region,
        commune: "Providencia",
      },
      weightKg: 1,
      dimensions: { lengthCm: 20, widthCm: 15, heightCm: 10 },
      itemCount: 1,
    });

    if (!quote) {
      return {
        success: false as const,
        message: "Sin cotización (revisa cuenta, rutas API o credenciales)",
      };
    }

    return {
      success: true as const,
      message: `Cotización OK — ${quote.serviceCode} $${quote.price.toLocaleString("es-CL")}`,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Error al cotizar",
    };
  }
}
