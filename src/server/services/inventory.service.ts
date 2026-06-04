import type { OrderItem, OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type InventoryTx = Prisma.TransactionClient;

/** Reserva stock de forma atómica (onHand - reserved >= qty). */
export async function reserveInventoryAtomic(
  tx: InventoryTx,
  variantId: string,
  quantity: number,
): Promise<boolean> {
  if (quantity <= 0) return false;

  const updated = await tx.$executeRaw`
    UPDATE inventory
    SET "quantityReserved" = "quantityReserved" + ${quantity},
        "updatedAt" = NOW()
    WHERE "variantId" = ${variantId}
      AND ("quantityOnHand" - "quantityReserved") >= ${quantity}
  `;
  return Number(updated) > 0;
}

/** Libera reservas sin dejar quantityReserved negativo. */
export async function releaseInventoryReservations(
  tx: InventoryTx,
  items: Pick<OrderItem, "variantId" | "quantity">[],
) {
  for (const item of items) {
    await tx.$executeRaw`
      UPDATE inventory
      SET "quantityReserved" = GREATEST(0, "quantityReserved" - ${item.quantity}),
          "updatedAt" = NOW()
      WHERE "variantId" = ${item.variantId}
    `;
  }
}

/** Convierte reserva en venta (pago confirmado). */
export async function finalizeInventoryForOrderItems(
  tx: InventoryTx,
  items: Pick<OrderItem, "variantId" | "quantity">[],
) {
  for (const item of items) {
    await tx.$executeRaw`
      UPDATE inventory
      SET "quantityOnHand" = GREATEST(0, "quantityOnHand" - ${item.quantity}),
          "quantityReserved" = GREATEST(0, "quantityReserved" - ${item.quantity}),
          "updatedAt" = NOW()
      WHERE "variantId" = ${item.variantId}
    `;
  }
}

const INVENTORY_RESTOCK_MARKER = "inventory_restocked";

/** Devuelve unidades vendidas al inventario (reembolso). */
export async function restockInventoryItems(
  tx: InventoryTx,
  items: Pick<OrderItem, "variantId" | "quantity">[],
) {
  for (const item of items) {
    await tx.inventory.update({
      where: { variantId: item.variantId },
      data: { quantityOnHand: { increment: item.quantity } },
    });
  }
}

/** Evita doble restock si webhook y admin marcan reembolso. */
export async function restockOrderInventoryOnce(
  tx: InventoryTx,
  orderId: string,
  orderStatus: OrderStatus,
  items: Pick<OrderItem, "variantId" | "quantity">[],
): Promise<boolean> {
  const already = await tx.orderStatusHistory.findFirst({
    where: { orderId, note: INVENTORY_RESTOCK_MARKER },
    select: { id: true },
  });
  if (already) return false;

  await restockInventoryItems(tx, items);
  await tx.orderStatusHistory.create({
    data: {
      orderId,
      status: orderStatus,
      note: INVENTORY_RESTOCK_MARKER,
    },
  });
  return true;
}

/** Fija onHand respetando unidades ya reservadas. */
export async function setInventoryOnHandSafe(
  tx: InventoryTx,
  variantId: string,
  targetOnHand: number,
  lowStockThreshold: number,
  note: string,
) {
  const inventory = await tx.inventory.findUnique({ where: { variantId } });
  if (!inventory) {
    await tx.inventory.create({
      data: {
        variantId,
        quantityOnHand: Math.max(0, targetOnHand),
        quantityReserved: 0,
        lowStockThreshold: Math.max(1, lowStockThreshold),
      },
    });
    return;
  }

  const safeOnHand = Math.max(inventory.quantityReserved, Math.max(0, targetOnHand));
  const delta = safeOnHand - inventory.quantityOnHand;

  if (delta === 0) {
    if (inventory.lowStockThreshold !== Math.max(1, lowStockThreshold)) {
      await tx.inventory.update({
        where: { variantId },
        data: { lowStockThreshold: Math.max(1, lowStockThreshold) },
      });
    }
    return;
  }

  await tx.inventory.update({
    where: { variantId },
    data: {
      quantityOnHand: safeOnHand,
      lowStockThreshold: Math.max(1, lowStockThreshold),
    },
  });

  await tx.inventoryAdjustment.create({
    data: {
      inventoryId: inventory.id,
      type: delta > 0 ? "RESTOCK" : "CORRECTION",
      quantity: delta,
      note,
    },
  });
}

/** Incrementa cupón solo si aún hay cupos (atómico). */
export async function reserveCouponAtomic(
  tx: InventoryTx,
  couponId: string,
): Promise<boolean> {
  const updated = await tx.$executeRaw`
    UPDATE coupons
    SET "usedCount" = "usedCount" + 1,
        "updatedAt" = NOW()
    WHERE id = ${couponId}
      AND "isActive" = true
      AND "deletedAt" IS NULL
      AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
  `;
  return Number(updated) > 0;
}

/** Devuelve un cupo de cupón (orden cancelada sin pago). */
export async function releaseCouponReservation(
  tx: InventoryTx,
  couponId: string,
) {
  await tx.$executeRaw`
    UPDATE coupons
    SET "usedCount" = GREATEST(0, "usedCount" - 1),
        "updatedAt" = NOW()
    WHERE id = ${couponId}
  `;
}

/** IDs de productos con al menos una variante con stock disponible real. */
export async function productIdsWithAvailableStock(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT DISTINCT pv."productId" AS "productId"
    FROM product_variants pv
    INNER JOIN inventory i ON i."variantId" = pv.id
    WHERE pv."deletedAt" IS NULL
      AND pv."isActive" = true
      AND i."quantityOnHand" > i."quantityReserved"
  `;
  return rows.map((r) => r.productId);
}

export async function productIdsOutOfStock(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM products p
    WHERE p."deletedAt" IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM product_variants pv
        INNER JOIN inventory i ON i."variantId" = pv.id
        WHERE pv."productId" = p.id
          AND pv."deletedAt" IS NULL
          AND pv."isActive" = true
          AND i."quantityOnHand" > i."quantityReserved"
      )
  `;
  return rows.map((r) => r.id);
}

export async function productIdsWithLowStock(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT DISTINCT pv."productId" AS "productId"
    FROM product_variants pv
    INNER JOIN inventory i ON i."variantId" = pv.id
    WHERE pv."deletedAt" IS NULL
      AND pv."isActive" = true
      AND (i."quantityOnHand" - i."quantityReserved") > 0
      AND (i."quantityOnHand" - i."quantityReserved") <= i."lowStockThreshold"
  `;
  return rows.map((r) => r.productId);
}

export async function productIdsOnSale(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM products
    WHERE "deletedAt" IS NULL
      AND "compareAtPrice" IS NOT NULL
      AND "compareAtPrice" > "basePrice"
  `;
  return rows.map((r) => r.id);
}

export async function productIdsNotOnSale(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM products
    WHERE "deletedAt" IS NULL
      AND ("compareAtPrice" IS NULL OR "compareAtPrice" <= "basePrice")
  `;
  return rows.map((r) => r.id);
}
