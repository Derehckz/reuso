import { prisma } from "@/lib/prisma";

export const STORE_SETTING_KEYS = {
  storeName: "store.name",
  storeEmail: "store.email",
  storePhone: "store.phone",
  socialInstagram: "social.instagram",
  socialFacebook: "social.facebook",
  seoTitle: "seo.title",
  seoDescription: "seo.description",
  analyticsId: "analytics.gaId",
  productAttributesGlobal: "catalog.productAttributes.global",
} as const;

export type StoreSettingKey =
  (typeof STORE_SETTING_KEYS)[keyof typeof STORE_SETTING_KEYS];

export type GlobalProductAttributeSet = {
  color: { label: string; values: string[] };
  size: { label: string; values: string[] };
};

export const DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES: GlobalProductAttributeSet = {
  color: { label: "Color", values: ["Negro", "Blanco"] },
  size: { label: "Talla", values: ["XS", "S", "M", "L", "XL"] },
};

export async function getStoreSettings(keys?: StoreSettingKey[]) {
  const rows = await prisma.storeSetting.findMany({
    where: keys ? { key: { in: keys } } : undefined,
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
    string,
    unknown
  >;
}

export async function upsertStoreSetting(key: string, value: unknown) {
  return prisma.storeSetting.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  });
}

export async function upsertStoreSettings(
  entries: Record<string, unknown>,
) {
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      upsertStoreSetting(key, value),
    ),
  );
}

export async function getGlobalProductAttributes(): Promise<GlobalProductAttributeSet> {
  const rows = await prisma.storeSetting.findUnique({
    where: { key: STORE_SETTING_KEYS.productAttributesGlobal },
    select: { value: true },
  });

  const value = rows?.value as Partial<GlobalProductAttributeSet> | null;
  const normalize = (arr: unknown, fallback: string[]) =>
    Array.isArray(arr)
      ? [...new Set(arr.map((v) => String(v).trim()).filter(Boolean))]
      : fallback;

  return {
    color: {
      label:
        typeof value?.color?.label === "string" && value.color.label.trim()
          ? value.color.label.trim()
          : DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.color.label,
      values: normalize(
        value?.color?.values,
        DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.color.values,
      ),
    },
    size: {
      label:
        typeof value?.size?.label === "string" && value.size.label.trim()
          ? value.size.label.trim()
          : DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.size.label,
      values: normalize(
        value?.size?.values,
        DEFAULT_GLOBAL_PRODUCT_ATTRIBUTES.size.values,
      ),
    },
  };
}
