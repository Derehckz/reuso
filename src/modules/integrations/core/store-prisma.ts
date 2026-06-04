import { prisma } from "@/lib/prisma";
import type { IntegrationStore } from "./types";

export function createPrismaIntegrationStore(): IntegrationStore {
  return {
    async get(key) {
      const row = await prisma.storeSetting.findUnique({
        where: { key },
        select: { value: true },
      });
      return row?.value ?? null;
    },
    async set(key, value) {
      await prisma.storeSetting.upsert({
        where: { key },
        create: { key, value: value as object },
        update: { value: value as object },
      });
    },
  };
}
