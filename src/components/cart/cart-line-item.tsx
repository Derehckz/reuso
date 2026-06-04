"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { CartLineItem } from "@/stores/cart-store";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type CartLineItemRowProps = {
  item: CartLineItem;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
};

export function CartLineItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartLineItemRowProps) {
  const atMax = item.quantity >= item.maxStock;

  return (
    <article className="flex gap-4 border-b border-neutral-100 py-6 last:border-0">
      <Link
        href={`/productos/${item.slug}`}
        className="relative h-28 w-24 shrink-0 bg-neutral-100 sm:h-32 sm:w-28"
      >
        {item.image ? (
          <>
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain p-2"
              sizes="112px"
              loading="lazy"
            />
            <ModaCircularBadge size="sm" />
          </>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/productos/${item.slug}`}
              className="text-label-sm text-foreground hover:text-brand-orange"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-neutral-500">
              {item.size} · {item.color}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <p className="mt-0.5 text-xs text-neutral-400">
          {formatPrice(item.price)} c/u
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="inline-flex items-center border border-neutral-200">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
              className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-neutral-50"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <span className="flex h-10 min-w-10 items-center justify-center border-x border-neutral-200 text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={atMax}
              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
              className={cn(
                "flex h-10 w-10 items-center justify-center transition-colors hover:bg-neutral-50",
                atMax && "cursor-not-allowed opacity-40",
              )}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.variantId)}
            className="flex items-center gap-1.5 text-label-sm text-neutral-400 transition-colors hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.25} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
