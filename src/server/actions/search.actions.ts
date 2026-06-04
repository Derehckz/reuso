"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { productRepository } from "@/server/repositories/product.repository";
import { clientIp, rateLimit, rateLimitMessage } from "@/shared/rate-limit";

const searchSchema = z.string().trim().min(1).max(120);

export async function searchCatalog(q: string) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const rl = rateLimit(`search:${ip}`, 40, 60_000);
  if (!rl.allowed) {
    return {
      products: [],
      brands: [],
      categories: [],
      totalProducts: 0,
      rateLimited: true,
      message: rateLimitMessage(rl.retryAfterMs),
    };
  }

  const parsed = searchSchema.safeParse(q);
  if (!parsed.success) {
    return {
      products: [],
      brands: [],
      categories: [],
      totalProducts: 0,
    };
  }

  return productRepository.searchCatalog(parsed.data);
}
