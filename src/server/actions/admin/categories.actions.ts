"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-admin";
import {
  normalizeCategorySlug,
  validateSlugFormat,
} from "@/lib/categories/slug-validation";
import { saveCategoryHeroImage } from "@/lib/media/save-category-hero-image";
import { saveCategoryTileImage } from "@/lib/media/save-category-tile-image";
import { buildSubcategorySlug } from "@/lib/constants/category-subcategories";
import {
  bulkCategorySchema,
  categoryFormSchema,
  categoryQuickEditSchema,
  checkSlugSchema,
  reorderCategoriesSchema,
  subcategoryFormSchema,
} from "@/lib/validations/admin";
import {
  bulkSetActive,
  createCategoryRecord,
  createSubcategoryRecord,
  deactivateCategoryChildren,
  getAdminCategoryById,
  getCategoryDetail,
  isSlugAvailable,
  markSubcategoryDeleted,
  reorderCategoryNodes,
  softDeleteCategory,
  softDeleteCategoryWithSubs,
  softDeleteSubcategory,
  updateCategoryRecord,
  updateSubcategoryRecord,
} from "@/server/repositories/admin/categories.repository";
import { CACHE_TAGS } from "@/shared/cache/tags";
import { prisma } from "@/lib/prisma";

function revalidateCatalogNav() {
  revalidateTag(CACHE_TAGS.navigation, "max");
  revalidateTag(CACHE_TAGS.categoriesTree, "max");
  revalidatePath("/productos");
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

async function resolveSlug(
  raw: string | undefined,
  name: string,
  type: "category" | "subcategory",
  excludeId?: string,
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  const slug = normalizeCategorySlug(raw ?? "", name);
  const formatError = validateSlugFormat(slug);
  if (formatError) return { ok: false, message: formatError };

  const available = await isSlugAvailable(slug, { type, excludeId });
  if (!available) {
    return { ok: false, message: "Este slug ya está en uso" };
  }
  return { ok: true, slug };
}

async function parseImageFields(
  formData: FormData,
  slug: string,
  prefix: "cat" | "sub",
): Promise<{
  image?: string | null;
  bannerImage?: string | null;
  error?: string;
}> {
  let image: string | null | undefined;
  let bannerImage: string | null | undefined;

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      image = await saveCategoryTileImage(
        imageFile,
        `${prefix}-${slug}-main`,
        slug,
      );
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `Error al subir imagen: ${error.message}`
            : "Error al subir imagen",
      };
    }
  }

  const bannerFile = formData.get("bannerImage");
  if (bannerFile instanceof File && bannerFile.size > 0) {
    try {
      bannerImage = await saveCategoryHeroImage(
        bannerFile,
        `${prefix}-${slug}-banner`,
      );
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `Error al subir banner: ${error.message}`
            : "Error al subir banner",
      };
    }
  }

  return {
    ...(image !== undefined ? { image } : {}),
    ...(bannerImage !== undefined ? { bannerImage } : {}),
  };
}

function parseCategoryFields(parsed: z.infer<typeof categoryFormSchema>) {
  return {
    name: parsed.name,
    description: parsed.description ?? null,
    shortDescription: parsed.shortDescription ?? null,
    metaTitle: parsed.metaTitle ?? null,
    metaDescription: parsed.metaDescription ?? null,
    gender: parsed.gender ?? null,
    sortOrder: parsed.sortOrder,
    isActive: parsed.isActive ?? true,
  };
}

function parseSubcategoryFields(parsed: z.infer<typeof subcategoryFormSchema>) {
  return {
    name: parsed.name,
    description: parsed.description ?? null,
    shortDescription: parsed.shortDescription ?? null,
    metaTitle: parsed.metaTitle ?? null,
    metaDescription: parsed.metaDescription ?? null,
    sortOrder: parsed.sortOrder,
    isActive: parsed.isActive ?? true,
  };
}

export async function checkCategorySlugAvailable(
  slug: string,
  type: "category" | "subcategory",
  excludeId?: string,
) {
  await requirePermission("categories:write");
  const parsed = checkSlugSchema.safeParse({ slug, type, excludeId });
  if (!parsed.success) {
    return { available: false as const, message: "Slug inválido" };
  }
  const normalized = normalizeCategorySlug(parsed.data.slug, parsed.data.slug);
  const formatError = validateSlugFormat(normalized);
  if (formatError) {
    return { available: false as const, message: formatError };
  }
  const available = await isSlugAvailable(normalized, {
    type: parsed.data.type,
    excludeId: parsed.data.excludeId,
  });
  return { available, slug: normalized, message: available ? null : "Slug en uso" };
}

export async function createCategory(formData: FormData) {
  await requirePermission("categories:write");

  const parsed = categoryFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
    cascadeInactive: formData.get("cascadeInactive") === "on",
    gender: formData.get("gender") || null,
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const slugResult = await resolveSlug(parsed.data.slug, parsed.data.name, "category");
  if (!slugResult.ok) {
    return { success: false as const, message: slugResult.message };
  }

  const images = await parseImageFields(formData, slugResult.slug, "cat");
  if (images.error) return { success: false as const, message: images.error };

  const category = await createCategoryRecord({
    ...parseCategoryFields(parsed.data),
    slug: slugResult.slug,
    image: images.image ?? null,
    bannerImage: images.bannerImage ?? null,
  });

  revalidateCatalogNav();
  redirect(`/admin/categorias?type=category&id=${category.id}`);
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requirePermission("categories:write");

  const parsed = categoryFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
    cascadeInactive: formData.get("cascadeInactive") === "on",
    gender: formData.get("gender") || null,
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const slugResult = await resolveSlug(
    parsed.data.slug,
    parsed.data.name,
    "category",
    categoryId,
  );
  if (!slugResult.ok) {
    return { success: false as const, message: slugResult.message };
  }

  const images = await parseImageFields(formData, slugResult.slug, "cat");
  if (images.error) return { success: false as const, message: images.error };

  const wasActive = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { isActive: true },
  });

  await updateCategoryRecord(categoryId, {
    ...parseCategoryFields(parsed.data),
    slug: slugResult.slug,
    ...(images.image !== undefined ? { image: images.image } : {}),
    ...(images.bannerImage !== undefined ? { bannerImage: images.bannerImage } : {}),
  });

  if (
    wasActive?.isActive &&
    !parsed.data.isActive &&
    parsed.data.cascadeInactive
  ) {
    await deactivateCategoryChildren(categoryId);
  }

  revalidateCatalogNav();
  return { success: true as const };
}

export async function updateCategoryNode(categoryId: string, formData: FormData) {
  return updateCategory(categoryId, formData);
}

export async function deleteCategory(categoryId: string) {
  await requirePermission("categories:write");

  const { productCount } = await softDeleteCategory(categoryId);

  if (productCount > 0) {
    return {
      success: false as const,
      message: "No se puede eliminar: tiene productos asociados",
    };
  }

  await softDeleteCategoryWithSubs(categoryId);

  revalidateCatalogNav();
  return { success: true as const };
}

export async function createSubcategory(formData: FormData) {
  await requirePermission("categories:write");

  const parsed = subcategoryFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const category = await getAdminCategoryById(parsed.data.categoryId);
  if (!category) {
    return { success: false as const, message: "Categoría no encontrada" };
  }

  const slugResult = await resolveSlug(
    parsed.data.slug,
    buildSubcategorySlug(category.slug, parsed.data.name),
    "subcategory",
  );
  if (!slugResult.ok) {
    return { success: false as const, message: slugResult.message };
  }

  const images = await parseImageFields(formData, slugResult.slug, "sub");
  if (images.error) return { success: false as const, message: images.error };

  const sub = await createSubcategoryRecord({
    categoryId: parsed.data.categoryId,
    ...parseSubcategoryFields(parsed.data),
    slug: slugResult.slug,
    image: images.image ?? null,
    bannerImage: images.bannerImage ?? null,
  });

  revalidateCatalogNav();
  return { success: true as const, id: sub.id };
}

export async function updateSubcategory(subcategoryId: string, formData: FormData) {
  await requirePermission("categories:write");

  const parsed = subcategoryFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const category = await getAdminCategoryById(parsed.data.categoryId);
  if (!category) {
    return { success: false as const, message: "Categoría no encontrada" };
  }

  const slugResult = await resolveSlug(
    parsed.data.slug,
    buildSubcategorySlug(category.slug, parsed.data.name),
    "subcategory",
    subcategoryId,
  );
  if (!slugResult.ok) {
    return { success: false as const, message: slugResult.message };
  }

  const images = await parseImageFields(formData, slugResult.slug, "sub");
  if (images.error) return { success: false as const, message: images.error };

  await updateSubcategoryRecord(subcategoryId, {
    ...parseSubcategoryFields(parsed.data),
    slug: slugResult.slug,
    ...(images.image !== undefined ? { image: images.image } : {}),
    ...(images.bannerImage !== undefined ? { bannerImage: images.bannerImage } : {}),
  });

  revalidateCatalogNav();
  return { success: true as const };
}

export async function deleteSubcategory(subcategoryId: string) {
  await requirePermission("categories:write");

  const count = await softDeleteSubcategory(subcategoryId);
  if (count > 0) {
    return {
      success: false as const,
      message: "Subcategoría con productos asociados",
    };
  }

  await markSubcategoryDeleted(subcategoryId);

  const tagSlug = `sys-subcat-${subcategoryId}`;
  await prisma.productTag.deleteMany({
    where: { tag: { slug: tagSlug } },
  });
  await prisma.tag.deleteMany({ where: { slug: tagSlug } });

  revalidateCatalogNav();
  return { success: true as const };
}

export async function quickUpdateCategoryNode(
  input: z.infer<typeof categoryQuickEditSchema>,
) {
  await requirePermission("categories:write");
  const parsed = categoryQuickEditSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const { id, type, name, slug, sortOrder, isActive } = parsed.data;

  if (slug !== undefined) {
    const detail = await getCategoryDetail(id, type);
    if (!detail) return { success: false as const, message: "No encontrado" };
    const slugResult = await resolveSlug(slug, name ?? detail.name, type, id);
    if (!slugResult.ok) {
      return { success: false as const, message: slugResult.message };
    }
    if (type === "category") {
      await updateCategoryRecord(id, {
        ...(name !== undefined ? { name } : {}),
        slug: slugResult.slug,
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      });
    } else {
      await updateSubcategoryRecord(id, {
        ...(name !== undefined ? { name } : {}),
        slug: slugResult.slug,
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      });
    }
  } else if (type === "category") {
    await updateCategoryRecord(id, {
      ...(name !== undefined ? { name } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });
  } else {
    await updateSubcategoryRecord(id, {
      ...(name !== undefined ? { name } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });
  }

  revalidateCatalogNav();
  return { success: true as const };
}

export async function reorderCategories(
  items: z.infer<typeof reorderCategoriesSchema>,
) {
  await requirePermission("categories:write");
  const parsed = reorderCategoriesSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false as const, message: "Orden inválido" };
  }
  await reorderCategoryNodes(parsed.data);
  revalidateCatalogNav();
  return { success: true as const };
}

export async function bulkCategoryAction(
  items: { id: string; type: "category" | "subcategory" }[],
  action: "activate" | "deactivate" | "delete",
  cascadeInactive = false,
) {
  await requirePermission("categories:write");
  const parsed = bulkCategorySchema.safeParse({ items, action, cascadeInactive });
  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  if (action === "activate") {
    await bulkSetActive(parsed.data.items, true, false);
    revalidateCatalogNav();
    return { success: true as const, count: parsed.data.items.length };
  }

  if (action === "deactivate") {
    await bulkSetActive(
      parsed.data.items,
      false,
      parsed.data.cascadeInactive ?? false,
    );
    revalidateCatalogNav();
    return { success: true as const, count: parsed.data.items.length };
  }

  let deleted = 0;
  const errors: string[] = [];

  for (const item of parsed.data.items) {
    if (item.type === "category") {
      const r = await deleteCategory(item.id);
      if (r.success) deleted += 1;
      else if (r.message) errors.push(r.message);
    } else {
      const r = await deleteSubcategory(item.id);
      if (r.success) deleted += 1;
      else if (r.message) errors.push(r.message);
    }
  }

  revalidateCatalogNav();
  return {
    success: deleted > 0,
    count: deleted,
    message:
      errors.length > 0
        ? `${deleted} eliminadas. ${errors[0]}`
        : `${deleted} eliminadas`,
  };
}
