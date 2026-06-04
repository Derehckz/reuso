export type SearchProductHit = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  image: string | null;
};

export type SearchBrandHit = {
  name: string;
  productCount: number;
};

export type SearchCategoryHit = {
  name: string;
  href: string;
};

export type SearchCatalogResult = {
  products: SearchProductHit[];
  brands: SearchBrandHit[];
  categories: SearchCategoryHit[];
  totalProducts: number;
};
