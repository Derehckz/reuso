"use server";

import { productRepository } from "@/server/repositories/product.repository";

export async function getQuickViewProduct(slug: string) {
  return productRepository.findQuickView(slug);
}
