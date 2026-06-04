"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/newsletter";
import type { ActionResult } from "@/types/action";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

export async function subscribeNewsletter(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`newsletter:${ip}`, 10, 60 * 60_000);
  if (!rl.allowed) {
    return { success: false, message: rateLimitMessage(rl.retryAfterMs) };
  }

  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, message: "Email inválido" };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: { isActive: true },
      create: { email: parsed.data.email.toLowerCase() },
    });
    return { success: true, message: "¡Suscripción exitosa! Revisa tu correo." };
  } catch {
    return { success: false, message: "No pudimos procesar tu suscripción." };
  }
}
