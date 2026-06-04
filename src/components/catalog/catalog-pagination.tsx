"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { catalogHref } from "@/lib/catalog-url";
import type { ProductFilters } from "@/types/product";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  filters: ProductFilters;
};

function pageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function CatalogPagination({
  page,
  totalPages,
  filters,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageRange(page, totalPages);

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label="Paginación del catálogo"
    >
      <p className="text-label-sm text-neutral-500">
        Página {page} de {totalPages}
      </p>

      <ul className="flex items-center gap-1">
        <li>
          {page <= 1 ? (
            <span
              className="flex h-10 w-10 items-center justify-center text-neutral-300"
              aria-hidden
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
            </span>
          ) : (
            <Link
              href={catalogHref(filters, { page: page - 1 })}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-brand-orange"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
            </Link>
          )}
        </li>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li key={`e-${i}`} className="px-1 text-neutral-400">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={catalogHref(filters, { page: p })}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center px-2 text-sm transition-colors",
                  p === page
                    ? "bg-brand-orange font-semibold text-white"
                    : "text-neutral-600 hover:text-brand-orange",
                )}
                aria-label={`Página ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Link>
            </li>
          ),
        )}

        <li>
          {page >= totalPages ? (
            <span
              className="flex h-10 w-10 items-center justify-center text-neutral-300"
              aria-hidden
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
            </span>
          ) : (
            <Link
              href={catalogHref(filters, { page: page + 1 })}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-brand-orange"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
