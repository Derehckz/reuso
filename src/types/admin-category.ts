/** Nodo del árbol admin (categoría padre o subcategoría). */
export type CategoryNodeType = "category" | "subcategory";

export type AdminCategoryTreeChild = {
  id: string;
  type: "subcategory";
  categoryId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  image: string | null;
  bannerImage: string | null;
  productCount: number;
  isEmpty: boolean;
};

export type AdminCategoryTreeNode = {
  id: string;
  type: "category";
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  image: string | null;
  bannerImage: string | null;
  gender: string | null;
  productCount: number;
  subcategoryCount: number;
  isEmpty: boolean;
  children: AdminCategoryTreeChild[];
};

export type AdminCategoryDetail = {
  id: string;
  type: CategoryNodeType;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  image: string | null;
  bannerImage: string | null;
  gender: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  subcategoryCount: number;
};

export type CategoryTreeFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  empty?: "all" | "empty" | "with_products";
};

export type ReorderNodeInput = {
  id: string;
  type: CategoryNodeType;
  sortOrder: number;
};
