"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission, requireAdminOnly } from "@/lib/auth-admin";
import { couponFormSchema } from "@/lib/validations/admin-cms";
import {
  createCouponRecord,
  softDeleteCoupon,
  updateCouponRecord,
} from "@/server/repositories/admin/coupons.repository";
import { writeAuditLog } from "@/shared/audit/audit.service";

function parseOptionalDate(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCoupon(formData: FormData) {
  const session = await requirePermission("coupons:write");

  const parsed = couponFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const data = parsed.data;
  const coupon = await createCouponRecord({
    code: data.code.toUpperCase().trim(),
    type: data.type,
    value: data.value,
    minPurchase: data.minPurchase ?? null,
    maxUses: data.maxUses ?? null,
    startsAt: parseOptionalDate(data.startsAt),
    expiresAt: parseOptionalDate(data.expiresAt),
    isActive: data.isActive ?? true,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "coupon.create",
    entity: "Coupon",
    entityId: coupon.id,
    metadata: { code: coupon.code },
  });

  revalidatePath("/admin/cupones");
  redirect(`/admin/cupones/${coupon.id}`);
}

export async function updateCoupon(couponId: string, formData: FormData) {
  const session = await requirePermission("coupons:write");

  const parsed = couponFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const data = parsed.data;
  await updateCouponRecord(couponId, {
    code: data.code.toUpperCase().trim(),
    type: data.type,
    value: data.value,
    minPurchase: data.minPurchase ?? null,
    maxUses: data.maxUses ?? null,
    startsAt: parseOptionalDate(data.startsAt),
    expiresAt: parseOptionalDate(data.expiresAt),
    isActive: data.isActive ?? true,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "coupon.update",
    entity: "Coupon",
    entityId: couponId,
  });

  revalidatePath("/admin/cupones");
  revalidatePath(`/admin/cupones/${couponId}`);
  return { success: true as const };
}

export async function deleteCoupon(couponId: string) {
  const session = await requireAdminOnly();
  await softDeleteCoupon(couponId);
  await writeAuditLog({
    userId: session.user.id,
    action: "coupon.delete",
    entity: "Coupon",
    entityId: couponId,
  });
  revalidatePath("/admin/cupones");
  return { success: true as const };
}
