import type { Gender, ProductCondition } from "@/generated/prisma/client";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isNewArrival: boolean;
  image: string | null;
  imageAlt: string | null;
  /** URLs extra para ciclo al pasar el cursor (máx. 5). */
  gallery?: string[];
  totalStock: number;
  category: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
};

export type ProductDetail = ProductListItem & {
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  gender: Gender;
  condition: ProductCondition;
  images: { id: string; url: string; alt: string | null }[];
  variants: {
    id: string;
    size: string;
    color: string;
    colorHex: string | null;
    stock: number;
    price: number | null;
  }[];
  related: ProductListItem[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    userName: string | null;
    createdAt: Date;
  }[];
  averageRating: number;
  reviewCount: number;
};

export type ProductFilters = {
  q?: string;
  category?: string;
  gender?: Gender;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "featured";
  page?: number;
  limit?: number;
};
