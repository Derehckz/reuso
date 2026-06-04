"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-admin";
import { writeAuditLog } from "@/shared/audit/audit.service";
import { slugify } from "@/lib/utils";
import { saveUploadedImage } from "@/lib/upload-storage";
import {
  productFormSchema,
  variantInputSchema,
} from "@/lib/validations/admin";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { setInventoryOnHandSafe } from "@/server/services/inventory.service";

const variantsSchema = z.array(variantInputSchema).min(1, "Al menos una variante");
const categorySelectionsSchema = z.array(z.string()).default([]);
const CATEGORY_TAG_PREFIX = "sys-subcat-";

function extractImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

function normalizeHex(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return v.startsWith("#") ? v : `#${v}`;
}

async function syncProductCategoryTags(
  tx: Prisma.TransactionClient,
  productId: string,
  categorySelectionIds: string[],
) {
  const uniqueIds = [...new Set(categorySelectionIds)].filter(Boolean);
  const targetTagIds: string[] = [];

  for (const id of uniqueIds) {
    const slug = `${CATEGORY_TAG_PREFIX}${id}`;
    const tag = await tx.tag.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: `Subcat ${id}`,
      },
      select: { id: true },
    });
    targetTagIds.push(tag.id);

    await tx.productTag.upsert({
      where: { productId_tagId: { productId, tagId: tag.id } },
      update: {},
      create: { productId, tagId: tag.id },
    });
  }

  await tx.productTag.deleteMany({
    where: {
      productId,
      ...(targetTagIds.length > 0 && { tagId: { notIn: targetTagIds } }),
      tag: { slug: { startsWith: CATEGORY_TAG_PREFIX } },
    },
  });
}

async function syncVariantStockInTx(
  tx: Prisma.TransactionClient,
  variantId: string,
  targetStock: number,
  lowStockThreshold: number,
  note: string,
) {
  await setInventoryOnHandSafe(
    tx,
    variantId,
    targetStock,
    lowStockThreshold,
    note,
  );
}

function validatePublishable(
  data: z.infer<typeof productFormSchema>,
  variants: z.infer<typeof variantInputSchema>[],
  imageCount: number,
): string | null {
  if (!data.isPublished) return null;
  if (imageCount === 0 && !data.imageUrl) {
    return "Publicar requiere al menos una imagen";
  }
  const activeWithStock = variants.filter(
    (v) => (v.isActive ?? true) && v.stock > 0,
  );
  if (activeWithStock.length === 0) {
    return "Publicar requiere al menos una variante activa con stock";
  }
  return null;
}

export async function createProduct(formData: FormData) {
  const session = await requirePermission("products:write");

  const raw = Object.fromEntries(formData.entries());
  let categorySelections: string[] = [];
  try {
    categorySelections = categorySelectionsSchema.parse(
      JSON.parse(String(formData.get("categorySelections") ?? "[]")),
    );
  } catch {
    return { success: false as const, message: "Categorías seleccionadas inválidas" };
  }
  const variantsJson = formData.get("variants");
  let variants: z.infer<typeof variantInputSchema>[] = [];
  try {
    variants = variantsSchema.parse(
      JSON.parse(String(variantsJson ?? "[]")),
    );
  } catch {
    return { success: false as const, message: "Variantes inválidas" };
  }

  const parsed = productFormSchema.safeParse({
    ...raw,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  if (
    data.compareAtPrice != null &&
    data.compareAtPrice > 0 &&
    data.compareAtPrice <= data.basePrice
  ) {
    return {
      success: false as const,
      message: "El precio comparación debe ser mayor al precio base",
    };
  }
  const slug = data.slug?.trim() || slugify(data.name);
  const imageFiles = extractImageFiles(formData);
  const publishError = validatePublishable(
    data,
    variants,
    imageFiles.length,
  );
  if (publishError) {
    return { success: false as const, message: publishError };
  }

  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) {
    return { success: false as const, message: "El slug ya existe" };
  }

  let uploadedImageUrls: string[] = [];
  try {
    uploadedImageUrls = await Promise.all(
      imageFiles.map((file) =>
        saveUploadedImage(file, {
          folder: "products",
          prefix: slug,
          maxWidth: 1800,
          maxHeight: 1800,
          quality: 85,
        }),
      ),
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? `Error al subir imágenes: ${error.message}`
          : "Error al subir imágenes",
    };
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        subcategoryId: data.subcategoryId,
        sku: data.sku || null,
        internalCode: data.internalCode || null,
        brand: data.brand || null,
        gender: data.gender,
        condition: data.condition,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice ?? null,
        vintageYear: data.vintageYear ?? null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        publishedAt: data.isPublished ? new Date() : null,
        ...(uploadedImageUrls.length > 0 && {
          images: {
            create: uploadedImageUrls.map((url, index) => ({
              url,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          },
        }),
        ...(uploadedImageUrls.length === 0 &&
          data.imageUrl && {
          images: {
            create: {
              url: data.imageUrl,
              isPrimary: true,
              sortOrder: 0,
            },
          },
        }),
      },
    });

    for (const v of variants) {
      const variant = await tx.productVariant.create({
        data: {
          productId: created.id,
          size: v.size,
          color: v.color,
          colorHex: normalizeHex(v.colorHex),
          sku: v.sku || null,
          price: v.price ?? null,
          isActive: v.isActive ?? true,
        },
      });
      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: v.stock,
          quantityReserved: 0,
          lowStockThreshold: Math.max(1, v.lowStockThreshold),
        },
      });
    }

    await syncProductCategoryTags(tx, created.id, categorySelections);

    return created;
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "product.create",
    entity: "Product",
    entityId: product.id,
  });

  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await requirePermission("products:write");

  const variantsJson = formData.get("variants");
  let variants: z.infer<typeof variantInputSchema>[] = [];
  try {
    variants = variantsSchema.parse(
      JSON.parse(String(variantsJson ?? "[]")),
    );
  } catch {
    return { success: false as const, message: "Variantes inválidas" };
  }

  const raw = Object.fromEntries(formData.entries());
  let categorySelections: string[] = [];
  try {
    categorySelections = categorySelectionsSchema.parse(
      JSON.parse(String(formData.get("categorySelections") ?? "[]")),
    );
  } catch {
    return { success: false as const, message: "Categorías seleccionadas inválidas" };
  }
  const parsed = productFormSchema.safeParse({
    ...raw,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
  });

  if (!parsed.success) {
    return { success: false as const, message: "Datos inválidos" };
  }

  const data = parsed.data;
  if (
    data.compareAtPrice != null &&
    data.compareAtPrice > 0 &&
    data.compareAtPrice <= data.basePrice
  ) {
    return {
      success: false as const,
      message: "El precio comparación debe ser mayor al precio base",
    };
  }
  const slug = data.slug?.trim() || slugify(data.name);
  const imageFiles = extractImageFiles(formData);
  const imageOrderJson = formData.get("imageOrder");
  let imageOrder: string[] = [];
  try {
    imageOrder = JSON.parse(String(imageOrderJson ?? "[]")) as string[];
  } catch {
    imageOrder = [];
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) {
    return { success: false as const, message: "Producto no encontrado" };
  }

  const publishError = validatePublishable(
    data,
    variants,
    product.images.length + imageFiles.length,
  );
  if (publishError) {
    return { success: false as const, message: publishError };
  }

  const duplicateSlug = await prisma.product.findFirst({
    where: { slug, id: { not: productId }, deletedAt: null },
    select: { id: true },
  });
  if (duplicateSlug) {
    return { success: false as const, message: "El slug ya existe en otro producto" };
  }

  let uploadedImageUrls: string[] = [];
  try {
    uploadedImageUrls = await Promise.all(
      imageFiles.map((file) =>
        saveUploadedImage(file, {
          folder: "products",
          prefix: slug,
          maxWidth: 1800,
          maxHeight: 1800,
          quality: 85,
        }),
      ),
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? `Error al subir imágenes: ${error.message}`
          : "Error al subir imágenes",
    };
  }

  if (imageOrder.length > 0) {
    const existingIds = new Set(product.images.map((i) => i.id));
    const invalidIds = imageOrder.filter((id) => !existingIds.has(id));
    if (invalidIds.length > 0) {
      return { success: false as const, message: "Orden de imágenes inválido" };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        subcategoryId: data.subcategoryId,
        sku: data.sku || null,
        internalCode: data.internalCode || null,
        brand: data.brand || null,
        gender: data.gender,
        condition: data.condition,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice ?? null,
        vintageYear: data.vintageYear ?? null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        publishedAt:
          data.isPublished && !product.isPublished
            ? new Date()
            : product.publishedAt,
      },
    });

    if (imageOrder.length > 0) {
      const existingIds = new Set(product.images.map((i) => i.id));
      const ordered = imageOrder.filter((id) => existingIds.has(id));
      for (let i = 0; i < ordered.length; i++) {
        await tx.productImage.update({
          where: { id: ordered[i] },
          data: { sortOrder: i, isPrimary: i === 0 },
        });
      }
    }

    if (uploadedImageUrls.length > 0) {
      const baseSort = product.images.length;
      await tx.productImage.createMany({
        data: uploadedImageUrls.map((url, index) => ({
          productId,
          url,
          isPrimary: product.images.length === 0 && index === 0,
          sortOrder: baseSort + index,
        })),
      });
    } else if (data.imageUrl) {
      const primary = await tx.productImage.findFirst({
        where: { productId, isPrimary: true },
      });
      if (primary) {
        await tx.productImage.update({
          where: { id: primary.id },
          data: { url: data.imageUrl },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId,
            url: data.imageUrl,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }
    }

    const existingIds = variants.filter((v) => v.id).map((v) => v.id!);
    await tx.productVariant.updateMany({
      where: {
        productId,
        id: { notIn: existingIds },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    for (const v of variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            colorHex: normalizeHex(v.colorHex),
            sku: v.sku || null,
            price: v.price ?? null,
            isActive: v.isActive ?? true,
          },
        });
        await syncVariantStockInTx(
          tx,
          v.id,
          v.stock,
          v.lowStockThreshold,
          "Ajuste desde edición de producto",
        );
      } else {
        const variant = await tx.productVariant.create({
          data: {
            productId,
            size: v.size,
            color: v.color,
            colorHex: normalizeHex(v.colorHex),
            sku: v.sku || null,
            price: v.price ?? null,
            isActive: v.isActive ?? true,
          },
        });
        await tx.inventory.create({
          data: {
            variantId: variant.id,
            quantityOnHand: v.stock,
            lowStockThreshold: Math.max(1, v.lowStockThreshold),
          },
        });
      }
    }

    await syncProductCategoryTags(tx, productId, categorySelections);
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "product.update",
    entity: "Product",
    entityId: productId,
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  return { success: true as const };
}

export async function deleteProductImage(imageId: string, productId: string) {
  await requirePermission("products:write");

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) {
    return { success: false as const, message: "Imagen no encontrada" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } });
    const remaining = await tx.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      await tx.productImage.update({
        where: { id: remaining[i].id },
        data: { sortOrder: i, isPrimary: i === 0 },
      });
    }
  });

  revalidatePath(`/admin/productos/${productId}`);
  return { success: true as const };
}

export async function duplicateProduct(productId: string) {
  const session = await requirePermission("products:write");

  const source = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { deletedAt: null },
        include: { inventory: true },
      },
      tags: { select: { tagId: true } },
    },
  });
  if (!source) {
    return { success: false as const, message: "Producto no encontrado" };
  }

  const baseSlug = `${source.slug}-copia`;
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: `${source.name} (copia)`,
        slug,
        description: source.description,
        shortDescription: source.shortDescription,
        subcategoryId: source.subcategoryId,
        sku: null,
        internalCode: null,
        brand: source.brand,
        gender: source.gender,
        condition: source.condition,
        basePrice: source.basePrice,
        compareAtPrice: source.compareAtPrice,
        vintageYear: source.vintageYear,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        isPublished: false,
        isFeatured: false,
        isNewArrival: false,
        publishedAt: null,
        images: {
          create: source.images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    for (const v of source.variants) {
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          sku: null,
          price: v.price,
          isActive: v.isActive,
        },
      });
      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: v.inventory?.quantityOnHand ?? 0,
          quantityReserved: 0,
          lowStockThreshold: v.inventory?.lowStockThreshold ?? 1,
        },
      });
    }

    const categoryTagIds = source.tags.map((t) => t.tagId);
    for (const tagId of categoryTagIds) {
      await tx.productTag.create({
        data: { productId: product.id, tagId },
      });
    }

    return product;
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "product.duplicate",
    entity: "Product",
    entityId: created.id,
    metadata: { sourceId: productId },
  });

  revalidatePath("/admin/productos");
  return { success: true as const, productId: created.id };
}

export async function bulkUpdateProducts(
  productIds: string[],
  action: "publish" | "unpublish" | "feature" | "unfeature",
) {
  const session = await requirePermission("products:write");
  if (productIds.length === 0) {
    return { success: false as const, message: "Sin productos seleccionados" };
  }

  if (action === "publish") {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      include: {
        images: { take: 1 },
        variants: {
          where: { deletedAt: null, isActive: true },
          include: { inventory: true },
        },
      },
    });

    const publishableIds: string[] = [];
    const skipped: string[] = [];

    for (const p of products) {
      const hasImage = p.images.length > 0;
      const hasStock = p.variants.some((v) => {
        const onHand = v.inventory?.quantityOnHand ?? 0;
        const reserved = v.inventory?.quantityReserved ?? 0;
        return onHand - reserved > 0;
      });
      if (hasImage && hasStock) publishableIds.push(p.id);
      else skipped.push(p.name);
    }

    if (publishableIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: publishableIds } },
        data: { isPublished: true, publishedAt: new Date() },
      });
    }

    await writeAuditLog({
      userId: session.user.id,
      action: "product.bulk_publish",
      entity: "Product",
      metadata: { published: publishableIds.length, skipped: skipped.length },
    });

    revalidatePath("/admin/productos");
    return {
      success: true as const,
      published: publishableIds.length,
      skipped: skipped.length,
      message:
        skipped.length > 0
          ? `${publishableIds.length} publicados. ${skipped.length} omitidos (sin imagen o sin stock).`
          : undefined,
    };
  }

  const data =
    action === "unpublish"
      ? { isPublished: false }
      : action === "feature"
        ? { isFeatured: true }
        : { isFeatured: false };

  await prisma.product.updateMany({
    where: { id: { in: productIds }, deletedAt: null },
    data,
  });

  await writeAuditLog({
    userId: session.user.id,
    action: `product.bulk_${action}`,
    entity: "Product",
    metadata: { count: productIds.length },
  });

  revalidatePath("/admin/productos");
  return { success: true as const };
}

export async function deleteProduct(productId: string) {
  const session = await requirePermission("products:delete");

  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: new Date(), isPublished: false },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "product.delete",
    entity: "Product",
    entityId: productId,
  });

  revalidatePath("/admin/productos");
  return { success: true as const };
}
