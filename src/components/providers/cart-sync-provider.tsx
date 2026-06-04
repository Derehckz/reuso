"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { mergeCartAfterLogin, syncCart } from "@/server/actions/cart-sync.actions";

const SYNC_DEBOUNCE_MS = 800;

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const mergedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || mergedRef.current) {
      return;
    }
    mergedRef.current = true;
    void mergeCartAfterLogin();
  }, [status, session?.user]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (items.length === 0) {
      void syncCart([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      void syncCart(
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      );
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items]);

  return children;
}
