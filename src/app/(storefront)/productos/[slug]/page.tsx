import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductBreadcrumbs } from "@/components/product/product-breadcrumbs";
import { ProductDescriptionSection } from "@/components/product/product-description-section";
import { ProductReviewsSection } from "@/components/product/product-reviews-section";
import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/ui/container";
import { productRepository } from "@/server/repositories/product.repository";
import { catalogCategoryHref } from "@/lib/constants/category-subcategories";
import { siteConfig } from "@/config/site";
import { ProductJsonLd } from "@/components/product/product-json-ld";

function absoluteImageUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${siteConfig.url}${url.startsWith("/") ? url : `/${url}`}`;
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.metaTitle?.trim() || product.name;
  const description =
    product.metaDescription?.trim() ||
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    undefined;
  const ogImage = product.images[0]?.url
    ? absoluteImageUrl(product.images[0].url)
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Inicio", href: "/" },
    {
      label: product.category.name,
      href: catalogCategoryHref(product.category.slug),
    },
    ...(product.subcategory
      ? [
          {
            label: product.subcategory.name,
            href: `/productos?categoria=${product.subcategory.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="bg-white">
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription ?? product.description}
        slug={product.slug}
        imageUrl={product.images[0]?.url ?? null}
        price={product.basePrice}
        inStock={product.totalStock > 0}
        sku={product.sku}
        brand={product.brand}
      />
      <Container className="py-8 md:py-10">
        <ProductBreadcrumbs items={breadcrumbs} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-12 xl:gap-16">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductPurchasePanel product={product} />
        </div>

        <div className="mt-4 lg:mt-12">
          <ProductDescriptionSection product={product} />
          <ProductReviewsSection
            reviews={product.reviews}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
        </div>
      </Container>

      {product.related.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <Container className="section-editorial !pt-12 !pb-16">
            <h2 className="text-label mb-8 text-center md:text-left">
              También te puede interesar
            </h2>
            <ProductGrid products={product.related} columns={4} />
          </Container>
        </section>
      )}
    </div>
  );
}
