import type { CatalogCategory, CatalogHero } from "@/types/catalog";

type SubcategoryRef = {
  slug: string;
  children?: { slug: string }[];
};

function subcategoryMatches(
  sub: SubcategoryRef,
  currentCategory: string,
): boolean {
  if (sub.slug === currentCategory) return true;
  return sub.children?.some((c) => c.slug === currentCategory) ?? false;
}

export function findCategoryMatch(
  categories: CatalogCategory[],
  categorySlug: string | undefined,
) {
  if (!categorySlug) return null;

  for (const cat of categories) {
    if (cat.slug === categorySlug) {
      return { category: cat, subcategory: null as null };
    }
    for (const sub of cat.subcategories) {
      if (sub.slug === categorySlug) {
        return { category: cat, subcategory: sub };
      }
      const child = sub.children?.find((c) => c.slug === categorySlug);
      if (child) {
        return { category: cat, subcategory: child };
      }
    }
  }
  return null;
}

export function isCategoryFamilyActive(
  cat: CatalogCategory,
  currentCategory: string | null,
) {
  if (!currentCategory) return false;
  if (currentCategory === cat.slug) return true;
  return cat.subcategories.some((s) => subcategoryMatches(s, currentCategory));
}

export function resolveCatalogTitle(
  categories: CatalogCategory[],
  filters: { q?: string; category?: string },
): string {
  if (filters.q) return `“${filters.q}”`;

  const match = findCategoryMatch(categories, filters.category);
  if (!match) return "Catálogo";

  if (match.subcategory) {
    return `${match.category.name} · ${match.subcategory.name}`;
  }
  return match.category.name;
}

/** Hero desde el árbol de nav (fallback si la consulta directa a BD no devuelve imagen). */
export function resolveCatalogHeroFromNav(
  categories: CatalogCategory[],
  categorySlug: string | undefined,
): CatalogHero | null {
  if (!categorySlug) return null;

  const match = findCategoryMatch(categories, categorySlug);
  if (!match) return null;

  if (match.subcategory) {
    return {
      title: match.subcategory.name,
      image: match.subcategory.image ?? match.category.image ?? null,
      eyebrow: match.category.name,
    };
  }

  return {
    title: match.category.name,
    image: match.category.image ?? null,
    eyebrow: null,
  };
}
