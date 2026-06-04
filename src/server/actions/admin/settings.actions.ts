"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOnly, requirePermission } from "@/lib/auth-admin";
import {
  globalProductAttributesSchema,
  storeSettingsSchema,
} from "@/lib/validations/admin-cms";
import {
  DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES,
  STORE_SETTING_KEYS,
  upsertStoreSettings,
} from "@/server/repositories/admin/settings.repository";
import { writeAuditLog } from "@/shared/audit/audit.service";

export async function saveStoreSettings(formData: FormData) {
  const session = await requireAdminOnly();

  const parsed = storeSettingsSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return { success: false as const, message: "Configuración inválida" };
  }

  const d = parsed.data;
  await upsertStoreSettings({
    [STORE_SETTING_KEYS.storeName]: d.storeName,
    [STORE_SETTING_KEYS.storeEmail]: d.storeEmail,
    [STORE_SETTING_KEYS.storePhone]: d.storePhone ?? "",
    [STORE_SETTING_KEYS.socialInstagram]: d.socialInstagram ?? "",
    [STORE_SETTING_KEYS.socialFacebook]: d.socialFacebook ?? "",
    [STORE_SETTING_KEYS.seoTitle]: d.seoTitle ?? "",
    [STORE_SETTING_KEYS.seoDescription]: d.seoDescription ?? "",
    [STORE_SETTING_KEYS.analyticsId]: d.analyticsId ?? "",
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "settings.update",
    entity: "StoreSetting",
    metadata: { keys: Object.values(STORE_SETTING_KEYS) },
  });

  revalidatePath("/admin/configuracion");
  return { success: true as const, message: "Configuración guardada" };
}

export async function saveGlobalProductAttributes(formData: FormData) {
  const session = await requirePermission("attributes:write");
  const parsed = globalProductAttributesSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return { success: false as const, message: "Atributos globales inválidos" };
  }

  const splitValues = (raw: string, fallback: string[]) => {
    const values = [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))];
    return values.length > 0 ? values : fallback;
  };

  const d = parsed.data;
  await upsertStoreSettings({
    [STORE_SETTING_KEYS.productAttributesGlobal]: {
      color: {
        label: d.colorLabel.trim(),
        values: splitValues(
          d.colorValues,
          DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.color.values,
        ),
      },
      size: {
        label: d.sizeLabel.trim(),
        values: splitValues(
          d.sizeValues,
          DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.size.values,
        ),
      },
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "settings.update",
    entity: "StoreSetting",
    metadata: { key: STORE_SETTING_KEYS.productAttributesGlobal },
  });

  revalidatePath("/admin/atributos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/admin/productos");
  return { success: true as const, message: "Atributos globales guardados" };
}
