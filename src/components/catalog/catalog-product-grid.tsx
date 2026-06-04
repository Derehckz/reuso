"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { ProductQuickViewModal } from "./product-quick-view";
import type { ProductListItem } from "@/types/product";

type CatalogProductGridProps = {
  products: ProductListItem[];
};

export function CatalogProductGrid({ products }: CatalogProductGridProps) {
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-editorial text-2xl text-foreground">
          Sin resultados
        </p>
        <p className="text-body-muted mt-3 max-w-sm">
          Prueba ajustando los filtros o busca otra prenda en nuestro catálogo
          curado.
        </p>
        <Link
          href="/productos"
          className="text-nav mt-8 text-brand-orange underline-offset-4 hover:underline"
        >
          Ver todo el catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={i < 4}
            onQuickView={setQuickViewSlug}
          />
        ))}
      </div>

      <ProductQuickViewModal
        slug={quickViewSlug}
        onClose={() => setQuickViewSlug(null)}
      />
    </>
  );
}
