"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  quoteForCheckout,
  trackOrderShipment,
} from "@/server/services/shipping.service";
import { toBluexpressError } from "@/lib/bluexpress";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

export async function getShippingQuote(
  region: string,
  commune: string,
  itemCount: number,
  totalQuantity?: number,
) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`shipping-quote:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return { success: false as const, message: rateLimitMessage(rl.retryAfterMs) };
  }

  if (!region?.trim() || !commune?.trim()) {
    return { success: false as const, message: "Región y comuna requeridas" };
  }

  if (itemCount < 1) {
    return { success: false as const, message: "El carrito está vacío" };
  }

  try {
    const quote = await quoteForCheckout({
      region,
      commune,
      itemCount,
      totalQuantity,
    });

    return {
      success: true as const,
      amount: quote.price,
      estimatedDays: quote.estimatedDays,
      serviceCode: quote.serviceCode,
      zone: quote.zone,
      weightKg: quote.weightKg,
      source: quote.source,
    };
  } catch (error) {
    console.error("[getShippingQuote]", error);
    return {
      success: false as const,
      message: toBluexpressError(error).message,
    };
  }
}

export async function trackShipmentByCode(
  code: string,
  options?: { email?: string; accessToken?: string },
) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`track-shipment:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return { success: false as const, message: rateLimitMessage(rl.retryAfterMs) };
  }

  if (!code?.trim()) {
    return { success: false as const, message: "Ingresa tu número de pedido o seguimiento" };
  }

  try {
    const session = await auth();
    return await trackOrderShipment({
      code,
      email: options?.email,
      accessToken: options?.accessToken,
      userId: session?.user?.id,
    });
  } catch (error) {
    console.error("[trackShipmentByCode]", error);
    return {
      success: false as const,
      message: "No se pudo obtener el seguimiento. Intenta más tarde.",
    };
  }
}
