import { prisma } from "@/lib/prisma";
import { isConnectionError } from "@/lib/pg-pool";
import {
  activeCategory,
  activeSubcategory,
  approvedReview,
  availableStock,
  publishedProduct,
} from "@/lib/prisma-soft-delete";
import type { ProductFilters } from "@/types/product";
import type { SearchCatalogResult } from "@/types/search";
import { catalogSubcategoryHref } from "@/lib/constants/category-subcategories";
import type { Gender, Prisma } from "@/generated/prisma/client";
import { PRODUCT_IMAGE_BY_SLUG } from "@/lib/constants/home-images";
import { categoryRepository } from "@/server/repositories/category.repository";

const DEFAULT_LIMIT = 20;
/** Ventana «nuevos ingresos» (3 semanas). */
const NEW_ARRIVAL_MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;

function isOnSale(
  p: { basePrice: number; compareAtPrice: number | null },
): boolean {
  return p.compareAtPrice != null && p.compareAtPrice > p.basePrice;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const EMPTY_SEARCH_RESULT: SearchCatalogResult = {
  products: [],
  brands: [],
  categories: [],
  totalProducts: 0,
};

type ProductListPage = {
  items: ReturnType<typeof mapListItem>[];
  total: number;
  page: number;
  totalPages: number;
};

function emptyProductPage(page = 1): ProductListPage {
  return { items: [], total: 0, page, totalPages: 0 };
}

/** Una entrada por nombre; el import WC puede repetir color con distinto colorHex. */
function dedupeColorFilterOptions(
  groups: { color: string; colorHex: string | null }[],
): { name: string; hex: string | null }[] {
  const byName = new Map<string, string | null>();
  for (const g of groups) {
    const prev = byName.get(g.color);
    if (prev === undefined) {
      byName.set(g.color, g.colorHex);
    } else if (!prev && g.colorHex) {
      byName.set(g.color, g.colorHex);
    }
  }
  return [...byName.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

async function withDbFallback<T>(
  operation: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isConnectionError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[db] ${operation}: Postgres no disponible — ejecuta «npm run dev:db»`,
        );
      }
      return fallback;
    }
    throw error;
  }
}

/** Usa WebP local si la BD aún tiene placeholders SVG. */
function resolveProductImageUrl(
  slug: string,
  url: string | null | undefined,
): string | null {
  const mapped = PRODUCT_IMAGE_BY_SLUG[slug];
  if (mapped && (!url || url.endsWith(".svg"))) {
    return mapped;
  }
  return url ?? mapped ?? null;
}

const variantInclude = {
  where: { isActive: true, deletedAt: null },
  include: { inventory: true },
  orderBy: [{ size: "asc" as const }, { color: "asc" as const }],
};

/** Galería corta para tarjetas de catálogo (hover). */
const cardImagesInclude = {
  orderBy: { sortOrder: "asc" as const },
  take: 5,
};

const CATEGORY_TAG_PREFIX = "sys-subcat-";

/** Subcategoría y categoría padre activas (catálogo público). */
const publishedSubcategoryTree = {
  ...activeSubcategory,
  category: activeCategory,
} as const;

async function buildWhere(filters: ProductFilters): Promise<Prisma.ProductWhereInput> {
  const andParts: Prisma.ProductWhereInput[] = [
    publishedProduct,
    { subcategory: publishedSubcategoryTree },
  ];

  if (filters.q) {
    andParts.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { brand: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.gender) {
    andParts.push({ gender: filters.gender });
  }

  if (filters.category) {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        ...activeSubcategory,
        OR: [
          { slug: filters.category },
          { slug: { startsWith: `${filters.category}-` } },
          { category: { slug: filters.category, ...activeCategory } },
        ],
      },
      select: { id: true },
    });
    const subcatIds = subcategories.map((s) => s.id);
    if (subcatIds.length === 0) {
      andParts.push({ id: { in: [] } });
    } else {
      andParts.push({
        OR: [
          { subcategoryId: { in: subcatIds } },
          {
            tags: {
              some: {
                tag: {
                  slug: {
                    in: subcatIds.map((id) => `${CATEGORY_TAG_PREFIX}${id}`),
                  },
                },
              },
            },
          },
        ],
      });
    }
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const basePrice: Prisma.IntFilter = {};
    if (filters.minPrice !== undefined) basePrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) basePrice.lte = filters.maxPrice;
    andParts.push({ basePrice });
  }

  if (filters.sizes?.length || filters.colors?.length) {
    const { productIdsWithAvailableStock } = await import(
      "@/server/services/inventory.service"
    );
    const inStockProductIds = await productIdsWithAvailableStock();
    andParts.push({
      id: { in: inStockProductIds },
      variants: {
        some: {
          isActive: true,
          deletedAt: null,
          ...(filters.sizes?.length ? { size: { in: filters.sizes } } : {}),
          ...(filters.colors?.length ? { color: { in: filters.colors } } : {}),
        },
      },
    });
  }

  return { AND: andParts };
}

function buildOrderBy(
  sort?: ProductFilters["sort"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ basePrice: "asc" }];
    case "price_desc":
      return [{ basePrice: "desc" }];
    case "newest":
      return [{ publishedAt: "desc" }];
    case "featured":
      return [{ isFeatured: "desc" }, { publishedAt: "desc" }];
    default:
      return [{ publishedAt: "desc" }];
  }
}

type ProductListRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isNewArrival: boolean;
  images: { url: string; alt: string | null }[];
  variants: {
    inventory: { quantityOnHand: number; quantityReserved: number } | null;
  }[];
  subcategory: {
    name: string;
    slug: string;
    category: { name: string; slug: string };
  };
};

function mapListItem(p: ProductListRow) {
  const resolvedImages = p.images
    .map((img) => resolveProductImageUrl(p.slug, img.url))
    .filter((url): url is string => !!url);
  const uniqueGallery = [...new Set(resolvedImages)];
  const primaryImage = p.images[0];
  const totalStock = p.variants.reduce(
    (sum, v) => sum + availableStock(v.inventory),
    0,
  );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    isNewArrival: p.isNewArrival,
    image: uniqueGallery[0] ?? null,
    imageAlt: primaryImage?.alt ?? p.name,
    gallery: uniqueGallery.length > 1 ? uniqueGallery : undefined,
    totalStock,
    category: {
      name: p.subcategory.category.name,
      slug: p.subcategory.category.slug,
    },
    subcategory: {
      name: p.subcategory.name,
      slug: p.subcategory.slug,
    },
  };
}

export const productRepository = {
  async findMany(filters: ProductFilters = {}) {
    const page = filters.page ?? 1;

    return withDbFallback("product.findMany", async () => {
      const limit = filters.limit ?? DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
      const where = await buildWhere(filters);

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: buildOrderBy(filters.sort),
          skip,
          take: limit,
          include: {
            subcategory: {
              include: { category: { select: { name: true, slug: true } } },
            },
            images: cardImagesInclude,
            variants: variantInclude,
          },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        items: items.map(mapListItem),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 0,
      };
    }, emptyProductPage(page));
  },

  async findBySlug(slug: string) {
    return withDbFallback("product.findBySlug", async () => {
    const product = await prisma.product.findFirst({
      where: { slug, ...publishedProduct },
      include: {
        subcategory: {
          include: { category: { select: { name: true, slug: true } } },
        },
        images: { orderBy: { sortOrder: "asc" } },
        variants: variantInclude,
        reviews: {
          where: approvedReview,
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        relatedFrom: {
          take: 8,
          include: {
            related: {
              include: {
                subcategory: {
                  include: { category: { select: { name: true, slug: true } } },
                },
                images: cardImagesInclude,
                variants: variantInclude,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    const approvedReviews = product.reviews;
    const averageRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) /
          approvedReviews.length
        : 0;

    const totalStock = product.variants.reduce(
      (sum, v) => sum + availableStock(v.inventory),
      0,
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      isNewArrival: product.isNewArrival,
      gender: product.gender,
      condition: product.condition,
      image: resolveProductImageUrl(
        product.slug,
        product.images.find((i) => i.isPrimary)?.url ??
          product.images[0]?.url ??
          null,
      ),
      imageAlt: product.name,
      totalStock,
      category: product.subcategory.category,
      subcategory: {
        name: product.subcategory.name,
        slug: product.subcategory.slug,
      },
      images: product.images.map((i) => ({
        id: i.id,
        url: resolveProductImageUrl(product.slug, i.url) ?? i.url,
        alt: i.alt,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        stock: availableStock(v.inventory),
        price: v.price,
      })),
      related: product.relatedFrom
        .filter(
          (r) =>
            r.related &&
            r.related.isPublished &&
            r.related.deletedAt === null,
        )
        .slice(0, 4)
        .map(({ related: r }) => mapListItem(r)),
      reviews: approvedReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        userName: r.user.name,
        createdAt: r.createdAt,
      })),
      averageRating,
      reviewCount: approvedReviews.length,
    };
    }, null);
  },

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];

    return withDbFallback("product.findByIds", async () => {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, ...publishedProduct },
      include: {
        subcategory: {
          include: { category: { select: { name: true, slug: true } } },
        },
        images: cardImagesInclude,
        variants: variantInclude,
      },
    });

    const byId = new Map(products.map((p) => [p.id, mapListItem(p)]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is ReturnType<typeof mapListItem> => !!item);
    }, []);
  },

  /** Destacados home: en oferta (compareAtPrice), 5 aleatorios por request. */
  async findFeatured(limit = 5) {
    return withDbFallback("product.findFeatured", async () => {
      const baseWhere: Prisma.ProductWhereInput = {
        ...publishedProduct,
        subcategory: publishedSubcategoryTree,
        compareAtPrice: { not: null },
      };
      const include = {
        subcategory: {
          include: { category: { select: { name: true, slug: true } } },
        },
        images: cardImagesInclude,
        variants: variantInclude,
      };

      const pool = await prisma.product.findMany({
        where: baseWhere,
        take: Math.max(limit * 12, 60),
        include,
      });

      const rows = shuffle(pool.filter(isOnSale)).slice(0, limit);

      const items = rows.map(mapListItem);
      return {
        items,
        total: items.length,
        page: 1,
        totalPages: items.length > 0 ? 1 : 0,
      };
    }, emptyProductPage(1));
  },

  /** Novedades: publicados en las últimas 3 semanas, orden aleatorio. */
  async findNewArrivals(limit = 5) {
    return withDbFallback("product.findNewArrivals", async () => {
      const since = new Date(Date.now() - NEW_ARRIVAL_MAX_AGE_MS);
      const baseWhere: Prisma.ProductWhereInput = {
        ...publishedProduct,
        subcategory: publishedSubcategoryTree,
        OR: [
          { publishedAt: { gte: since } },
          { publishedAt: null, createdAt: { gte: since } },
        ],
      };
      const include = {
        subcategory: {
          include: { category: { select: { name: true, slug: true } } },
        },
        images: cardImagesInclude,
        variants: variantInclude,
      };

      const pool = await prisma.product.findMany({
        where: baseWhere,
        take: Math.max(limit * 10, 50),
        include,
      });

      const rows = shuffle(pool).slice(0, limit);

      const items = rows.map(mapListItem);
      return {
        items,
        total: items.length,
        page: 1,
        totalPages: items.length > 0 ? 1 : 0,
      };
    }, emptyProductPage(1));
  },

  async searchSuggestions(q: string, limit = 6) {
    if (!q || q.length < 2) return [];

    return withDbFallback(
      "product.searchSuggestions",
      () =>
        prisma.product.findMany({
          where: {
            ...publishedProduct,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
          take: limit,
        }),
      [],
    );
  },

  async searchCatalog(q: string): Promise<SearchCatalogResult> {
    const term = q.trim();
    if (term.length < 1) {
      return EMPTY_SEARCH_RESULT;
    }

    return withDbFallback("product.searchCatalog", async () => {
    const productWhere: Prisma.ProductWhereInput = {
      ...publishedProduct,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { brand: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ],
    };

    const [products, totalProducts, brandsGrouped, subcategories] =
      await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          select: {
            id: true,
            name: true,
            slug: true,
            brand: true,
            basePrice: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
          take: 6,
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        }),
        prisma.product.count({ where: productWhere }),
        prisma.product.groupBy({
          by: ["brand"],
          where: {
            ...publishedProduct,
            brand: { contains: term, mode: "insensitive", not: null },
          },
          _count: { _all: true },
          orderBy: { _count: { brand: "desc" } },
          take: 5,
        }),
        prisma.subcategory.findMany({
          where: {
            ...activeSubcategory,
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              {
                category: {
                  name: { contains: term, mode: "insensitive" },
                  ...activeCategory,
                },
              },
            ],
          },
          select: {
            name: true,
            slug: true,
            category: { select: { name: true, slug: true, gender: true } },
          },
          take: 4,
        }),
      ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        price: p.basePrice,
        image: resolveProductImageUrl(p.slug, p.images[0]?.url ?? null),
      })),
      brands: brandsGrouped
        .filter((b): b is typeof b & { brand: string } => !!b.brand)
        .map((b) => ({
          name: b.brand,
          productCount: b._count._all,
        })),
      categories: subcategories.map((s) => ({
        name: `${s.category.name} · ${s.name}`,
        href: catalogSubcategoryHref(s.slug, s.category.gender),
      })),
      totalProducts,
    };
    }, EMPTY_SEARCH_RESULT);
  },

  async getFilterOptions(filters?: { gender?: Gender; category?: string }) {
    return withDbFallback(
      "product.getFilterOptions",
      async () => {
    const where: Prisma.ProductWhereInput = {
      ...publishedProduct,
      subcategory: publishedSubcategoryTree,
    };
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.category) {
      where.subcategory = {
        ...publishedSubcategoryTree,
        OR: [
          { slug: filters.category },
          { slug: { startsWith: `${filters.category}-` } },
          { category: { slug: filters.category, ...activeCategory } },
        ],
      };
    }

    const [sizeGroups, colorGroups, priceRange] = await Promise.all([
      prisma.productVariant.groupBy({
        by: ["size"],
        where: {
          isActive: true,
          deletedAt: null,
          product: where,
        },
        orderBy: { size: "asc" },
      }),
      prisma.productVariant.groupBy({
        by: ["color", "colorHex"],
        where: {
          isActive: true,
          deletedAt: null,
          product: where,
        },
      }),
      prisma.product.aggregate({
        where,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return {
      sizes: sizeGroups.map((g) => g.size).sort(),
      colors: dedupeColorFilterOptions(colorGroups),
      minPrice: priceRange._min.basePrice ?? 0,
      maxPrice: priceRange._max.basePrice ?? 300000,
    };
      },
      {
        sizes: [],
        colors: [],
        minPrice: 0,
        maxPrice: 300000,
      },
    );
  },

  async findQuickView(slug: string) {
    return withDbFallback("product.findQuickView", async () => {
    const product = await prisma.product.findFirst({
      where: { slug, ...publishedProduct },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 6 },
        variants: variantInclude,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      shortDescription: product.shortDescription,
      totalStock: product.variants.reduce(
        (sum, v) => sum + availableStock(v.inventory),
        0,
      ),
      images: product.images.map((i) => ({
        id: i.id,
        url: resolveProductImageUrl(product.slug, i.url) ?? i.url,
        alt: i.alt,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        stock: availableStock(v.inventory),
        price: v.price,
      })),
    };
    }, null);
  },

  async getCatalogCategories() {
    return categoryRepository.getNavCategories();
  },
};
