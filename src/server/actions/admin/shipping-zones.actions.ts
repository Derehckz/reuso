"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/auth-admin";

export async function listShippingZones() {
  await requireAdminOnly();
  return prisma.shippingZone.findMany({
    orderBy: { name: "asc" },
  });
}

export async function upsertShippingZone(formData: FormData) {
  await requireAdminOnly();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const regionCode = String(formData.get("regionCode") ?? "").trim().toUpperCase();
  const basePrice = Number.parseInt(String(formData.get("basePrice") ?? ""), 10);
  const isActive = formData.get("isActive") === "on";

  if (!name || !regionCode || Number.isNaN(basePrice) || basePrice < 0) {
    return { success: false as const, message: "Datos inválidos" };
  }

  if (id) {
    await prisma.shippingZone.update({
      where: { id },
      data: { name, regionCode, basePrice, isActive },
    });
  } else {
    await prisma.shippingZone.create({
      data: { name, regionCode, basePrice, isActive },
    });
  }

  revalidatePath("/admin/configuracion");
  return { success: true as const };
}

export async function deleteShippingZone(id: string) {
  await requireAdminOnly();
  await prisma.shippingZone.delete({ where: { id } });
  revalidatePath("/admin/configuracion");
  return { success: true as const };
}
