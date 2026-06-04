import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/mujer`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/hombre`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/ropa-deportiva`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
    });

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${base}/productos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
