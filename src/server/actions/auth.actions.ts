"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types/action";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

export async function registerUser(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`register:${ip}`, 5, 60 * 60_000);
  if (!rl.allowed) {
    return { success: false, message: rateLimitMessage(rl.retryAfterMs) };
  }

  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      if (existing.deletedAt) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            passwordHash,
            deletedAt: null,
            isBlocked: false,
          },
        });
        return {
          success: true,
          message: "Cuenta creada. Ya puedes iniciar sesión.",
        };
      }
      return {
        success: false,
        message:
          "No pudimos completar el registro. Si ya tienes cuenta, inicia sesión.",
      };
    }

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    return { success: true, message: "Cuenta creada. Ya puedes iniciar sesión." };
  } catch {
    return { success: false, message: "Error al crear la cuenta. Intenta nuevamente." };
  }
}
