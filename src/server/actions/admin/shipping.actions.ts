"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-admin";
import { generateLabelForOrder } from "@/server/services/shipping.service";

export async function createShipmentLabel(orderId: string) {
  await requirePermission("orders:write");
  const result = await generateLabelForOrder(orderId);
  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/ordenes");
  return result;
}
