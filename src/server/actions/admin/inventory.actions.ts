"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-admin";
import { inventoryAdjustSchema } from "@/lib/validations/admin";
import { setInventoryOnHandSafe } from "@/server/services/inventory.service";

export async function adjustInventory(formData: FormData) {
  await requirePermission("inventory:write");

  const parsed = inventoryAdjustSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const { variantId, quantity, note } = parsed.data;

  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
  });

  if (!inventory) {
    return { success: false as const, message: "Inventario no encontrado" };
  }

  const targetOnHand = Math.max(
    inventory.quantityReserved,
    Math.max(0, inventory.quantityOnHand + quantity),
  );

  await prisma.$transaction(async (tx) => {
    await setInventoryOnHandSafe(
      tx,
      variantId,
      targetOnHand,
      inventory.lowStockThreshold,
      note ?? "Ajuste manual admin",
    );
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  return { success: true as const, newStock: targetOnHand };
}

export async function setInventoryStock(variantId: string, stock: number) {
  await requirePermission("inventory:write");

  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
  });
  if (!inventory) {
    return { success: false as const, message: "Inventario no encontrado" };
  }

  await prisma.$transaction(async (tx) => {
    await setInventoryOnHandSafe(
      tx,
      variantId,
      stock,
      inventory.lowStockThreshold,
      "Stock fijado desde panel admin",
    );
  });

  revalidatePath("/admin/inventario");
  return { success: true as const };
}

export async function setLowStockThreshold(variantId: string, threshold: number) {
  await requirePermission("inventory:write");

  if (threshold < 1) {
    return { success: false as const, message: "El umbral debe ser al menos 1" };
  }

  await prisma.inventory.update({
    where: { variantId },
    data: { lowStockThreshold: threshold },
  });

  revalidatePath("/admin/inventario");
  return { success: true as const };
}

export async function getInventoryAdjustments(variantId: string) {
  await requirePermission("inventory:write");
  const { listInventoryAdjustments } = await import(
    "@/server/repositories/admin/inventory.repository"
  );
  return listInventoryAdjustments(variantId);
}
