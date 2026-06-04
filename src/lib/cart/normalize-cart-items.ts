import { z } from "zod";
import { cartItemInputSchema } from "@/lib/validations/checkout";

export type NormalizedCartItem = z.infer<typeof cartItemInputSchema>;

const cartItemsArraySchema = z.array(cartItemInputSchema).min(1);

/**
 * Valida y fusiona líneas duplicadas por variantId (suma cantidades, máx. 10 por variante).
 */
export function normalizeCartItems(
  raw: unknown,
):
  | { success: true; items: NormalizedCartItem[] }
  | { success: false; message: string } {
  const parsed = cartItemsArraySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "El carrito contiene datos inválidos",
    };
  }

  const merged = new Map<string, NormalizedCartItem>();

  for (const item of parsed.data) {
    const existing = merged.get(item.variantId);
    if (existing) {
      if (existing.productId !== item.productId) {
        return {
          success: false,
          message: "Datos de carrito inconsistentes",
        };
      }
      const quantity = Math.min(10, existing.quantity + item.quantity);
      merged.set(item.variantId, { ...existing, quantity });
    } else {
      merged.set(item.variantId, { ...item });
    }
  }

  return { success: true, items: [...merged.values()] };
}
