import { slugify } from "@/lib/utils";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "cuenta",
  "productos",
  "carrito",
  "checkout",
]);

export function normalizeCategorySlug(raw: string, fallbackName: string): string {
  const slug = (raw.trim() || slugify(fallbackName)).toLowerCase();
  return slug.replace(/[^a-z0-9-]/g, "-").replace(/(^-|-$)/g, "");
}

export function isReservedCategorySlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function validateSlugFormat(slug: string): string | null {
  if (slug.length < 2) return "El slug debe tener al menos 2 caracteres";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Solo minúsculas, números y guiones";
  }
  if (isReservedCategorySlug(slug)) return "Este slug está reservado";
  return null;
}
