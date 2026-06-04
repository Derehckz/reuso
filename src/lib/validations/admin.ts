import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  subcategoryId: z.string().min(1, "Subcategoría requerida"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  gender: z.enum(["MUJER", "HOMBRE", "NINO", "UNISEX"]),
  condition: z.enum(["EXCELENTE", "MUY_BUENO", "BUENO"]),
  basePrice: z.coerce.number().int().min(0),
  compareAtPrice: z.coerce.number().int().min(0).optional().nullable(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  vintageYear: z.coerce.number().int().min(1950).max(2030).optional().nullable(),
  internalCode: z.string().max(64).optional().nullable(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  imageUrl: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
});

export const variantInputSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color HEX inválido")
    .optional()
    .nullable(),
  sku: z.string().optional(),
  price: z.coerce.number().int().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(1).default(1),
  isActive: z.coerce.boolean().optional().default(true),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  gender: z.enum(["MUJER", "HOMBRE", "NINO", "UNISEX"]).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().optional(),
  cascadeInactive: z.coerce.boolean().optional(),
});

export const subcategoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  categoryId: z.string().min(1),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().optional(),
});

export const categoryQuickEditSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["category", "subcategory"]),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const reorderCategoriesSchema = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(["category", "subcategory"]),
    sortOrder: z.coerce.number().int().min(0),
  }),
);

export const bulkCategorySchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(["category", "subcategory"]),
    }),
  ),
  action: z.enum(["activate", "deactivate", "delete"]),
  cascadeInactive: z.coerce.boolean().optional(),
});

export const checkSlugSchema = z.object({
  slug: z.string().min(2),
  type: z.enum(["category", "subcategory"]),
  excludeId: z.string().optional(),
});

export const inventoryAdjustSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int(),
  note: z.string().optional(),
});

export const orderStatusSchema = z.enum([
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]),
  phone: z.string().optional(),
});
