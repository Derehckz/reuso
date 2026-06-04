"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CatalogProductGrid } from "@/components/catalog/catalog-product-grid";
import { useWishlistStore } from "@/stores/wishlist-store";
import {
  getWishlistProducts,
  mergeWishlist,
  persistWishlist,
} from "@/server/actions/wishlist.actions";
import type { ProductListItem } from "@/types/product";

export function FavoritesPageContent() {
  const productIds = useWishlistStore((s) => s.productIds);
  const setAll = useWishlistStore((s) => s.setAll);
  const clear = useWishlistStore((s) => s.clear);
  const pruneToValid = useWishlistStore((s) => s.pruneToValid);

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const merge = await mergeWishlist(productIds);
      if (cancelled) return;

      const ids = merge.productIds;
      setSynced(merge.synced);

      if (
        ids.length !== productIds.length ||
        ids.some((id, index) => id !== productIds[index])
      ) {
        setAll(ids);
      }

      const items = await getWishlistProducts(ids);
      if (cancelled) return;

      const validIds = items.map((p) => p.id);
      pruneToValid(validIds);
      setProducts(items);
      setLoading(false);

      if (merge.synced) {
        await persistWishlist(validIds);
      }
    }

    const timer = setTimeout(() => {
      void load();
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [productIds, setAll, pruneToValid]);

  const handleClear = async () => {
    clear();
    setProducts([]);
    await persistWishlist([]);
  };

  const count = products.length;
  const isEmpty = !loading && count === 0;

  if (isEmpty) {
    return (
      <Container className="section-editorial flex flex-col items-center py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-beige-muted">
          <Bookmark className="h-7 w-7 text-brand-green" strokeWidth={1.25} />
        </div>
        <h1 className="font-editorial text-3xl text-foreground md:text-4xl">
          Mis favoritos
        </h1>
        <p className="text-body-muted mt-3 max-w-sm">
          Guarda las piezas que te interesan con el ícono de marcador en el
          catálogo. Aparecerán aquí para que las revises cuando quieras.
        </p>
        <Link href="/productos" className="mt-8">
          <Button size="lg">Explorar catálogo</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="section-editorial !pt-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-sm text-brand-orange">Tu cuenta</p>
          <h1 className="font-editorial mt-1 text-4xl text-foreground md:text-5xl">
            Mis favoritos
          </h1>
          <p className="text-label-sm mt-2 text-neutral-500">
            {loading
              ? "Cargando…"
              : `${count} ${count === 1 ? "pieza guardada" : "piezas guardadas"}`}
            {synced && !loading && (
              <span className="text-neutral-400"> · sincronizado con tu cuenta</span>
            )}
          </p>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={() => void handleClear()}
            className="text-label-sm text-neutral-400 transition-colors hover:text-red-600"
          >
            Vaciar favoritos
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-sm bg-brand-beige-muted"
            />
          ))}
        </div>
      ) : (
        <CatalogProductGrid products={products} />
      )}

      <Link
        href="/productos"
        className="text-nav mt-10 inline-block text-brand-orange hover:underline"
      >
        ← Seguir explorando
      </Link>
    </Container>
  );
}
