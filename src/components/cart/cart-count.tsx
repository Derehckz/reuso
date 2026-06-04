"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

type CartCountProps = {
  className?: string;
  /** Formato compacto para mobile: [n] */
  bracketed?: boolean;
  /** No renderizar cuando el carrito está vacío (badge en icono). */
  hideWhenZero?: boolean;
};

/** Evita hydration mismatch: el carrito persistido solo existe en el cliente. */
export function CartCount({
  className,
  bracketed = true,
  hideWhenZero = false,
}: CartCountProps) {
  const count = useCartStore((s) => s.itemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const display = mounted ? count : 0;

  if (hideWhenZero && display === 0) {
    return null;
  }

  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {bracketed ? `[${display}]` : display}
    </span>
  );
}
