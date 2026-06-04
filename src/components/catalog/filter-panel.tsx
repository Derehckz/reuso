"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/types/catalog";
import { isCategoryFamilyActive } from "@/lib/catalog-category";

export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  minPrice: number;
  maxPrice: number;
};

type FilterPanelProps = {
  options: FilterOptions;
  categories: CatalogCategory[];
  onApplied?: () => void;
  className?: string;
};

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
  activeCount = 0,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  activeCount?: number;
}) {
  return (
    <div className="border-b border-neutral-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-label-sm font-medium text-foreground">{title}</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center bg-brand-orange px-1.5 text-[10px] font-medium text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.25}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FilterPanel({
  options,
  categories,
  onApplied,
  className,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      startTransition(() => {
        router.push(`/productos?${params.toString()}`);
        onApplied?.();
      });
    },
    [router, searchParams, onApplied],
  );

  const clearFilters = () => {
    startTransition(() => {
      router.push("/productos");
      onApplied?.();
    });
  };

  const currentCategory =
    searchParams.get("categoria") ?? searchParams.get("category");
  const selectedSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const selectedColors =
    searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
  const maxPrice = Number(searchParams.get("maxPrice") ?? options.maxPrice);

  const priceActive = maxPrice < options.maxPrice;
  const categoryActive = Boolean(currentCategory);
  const colorActive = selectedColors.length > 0;
  const sizeActive = selectedSizes.length > 0;

  const [openSections, setOpenSections] = useState({
    precio: true,
    categoria: categoryActive,
    color: colorActive,
    talla: sizeActive,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      precio: true,
      categoria: true,
      color: true,
      talla: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      precio: false,
      categoria: false,
      color: false,
      talla: false,
    });
  };

  const allExpanded = Object.values(openSections).every(Boolean);

  return (
    <div
      className={cn(
        isPending && "pointer-events-none opacity-60",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-label text-foreground">Filtros</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="text-label-sm text-neutral-500 hover:text-brand-orange"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={allExpanded ? collapseAll : expandAll}
            className="text-label-sm text-neutral-500 hover:text-brand-orange"
          >
            {allExpanded ? "Contraer" : "Expandir"}
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <CollapsibleSection
          title="Precio"
          open={openSections.precio}
          onToggle={() => toggleSection("precio")}
          activeCount={priceActive ? 1 : 0}
        >
          <p className="mb-3 text-sm tabular-nums text-neutral-600">
            Hasta {maxPrice.toLocaleString("es-CL")} CLP
          </p>
          <input
            type="range"
            min={options.minPrice}
            max={options.maxPrice}
            value={maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
            className="h-1 w-full cursor-pointer accent-brand-orange"
          />
          <div className="mt-1 flex justify-between text-label-sm text-neutral-400">
            <span>{options.minPrice.toLocaleString("es-CL")}</span>
            <span>{options.maxPrice.toLocaleString("es-CL")}</span>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Categoría"
          open={openSections.categoria}
          onToggle={() => toggleSection("categoria")}
          activeCount={categoryActive ? 1 : 0}
        >
          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const familyActive = isCategoryFamilyActive(cat, currentCategory);
              const parentSelected = currentCategory === cat.slug;

              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() =>
                      updateParams({
                        categoria: parentSelected ? null : cat.slug,
                        genero: parentSelected ? null : (cat.gender ?? null),
                      })
                    }
                    className={cn(
                      "w-full py-1 text-left text-sm font-medium transition-colors",
                      familyActive
                        ? "text-brand-orange"
                        : "text-foreground hover:text-brand-green",
                    )}
                  >
                    {cat.name}
                    {!parentSelected && familyActive && (
                      <span className="ml-1 font-normal text-neutral-500">
                        (todo)
                      </span>
                    )}
                  </button>

                  {cat.subcategories.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 border-l border-neutral-200 pl-2.5">
                      <li>
                        <button
                          type="button"
                          onClick={() =>
                            updateParams({
                              categoria: parentSelected ? null : cat.slug,
                              genero: parentSelected ? null : (cat.gender ?? null),
                            })
                          }
                          className={cn(
                            "w-full py-0.5 text-left text-sm transition-colors",
                            parentSelected
                              ? "font-semibold text-brand-orange"
                              : "text-neutral-500 hover:text-foreground",
                          )}
                        >
                          Ver todo {cat.name}
                        </button>
                      </li>
                      {cat.subcategories.map((sub) => {
                        const subSelected = currentCategory === sub.slug;
                        const childActive = sub.children?.some(
                          (c) => c.slug === currentCategory,
                        );
                        const subFamilyActive = subSelected || childActive;

                        return (
                          <li key={sub.id}>
                            <button
                              type="button"
                              onClick={() =>
                                updateParams({
                                  categoria: subSelected ? cat.slug : sub.slug,
                                  genero: cat.gender ?? null,
                                })
                              }
                              className={cn(
                                "w-full py-0.5 text-left text-sm transition-colors",
                                subFamilyActive
                                  ? "font-semibold text-brand-orange"
                                  : "text-neutral-600 hover:text-foreground",
                              )}
                            >
                              {sub.name}
                            </button>
                            {sub.children && sub.children.length > 0 && (
                              <ul className="mt-0.5 space-y-0.5 border-l border-neutral-200 pl-2">
                                {sub.children.map((child) => {
                                  const childSelected =
                                    currentCategory === child.slug;
                                  return (
                                    <li key={child.id}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateParams({
                                            categoria: childSelected
                                              ? sub.slug
                                              : child.slug,
                                            genero: cat.gender ?? null,
                                          })
                                        }
                                        className={cn(
                                          "w-full py-0.5 text-left text-xs transition-colors",
                                          childSelected
                                            ? "font-semibold text-brand-orange"
                                            : "text-neutral-500 hover:text-foreground",
                                        )}
                                      >
                                        {child.name}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>

        {options.colors.length > 0 && (
          <CollapsibleSection
            title="Color"
            open={openSections.color}
            onToggle={() => toggleSection("color")}
            activeCount={selectedColors.length}
          >
            <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {options.colors.map((color, index) => {
                const active = selectedColors.includes(color.name);
                const colorKey = `${color.name}-${color.hex ?? index}`;
                return (
                  <li key={colorKey}>
                    <button
                      type="button"
                      onClick={() => {
                        const next = active
                          ? selectedColors.filter((c) => c !== color.name)
                          : [...selectedColors, color.name];
                        updateParams({
                          colors: next.length ? next.join(",") : null,
                        });
                      }}
                      className="flex w-full items-center gap-2.5 text-sm"
                    >
                      <span
                        className={cn(
                          "h-4 w-4 shrink-0 rounded-full border",
                          active && "ring-2 ring-brand-orange ring-offset-1",
                        )}
                        style={{ backgroundColor: color.hex ?? "#e5e5e5" }}
                      />
                      {color.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </CollapsibleSection>
        )}

        {options.sizes.length > 0 && (
          <CollapsibleSection
            title="Talla"
            open={openSections.talla}
            onToggle={() => toggleSection("talla")}
            activeCount={selectedSizes.length}
          >
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
              {options.sizes.map((size) => {
                const active = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? selectedSizes.filter((s) => s !== size)
                        : [...selectedSizes, size];
                      updateParams({
                        sizes: next.length ? next.join(",") : null,
                      });
                    }}
                    className={cn(
                      "min-h-8 min-w-8 border px-2 text-label-sm transition-all",
                      active
                        ? "border-brand-orange bg-brand-orange text-white"
                        : "border-neutral-200 hover:border-neutral-900",
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
