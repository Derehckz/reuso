"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { FilterSidebar } from "./filter-sidebar";
import { FilterDrawer } from "./filter-drawer";
import { CatalogToolbar } from "./catalog-toolbar";
import { CatalogActiveFilters } from "./catalog-active-filters";
import { CatalogProductGrid } from "./catalog-product-grid";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogHeroHeader } from "./catalog-hero-header";
import type { FilterOptions } from "./filter-panel";
import type { CatalogCategory, CatalogHero } from "@/types/catalog";
import type { ProductListItem } from "@/types/product";
import type { ProductFilters } from "@/types/product";

type CatalogViewProps = {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: ProductFilters;
  filterOptions: FilterOptions;
  categories: CatalogCategory[];
  title: string;
  hero?: CatalogHero | null;
  afterHero?: React.ReactNode;
};

export function CatalogView({
  products,
  total,
  page,
  totalPages,
  filters,
  filterOptions,
  categories,
  title,
  hero,
  afterHero,
}: CatalogViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const isNavigating = searchParams.toString(); // re-render on navigation

  return (
    <>
      <CatalogHeroHeader
        title={title}
        hero={hero}
        className={afterHero ? "!mb-0" : undefined}
      />
      {afterHero}
      <Container
        className={cn(
          "section-editorial",
          hero?.image ? "!pt-0" : "!pt-8 md:!pt-10",
        )}
      >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <FilterSidebar options={filterOptions} categories={categories} />

        <div className="min-w-0 flex-1" key={isNavigating}>
          <CatalogToolbar
            filters={filters}
            total={total}
            onOpenFilters={() => setFiltersOpen(true)}
          />

          <CatalogActiveFilters filters={filters} categories={categories} />

          <CatalogProductGrid products={products} />

          <CatalogPagination
            page={page}
            totalPages={totalPages}
            filters={filters}
          />
        </div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        options={filterOptions}
        categories={categories}
      />
      </Container>
    </>
  );
}
