"use server";

import { z } from "zod";
import { headers } from "next/headers";
import {
  mergeGuestCartOnLogin,
  syncCartToServer,
} from "@/server/services/cart.service";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

const syncItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

const syncCartSchema = z.object({
  items: z.array(syncItemSchema).max(50),
});

export async function syncCart(items: z.infer<typeof syncCartSchema>["items"]) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`cart-sync:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return { success: false as const, message: rateLimitMessage(rl.retryAfterMs) };
  }

  const parsed = syncCartSchema.safeParse({ items });
  if (!parsed.success) {
    return { success: false as const, message: "Carrito inválido" };
  }

  try {
    await syncCartToServer(parsed.data.items);
    return { success: true as const };
  } catch {
    return { success: false as const, message: "No se pudo guardar el carrito" };
  }
}

export async function mergeCartAfterLogin() {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const };
    }
    await mergeGuestCartOnLogin(session.user.id);
    return { success: true as const };
  } catch {
    return { success: false as const };
  }
}
