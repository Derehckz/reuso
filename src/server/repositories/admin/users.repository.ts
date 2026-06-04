import { prisma } from "@/lib/prisma";
import type { ListParams } from "@/lib/admin/query";
import type { Prisma, UserRole } from "@/generated/prisma/client";

export type AdminUserListFilters = {
  role?: UserRole;
  blocked?: "1" | "0";
};

export async function listAdminUsers(
  params: ListParams,
  filters: AdminUserListFilters = {},
) {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(filters.role && { role: filters.role }),
    ...(filters.blocked === "1" && { isBlocked: true }),
    ...(filters.blocked === "0" && { isBlocked: false }),
    ...(params.q && {
      OR: [
        { email: { contains: params.q, mode: "insensitive" } },
        { name: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: params.order },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export async function getAdminUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isBlocked: true,
      createdAt: true,
      _count: { select: { orders: true, addresses: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      addresses: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          label: true,
          street: true,
          commune: true,
          region: true,
          isDefault: true,
        },
      },
    },
  });
}
