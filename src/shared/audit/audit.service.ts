import { headers } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/shared/rate-limit";

export type AuditPayload = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(payload: AuditPayload) {
  let ip: string | undefined;
  try {
    const hdrs = await headers();
    ip = clientIp(hdrs);
  } catch {
    ip = undefined;
  }

  await prisma.auditLog.create({
    data: {
      userId: payload.userId ?? null,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId ?? null,
      metadata: (payload.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      ip,
    },
  });
}
