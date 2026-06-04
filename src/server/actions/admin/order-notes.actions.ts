"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-admin";
import { orderNoteSchema } from "@/lib/validations/admin-cms";
import { createOrderNote } from "@/server/repositories/admin/order-notes.repository";
import { writeAuditLog } from "@/shared/audit/audit.service";

export async function addOrderNote(orderId: string, formData: FormData) {
  const session = await requirePermission("orders:write");

  const parsed = orderNoteSchema.safeParse({
    body: formData.get("body"),
    isInternal: formData.get("isInternal") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Nota inválida" };
  }

  await createOrderNote({
    orderId,
    userId: session.user.id,
    body: parsed.data.body,
    isInternal: parsed.data.isInternal ?? true,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "order.note",
    entity: "Order",
    entityId: orderId,
  });

  revalidatePath(`/admin/ordenes/${orderId}`);
  return { success: true as const };
}
