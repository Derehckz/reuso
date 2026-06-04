"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-storage";

const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  number: z.string().optional(),
  apartment: z.string().optional(),
  commune: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().optional(),
  phone: z.string().min(8),
  isDefault: z.coerce.boolean().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function saveAddress(formData: FormData) {
  const session = await requireAuth();
  const parsed = addressSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, deletedAt: null },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label: data.label,
      firstName: data.firstName,
      lastName: data.lastName,
      street: data.street,
      number: data.number,
      apartment: data.apartment,
      commune: data.commune,
      region: data.region,
      postalCode: data.postalCode,
      phone: data.phone,
      isDefault: data.isDefault ?? false,
    },
  });

  revalidatePath("/cuenta/direcciones");
  return { success: true as const };
}

export async function deleteAddress(addressId: string) {
  const session = await requireAuth();
  await prisma.address.updateMany({
    where: { id: addressId, userId: session.user.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/cuenta/direcciones");
  return { success: true as const };
}

export async function changePassword(formData: FormData) {
  const session = await requireAuth();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.flatten().fieldErrors.confirmPassword?.[0] ?? "Datos inválidos",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return {
      success: false as const,
      message: "Tu cuenta usa inicio de sesión social. No puedes cambiar contraseña aquí.",
    };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { success: false as const, message: "Contraseña actual incorrecta" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: true as const, message: "Contraseña actualizada" };
}

export async function updateProfile(formData: FormData) {
  const session = await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const imageFile = formData.get("profileImage");

  if (name.length < 2) {
    return { success: false as const, message: "Nombre inválido" };
  }

  let imageToSave: string | null | undefined = undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageToSave = await saveUploadedImage(imageFile, {
        folder: "avatars",
        prefix: session.user.id,
        maxWidth: 600,
        maxHeight: 600,
        quality: 86,
      });
    } catch (error) {
      return {
        success: false as const,
        message:
          error instanceof Error
            ? `No se pudo subir la foto: ${error.message}`
            : "No se pudo subir la foto",
      };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
      ...(imageToSave !== undefined ? { image: imageToSave } : {}),
    },
  });

  revalidatePath("/cuenta");
  revalidatePath("/cuenta/configuracion");
  return { success: true as const };
}
