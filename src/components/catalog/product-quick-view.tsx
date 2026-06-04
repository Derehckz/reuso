"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { getQuickViewProduct } from "@/server/actions/catalog.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore, useWishlistSaved } from "@/stores/wishlist-store";
import { persistWishlist } from "@/server/actions/wishlist.actions";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import type { ProductQuickView } from "@/types/catalog";

type ProductQuickViewModalProps = {
  slug: string | null;
  onClose: () => void;
};

export function ProductQuickViewModal({
  slug,
  onClose,
}: ProductQuickViewModalProps) {
  const [product, setProduct] = useState<ProductQuickView | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle } = useWishlistStore();
  const saved = useWishlistSaved(product?.id ?? "");

  const load = useCallback(async (productSlug: string) => {
    setLoading(true);
    setProduct(null);
    try {
      const data = await getQuickViewProduct(productSlug);
      setProduct(data);
      const firstAvailable = data?.variants.find((v) => v.stock > 0);
      setSelectedVariantId(firstAvailable?.id ?? data?.variants[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) load(slug);
    else setProduct(null);
  }, [slug, load]);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [slug, onClose]);

  if (!slug) return null;

  const variant = product?.variants.find((v) => v.id === selectedVariantId);
  const price = variant?.price ?? product?.basePrice ?? 0;

  function handleAddToCart() {
    if (!product || !variant || variant.stock < 1) {
      toast.error("Selecciona una variante disponible");
      return;
    }
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      size: variant.size,
      color: variant.color,
      price,
      maxStock: variant.stock,
      quantity: 1,
    });
    toast.success("Agregado al carrito");
    onClose();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar vista rápida"
        className="fixed inset-0 z-[60] bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-[50%] z-[61] mx-auto max-h-[90vh] max-w-4xl -translate-y-1/2 overflow-y-auto bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
        role="dialog"
        aria-modal="true"
        aria-label="Vista rápida del producto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-white/90 backdrop-blur-sm"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" strokeWidth={1.25} />
        </button>

        {loading ? (
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid sm:grid-cols-2">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              {product.images[0] ? (
                <>
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt ?? product.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority
                  />
                  <ModaCircularBadge />
                </>
              ) : null}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              {product.brand && (
                <p className="text-label-sm text-neutral-400">{product.brand}</p>
              )}
              <h2 className="mt-1 font-editorial text-2xl text-foreground">
                {product.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-lg font-semibold">{formatPrice(price)}</p>
                {product.compareAtPrice && (
                  <p className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-body-muted mt-4 line-clamp-3">
                  {product.shortDescription}
                </p>
              )}

              {product.variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-label-sm mb-2 text-neutral-500">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={v.stock < 1}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={cn(
                          "min-h-9 min-w-9 border px-2.5 text-label-sm",
                          selectedVariantId === v.id
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-neutral-200 disabled:opacity-30",
                        )}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.totalStock === 0 && (
                <Badge variant="outline" className="mt-4 w-fit">
                  Agotado
                </Badge>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <Button
                  size="lg"
                  fullWidth
                  disabled={!variant || variant.stock < 1}
                  onClick={handleAddToCart}
                >
                  Agregar al carrito
                </Button>
                <div className="flex gap-2">
                  <Link
                    href={`/productos/${product.slug}`}
                    onClick={onClose}
                    className="flex flex-1"
                  >
                    <Button variant="outline" fullWidth type="button">
                      Ver detalle
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      toggle(product.id);
                      void persistWishlist(useWishlistStore.getState().productIds);
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-200"
                    aria-label={saved ? "Quitar de favoritos" : "Guardar"}
                  >
                    <Bookmark
                      className={cn(
                        "h-5 w-5",
                        saved && "fill-brand-orange text-brand-orange",
                      )}
                      strokeWidth={1.25}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-neutral-500">Producto no encontrado</p>
            <Button variant="ghost" className="mt-4" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
