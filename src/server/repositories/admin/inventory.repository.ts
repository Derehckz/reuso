import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/prisma-soft-delete";
import type { ListParams } from "@/lib/admin/query";
import type { Prisma } from "@/generated/prisma/client";

export type InventoryListFilters = {
  lowStockOnly?: boolean;
};

function mapVariantRow(
  v: {
    id: string;
    size: string;
    color: string;
    sku: string | null;
    inventory: {
      quantityOnHand: number;
      quantityReserved: number;
      lowStockThreshold: number;
    } | null;
    product: {
      id: string;
      name: string;
      slug: string;
      sku: string | null;
      images: { url: string }[];
    };
  },
) {
  const onHand = v.inventory?.quantityOnHand ?? 0;
  const reserved = v.inventory?.quantityReserved ?? 0;
  const available = availableStock(v.inventory);
  const threshold = v.inventory?.lowStockThreshold ?? 1;
  return {
    variantId: v.id,
    productId: v.product.id,
    productName: v.product.name,
    productSlug: v.product.slug,
    imageUrl: v.product.images[0]?.url ?? null,
    sku: v.sku ?? v.product.sku,
    size: v.size,
    color: v.color,
    onHand,
    reserved,
    available,
    threshold,
    isLowStock: available > 0 && available <= threshold,
  };
}

const variantInclude = {
  inventory: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  },
} as const;

export async function listAdminInventory(
  params: ListParams,
  filters: InventoryListFilters = {},
) {
  if (filters.lowStockOnly) {
    const q = params.q?.trim();
    const like = q ? `%${q}%` : null;
    const rows = like
      ? await prisma.$queryRaw<{ id: string }[]>`
          SELECT pv.id
          FROM product_variants pv
          INNER JOIN products p ON p.id = pv."productId"
          INNER JOIN inventory i ON i."variantId" = pv.id
          WHERE pv."deletedAt" IS NULL
            AND pv."isActive" = true
            AND p."deletedAt" IS NULL
            AND (i."quantityOnHand" - i."quantityReserved") > 0
            AND (i."quantityOnHand" - i."quantityReserved") <= i."lowStockThreshold"
            AND (
              pv.sku ILIKE ${like}
              OR p.name ILIKE ${like}
              OR pv.size ILIKE ${like}
              OR pv.color ILIKE ${like}
            )
          ORDER BY pv."updatedAt" DESC
        `
      : await prisma.$queryRaw<{ id: string }[]>`
          SELECT pv.id
          FROM product_variants pv
          INNER JOIN products p ON p.id = pv."productId"
          INNER JOIN inventory i ON i."variantId" = pv.id
          WHERE pv."deletedAt" IS NULL
            AND pv."isActive" = true
            AND p."deletedAt" IS NULL
            AND (i."quantityOnHand" - i."quantityReserved") > 0
            AND (i."quantityOnHand" - i."quantityReserved") <= i."lowStockThreshold"
          ORDER BY pv."updatedAt" DESC
        `;

    const total = rows.length;
    const pageIds = rows
      .slice((params.page - 1) * params.perPage, params.page * params.perPage)
      .map((r) => r.id);

    if (pageIds.length === 0) {
      return { items: [], total };
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: pageIds } },
      include: variantInclude,
    });
    const orderMap = new Map(pageIds.map((id, i) => [id, i]));
    variants.sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
    );

    return { items: variants.map(mapVariantRow), total };
  }

  const where: Prisma.ProductVariantWhereInput = {
    deletedAt: null,
    isActive: true,
    product: { deletedAt: null },
    ...(params.q && {
      OR: [
        { sku: { contains: params.q, mode: "insensitive" } },
        { product: { name: { contains: params.q, mode: "insensitive" } } },
        { size: { contains: params.q, mode: "insensitive" } },
        { color: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };

  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: variantInclude,
    }),
    prisma.productVariant.count({ where }),
  ]);

  return {
    items: variants.map(mapVariantRow),
    total,
  };
}

export async function listInventoryAdjustments(variantId: string, limit = 20) {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    select: { id: true },
  });
  if (!inventory) return [];

  return prisma.inventoryAdjustment.findMany({
    where: { inventoryId: inventory.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
