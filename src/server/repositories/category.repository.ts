import { prisma } from "@/lib/prisma";
import { isConnectionError } from "@/lib/pg-pool";
import { activeCategory, activeSubcategory } from "@/lib/prisma-soft-delete";
import {
  HOME_CATEGORY_TILES,
  type CategoryTile,
} from "@/lib/constants/category-tiles";
import {
  MAIN_NAV_CATEGORY_SLUGS,
  buildNavCategoriesFromConstants,
  shapeNavCategories,
} from "@/lib/constants/category-subcategories";

const subcategorySelect = {
  where: { ...activeSubcategory },
  orderBy: { sortOrder: "asc" as const },
  select: { id: true, name: true, slug: true, image: true },
};

/** Nav sin tocar la BD — seguro para layout y SSR cuando Postgres no está disponible. */
export function getNavCategoriesFromConstants() {
  return buildNavCategoriesFromConstants();
}

async function loadNavFromDatabase() {
  const categories = await prisma.category.findMany({
    where: {
      ...activeCategory,
      slug: { in: [...MAIN_NAV_CATEGORY_SLUGS] },
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      gender: true,
      image: true,
      subcategories: subcategorySelect,
    },
  });

  return shapeNavCategories(categories);
}

function pickTileImage(
  image: string | null | undefined,
  bannerImage: string | null | undefined,
): string | null {
  return image ?? bannerImage ?? null;
}

async function loadHomeTilesFromDatabase() {
  const categories = await prisma.category.findMany({
    where: {
      ...activeCategory,
      slug: { in: ["mujer", "hombre", "ropa-deportiva"] },
    },
    select: { slug: true, image: true, bannerImage: true },
  });

  const subcategories = await prisma.subcategory.findMany({
    where: {
      ...activeSubcategory,
      slug: { in: ["mujer-polerones", "mujer-carteras", "hombre-zapatillas"] },
    },
    select: { slug: true, image: true, bannerImage: true },
  });

  const categoryImage = new Map(
    categories.map((c) => [c.slug, pickTileImage(c.image, c.bannerImage)]),
  );
  const subcategoryImage = new Map(
    subcategories.map((s) => [s.slug, pickTileImage(s.image, s.bannerImage)]),
  );

  return HOME_CATEGORY_TILES.map((tile) => {
    const categoryFromHref = tile.href.split("categoria=")[1]?.split("&")[0];
    const imageFromCategory = categoryFromHref
      ? categoryImage.get(categoryFromHref)
      : null;
    const imageFromSubcategory = categoryFromHref
      ? subcategoryImage.get(categoryFromHref)
      : null;

    const imageSrc =
      imageFromCategory ?? imageFromSubcategory ?? tile.imageSrc;
    return {
      ...tile,
      imageSrc,
    } satisfies CategoryTile;
  });
}

export const categoryRepository = {
  /**
   * Intenta enriquecer el nav desde BD; si falla la conexión, devuelve constantes
   * sin lanzar error (evita overlay de Next en desarrollo).
   */
  async getNavCategories() {
    try {
      return await loadNavFromDatabase();
    } catch (error) {
      if (isConnectionError(error)) {
        return buildNavCategoriesFromConstants();
      }
      console.warn(
        "[categories] Carga desde BD fallida, usando constantes:",
        error instanceof Error ? error.message : error,
      );
      return buildNavCategoriesFromConstants();
    }
  },

  /** Imagen y título para el hero del catálogo (`?categoria=`). */
  async getCatalogHero(categorySlug: string) {
    try {
      const sub = await prisma.subcategory.findFirst({
        where: {
          slug: categorySlug,
          ...activeSubcategory,
          category: activeCategory,
        },
        select: {
          name: true,
          image: true,
          bannerImage: true,
          category: {
            select: { name: true, image: true, bannerImage: true },
          },
        },
      });

      if (sub) {
        return {
          title: sub.name,
          image:
            sub.bannerImage ??
            sub.image ??
            sub.category.bannerImage ??
            sub.category.image ??
            null,
          eyebrow: sub.category.name,
        };
      }

      const category = await prisma.category.findFirst({
        where: { slug: categorySlug, ...activeCategory },
        select: { name: true, image: true, bannerImage: true },
      });

      if (category) {
        return {
          title: category.name,
          image: category.bannerImage ?? category.image ?? null,
          eyebrow: null,
        };
      }

      return null;
    } catch (error) {
      if (!isConnectionError(error)) {
        console.warn(
          "[categories] getCatalogHero falló:",
          error instanceof Error ? error.message : error,
        );
      }
      return null;
    }
  },

  async getBySlug(slug: string) {
    try {
      return await prisma.category.findFirst({
        where: { slug, ...activeCategory },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          gender: true,
          subcategories: subcategorySelect,
        },
      });
    } catch {
      return null;
    }
  },

  /** Tiles del home con fallback a constantes si faltan imágenes en BD. */
  async getHomeCategoryTiles() {
    try {
      return await loadHomeTilesFromDatabase();
    } catch (error) {
      if (!isConnectionError(error)) {
        console.warn(
          "[categories] Home tiles desde BD falló, usando constantes:",
          error instanceof Error ? error.message : error,
        );
      }
      return HOME_CATEGORY_TILES;
    }
  },
};
