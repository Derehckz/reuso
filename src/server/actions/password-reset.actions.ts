"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { passwordSchema } from "@/lib/validations/password";
import type { ActionResult } from "@/types/action";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Token inválido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`password-reset:${ip}`, 5, 60 * 60_000);
  if (!rl.allowed) {
    return { success: false, message: rateLimitMessage(rl.retryAfterMs) };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null, isBlocked: false },
    select: { id: true },
  });

  // Respuesta homogénea para no filtrar existencia de usuarios.
  const genericMessage =
    "Si el email existe, te enviaremos un enlace para restablecer tu contraseña.";

  if (!user) {
    return { success: true, message: genericMessage };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const resetLink = absoluteUrl(`/auth/restablecer-contrasena?token=${token}`);
  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] Reset link para ${email}: ${resetLink}`);
  } else if (!process.env.SMTP_HOST && !process.env.RESEND_API_KEY) {
    console.warn(
      "[auth] Producción sin SMTP_HOST ni RESEND_API_KEY: los enlaces de recuperación no se envían por correo.",
    );
  }

  return { success: true, message: genericMessage };
}

export async function resetPasswordWithToken(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.flatten().fieldErrors.confirmPassword?.[0] ??
        parsed.error.flatten().fieldErrors.password?.[0] ??
        "Datos inválidos",
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { token, password } = parsed.data;

  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, deletedAt: true, isBlocked: true } } },
  });

  if (
    !row ||
    row.expiresAt < new Date() ||
    row.user.deletedAt !== null ||
    row.user.isBlocked
  ) {
    return {
      success: false,
      message: "El enlace expiró o no es válido.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId },
    }),
  ]);

  return {
    success: true,
    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
  };
}
