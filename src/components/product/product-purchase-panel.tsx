"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { siteConfig } from "@/config/site";
import { ProductTrustBadges } from "@/components/product/product-trust-badges";
import type { ProductDetail } from "@/types/product";
import { cn } from "@/lib/utils";

type ProductPurchasePanelProps = {
  product: ProductDetail;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const defaultVariant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === selectedVariantId);
  const price = variant?.price ?? product.basePrice;
  const installment = Math.round(price / 12);

  const uniqueColors = useMemo(() => {
    const seen = new Set<string>();
    return product.variants.filter((v) => {
      if (seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    });
  }, [product.variants]);

  const uniqueSizes = useMemo(() => {
    const color = variant?.color;
    const sizes = product.variants
      .filter((v) => !color || v.color === color)
      .map((v) => v.size);
    return [...new Set(sizes)];
  }, [product.variants, variant?.color]);

  const selectedColor = variant?.color ?? uniqueColors[0]?.color;

  function selectColor(color: string) {
    const next = product.variants.find(
      (v) => v.color === color && v.stock > 0,
    );
    if (next) setSelectedVariantId(next.id);
    else {
      const any = product.variants.find((v) => v.color === color);
      if (any) setSelectedVariantId(any.id);
    }
  }

  function selectSize(size: string) {
    const next = product.variants.find(
      (v) =>
        v.size === size &&
        v.color === selectedColor &&
        v.stock > 0,
    );
    if (next) setSelectedVariantId(next.id);
    else {
      const fallback = product.variants.find(
        (v) => v.size === size && v.color === selectedColor,
      );
      if (fallback) setSelectedVariantId(fallback.id);
    }
  }

  function buildLineItem() {
    if (!variant || variant.stock < 1) return null;
    return {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      size: variant.size,
      color: variant.color,
      price,
      maxStock: variant.stock,
      quantity,
    };
  }

  function handleAddToCart() {
    const item = buildLineItem();
    if (!item) {
      toast.error("Producto agotado");
      return;
    }
    addItem(item);
    toast.success("Agregado al carrito");
  }

  function handleBuyNow() {
    const item = buildLineItem();
    if (!item) {
      toast.error("Producto agotado");
      return;
    }
    addItem(item);
    router.push("/checkout");
  }

  const outOfStock = !variant || variant.stock < 1;

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      {product.sku && (
        <p className="text-xs text-neutral-500">
          Referencia: <span className="text-neutral-700">{product.sku}</span>
        </p>
      )}

      <h1 className="font-editorial mt-2 text-2xl leading-tight text-foreground md:text-3xl">
        {product.name}
      </h1>

      {product.brand && (
        <p className="mt-1 text-label-sm text-neutral-500">{product.brand}</p>
      )}

      {product.reviewCount > 0 && (
        <p className="mt-2 text-sm text-neutral-600">
          ★ {product.averageRating.toFixed(1)} · {product.reviewCount}{" "}
          {product.reviewCount === 1 ? "reseña" : "reseñas"}
        </p>
      )}

      <div className="mt-6 border-b border-neutral-200 pb-6">
        <p className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">
          {formatPrice(price)}
        </p>
        {product.compareAtPrice && product.compareAtPrice > price && (
          <p className="mt-1 text-sm text-neutral-400 line-through">
            {formatPrice(product.compareAtPrice)}
          </p>
        )}
        <p className="mt-3 inline-block rounded-sm bg-brand-beige-muted px-3 py-1.5 text-xs text-neutral-700">
          Hasta 12× {formatPrice(installment)}, 0% de interés
        </p>
      </div>

      {uniqueColors.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm text-neutral-700">
              <span className="font-medium text-foreground">Color:</span>{" "}
              {selectedColor}
            </p>
            <Link
              href="/guia-tallas"
              className="text-xs text-brand-green underline-offset-2 hover:underline"
            >
              Guía de tallas
            </Link>
          </div>
          {uniqueColors.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((v) => {
                const active = selectedColor === v.color;
                const hasStock = product.variants.some(
                  (x) => x.color === v.color && x.stock > 0,
                );
                return (
                  <button
                    key={v.color}
                    type="button"
                    disabled={!hasStock}
                    onClick={() => selectColor(v.color)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                      active
                        ? "border-brand-green bg-brand-green/5"
                        : "border-neutral-200 hover:border-neutral-400",
                      !hasStock && "opacity-40",
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-neutral-200"
                      style={{ backgroundColor: v.colorHex ?? "#e5e5e5" }}
                    />
                    {v.color}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">Talla</p>
        <div className="flex flex-wrap gap-2">
          {uniqueSizes.map((size) => {
            const v = product.variants.find(
              (x) => x.size === size && x.color === selectedColor,
            );
            const inStock = v && v.stock > 0;
            const active = variant?.size === size;
            return (
              <button
                key={size}
                type="button"
                disabled={!v}
                onClick={() => selectSize(size)}
                className={cn(
                  "relative flex h-11 min-w-11 items-center justify-center rounded-full border text-sm font-medium transition-all",
                  active
                    ? "border-brand-green bg-brand-green text-white"
                    : "border-neutral-300 text-foreground hover:border-brand-green",
                  !inStock &&
                    "text-neutral-400 after:absolute after:left-1/2 after:top-1/2 after:h-[120%] after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-neutral-400 after:content-['']",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">Cantidad</p>
        <div className="inline-flex items-center border border-neutral-300">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-11 min-w-12 items-center justify-center border-x border-neutral-300 text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            disabled={!variant || quantity >= variant.stock}
            onClick={() =>
              setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))
            }
            className="flex h-11 w-11 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {variant && variant.stock > 0 && variant.stock <= 5 && (
          <p className="mt-2 text-xs text-brand-orange">
            Solo quedan {variant.stock} unidades
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          variant="outline"
          fullWidth
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
        >
          {outOfStock ? "Agotado" : "Añadir al carro"}
        </Button>
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={outOfStock}
          onClick={handleBuyNow}
          className="bg-brand-orange hover:bg-brand-orange-hover"
        >
          Comprar ahora
        </Button>
      </div>

      <ProductTrustBadges />

      <Link
        href="/tiendas"
        className="mt-6 flex w-full items-center justify-center border border-neutral-300 py-3.5 text-label-sm uppercase tracking-widest text-foreground transition-colors hover:border-brand-green hover:text-brand-green"
      >
        Ver stock en tiendas
      </Link>
    </div>
  );
}
