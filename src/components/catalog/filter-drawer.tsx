"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { FilterPanel, type FilterOptions } from "./filter-panel";
import type { CatalogCategory } from "@/types/catalog";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  options: FilterOptions;
  categories: CatalogCategory[];
};

export function FilterDrawer({
  open,
  onClose,
  options,
  categories,
}: FilterDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar filtros"
        className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Filtros del catálogo"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
          <h2 className="text-label text-foreground">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <FilterPanel
            options={options}
            categories={categories}
            onApplied={onClose}
          />
        </div>
      </div>
    </>
  );
}
