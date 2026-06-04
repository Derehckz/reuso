import { z } from "zod";

export const couponFormSchema = z.object({
  code: z.string().min(2).max(32),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().int().min(1),
  minPurchase: z.coerce.number().int().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

export const bannerFormSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  subtitle: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().optional(),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().min(1),
  storeEmail: z.string().email(),
  storePhone: z.string().optional(),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  analyticsId: z.string().optional(),
});

export const globalProductAttributesSchema = z.object({
  colorLabel: z.string().min(1).max(40),
  colorValues: z.string().min(1),
  sizeLabel: z.string().min(1).max(40),
  sizeValues: z.string().min(1),
});

export const orderNoteSchema = z.object({
  body: z.string().min(1).max(2000),
  isInternal: z.coerce.boolean().optional(),
});
