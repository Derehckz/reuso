import type { ProductListItem } from "@/types/product";

const DEFAULT_DEMO_SLUG = "camiseta-ac-milan-away-2023";
const DEFAULT_DEMO_COUNT = 5;

function matchesDemoProduct(product: ProductListItem): boolean {
  const haystack = `${product.name} ${product.slug}`.toLowerCase();
  return (
    haystack.includes("ac milan") ||
    haystack.includes("ac-milan") ||
    product.slug === DEFAULT_DEMO_SLUG
  );
}

/** Repite un producto en la fila DESTACADOS del home (solo visualización). */
export function buildFeaturedDemoRow(
  items: ProductListItem[],
  options?: { count?: number; preferSlug?: string },
): ProductListItem[] {
  const count = options?.count ?? DEFAULT_DEMO_COUNT;
  const preferSlug = options?.preferSlug ?? DEFAULT_DEMO_SLUG;

  const source =
    items.find((p) => p.slug === preferSlug) ??
    items.find(matchesDemoProduct) ??
    null;

  if (!source) return items;

  return Array.from({ length: count }, (_, index) => ({
    ...source,
    id: `${source.id}-featured-demo-${index}`,
  }));
}
