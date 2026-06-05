import { CATALOG_CATEGORY_HERO } from "@/lib/media/catalog-category-hero";

/** Presets de imagen para el grid de categorías en el home (re-uso.cl). */
export const HOME_CATEGORY_TILE_SPECS = {
  /** Fila superior: MUJER, HOMBRE, NIÑOS */
  top: {
    width: 800,
    height: 800,
    label: "800 × 800 px",
    ratio: "1:1",
    adminAspect: "square" as const,
    hint: "Fila superior del home (3 columnas). Cuadrada, con margen alrededor del sujeto.",
  },
  /** Fila inferior lateral: SPORT WEAR o BOLSOS */
  bottomNarrow: {
    width: 800,
    height: 800,
    label: "800 × 800 px",
    ratio: "1:1",
    adminAspect: "square" as const,
    hint: "Columnas laterales del home (SPORT WEAR, BOLSOS). Cuadrada.",
  },
  /** Fila inferior centro: FOOT WEAR */
  bottomWide: {
    width: 1200,
    height: 600,
    label: "1200 × 600 px",
    ratio: "2:1",
    adminAspect: "categoryHero" as const,
    hint: "Columna central ancha del home (FOOT WEAR). Horizontal 2:1.",
  },
} as const;

export type HomeCategoryTileSpecKey = keyof typeof HOME_CATEGORY_TILE_SPECS;

const TOP_SLUGS = new Set(["mujer", "hombre"]);
const TOP_SUB_SUFFIXES = ["-polerones"];

const NARROW_SLUGS = new Set(["mujer-carteras"]);
const WIDE_SLUGS = new Set(["mujer-zapatillas", "hombre-zapatillas"]);

/** Qué preset de imagen usar en admin según slug de categoría/subcategoría. */
export function homeTileSpecForSlug(slug: string): HomeCategoryTileSpecKey {
  if (slug === "ropa-deportiva") return "bottomNarrow";
  if (NARROW_SLUGS.has(slug)) return "bottomNarrow";
  if (WIDE_SLUGS.has(slug)) return "bottomWide";
  if (TOP_SLUGS.has(slug)) return "top";
  if (TOP_SUB_SUFFIXES.some((s) => slug.endsWith(s))) return "top";
  if (slug.includes("carteras") || slug.includes("bolsos")) return "bottomNarrow";
  if (slug.includes("zapatillas") || slug.includes("calzado")) return "bottomWide";
  return "top";
}

export function catalogBannerSpec() {
  return {
    ...CATALOG_CATEGORY_HERO,
    hint: "Solo hero de /productos?categoria=… No afecta el grid del inicio si ya subiste imagen principal.",
  };
}
