"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-admin";
import { bannerFormSchema } from "@/lib/validations/admin-cms";
import { slugify } from "@/lib/utils";
import { saveUploadedImage } from "@/lib/upload-storage";
import {
  createBannerRecord,
  deleteBannerRecord,
  getAdminBannerById,
  updateBannerRecord,
} from "@/server/repositories/admin/banners.repository";
import { writeAuditLog } from "@/shared/audit/audit.service";
import { CACHE_TAGS } from "@/shared/cache/tags";

function parseBannerForm(formData: FormData) {
  return bannerFormSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || null,
    link: formData.get("link") || null,
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "on",
  });
}

async function uploadBannerImage(
  file: FormDataEntryValue | null,
  slug: string,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  return saveUploadedImage(file, {
    folder: "banners",
    prefix: `banner-${slug}`,
    maxWidth: 2560,
    maxHeight: 1400,
    quality: 86,
  });
}

export async function createBanner(formData: FormData) {
  const session = await requirePermission("content:write");

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const data = parsed.data;
  const slug = slugify(data.title);

  let imageUrl: string | null = null;
  let mobileUrl: string | null = null;

  try {
    imageUrl = await uploadBannerImage(formData.get("image"), slug);
    if (!imageUrl) {
      return {
        success: false as const,
        message: "Sube una imagen para el banner de escritorio",
      };
    }
    mobileUrl = await uploadBannerImage(formData.get("mobileImage"), `${slug}-mobile`);
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? `Error al subir imagen: ${error.message}`
          : "Error al subir imagen",
    };
  }

  const banner = await createBannerRecord({
    title: data.title,
    subtitle: data.subtitle,
    imageUrl,
    mobileUrl,
    link: data.link || null,
    sortOrder: data.sortOrder,
    isActive: data.isActive ?? true,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "banner.create",
    entity: "Banner",
    entityId: banner.id,
  });

  revalidateTag(CACHE_TAGS.homeBanners, "max");
  revalidatePath("/admin/contenido");
  redirect(`/admin/contenido/banners/${banner.id}`);
}

export async function updateBanner(bannerId: string, formData: FormData) {
  const session = await requirePermission("content:write");

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const existing = await getAdminBannerById(bannerId);
  if (!existing) {
    return { success: false as const, message: "Banner no encontrado" };
  }

  const data = parsed.data;
  const slug = slugify(data.title);

  let imageUrl = existing.imageUrl;
  let mobileUrl = existing.mobileUrl;

  try {
    const desktop = await uploadBannerImage(formData.get("image"), slug);
    if (desktop) imageUrl = desktop;

    const mobile = await uploadBannerImage(
      formData.get("mobileImage"),
      `${slug}-mobile`,
    );
    if (mobile) mobileUrl = mobile;
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? `Error al subir imagen: ${error.message}`
          : "Error al subir imagen",
    };
  }

  await updateBannerRecord(bannerId, {
    title: data.title,
    subtitle: data.subtitle,
    imageUrl,
    mobileUrl,
    link: data.link || null,
    sortOrder: data.sortOrder,
    isActive: data.isActive ?? true,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "banner.update",
    entity: "Banner",
    entityId: bannerId,
  });

  revalidateTag(CACHE_TAGS.homeBanners, "max");
  revalidatePath("/admin/contenido");
  return { success: true as const };
}

export async function deleteBanner(bannerId: string) {
  const session = await requirePermission("content:write");
  await deleteBannerRecord(bannerId);
  await writeAuditLog({
    userId: session.user.id,
    action: "banner.delete",
    entity: "Banner",
    entityId: bannerId,
  });
  revalidateTag(CACHE_TAGS.homeBanners, "max");
  revalidatePath("/admin/contenido");
  return { success: true as const };
}
