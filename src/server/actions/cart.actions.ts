"use server";

import {
  validateCartLines,
  applyCoupon,
  type CartItemInput,
} from "@/server/services/checkout.service";
import { validateCartSchema } from "@/lib/validations/checkout";

export async function validateCart(items: CartItemInput[]) {
  const parsed = validateCartSchema.safeParse({ items });
  if (!parsed.success) {
    return { success: false as const, errors: ["El carrito está vacío"] };
  }

  const { lines, errors } = await validateCartLines(parsed.data.items);

  return {
    success: errors.length === 0 && lines.length > 0,
    lines,
    errors,
  };
}

export async function validateCouponCode(code: string, subtotal: number) {
  try {
    const result = await applyCoupon(code, subtotal);
    return {
      success: true as const,
      discountAmount: result.discountAmount,
      code: result.code,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Cupón inválido",
    };
  }
}
