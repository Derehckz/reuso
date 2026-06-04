"use client";

import { SlidersHorizontal } from "lucide-react";
import { countActiveFilters } from "@/lib/catalog-url";
import { CatalogSearch } from "./catalog-search";
import type { ProductFilters } from "@/types/product";

type CatalogToolbarProps = {
  filters: ProductFilters;
  total: number;
  onOpenFilters: () => void;
};

export function CatalogToolbar({
  filters,
  total,
  onOpenFilters,
}: CatalogToolbarProps) {
  const activeFilters = countActiveFilters(filters);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <CatalogSearch
          initialQuery={filters.q ?? ""}
          className="flex-1"
        />
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-neutral-200 bg-white px-4 text-label-sm transition-colors hover:border-neutral-900 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} />
          Filtros
          {activeFilters > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center bg-brand-orange px-1 text-[10px] text-white">
              {activeFilters}
            </span>
          )}
        </button>
      </div>
      <p className="text-label-sm text-neutral-500">
        {total} {total === 1 ? "pieza" : "piezas"}
        {filters.q ? ` para “${filters.q}”` : ""}
      </p>
    </div>
  );
}
