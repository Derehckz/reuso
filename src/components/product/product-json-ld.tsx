import { siteConfig } from "@/config/site";

type ProductJsonLdProps = {
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  price: number;
  currency?: string;
  inStock: boolean;
  sku?: string | null;
  brand?: string | null;
};

function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ProductJsonLd({
  name,
  description,
  slug,
  imageUrl,
  price,
  currency = "CLP",
  inStock,
  sku,
  brand,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? undefined,
    sku: sku ?? undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/productos/${slug}`),
      priceCurrency: currency,
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
