import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(10),
});

export const applyCouponSchema = z.object({
  code: z.string().min(3).max(32).transform((s) => s.toUpperCase().trim()),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
