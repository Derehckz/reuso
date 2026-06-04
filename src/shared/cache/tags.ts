/** Tags para revalidación on-demand (admin, sync categorías). */
export const CACHE_TAGS = {
  navigation: "navigation",
  categoriesTree: "categories-tree",
  catalogFilters: "catalog-filters",
  homeFeatured: "home-featured",
  homeBanners: "home-banners",
  brandLogos: "brand-logos",
  product: (slug: string) => `product:${slug}`,
} as const;
