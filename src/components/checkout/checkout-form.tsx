"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CHILE_REGIONS } from "@/lib/constants/chile-regions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCartStore } from "@/stores/cart-store";
import { validateCart, validateCouponCode } from "@/server/actions/cart.actions";
import { getShippingQuote } from "@/server/actions/shipping.actions";
import {
  getCheckoutPreview,
  placeOrder,
} from "@/server/actions/checkout.actions";
import { cn, formatPrice } from "@/lib/utils";

export function CheckoutForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, itemCount, clearCart } = useCartStore();
  const [cartErrors, setCartErrors] = useState<string[]>([]);

  const [shippingAmount, setShippingAmount] = useState<number | null>(null);
  const [shippingDays, setShippingDays] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const submitLock = useRef(false);
  const idempotencyKey = useId().replace(/:/g, "");

  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");

  const sub = subtotal();
  const clientTotal = Math.max(0, sub - discountAmount + (shippingAmount ?? 0));
  const total = serverTotal ?? clientTotal;
  const count = itemCount();
  const canSubmit =
    items.length > 0 &&
    cartErrors.length === 0 &&
    Boolean(region.trim()) &&
    Boolean(commune.trim()) &&
    shippingAmount !== null &&
    !shippingLoading;

  const fetchShipping = useCallback(async () => {
    if (!region || !commune) {
      setShippingAmount(null);
      setShippingDays(null);
      return;
    }
    setShippingLoading(true);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const result = await getShippingQuote(region, commune, count, totalQty);
    setShippingLoading(false);
    if (result.success) {
      setShippingAmount(result.amount);
      setShippingDays(result.estimatedDays);
    } else {
      setShippingAmount(null);
      setShippingDays(null);
      toast.error(result.message);
    }
  }, [region, commune, count, items]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (items.length === 0) {
        setCartErrors([]);
        return;
      }
      const result = await validateCart(
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      );
      setCartErrors(result.success ? [] : result.errors);
    }, 400);
    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    const t = setTimeout(fetchShipping, 400);
    return () => clearTimeout(t);
  }, [fetchShipping]);

  useEffect(() => {
    if (!region.trim() || !commune.trim() || items.length === 0) {
      setServerTotal(null);
      return;
    }

    const timer = setTimeout(async () => {
      const preview = await getCheckoutPreview({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        region,
        commune,
        couponCode: couponApplied ? couponCode : undefined,
      });
      if (preview.success) {
        setServerTotal(preview.total);
        setDiscountAmount(preview.discountAmount);
        setShippingAmount(preview.shippingAmount);
      } else {
        setServerTotal(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [items, region, commune, couponApplied, couponCode]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const result = await validateCouponCode(couponCode, sub);
    setCouponLoading(false);
    if (result.success) {
      setDiscountAmount(result.discountAmount);
      setCouponApplied(true);
      toast.success("Cupón aplicado");
    } else {
      setDiscountAmount(0);
      setCouponApplied(false);
      setCouponError(result.message);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLock.current) return;

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      router.push("/carrito");
      return;
    }
    if (cartErrors.length > 0) {
      toast.error("Corrige los problemas del carrito antes de pagar");
      return;
    }
    if (!region.trim() || !commune.trim()) {
      toast.error("Selecciona región y comuna para calcular el envío");
      return;
    }
    if (shippingAmount === null || shippingLoading) {
      toast.error("Espera el cálculo de envío");
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("checkoutIdempotencyKey", idempotencyKey);
    if (couponApplied && couponCode) {
      formData.set("couponCode", couponCode);
    }

    const result = await placeOrder(
      formData,
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    );

    if (!result.success) {
      submitLock.current = false;
      setSubmitting(false);
      toast.error(result.message);
      return;
    }

    clearCart();

    if (result.paymentUrl) {
      window.location.href = result.paymentUrl;
      return;
    }

    const tokenParam = result.accessToken
      ? `&token=${encodeURIComponent(result.accessToken)}`
      : "";
    router.push(
      `/checkout/exito?order=${encodeURIComponent(result.orderNumber)}${tokenParam}`,
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-editorial text-2xl">No hay productos para pagar</p>
        <Button className="mt-6" onClick={() => router.push("/productos")}>
          Ir al catálogo
        </Button>
      </div>
    );
  }

  const inputClass =
    "w-full border border-neutral-200 bg-white px-4 py-3 text-sm normal-case tracking-normal placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <div className="space-y-10">
        {cartErrors.length > 0 && (
          <div
            className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            <p className="font-medium">Revisa tu carrito antes de pagar:</p>
            <ul className="mt-2 list-inside list-disc">
              {cartErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Contacto */}
        <section>
          <h2 className="text-label mb-6 text-foreground">Contacto</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-label-sm text-neutral-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={session?.user?.email ?? ""}
                readOnly={!!session?.user?.email}
                className={cn(inputClass, "mt-1.5", session?.user?.email && "bg-neutral-50")}
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-label-sm text-neutral-500">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+56 9 1234 5678"
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
          </div>
        </section>

        {/* Envío */}
        <section>
          <h2 className="text-label mb-6 text-foreground">Envío</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-label-sm text-neutral-500">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                defaultValue={session?.user?.name?.split(" ")[0] ?? ""}
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-label-sm text-neutral-500">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="street" className="text-label-sm text-neutral-500">
                Dirección
              </label>
              <input
                id="street"
                name="street"
                required
                placeholder="Calle / Avenida"
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
            <div>
              <label htmlFor="number" className="text-label-sm text-neutral-500">
                Número
              </label>
              <input id="number" name="number" className={cn(inputClass, "mt-1.5")} />
            </div>
            <div>
              <label htmlFor="apartment" className="text-label-sm text-neutral-500">
                Depto / Casa (opcional)
              </label>
              <input id="apartment" name="apartment" className={cn(inputClass, "mt-1.5")} />
            </div>
            <div>
              <label htmlFor="region" className="text-label-sm text-neutral-500">
                Región
              </label>
              <select
                id="region"
                name="region"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={cn(inputClass, "mt-1.5")}
              >
                <option value="">Seleccionar región</option>
                {CHILE_REGIONS.map((r) => (
                  <option key={r.code} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="commune" className="text-label-sm text-neutral-500">
                Comuna
              </label>
              <input
                id="commune"
                name="commune"
                required
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ej: Providencia"
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="text-label-sm text-neutral-500">
                Código postal (opcional)
              </label>
              <input id="postalCode" name="postalCode" className={cn(inputClass, "mt-1.5")} />
            </div>
          </div>
          {shippingAmount !== null && shippingDays !== null && (
            <p className="text-label-sm mt-4 text-brand-green">
              Envío Bluexpress · entrega estimada {shippingDays}{" "}
              {shippingDays === 1 ? "día hábil" : "días hábiles"}
            </p>
          )}
        </section>

        {/* Notas */}
        <section>
          <h2 className="text-label mb-4 text-foreground">Notas del pedido</h2>
          <textarea
            name="notes"
            rows={3}
            placeholder="Instrucciones de entrega (opcional)"
            className={cn(inputClass, "resize-none")}
          />
        </section>

        {session?.user && (
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" name="saveAddress" className="accent-brand-orange" />
            Guardar dirección para próximas compras
          </label>
        )}

        {/* Mobile summary inline before submit */}
        <div className="lg:hidden">
          <OrderSummary
            subtotal={sub}
            discountAmount={discountAmount}
            shippingAmount={shippingAmount}
            shippingLoading={shippingLoading}
            total={total}
            itemCount={count}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            couponLoading={couponLoading}
            couponError={couponError}
            couponApplied={couponApplied}
            sticky={false}
            className="!p-0 !bg-transparent"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={submitting}
          disabled={!canSubmit}
          className="hidden lg:flex"
        >
          Pagar · {formatPrice(total)}
        </Button>

        <p className="text-center text-[10px] text-neutral-400">
          Al continuar aceptas nuestros{" "}
          <a href="/terminos" className="underline hover:text-brand-green">
            términos
          </a>{" "}
          y{" "}
          <a href="/privacidad" className="underline hover:text-brand-green">
            políticas de privacidad
          </a>
          . Pago seguro con MercadoPago.
        </p>
      </div>

      {/* Desktop summary */}
      <div className="hidden lg:block">
        <OrderSummary
          subtotal={sub}
          discountAmount={discountAmount}
          shippingAmount={shippingAmount}
          shippingLoading={shippingLoading}
          total={total}
          itemCount={count}
          couponCode={couponCode}
          onCouponChange={setCouponCode}
          onApplyCoupon={handleApplyCoupon}
          couponLoading={couponLoading}
          couponError={couponError}
          couponApplied={couponApplied}
          sticky
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={submitting}
          disabled={!canSubmit}
          className="mt-6"
        >
          Confirmar y pagar
        </Button>
      </div>

      {/* Mobile fixed pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 lg:hidden">
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={submitting}
          disabled={!canSubmit}
        >
          Pagar ahora
        </Button>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </form>
  );
}
