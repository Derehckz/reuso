"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-admin";
import { absoluteUrl } from "@/lib/utils";
import { userUpdateSchema } from "@/lib/validations/admin";

export async function updateUser(userId: string, formData: FormData) {
  const session = await requirePermission("customers:write");

  const parsed = userUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  if (
    parsed.data.role === "ADMIN" &&
    session.user.role !== "ADMIN"
  ) {
    return {
      success: false as const,
      message: "Solo un administrador puede asignar rol ADMIN",
    };
  }

  if (userId === session.user.id && parsed.data.role !== "ADMIN") {
    return {
      success: false as const,
      message: "No puedes quitarte el rol de administrador",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone,
    },
  });

  revalidatePath("/admin/usuarios");
  return { success: true as const };
}

export async function deactivateUser(userId: string) {
  const session = await requirePermission("customers:write");

  if (userId === session.user.id) {
    return { success: false as const, message: "No puedes desactivarte a ti mismo" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/usuarios");
  return { success: true as const };
}

export async function toggleUserBlocked(userId: string, blocked: boolean) {
  const session = await requirePermission("customers:block");

  if (userId === session.user.id) {
    return { success: false as const, message: "No puedes bloquearte a ti mismo" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: blocked },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { success: true as const };
}

export async function createCustomerResetLink(userId: string) {
  await requirePermission("customers:write");

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, role: "CUSTOMER" },
    select: { id: true },
  });

  if (!user) {
    return {
      success: false as const,
      message: "Solo puedes restablecer contraseña de clientes activos.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  return {
    success: true as const,
    resetUrl: absoluteUrl(`/auth/restablecer-contrasena?token=${token}`),
    message: "Enlace de restablecimiento creado (expira en 1 hora).",
  };
}
