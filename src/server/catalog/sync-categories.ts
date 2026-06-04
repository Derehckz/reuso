import type { PrismaClient } from "@/generated/prisma/client";
import { Gender } from "@/generated/prisma/client";
import {
  MAIN_NAV_CATEGORY_SLUGS,
  flattenSubcategoriesForSeed,
  type MainNavCategorySlug,
} from "@/lib/constants/category-subcategories";

const CATEGORY_SEED: Record<
  MainNavCategorySlug,
  { name: string; gender: Gender; sortOrder: number }
> = {
  mujer: { name: "Mujer", gender: Gender.MUJER, sortOrder: 1 },
  hombre: { name: "Hombre", gender: Gender.HOMBRE, sortOrder: 2 },
  "ropa-deportiva": {
    name: "Ropa Deportiva",
    gender: Gender.UNISEX,
    sortOrder: 3,
  },
};

/** Reasigna productos de slugs de subcategoría antiguos al nuevo árbol. */
const LEGACY_SUBCATEGORY_SLUG_MAP: Record<string, string> = {
  "mujer-footwear": "mujer-zapatillas",
  "mujer-bolsos": "mujer-carteras",
  "mujer-jeans": "mujer-pantalones",
  "mujer-sportwear": "ropa-deportiva-otros",
  "hombre-footwear": "hombre-zapatillas",
  "hombre-bolsos": "hombre-jockeys",
  "hombre-sportwear": "ropa-deportiva-otros",
  "hombre-jeans": "hombre-pantalones",
};

export async function syncCategories(prisma: PrismaClient) {
  const categories: Record<MainNavCategorySlug, { id: string; slug: string }> =
    {} as Record<MainNavCategorySlug, { id: string; slug: string }>;

  for (const slug of MAIN_NAV_CATEGORY_SLUGS) {
    const meta = CATEGORY_SEED[slug];
    const row = await prisma.category.upsert({
      where: { slug },
      update: {
        name: meta.name,
        gender: meta.gender,
        sortOrder: meta.sortOrder,
        isActive: true,
        deletedAt: null,
      },
      create: {
        name: meta.name,
        slug,
        gender: meta.gender,
        sortOrder: meta.sortOrder,
      },
    });
    categories[slug] = { id: row.id, slug: row.slug };
  }

  await prisma.category.updateMany({
    where: { slug: "nino" },
    data: { isActive: false },
  });

  const subBySlug: Record<string, { id: string }> = {};

  for (const categorySlug of MAIN_NAV_CATEGORY_SLUGS) {
    const category = categories[categorySlug];
    const flat = flattenSubcategoriesForSeed(categorySlug);
    let sortOrder = 0;

    for (const { name, slug } of flat) {
      sortOrder += 1;
      const sub = await prisma.subcategory.upsert({
        where: { slug },
        update: {
          name,
          categoryId: category.id,
          sortOrder,
          isActive: true,
          deletedAt: null,
        },
        create: {
          categoryId: category.id,
          name,
          slug,
          sortOrder,
        },
      });
      subBySlug[slug] = { id: sub.id };
    }
  }

  for (const [legacySlug, targetSlug] of Object.entries(
    LEGACY_SUBCATEGORY_SLUG_MAP,
  )) {
    const target = subBySlug[targetSlug];
    if (!target) continue;

    await prisma.product.updateMany({
      where: {
        deletedAt: null,
        subcategory: { slug: legacySlug },
      },
      data: { subcategoryId: target.id },
    });
  }

  return { categories, subBySlug };
}
