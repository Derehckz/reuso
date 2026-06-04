"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { productRepository } from "@/server/repositories/product.repository";
import { wishlistRepository } from "@/server/repositories/wishlist.repository";

const productIdsSchema = z
  .array(z.string().min(1).max(40))
  .max(100);

export async function getWishlistProducts(productIds: string[]) {
  const parsed = productIdsSchema.safeParse(productIds);
  if (!parsed.success || parsed.data.length === 0) return [];
  try {
    return await productRepository.findByIds(parsed.data);
  } catch (error) {
    console.error("[wishlist] getWishlistProducts:", error);
    return [];
  }
}

/** Une favoritos locales con la cuenta y persiste en BD si hay sesión. */
export async function mergeWishlist(localIds: string[]) {
  const parsed = productIdsSchema.safeParse(localIds);
  const ids = parsed.success ? parsed.data : [];

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { productIds: ids, synced: false as const };
  }

  try {
    const dbIds = await wishlistRepository.getProductIdsForUser(userId);
    const merged = [...new Set([...dbIds, ...ids])];
    await wishlistRepository.replaceItems(userId, merged);
    return { productIds: merged, synced: true as const };
  } catch (error) {
    console.error("[wishlist] mergeWishlist:", error);
    return { productIds: ids, synced: false as const };
  }
}

export async function persistWishlist(productIds: string[]) {
  const parsed = productIdsSchema.safeParse(productIds);
  if (!parsed.success) return { synced: false as const };

  const session = await auth();
  if (!session?.user?.id) return { synced: false as const };

  try {
    await wishlistRepository.replaceItems(session.user.id, parsed.data);
    return { synced: true as const };
  } catch (error) {
    console.error("[wishlist] persistWishlist:", error);
    return { synced: false as const };
  }
}
