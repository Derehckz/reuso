"use client";

import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OrderSummaryProps = {
  subtotal: number;
  discountAmount?: number;
  shippingAmount?: number | null;
  shippingLoading?: boolean;
  total: number;
  itemCount: number;
  couponCode?: string;
  onCouponChange?: (code: string) => void;
  onApplyCoupon?: () => void;
  couponLoading?: boolean;
  couponError?: string | null;
  couponApplied?: boolean;
  checkoutHref?: string;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
  className?: string;
  sticky?: boolean;
};

export function OrderSummary({
  subtotal,
  discountAmount = 0,
  shippingAmount,
  shippingLoading,
  total,
  itemCount,
  couponCode = "",
  onCouponChange,
  onApplyCoupon,
  couponLoading,
  couponError,
  couponApplied,
  checkoutHref,
  onCheckout,
  checkoutLoading,
  checkoutDisabled,
  checkoutLabel = "Continuar al pago",
  className,
  sticky = true,
}: OrderSummaryProps) {
  const showCoupon = onCouponChange && onApplyCoupon;

  return (
    <aside
      className={cn(
        "bg-neutral-50 p-6 lg:p-8",
        sticky && "lg:sticky lg:top-28",
        className,
      )}
    >
      <h2 className="text-label text-foreground">Resumen</h2>
      <p className="text-label-sm mt-1 text-neutral-500">
        {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
      </p>

      {showCoupon && (
        <div className="mt-6">
          <label htmlFor="coupon" className="text-label-sm text-neutral-500">
            Cupón de descuento
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              id="coupon"
              variant="minimal"
              placeholder="Código"
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
              className="flex-1 border border-neutral-200 bg-white px-3 py-2.5 text-sm normal-case tracking-normal"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onApplyCoupon}
              isLoading={couponLoading}
            >
              Aplicar
            </Button>
          </div>
          {couponError && (
            <p className="mt-2 text-xs text-red-600">{couponError}</p>
          )}
          {couponApplied && !couponError && (
            <p className="mt-2 text-xs text-brand-green">Cupón aplicado</p>
          )}
        </div>
      )}

      <dl className="mt-6 space-y-3 border-t border-neutral-200 pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-600">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-brand-green">
            <dt>Descuento</dt>
            <dd className="tabular-nums">−{formatPrice(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-neutral-600">Envío</dt>
          <dd className="tabular-nums">
            {shippingLoading ? (
              <span className="text-neutral-400">Calculando...</span>
            ) : shippingAmount !== null && shippingAmount !== undefined ? (
              formatPrice(shippingAmount)
            ) : (
              <span className="text-neutral-400">A calcular</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>

      {checkoutHref ? (
        <Link
          href={checkoutDisabled ? "#" : checkoutHref}
          className={cn("mt-6 block", checkoutDisabled && "pointer-events-none")}
          aria-disabled={checkoutDisabled}
          tabIndex={checkoutDisabled ? -1 : undefined}
        >
          <Button size="lg" fullWidth disabled={checkoutDisabled}>
            {checkoutLabel}
          </Button>
        </Link>
      ) : onCheckout ? (
        <Button
          type="button"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={onCheckout}
          isLoading={checkoutLoading}
          disabled={checkoutDisabled}
        >
          {checkoutLabel}
        </Button>
      ) : null}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-400">
        Envío calculado según región. Cambios limitados sin costo.
      </p>
    </aside>
  );
}
