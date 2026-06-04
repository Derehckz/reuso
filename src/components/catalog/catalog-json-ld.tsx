import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

type CatalogJsonLdProps = {
  products: ProductListItem[];
  total: number;
};

export function CatalogJsonLd({ products, total }: CatalogJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo — reuso",
    description: siteConfig.description,
    url: absoluteUrl("/productos"),
    numberOfItems: total,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/productos/${p.slug}`),
        item: {
          "@type": "Product",
          name: p.name,
          url: absoluteUrl(`/productos/${p.slug}`),
          image: p.image ? absoluteUrl(p.image) : undefined,
          brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "CLP",
            price: p.basePrice,
            availability:
              p.totalStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
