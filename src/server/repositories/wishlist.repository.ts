import { prisma } from "@/lib/prisma";

export const wishlistRepository = {
  async getProductIdsForUser(userId: string) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      select: {
        items: { select: { productId: true }, orderBy: { createdAt: "desc" } },
      },
    });

    return wishlist?.items.map((i) => i.productId) ?? [];
  },

  async replaceItems(userId: string, productIds: string[]) {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.$transaction([
      prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } }),
      ...(productIds.length > 0
        ? [
            prisma.wishlistItem.createMany({
              data: productIds.map((productId) => ({
                wishlistId: wishlist.id,
                productId,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  },
};
