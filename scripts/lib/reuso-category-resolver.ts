/**
 * Mapea categorías WooCommerce al árbol de https://re-uso.cl/
 * (Mujer / Hombre / Ropa Deportiva + subcategorías en category-subcategories.ts).
 */
import {
  type MainNavCategorySlug,
  MAIN_NAV_CATEGORY_SLUGS,
  flattenSubcategoriesForSeed,
  buildSubcategorySlug,
} from "../../src/lib/constants/category-subcategories";

export type WcCategoryNode = {
  id: number;
  name: string;
  slug: string;
  parent: number;
};

const VALID_SUB_SLUGS = new Set(
  MAIN_NAV_CATEGORY_SLUGS.flatMap((cat) =>
    flattenSubcategoriesForSeed(cat).map((s) => s.slug),
  ),
);

/** Categorías WC que no definen tipo de prenda (solo merchandising). */
const SKIP_CATEGORY_SLUGS = new Set([
  "marcas",
  "marca",
  "best-sellers",
  "bestsellers",
  "best-seller",
  "new-arrivals",
  "nuevos",
  "novedades",
  "destacados",
  "featured",
  "sin-categorizar",
  "uncategorized",
  "otros",
]);

export function buildWcCategoryTree(nodes: WcCategoryNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  function pathFor(id: number): WcCategoryNode[] {
    const path: WcCategoryNode[] = [];
    let cur = byId.get(id);
    const guard = new Set<number>();
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      path.unshift(cur);
      cur = cur.parent ? byId.get(cur.parent) : undefined;
    }
    return path;
  }

  return { byId, pathFor };
}

function pathText(path: WcCategoryNode[]): string {
  return path.map((p) => `${p.name} ${p.slug}`).join(" ").toLowerCase();
}

function detectMainCategory(text: string): MainNavCategorySlug | null {
  if (text.includes("mujer") || text.includes("women")) return "mujer";
  if (text.includes("hombre") || text.includes("men")) return "hombre";
  if (
    text.includes("ropa deportiva") ||
    text.includes("ropa-deportiva") ||
    text.includes("deportiv")
  ) {
    return "ropa-deportiva";
  }
  return null;
}

function resolveRopaDeportiva(text: string): string {
  if (text.includes("basketball") || text.includes("nba")) {
    return "ropa-deportiva-camisetas-basketball";
  }
  if (
    text.includes("fútbol") ||
    text.includes("futbol") ||
    text.includes("soccer")
  ) {
    return "ropa-deportiva-camisetas-futbol";
  }
  if (text.includes("nfl")) {
    return "ropa-deportiva-camisetas-nfl";
  }
  if (text.includes("camiseta") || text.includes("jersey")) {
    return "ropa-deportiva-camisetas-basketball";
  }
  return "ropa-deportiva-otros";
}

function resolveSubSlug(main: MainNavCategorySlug, text: string): string | null {
  if (main === "ropa-deportiva") {
    return resolveRopaDeportiva(text);
  }

  const rules: { match: RegExp | string; subName: string }[] = [
    { match: /zapatilla|sneaker|calzado/, subName: "Zapatillas" },
    { match: /poler[oó]n|hoodie|sudadera/, subName: "Polerones" },
    { match: /polera|remera|t-?shirt|camiseta/, subName: "Poleras" },
    { match: /pantal[oó]n|jean|denim|pantalon/, subName: "Pantalones" },
    { match: /vestido|dress/, subName: "Vestidos" },
    { match: /short/, subName: "Shorts" },
    { match: /chaqueta|abrigo|jacket|bomber|parka|blazer/, subName: "Chaquetas" },
    { match: /jockey|gorro|cap|beanie/, subName: "Jockeys" },
    {
      match: /cartera|bolso|tote|mochila|bag|handbag/,
      subName: "Carteras",
    },
  ];

  for (const { match, subName } of rules) {
    const ok =
      typeof match === "string" ? text.includes(match) : match.test(text);
    if (ok) {
      const slug = buildSubcategorySlug(main, subName);
      if (VALID_SUB_SLUGS.has(slug)) return slug;
    }
  }

  return null;
}

/**
 * Elige la subcategoría reuso más específica a partir de las categorías WC del producto.
 */
export function resolveReusoSubcategorySlug(
  productCategories: { id: number }[],
  tree: ReturnType<typeof buildWcCategoryTree>,
  overrides: Record<string, string> = {},
): string {
  let best: { slug: string; depth: number } | null = null;

  for (const cat of productCategories) {
    const path = tree.pathFor(cat.id);
    if (path.length === 0) continue;

    const leaf = path[path.length - 1];
    if (SKIP_CATEGORY_SLUGS.has(leaf.slug)) continue;

    for (const node of path) {
      const key = node.slug;
      if (overrides[key]) {
        const slug = overrides[key];
        if (VALID_SUB_SLUGS.has(slug)) {
          return slug;
        }
      }
    }

    const text = pathText(path);
    const main = detectMainCategory(text);
    if (!main) continue;

    const subSlug = resolveSubSlug(main, text);
    if (!subSlug || !VALID_SUB_SLUGS.has(subSlug)) continue;

    if (!best || path.length >= best.depth) {
      best = { slug: subSlug, depth: path.length };
    }
  }

  if (best) return best.slug;

  if (overrides.default && VALID_SUB_SLUGS.has(overrides.default)) {
    return overrides.default;
  }

  return "mujer-poleras";
}

/** Marca desde rama «Marcas › Nike» en WooCommerce. */
export function extractBrandFromWcCategories(
  productCategories: { id: number }[],
  tree: ReturnType<typeof buildWcCategoryTree>,
): string | null {
  for (const cat of productCategories) {
    const path = tree.pathFor(cat.id);
    const marcasIdx = path.findIndex(
      (p) => p.slug === "marcas" || p.name.toLowerCase() === "marcas",
    );
    if (marcasIdx >= 0 && path.length > marcasIdx + 1) {
      return path[path.length - 1].name;
    }
  }
  return null;
}

export function listValidSubcategorySlugs(): string[] {
  return [...VALID_SUB_SLUGS].sort();
}
