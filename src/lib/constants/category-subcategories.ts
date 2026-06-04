import { slugify } from "@/lib/utils";

/**
 * Árbol de categorías alineado con https://re-uso.cl/
 * (Mujer, Hombre, Ropa Deportiva — sin Niño en nav principal).
 */
export type SubcategoryNode =
  | string
  | { readonly name: string; readonly children?: readonly string[] };

export const MAIN_NAV_CATEGORY_SLUGS = [
  "mujer",
  "hombre",
  "ropa-deportiva",
] as const;

export type MainNavCategorySlug = (typeof MAIN_NAV_CATEGORY_SLUGS)[number];

/** Subcategorías por categoría principal (slug → nombres o grupos anidados). */
export const SUBCATEGORIES_BY_CATEGORY: Record<
  MainNavCategorySlug,
  readonly SubcategoryNode[]
> = {
  mujer: [
    "Zapatillas",
    "Poleras",
    "Polerones",
    "Pantalones",
    "Vestidos",
    "Shorts",
    "Chaquetas",
    "Jockeys",
    "Carteras",
  ],
  hombre: [
    "Zapatillas",
    "Poleras",
    "Polerones",
    "Pantalones",
    "Shorts",
    "Chaquetas",
    "Jockeys",
  ],
  "ropa-deportiva": [
    { name: "Camisetas", children: ["Basketball", "Fútbol", "NFL"] },
    "Otros",
  ],
};

export const CATEGORY_DISPLAY_NAMES: Record<MainNavCategorySlug, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  "ropa-deportiva": "Ropa Deportiva",
};

const CATEGORY_GENDER: Record<MainNavCategorySlug, string> = {
  mujer: "MUJER",
  hombre: "HOMBRE",
  "ropa-deportiva": "UNISEX",
};

export function buildSubcategorySlug(
  categorySlug: string,
  subcategoryName: string,
) {
  return `${categorySlug}-${slugify(subcategoryName)}`;
}

/** Slug para subcategorías hijas (ej. Camisetas → Basketball). */
export function buildNestedSubcategorySlug(
  categorySlug: string,
  parentName: string,
  childName: string,
) {
  return buildSubcategorySlug(categorySlug, `${parentName} ${childName}`);
}

export type FlatSubcategorySeed = {
  name: string;
  slug: string;
};

/** Lista plana para seed / admin (incluye hijas de grupos anidados). */
export function flattenSubcategoriesForSeed(
  categorySlug: MainNavCategorySlug,
): FlatSubcategorySeed[] {
  const nodes = SUBCATEGORIES_BY_CATEGORY[categorySlug];
  const result: FlatSubcategorySeed[] = [];

  for (const node of nodes) {
    if (typeof node === "string") {
      result.push({
        name: node,
        slug: buildSubcategorySlug(categorySlug, node),
      });
      continue;
    }

    result.push({
      name: node.name,
      slug: buildSubcategorySlug(categorySlug, node.name),
    });

    for (const child of node.children ?? []) {
      result.push({
        name: child,
        slug: buildNestedSubcategorySlug(categorySlug, node.name, child),
      });
    }
  }

  return result;
}

export type NavSubcategoryItem = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  children?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  }[];
};

export type NavCategoryTree = {
  id: string;
  name: string;
  slug: string;
  gender?: string | null;
  image?: string | null;
  subcategories: NavSubcategoryItem[];
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  gender?: string | null;
  image?: string | null;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  }[];
};

/** Árbol de navegación desde constantes (siempre visible, sin depender de la BD). */
export function buildNavCategoriesFromConstants(): NavCategoryTree[] {
  return MAIN_NAV_CATEGORY_SLUGS.map((categorySlug) => {
    const tree = SUBCATEGORIES_BY_CATEGORY[categorySlug];
    const subcategories: NavSubcategoryItem[] = [];

    for (const node of tree) {
      if (typeof node === "string") {
        const slug = buildSubcategorySlug(categorySlug, node);
        subcategories.push({ id: slug, name: node, slug });
        continue;
      }

      const parentSlug = buildSubcategorySlug(categorySlug, node.name);
      const children = (node.children ?? []).map((childName) => {
        const slug = buildNestedSubcategorySlug(
          categorySlug,
          node.name,
          childName,
        );
        return { id: slug, name: childName, slug };
      });

      subcategories.push({
        id: parentSlug,
        name: node.name,
        slug: parentSlug,
        children: children.length > 0 ? children : undefined,
      });
    }

    return {
      id: categorySlug,
      name: CATEGORY_DISPLAY_NAMES[categorySlug],
      slug: categorySlug,
      gender: CATEGORY_GENDER[categorySlug],
      subcategories,
    };
  });
}

/** Enriquece el árbol de constantes con ids de BD cuando existen. */
export function shapeNavCategories(dbCategories: DbCategory[]): NavCategoryTree[] {
  const fallback = buildNavCategoriesFromConstants();
  if (dbCategories.length === 0) return fallback;

  const bySlug = new Map(dbCategories.map((c) => [c.slug, c]));

  return fallback.map((fb) => {
    const db = bySlug.get(fb.slug);
    if (!db) return fb;

    const subMap = new Map(db.subcategories.map((s) => [s.slug, s]));

    const subcategories = fb.subcategories.map((sub) => {
      const dbSub = subMap.get(sub.slug);
      const children = sub.children?.map(
        (child) => subMap.get(child.slug) ?? child,
      );

      const merged = dbSub ?? sub;
      return {
        ...merged,
        image: dbSub?.image ?? null,
        children:
          children && children.length > 0
            ? children.map((child) => ({
                ...child,
                image:
                  subMap.get(child.slug)?.image ??
                  ("image" in child ? child.image : null) ??
                  null,
              }))
            : undefined,
      };
    });

    return {
      ...fb,
      id: db.id,
      gender: db.gender ?? fb.gender,
      image: db.image ?? null,
      subcategories,
    };
  });
}

export function catalogSubcategoryHref(
  subcategorySlug: string,
  gender?: string | null,
) {
  const params = new URLSearchParams({ categoria: subcategorySlug });
  if (gender) params.set("genero", gender);
  return `/productos?${params.toString()}`;
}

export function catalogCategoryHref(
  categorySlug: string,
  gender?: string | null,
) {
  const params = new URLSearchParams({ categoria: categorySlug });
  if (gender) params.set("genero", gender);
  return `/productos?${params.toString()}`;
}
