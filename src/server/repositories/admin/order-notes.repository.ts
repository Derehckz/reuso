import { prisma } from "@/lib/prisma";

export async function listOrderNotes(orderId: string) {
  return prisma.orderNote.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createOrderNote(data: {
  orderId: string;
  userId: string;
  body: string;
  isInternal?: boolean;
}) {
  return prisma.orderNote.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      body: data.body,
      isInternal: data.isInternal ?? true,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
