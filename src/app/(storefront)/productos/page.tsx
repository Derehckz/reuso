import { Suspense } from "react";
import type { Metadata } from "next";
import { productRepository } from "@/server/repositories/product.repository";
import { parseCatalogParams, buildCatalogSearchParams } from "@/lib/catalog-url";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { CatalogView } from "@/components/catalog/catalog-view";
import { CatalogJsonLd } from "@/components/catalog/catalog-json-ld";
import { CatalogPageSkeleton } from "@/components/catalog/catalog-page-skeleton";
import { BrandStrip } from "@/components/home/brand-strip";
import {
  resolveCatalogHeroFromNav,
  resolveCatalogTitle,
} from "@/lib/catalog-category";
import type { CatalogHero } from "@/types/catalog";
import { categoryRepository } from "@/server/repositories/category.repository";
import { getCategorySeoBySlug } from "@/server/repositories/admin/categories.repository";

export const revalidate = 60;

function isCategoryCatalogPage(filters: ReturnType<typeof parseCatalogParams>) {
  if (filters.q) return false;
  return Boolean(filters.category || filters.gender);
}

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseCatalogParams(params);
  const qs = buildCatalogSearchParams(filters);

  let title = "Catálogo";
  let description =
    "Explora ropa reutilizada americana premium. Piezas curadas, estado excelente y estilo editorial.";

  if (filters.q) {
    title = `Buscar: ${filters.q}`;
    description = `Resultados para "${filters.q}" en ${siteConfig.name}. Moda reutilizada de alta calidad.`;
  } else if (filters.category) {
    const [categories, seo] = await Promise.all([
      productRepository.getCatalogCategories(),
      getCategorySeoBySlug(filters.category),
    ]);
    title = seo?.metaTitle?.trim() || resolveCatalogTitle(categories, filters);
    description =
      seo?.metaDescription?.trim() ||
      seo?.shortDescription?.trim() ||
      `Colección ${resolveCatalogTitle(categories, filters)} — ropa reutilizada seleccionada en ${siteConfig.name}.`;
  }

  const canonical = qs
    ? absoluteUrl(`/productos?${qs}`)
    : absoluteUrl("/productos");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonical,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filters = parseCatalogParams(searchParams);

  const [catalog, filterOptions, categories] = await Promise.all([
    productRepository.findMany(filters),
    productRepository.getFilterOptions({
      gender: filters.gender,
      category: filters.category,
    }),
    productRepository.getCatalogCategories(),
  ]);

  const title = resolveCatalogTitle(categories, filters);

  let hero: CatalogHero | null = filters.category
    ? await categoryRepository.getCatalogHero(filters.category)
    : null;
  if (filters.category && hero && !hero.image) {
    const fromNav = resolveCatalogHeroFromNav(categories, filters.category);
    if (fromNav?.image) {
      hero = { ...hero, image: fromNav.image };
    }
  }
  if (filters.category && !hero) {
    hero = resolveCatalogHeroFromNav(categories, filters.category);
  }

  const showBrandStrip = isCategoryCatalogPage(filters);

  return (
    <>
      <CatalogJsonLd products={catalog.items} total={catalog.total} />
      <CatalogView
        products={catalog.items}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        filters={filters}
        filterOptions={filterOptions}
        categories={categories}
        title={title}
        hero={hero}
        afterHero={showBrandStrip ? <BrandStrip variant="compact" /> : undefined}
      />
    </>
  );
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<CatalogPageSkeleton />}>
      <CatalogContent searchParams={params} />
    </Suspense>
  );
}
