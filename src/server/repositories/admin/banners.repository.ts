import { prisma } from "@/lib/prisma";

export async function listAdminBanners() {
  return prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAdminBannerById(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}

export async function createBannerRecord(data: {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileUrl?: string | null;
  link?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
}) {
  return prisma.banner.create({ data });
}

export async function updateBannerRecord(
  id: string,
  data: Partial<{
    title: string;
    subtitle: string | null;
    imageUrl: string;
    mobileUrl: string | null;
    link: string | null;
    sortOrder: number;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  }>,
) {
  return prisma.banner.update({ where: { id }, data });
}

export async function deleteBannerRecord(id: string) {
  return prisma.banner.delete({ where: { id } });
}
