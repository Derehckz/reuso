import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/prisma-soft-delete";

const PAID_STATUSES = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export async function getDashboardMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    productCount,
    publishedCount,
    orderCount,
    ordersToday,
    pendingOrders,
    customerCount,
    revenueAll,
    revenueMonth,
    recentOrders,
    lowStockVariants,
    ordersByStatus,
    recentCustomers,
    topProductsRaw,
    paidOrdersCount,
    allOrdersLast30,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({
      where: { deletedAt: null, isPublished: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({
      where: { status: { in: ["AWAITING_PAYMENT", "PAID", "PROCESSING"] } },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER", deletedAt: null },
    }),
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: [...PAID_STATUSES] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        guestEmail: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        inventory: true,
        product: { select: { id: true, name: true, slug: true } },
      },
      take: 100,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: { in: [...PAID_STATUSES] },
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.count({
      where: { status: { in: [...PAID_STATUSES] } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const productIds = topProductsRaw.map((t) => t.productId);
  const topProductDetails =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true, brand: true },
        })
      : [];
  const productMap = new Map(topProductDetails.map((p) => [p.id, p]));

  const topProducts = topProductsRaw.map((row) => ({
    productId: row.productId,
    quantity: row._sum.quantity ?? 0,
    product: productMap.get(row.productId),
  }));

  const lowStock = lowStockVariants
    .filter((v) => {
      const avail = availableStock(v.inventory);
      const threshold = v.inventory?.lowStockThreshold ?? 1;
      return avail <= threshold;
    })
    .slice(0, 10)
    .map((v) => ({
      id: v.id,
      productId: v.product.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      size: v.size,
      color: v.color,
      stock: availableStock(v.inventory),
    }));

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 6);
  rangeStart.setHours(0, 0, 0, 0);

  const paidOrdersLast7 = await prisma.order.findMany({
    where: {
      createdAt: { gte: rangeStart },
      status: { in: [...PAID_STATUSES] },
    },
    select: { total: true, createdAt: true },
  });

  const totalsByDay = new Map<string, { total: number; count: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    totalsByDay.set(key, { total: 0, count: 0 });
  }

  for (const order of paidOrdersLast7) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    const bucket = totalsByDay.get(key);
    if (bucket) {
      bucket.total += order.total;
      bucket.count += 1;
    }
  }

  const last7Days: { date: string; total: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const bucket = totalsByDay.get(key) ?? { total: 0, count: 0 };
    last7Days.push({
      date: d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" }),
      total: bucket.total,
      count: bucket.count,
    });
  }

  const conversionRate =
    allOrdersLast30 > 0
      ? Math.round((paidOrdersCount / allOrdersLast30) * 1000) / 10
      : 0;

  return {
    productCount,
    publishedCount,
    orderCount,
    ordersToday,
    pendingOrders,
    customerCount,
    revenueAll: revenueAll._sum.total ?? 0,
    revenueMonth: revenueMonth._sum.total ?? 0,
    recentOrders,
    recentCustomers,
    topProducts,
    conversionRate,
    lowStock,
    ordersByStatus: ordersByStatus.map((o) => ({
      status: o.status,
      count: o._count.status,
    })),
    last7Days,
  };
}
