"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const CATALOG_SORT_OPTIONS = [
  { value: "featured", label: "Destacados" },
  { value: "newest", label: "Novedades" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
] as const;

type CatalogSortSelectProps = {
  className?: string;
  id?: string;
  onApplied?: () => void;
};

export function CatalogSortSelect({
  className,
  id = "catalog-sort",
  onApplied,
}: CatalogSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentSort = searchParams.get("sort") ?? "newest";

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "featured") params.delete("sort");
      else params.set("sort", value);
      params.delete("page");
      startTransition(() => {
        router.push(`/productos?${params.toString()}`);
        onApplied?.();
      });
    },
    [router, searchParams, onApplied],
  );

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        isPending && "opacity-60",
        className,
      )}
    >
      <label htmlFor={id} className="text-label-sm whitespace-nowrap text-neutral-500">
        Ordenar por:
      </label>
      <div className="relative min-w-[10.5rem]">
        <select
          id={id}
          value={currentSort}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full cursor-pointer appearance-none border border-neutral-200 bg-white pl-3 pr-8 text-label-sm text-foreground outline-none transition-colors hover:border-neutral-400 focus:border-brand-orange"
        >
          {CATALOG_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
    </div>
  );
}
