import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/prisma-soft-delete";
import type { ListParams } from "@/lib/admin/query";
import type { Prisma } from "@/generated/prisma/client";
import {
  productIdsNotOnSale,
  productIdsOnSale,
  productIdsOutOfStock,
  productIdsWithAvailableStock,
  productIdsWithLowStock,
} from "@/server/services/inventory.service";

const CATEGORY_TAG_PREFIX = "sys-subcat-";

export type AdminProductListFilters = {
  status?: "published" | "draft" | "all";
  categoryId?: string;
  stock?: "all" | "in_stock" | "out_of_stock" | "low_stock";
  offer?: "all" | "on_sale" | "no_sale";
};

function intersectIds(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return a.filter((id) => set.has(id));
}

async function resolveStockFilterIds(
  stock?: AdminProductListFilters["stock"],
): Promise<string[] | undefined> {
  if (!stock || stock === "all") return undefined;
  if (stock === "in_stock") return productIdsWithAvailableStock();
  if (stock === "out_of_stock") return productIdsOutOfStock();
  return productIdsWithLowStock();
}

async function resolveOfferFilterIds(
  offer?: AdminProductListFilters["offer"],
): Promise<string[] | undefined> {
  if (!offer || offer === "all") return undefined;
  if (offer === "on_sale") return productIdsOnSale();
  return productIdsNotOnSale();
}

export async function listAdminProducts(
  params: ListParams,
  filters: AdminProductListFilters = {},
) {
  let categoryOr: Prisma.ProductWhereInput[] | undefined;
  if (filters.categoryId) {
    const subcats = await prisma.subcategory.findMany({
      where: { categoryId: filters.categoryId, deletedAt: null },
      select: { id: true },
    });
    const subcatIds = subcats.map((s) => s.id);
    categoryOr = [
      { subcategoryId: { in: subcatIds } },
      {
        tags: {
          some: {
            tag: {
              slug: { in: subcatIds.map((id) => `${CATEGORY_TAG_PREFIX}${id}`) },
            },
          },
        },
      },
    ];
  }

  let stockIds = await resolveStockFilterIds(filters.stock);
  const offerIds = await resolveOfferFilterIds(filters.offer);
  if (stockIds && offerIds) {
    stockIds = intersectIds(stockIds, offerIds);
  } else if (offerIds) {
    stockIds = offerIds;
  }

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(filters.status === "published" && { isPublished: true }),
    ...(filters.status === "draft" && { isPublished: false }),
    ...(categoryOr && { OR: categoryOr }),
    ...(stockIds && { id: { in: stockIds } }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { sku: { contains: params.q, mode: "insensitive" } },
        { brand: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "name"
      ? { name: params.order }
      : params.sort === "price"
        ? { basePrice: params.order }
        : { updatedAt: params.order };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: {
        subcategory: { include: { category: { select: { id: true, name: true } } } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const mapped = items.map((p) => {
    const stock = p.variants.reduce(
      (s, v) => s + availableStock(v.inventory),
      0,
    );
    const onSale =
      p.compareAtPrice != null && p.compareAtPrice > p.basePrice;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      basePrice: p.basePrice,
      compareAtPrice: p.compareAtPrice,
      isPublished: p.isPublished,
      categoryName: p.subcategory.category.name,
      subcategoryName: p.subcategory.name,
      imageUrl: p.images[0]?.url ?? null,
      stock,
      variantCount: p.variants.length,
      updatedAt: p.updatedAt,
      onSale,
      isLowStock: p.variants.some((v) => {
        const available = availableStock(v.inventory);
        const threshold = v.inventory?.lowStockThreshold ?? 1;
        return available > 0 && available <= threshold;
      }),
    };
  });

  return { items: mapped, total };
}

export async function getAdminProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      subcategory: { include: { category: true } },
      images: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      variants: {
        where: { deletedAt: null },
        include: { inventory: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getSubcategoriesForSelect() {
  return prisma.subcategory.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { category: { select: { id: true, name: true, slug: true, gender: true } } },
  });
}
