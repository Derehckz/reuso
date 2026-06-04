"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartSyncProvider } from "@/components/providers/cart-sync-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSyncProvider>
        {children}
      </CartSyncProvider>
      <Toaster position="top-center" richColors closeButton />
    </SessionProvider>
  );
}
