import type { ProductListItem } from "./product";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  gender?: string | null;
  image?: string | null;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    children?: {
      id: string;
      name: string;
      slug: string;
      image?: string | null;
    }[];
  }[];
};

/** Cabecera del listado por categoría / subcategoría. */
export type CatalogHero = {
  title: string;
  image: string | null;
  /** Ej. categoría padre cuando el filtro es una subcategoría. */
  eyebrow?: string | null;
};

export type ProductQuickView = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  shortDescription: string | null;
  totalStock: number;
  images: { id: string; url: string; alt: string | null }[];
  variants: {
    id: string;
    size: string;
    color: string;
    colorHex: string | null;
    stock: number;
    price: number | null;
  }[];
};

export type CatalogPageData = {
  items: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: import("./product").ProductFilters;
};
