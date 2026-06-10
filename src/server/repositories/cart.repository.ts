import { prisma } from "@/lib/prisma";
import type { CartItemInput } from "@/server/services/checkout.service";

export const CART_SESSION_COOKIE = "reuso_cart_session";

export const cartRepository = {
  async findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
                inventory: true,
              },
            },
          },
        },
      },
    });
  },

  async findBySessionId(sessionId: string) {
    return prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
  },

  async ensureUserCart(userId: string) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  async ensureGuestCart(sessionId: string) {
    return prisma.cart.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });
  },

  async replaceItems(cartId: string, items: CartItemInput[]) {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId } });
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((i) => ({
            cartId,
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        });
      }
    });
  },

  async mergeGuestIntoUser(guestCartId: string, userCartId: string) {
    const [guestItems, userItems] = await Promise.all([
      prisma.cartItem.findMany({ where: { cartId: guestCartId } }),
      prisma.cartItem.findMany({ where: { cartId: userCartId } }),
    ]);

    const merged = new Map<string, CartItemInput>();

    for (const item of userItems) {
      merged.set(item.variantId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    for (const item of guestItems) {
      const existing = merged.get(item.variantId);
      if (existing) {
        merged.set(item.variantId, {
          ...existing,
          quantity: Math.min(10, existing.quantity + item.quantity),
        });
      } else {
        merged.set(item.variantId, {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
    }

    await cartRepository.replaceItems(userCartId, [...merged.values()]);
    await prisma.cart.delete({ where: { id: guestCartId } }).catch(() => undefined);
  },
};
