import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import {
  cartRepository,
  CART_SESSION_COOKIE,
} from "@/server/repositories/cart.repository";
import type { CartItemInput } from "@/server/services/checkout.service";

export async function getOrCreateGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = `guest_${nanoid(24)}`;
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return sessionId;
}

export async function syncCartToServer(items: CartItemInput[]) {
  const session = await auth();
  const sanitized = items
    .filter((i) => i.quantity > 0 && i.variantId && i.productId)
    .map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: Math.min(10, Math.max(1, i.quantity)),
    }));

  if (session?.user?.id) {
    const cart = await cartRepository.ensureUserCart(session.user.id);
    await cartRepository.replaceItems(cart.id, sanitized);
    return { cartId: cart.id, userId: session.user.id };
  }

  const sessionId = await getOrCreateGuestSessionId();
  const cart = await cartRepository.ensureGuestCart(sessionId);
  await cartRepository.replaceItems(cart.id, sanitized);
  return { cartId: cart.id, sessionId };
}

export async function mergeGuestCartOnLogin(userId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) return;

  const [guestCart, userCart] = await Promise.all([
    cartRepository.findBySessionId(sessionId),
    cartRepository.ensureUserCart(userId),
  ]);

  if (guestCart?.items.length) {
    await cartRepository.mergeGuestIntoUser(guestCart.id, userCart.id);
  }

  cookieStore.delete(CART_SESSION_COOKIE);
}

export async function loadServerCartItems(): Promise<CartItemInput[]> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user?.id) {
    const cart = await cartRepository.findByUserId(session.user.id);
    return (
      cart?.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })) ?? []
    );
  }

  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) return [];

  const cart = await cartRepository.findBySessionId(sessionId);
  return (
    cart?.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })) ?? []
  );
}
