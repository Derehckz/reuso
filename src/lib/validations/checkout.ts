import { z } from "zod";

export const checkoutAddressSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(9, "Teléfono inválido")
    .regex(/^[\d\s+()-]+$/, "Formato de teléfono inválido"),
  street: z.string().min(3, "Calle requerida"),
  number: z.string().optional(),
  apartment: z.string().optional(),
  commune: z.string().min(2, "Comuna requerida"),
  region: z.string().min(2, "Región requerida"),
  postalCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const checkoutSchema = checkoutAddressSchema.extend({
  couponCode: z.string().optional(),
  saveAddress: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;

export const cartItemInputSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemInputSchema).min(1, "El carrito está vacío"),
});
