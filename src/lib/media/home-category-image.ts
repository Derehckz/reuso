import { CATALOG_CATEGORY_HERO } from "@/lib/media/catalog-category-hero";

/** Presets de imagen para el grid de categorías en el home (re-uso.cl). */
export const HOME_CATEGORY_TILE_SPECS = {
  /** Fila superior: MUJER, HOMBRE, POLERONES */
  top: {
    width: 1000,
    height: 1000,
    label: "1000 × 1000 px",
    ratio: "1:1",
    adminAspect: "square" as const,
    hint: "Fila superior del home. Foto vertical con espacio alrededor del modelo (no macro). Formato cuadrado.",
  },
  /** Fila inferior izquierda: BOLSOS / carteras */
  bottomNarrow: {
    width: 600,
    height: 800,
    label: "600 × 800 px",
    ratio: "3:4",
    adminAspect: "square" as const,
    hint: "Columna estrecha del home (BOLSOS). Vertical 3:4, producto centrado.",
  },
  /** Fila inferior derecha: FOOT WEAR / zapatillas */
  bottomWide: {
    width: 1800,
    height: 600,
    label: "1800 × 600 px",
    ratio: "3:1",
    adminAspect: "categoryHero" as const,
    hint: "Columna ancha del home (FOOT WEAR). Panorámica horizontal 3:1.",
  },
} as const;

export type HomeCategoryTileSpecKey = keyof typeof HOME_CATEGORY_TILE_SPECS;

const TOP_SLUGS = new Set(["mujer", "hombre", "ropa-deportiva"]);
const TOP_SUB_SUFFIXES = ["-polerones"];

const NARROW_SLUGS = new Set(["mujer-carteras"]);
const WIDE_SLUGS = new Set(["mujer-zapatillas", "hombre-zapatillas"]);

/** Qué preset de imagen usar en admin según slug de categoría/subcategoría. */
export function homeTileSpecForSlug(slug: string): HomeCategoryTileSpecKey {
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
