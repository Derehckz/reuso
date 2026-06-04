import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/typography";
import { brandLogoRepository } from "@/server/repositories/brand-logo.repository";

function isValidLogoFile(imageSrc: string): boolean {
  const filePath = path.join(process.cwd(), "public", imageSrc.replace(/^\//, ""));
  try {
    return fs.statSync(filePath).size > 500;
  } catch {
    return false;
  }
}

export async function BrandStrip() {
  const dbBrands = await brandLogoRepository.getActiveLogos();

  const brands = dbBrands
    .map((b) => ({
      id: b.id,
      name: b.name,
      imageSrc: b.imageUrl,
    }))
    .filter((b) => isValidLogoFile(b.imageSrc));

  if (brands.length === 0) return null;

  const loop = [...brands, ...brands];

  return (
    <section
      aria-label="Marcas seleccionadas"
      className="border-y border-neutral-900/5 bg-neutral-50 py-10 md:py-12"
    >
      <Container>
        <SectionTitle className="mb-8 text-center">
          Marcas que curamos
        </SectionTitle>
      </Container>

      <div className="relative overflow-hidden">
        <div className="flex w-max animate-brand-marquee items-center gap-12 px-6 md:gap-16 md:px-10">
          {loop.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex h-12 w-[120px] shrink-0 items-center justify-center md:h-14 md:w-[140px]"
            >
              <Image
                src={brand.imageSrc}
                alt={brand.name}
                width={140}
                height={56}
                unoptimized
                style={{ width: "auto", height: "auto", maxHeight: "100%", maxWidth: "100%" }}
                className="object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
