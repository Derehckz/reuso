"use client";

import Link from "next/link";
import { ProductCardGallery } from "@/components/ui/product-card-gallery";
import { Bookmark, Eye } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { IconButton } from "@/components/ui/icon-button";
import type { ProductListItem } from "@/types/product";
import { useWishlistStore, useWishlistSaved } from "@/stores/wishlist-store";
import { persistWishlist } from "@/server/actions/wishlist.actions";

export type ProductCardProps = {
  product: ProductListItem;
  priority?: boolean;
  /** Tamaño visual: compact para carrito-relacionados, default para grid */
  size?: "default" | "compact";
  onQuickView?: (slug: string) => void;
};

export function ProductCard({
  product,
  priority,
  size = "default",
  onQuickView,
}: ProductCardProps) {
  const { toggle } = useWishlistStore();
  const saved = useWishlistSaved(product.id);
  const outOfStock = product.totalStock === 0;
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [product.image]
        : [];
  const imageSizes =
    size === "compact"
      ? "200px"
      : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw";

  return (
    <article
      className={cn(
        "group relative flex flex-col",
        size === "compact" && "max-w-[200px]",
      )}
    >
      <Link
        href={`/productos/${product.slug}`}
        className={cn(
          "relative overflow-hidden bg-neutral-100",
          "aspect-[3/4]",
          size === "default" && "mb-3",
          size === "compact" && "mb-2",
        )}
        aria-label={`Ver ${product.name}`}
      >
        {gallery.length > 0 ? (
          <>
            <ProductCardGallery
              images={gallery}
              alt={product.imageAlt ?? product.name}
              priority={priority}
              sizes={imageSizes}
            />
            <ModaCircularBadge />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-label-sm text-neutral-400">Sin imagen</span>
          </div>
        )}

        {/* Overlay sutil al hover — estilo Nike/Zara */}
        <div
          className="pointer-events-none absolute inset-0 bg-neutral-900/0 transition-colors duration-500 group-hover:bg-neutral-900/[0.02]"
          aria-hidden
        />

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5 sm:right-3 sm:top-3">
          {product.isNewArrival && <Badge variant="accent">Nuevo</Badge>}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <Badge variant="outline">Agotado</Badge>
          </div>
        )}

        {/* Acciones hover — quick view + wishlist */}
        <div
          className={cn(
            "absolute bottom-2 left-2 right-2 flex justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3",
            "opacity-100 transition-opacity duration-300",
            "md:opacity-0 md:group-hover:opacity-100",
          )}
          onClick={(e) => e.preventDefault()}
        >
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product.slug);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 bg-white/95 py-2 text-label-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.25} />
              Vista rápida
            </button>
          )}
          <IconButton
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
            aria-label={saved ? "Quitar de favoritos" : "Guardar"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.id);
              void persistWishlist(useWishlistStore.getState().productIds);
            }}
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                saved && "fill-brand-orange text-brand-orange",
              )}
              strokeWidth={1.25}
            />
          </IconButton>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-2 px-0.5">
        <Link href={`/productos/${product.slug}`} className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            {product.subcategory?.name ?? product.category.name}
          </p>
          {product.brand && (
            <p className="text-label-sm mb-0.5 text-neutral-400">
              {product.brand}
            </p>
          )}
          <h3
            className={cn(
              "truncate font-ui uppercase tracking-wide text-foreground",
              size === "default" ? "text-xs" : "text-[10px]",
            )}
          >
            {product.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <p
              className={cn(
                "font-ui text-foreground",
                size === "default" ? "text-sm" : "text-xs",
              )}
            >
              {formatPrice(product.basePrice)}
            </p>
            {product.compareAtPrice && (
              <p className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
          </div>
        </Link>
      </div>
    </article>
  );
}
