import { prisma } from "@/lib/prisma";
import type { ListParams } from "@/lib/admin/query";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export type AdminOrderListFilters = {
  status?: OrderStatus;
};

export async function listAdminOrders(
  params: ListParams,
  filters: AdminOrderListFilters = {},
) {
  const where: Prisma.OrderWhereInput = {
    ...(filters.status && { status: filters.status }),
    ...(params.q && {
      OR: [
        { orderNumber: { contains: params.q, mode: "insensitive" } },
        { guestEmail: { contains: params.q, mode: "insensitive" } },
        { user: { email: { contains: params.q, mode: "insensitive" } } },
        { user: { name: { contains: params.q, mode: "insensitive" } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: params.order },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
        shipment: { select: { status: true, trackingNumber: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      payment: true,
      shipment: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      coupon: { select: { code: true } },
      adminNotes: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
}
