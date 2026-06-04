import type { OrderItem, Prisma } from "@/generated/prisma/client";
import {
  finalizeInventoryForOrderItems,
  releaseInventoryReservations,
  restockInventoryItems,
} from "@/server/services/inventory.service";

type Tx = Prisma.TransactionClient;

/** @deprecated Use releaseInventoryReservations from inventory.service */
export async function releaseOrderReservations(
  tx: Tx,
  items: Pick<OrderItem, "variantId" | "quantity">[],
) {
  return releaseInventoryReservations(tx, items);
}

/** @deprecated Use restockInventoryItems from inventory.service */
export async function restockOrderItems(
  tx: Tx,
  items: Pick<OrderItem, "variantId" | "quantity">[],
) {
  return restockInventoryItems(tx, items);
}

export { finalizeInventoryForOrderItems };
