"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CartLineItemRow } from "./cart-line-item";
import { OrderSummary } from "./order-summary";
import { useCartStore } from "@/stores/cart-store";
import { validateCart } from "@/server/actions/cart.actions";
import { formatPrice } from "@/lib/utils";

export function CartPageContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } =
    useCartStore();
  const [validating, setValidating] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const runValidation = useCallback(async () => {
    if (items.length === 0) {
      setStockWarning(null);
      return;
    }

    setValidating(true);
    const result = await validateCart(
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    );
    setValidating(false);

    if (!result.success) {
      setStockWarning(result.errors[0] ?? "Algunos productos no están disponibles");
      if (result.lines) {
        for (const line of result.lines) {
          const local = items.find((i) => i.variantId === line.variantId);
          if (local && line.quantity !== local.quantity) {
            updateQuantity(line.variantId, line.quantity);
          }
        }
      }
    } else {
      setStockWarning(null);
      if (result.lines) {
        for (const line of result.lines) {
          const local = items.find((i) => i.variantId === line.variantId);
          if (local) {
            if (line.unitPrice !== local.price) {
              useCartStore.setState((state) => ({
                items: state.items.map((i) =>
                  i.variantId === line.variantId
                    ? { ...i, price: line.unitPrice, maxStock: line.maxStock }
                    : i,
                ),
              }));
            }
            if (line.quantity !== local.quantity) {
              updateQuantity(line.variantId, line.quantity);
            }
          }
        }
      }
    }
  }, [items, updateQuantity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runValidation();
    }, 500);
    return () => clearTimeout(timer);
  }, [runValidation]);

  useEffect(() => {
    const onFocus = () => {
      void runValidation();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [runValidation]);

  const checkoutBlocked = validating || Boolean(stockWarning);

  if (items.length === 0) {
    return (
      <Container className="section-editorial flex flex-col items-center py-24 text-center">
        <p className="font-editorial text-3xl text-foreground">Tu carrito está vacío</p>
        <p className="text-body-muted mt-3 max-w-sm">
          Explora piezas curadas de moda reutilizada premium.
        </p>
        <Link href="/productos" className="mt-8">
          <Button size="lg">Explorar catálogo</Button>
        </Link>
      </Container>
    );
  }

  const count = itemCount();

  return (
    <Container className="section-editorial !pt-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-4xl text-foreground md:text-5xl">
            Carrito
          </h1>
          <p className="text-label-sm mt-2 text-neutral-500">
            {count} {count === 1 ? "artículo" : "artículos"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-label-sm text-neutral-400 hover:text-red-600"
        >
          Vaciar carrito
        </button>
      </div>

      {stockWarning && (
        <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {stockWarning}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className={validating ? "opacity-70" : ""}>
          {items.map((item) => (
            <CartLineItemRow
              key={item.variantId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          <Link
            href="/productos"
            className="text-nav mt-4 inline-block text-brand-orange hover:underline"
          >
            ← Seguir comprando
          </Link>
        </div>

        <OrderSummary
          subtotal={subtotal()}
          shippingAmount={null}
          total={subtotal()}
          itemCount={count}
          checkoutHref="/checkout"
          checkoutLabel="Continuar al pago"
          checkoutDisabled={checkoutBlocked}
        />
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-label-sm text-neutral-500">Total</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatPrice(subtotal())}
            </p>
          </div>
          <Button
            onClick={() => !checkoutBlocked && router.push("/checkout")}
            className="shrink-0"
            disabled={checkoutBlocked}
          >
            Pagar
          </Button>
        </div>
      </div>
      <div className="h-24 lg:hidden" aria-hidden />
    </Container>
  );
}
