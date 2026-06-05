import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeSplash } from "@/components/brand/splash-screen";
import { CategoryGrid } from "@/components/home/category-grid";
import { EditorialManifestoSection } from "@/components/home/editorial-manifesto-section";
import { AuthCtaSection } from "@/components/home/auth-cta-section";
import { BrandStrip } from "@/components/home/brand-strip";
import { ProductRow } from "@/components/home/product-row";
import { productRepository } from "@/server/repositories/product.repository";

/** Evita cachear la home vacía cuando la DB falló en un request anterior. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    productRepository.findFeatured(5),
    productRepository.findNewArrivals(5),
  ]);

  const featuredProducts = featured.items;
  const newProducts = newArrivals.items;

  return (
    <>
      <HomeSplash />
      <HeroCarousel />

      <BrandStrip />

      {featuredProducts.length > 0 && (
        <ProductRow
          title="DESTACADOS"
          products={featuredProducts}
          viewAllHref="/productos?sort=featured"
        />
      )}

      <CategoryGrid />

      {newProducts.length > 0 && (
        <ProductRow
          title="NUEVOS INGRESOS"
          products={newProducts}
          viewAllHref="/productos?sort=newest"
        />
      )}

      <section className="section-editorial bg-neutral-50">
        <div className="container-store max-w-3xl text-center">
          <p className="font-editorial text-3xl text-brand-green md:text-4xl">
            Lo normal es opcional
          </p>
          <p className="text-body-muted mx-auto mt-6 max-w-lg">
            En reuso seleccionamos piezas americanas y vintage en excelente
            estado. Moda con historia, calidad premium y conciencia circular.
          </p>
        </div>
      </section>

      <EditorialManifestoSection />

      <AuthCtaSection />
    </>
  );
}
