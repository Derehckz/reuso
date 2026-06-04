"use server";

import type { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";

export async function exportOrdersCsv(filters?: {
  status?: string;
  from?: string;
  to?: string;
}) {
  await requirePermission("orders:export");

  const where: Prisma.OrderWhereInput = {};

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status as never;
  }
  if (filters?.from || filters?.to) {
    where.createdAt = {};
    if (filters.from) {
      where.createdAt.gte = new Date(filters.from);
    }
    if (filters.to) {
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: { email: true, name: true } },
      payment: { select: { status: true, externalId: true } },
      shipment: { select: { trackingNumber: true, status: true } },
    },
  });

  const header = [
    "orderNumber",
    "status",
    "total",
    "subtotal",
    "discount",
    "shipping",
    "customerEmail",
    "customerName",
    "paymentStatus",
    "tracking",
    "createdAt",
  ].join(",");

  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.status,
      o.total,
      o.subtotal,
      o.discountAmount,
      o.shippingAmount,
      o.user?.email ?? o.guestEmail ?? "",
      o.user?.name ?? "",
      o.payment?.status ?? "",
      o.shipment?.trackingNumber ?? "",
      o.createdAt.toISOString(),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header, ...rows].join("\n");
}
