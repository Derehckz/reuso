import { prisma } from "@/lib/prisma";
import type { ListParams } from "@/lib/admin/query";
import type { CouponType, Prisma } from "@/generated/prisma/client";

export type AdminCouponListFilters = {
  active?: "1" | "0";
};

export async function listAdminCoupons(
  params: ListParams,
  filters: AdminCouponListFilters = {},
) {
  const where: Prisma.CouponWhereInput = {
    deletedAt: null,
    ...(filters.active === "1" && { isActive: true }),
    ...(filters.active === "0" && { isActive: false }),
    ...(params.q && {
      code: { contains: params.q, mode: "insensitive" },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items, total };
}

export async function getAdminCouponById(id: string) {
  return prisma.coupon.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createCouponRecord(data: {
  code: string;
  type: CouponType;
  value: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive: boolean;
}) {
  return prisma.coupon.create({ data });
}

export async function updateCouponRecord(
  id: string,
  data: Partial<{
    code: string;
    type: CouponType;
    value: number;
    minPurchase: number | null;
    maxUses: number | null;
    startsAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
  }>,
) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function softDeleteCoupon(id: string) {
  return prisma.coupon.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}
