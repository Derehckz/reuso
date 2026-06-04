"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setAll: (productIds: string[]) => void;
  pruneToValid: (validIds: string[]) => void;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clear: () => set({ productIds: [] }),
      setAll: (productIds) => set({ productIds }),
      pruneToValid: (validIds) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => validIds.includes(id)),
        })),
      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "reuso-wishlist" },
  ),
);

/** Evita mismatch SSR: localStorage solo aplica tras hidratar el persist. */
export function useWishlistHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useWishlistStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

export function useWishlistSaved(productId: string): boolean {
  const hydrated = useWishlistHydrated();
  const has = useWishlistStore((s) => s.has);
  return hydrated && has(productId);
}
