import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isConnectionError } from "@/lib/pg-pool";
import { BRAND_LOGOS } from "@/lib/constants/brand-logos";
import { CACHE_TAGS } from "@/shared/cache/tags";

export type BrandLogoRow = {
  id: string;
  name: string;
  imageUrl: string;
};

async function loadActiveBrandLogos(): Promise<BrandLogoRow[]> {
  try {
    return await prisma.brandLogo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, imageUrl: true },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      return BRAND_LOGOS.map((b) => ({
        id: b.id,
        name: b.name,
        imageUrl: b.imageSrc,
      }));
    }
    throw error;
  }
}

export const brandLogoRepository = {
  getActiveLogos() {
    return unstable_cache(
      loadActiveBrandLogos,
      ["brand-logos-active"],
      { tags: [CACHE_TAGS.brandLogos], revalidate: 600 },
    )();
  },
};
