"use server";

import { auth } from "@/lib/auth";
import { normalizeCartItems } from "@/lib/cart/normalize-cart-items";
import {
  lookupCheckoutIdempotency,
  rememberCheckoutIdempotency,
} from "@/lib/checkout/idempotency";
import { checkoutSchema } from "@/lib/validations/checkout";
import { headers } from "next/headers";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";
import { createOrderAccessToken } from "@/lib/order-access-token";
import {
  createCheckoutOrder,
  previewCheckoutTotals,
} from "@/server/services/checkout.service";
import type { CartItemInput } from "@/server/services/checkout.service";
import { syncCartToServer } from "@/server/services/cart.service";
import { prisma } from "@/lib/prisma";

function mapCartItems(raw: CartItemInput[]) {
  return normalizeCartItems(raw);
}

export async function getCheckoutPreview(input: {
  items: CartItemInput[];
  region: string;
  commune: string;
  couponCode?: string;
}) {
  const normalized = mapCartItems(input.items);
  if (!normalized.success) {
    return { success: false as const, message: normalized.message, errors: [] };
  }

  const preview = await previewCheckoutTotals({
    items: normalized.items,
    region: input.region,
    commune: input.commune,
    couponCode: input.couponCode,
  });

  if (preview.errors.length > 0) {
    return {
      success: false as const,
      message: preview.errors[0] ?? "No se pudo calcular el total",
      errors: preview.errors,
    };
  }

  return {
    success: true as const,
    subtotal: preview.subtotal,
    discountAmount: preview.discountAmount,
    shippingAmount: preview.shippingAmount,
    total: preview.total,
    couponCode: preview.couponCode,
  };
}

export async function placeOrder(
  formData: FormData,
  cartItems: CartItemInput[],
) {
  try {
    const hdrs = await headers();
    const ip = clientIp(hdrs);
    const rl = rateLimit(`checkout:${ip}`, 15, 60_000);
    if (!rl.allowed) {
      return { success: false as const, message: rateLimitMessage(rl.retryAfterMs) };
    }

    const session = await auth();
    const idempotencyKey = String(
      formData.get("checkoutIdempotencyKey") ?? "",
    ).trim();

    if (idempotencyKey.length >= 16) {
      const existingNumber = lookupCheckoutIdempotency(idempotencyKey);
      if (existingNumber) {
        const existing = await prisma.order.findUnique({
          where: { orderNumber: existingNumber },
          select: {
            orderNumber: true,
            total: true,
            guestEmail: true,
            userId: true,
            payment: { select: { rawResponse: true } },
          },
        });
        if (existing) {
          const email =
            session?.user?.email?.toLowerCase() ??
            String(formData.get("email") ?? "").toLowerCase();
          const accessToken = createOrderAccessToken(
            existing.orderNumber,
            email,
          );
          return {
            success: true as const,
            orderNumber: existing.orderNumber,
            paymentUrl: null,
            total: existing.total,
            accessToken,
            deduplicated: true as const,
          };
        }
      }
    }

    const normalized = mapCartItems(cartItems);
    if (!normalized.success) {
      return { success: false as const, message: normalized.message };
    }

    const raw = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      street: formData.get("street"),
      number: formData.get("number") || undefined,
      apartment: formData.get("apartment") || undefined,
      commune: formData.get("commune"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode") || undefined,
      notes: formData.get("notes") || undefined,
      couponCode: formData.get("couponCode") || undefined,
      saveAddress: formData.get("saveAddress") === "on",
    };

    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(firstError).flat()[0] ?? "Datos de checkout inválidos";
      return { success: false as const, message };
    }

    const email =
      session?.user?.email?.toLowerCase() ?? parsed.data.email.toLowerCase();

    await syncCartToServer(normalized.items);

    const result = await createCheckoutOrder({
      userId: session?.user?.id ?? null,
      form: { ...parsed.data, email },
      items: normalized.items,
    });

    if (idempotencyKey.length >= 16) {
      rememberCheckoutIdempotency(idempotencyKey, result.orderNumber);
    }

    const accessToken = createOrderAccessToken(result.orderNumber, email);

    return {
      success: true as const,
      orderNumber: result.orderNumber,
      paymentUrl: result.paymentUrl,
      total: result.total,
      accessToken,
    };
  } catch (e) {
    console.error("[placeOrder]", e);
    return {
      success: false as const,
      message:
        e instanceof Error ? e.message : "No se pudo procesar tu pedido",
    };
  }
}
