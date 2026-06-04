import type { ProductFilters } from "@/types/product";
import type { Gender } from "@/generated/prisma/client";
import { MAIN_NAV_CATEGORY_SLUGS } from "@/lib/constants/category-subcategories";

const GENDER_BY_CATEGORY_ROOT: Record<string, Gender> = {
  mujer: "MUJER",
  hombre: "HOMBRE",
  "ropa-deportiva": "UNISEX",
};

export function inferGenderFromCategorySlug(
  categorySlug: string | undefined,
): Gender | undefined {
  if (!categorySlug) return undefined;

  for (const root of MAIN_NAV_CATEGORY_SLUGS) {
    if (categorySlug === root || categorySlug.startsWith(`${root}-`)) {
      return GENDER_BY_CATEGORY_ROOT[root];
    }
  }

  return undefined;
}

export function buildCatalogSearchParams(
  filters: ProductFilters,
  overrides?: Partial<ProductFilters & { page: number }>,
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("categoria", merged.category);
  if (merged.gender) params.set("genero", merged.gender);
  if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.sizes?.length) params.set("sizes", merged.sizes.join(","));
  if (merged.colors?.length) params.set("colors", merged.colors.join(","));
  if (merged.minPrice !== undefined) params.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice !== undefined) params.set("maxPrice", String(merged.maxPrice));
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));

  return params.toString();
}

export function catalogHref(
  filters: ProductFilters,
  overrides?: Partial<ProductFilters & { page: number }>,
): string {
  const qs = buildCatalogSearchParams(filters, overrides);
  return qs ? `/productos?${qs}` : "/productos";
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

export function parseCatalogParams(
  params: Record<string, string | undefined>,
): ProductFilters {
  const category = params.categoria ?? params.category;
  const genderFromCategory = inferGenderFromCategorySlug(category);
  const page = parsePositiveInt(params.page);

  return {
    q: params.q?.trim() || undefined,
    category,
    gender:
      (params.genero as ProductFilters["gender"]) ?? genderFromCategory,
    sort: (params.sort as ProductFilters["sort"]) ?? "newest",
    sizes: params.sizes?.split(",").filter(Boolean),
    colors: params.colors?.split(",").filter(Boolean),
    minPrice: parsePositiveInt(params.minPrice),
    maxPrice: parsePositiveInt(params.maxPrice),
    page: Math.max(1, page ?? 1),
    limit: 20,
  };
}

export function countActiveFilters(filters: ProductFilters): number {
  let n = 0;
  if (filters.q) n++;
  if (filters.category) n++;
  if (filters.gender) n++;
  if (filters.sizes?.length) n++;
  if (filters.colors?.length) n++;
  if (filters.minPrice !== undefined) n++;
  if (filters.maxPrice !== undefined) n++;
  if (filters.sort && filters.sort !== "newest") n++;
  return n;
}
