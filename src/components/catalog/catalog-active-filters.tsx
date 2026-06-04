"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { countActiveFilters } from "@/lib/catalog-url";
import { findCategoryMatch } from "@/lib/catalog-category";
import { CatalogSortSelect } from "@/components/catalog/catalog-sort-select";
import type { ProductFilters } from "@/types/product";
import type { CatalogCategory } from "@/types/catalog";

type CatalogActiveFiltersProps = {
  filters: ProductFilters;
  categories: CatalogCategory[];
};

export function CatalogActiveFilters({
  filters,
  categories,
}: CatalogActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCount = countActiveFilters(filters);

  const removeKey = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/productos?${params.toString()}`));
  };

  const removeFromList = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.filter((v) => v !== value);
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/productos?${params.toString()}`));
  };

  const match = findCategoryMatch(categories, filters.category);
  const categoryLabel = match
    ? match.subcategory
      ? `${match.category.name} · ${match.subcategory.name}`
      : `${match.category.name} (todo)`
    : filters.category
      ? filters.category.replace(/-/g, " ")
      : null;

  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.q) chips.push({ label: `"${filters.q}"`, onRemove: () => removeKey("q") });
  if (categoryLabel)
    chips.push({ label: categoryLabel, onRemove: () => removeKey("categoria") });
  if (filters.gender)
    chips.push({ label: filters.gender, onRemove: () => removeKey("genero") });
  filters.sizes?.forEach((s) =>
    chips.push({ label: `Talla ${s}`, onRemove: () => removeFromList("sizes", s) }),
  );
  filters.colors?.forEach((c) =>
    chips.push({ label: c, onRemove: () => removeFromList("colors", c) }),
  );
  if (filters.maxPrice !== undefined)
    chips.push({
      label: `$${filters.maxPrice.toLocaleString("es-CL")}`,
      onRemove: () => removeKey("maxPrice"),
    });

  const hasChips = chips.length > 0;

  return (
    <div
      className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isPending ? "opacity-60" : ""}`}
    >
      <div
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
        aria-label={hasChips ? "Filtros activos" : undefined}
      >
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={chip.onRemove}
            className="inline-flex items-center gap-1.5 border border-neutral-200 bg-white px-3 py-1.5 text-label-sm text-foreground transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            {chip.label}
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        ))}
        {hasChips && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/productos"))}
            className="text-label-sm text-neutral-500 underline-offset-2 hover:text-brand-orange hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <CatalogSortSelect className="sm:ml-auto" />
    </div>
  );
}
