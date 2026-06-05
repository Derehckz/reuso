import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGOS } from "@/lib/constants/brand-logos";
import { brandLogoRepository } from "@/server/repositories/brand-logo.repository";

type BrandItem = {
  id: string;
  name: string;
  imageSrc: string;
};

function isValidLogoFile(imageSrc: string): boolean {
  const filePath = path.join(process.cwd(), "public", imageSrc.replace(/^\//, ""));
  try {
    return fs.statSync(filePath).size > 500;
  } catch {
    return false;
  }
}

async function resolveBrands(): Promise<BrandItem[]> {
  const dbBrands = await brandLogoRepository.getActiveLogos();
  const fromDb = dbBrands
    .map((b) => ({
      id: b.id,
      name: b.name,
      imageSrc: b.imageUrl,
    }))
    .filter((b) => isValidLogoFile(b.imageSrc));

  if (fromDb.length > 0) return fromDb;

  return BRAND_LOGOS.filter((b) => isValidLogoFile(b.imageSrc)).map((b) => ({
    id: b.id,
    name: b.name,
    imageSrc: b.imageSrc,
  }));
}

function MarqueeRow({
  brands,
  direction,
  className,
}: {
  brands: BrandItem[];
  direction: "forward" | "reverse";
  className?: string;
}) {
  const loop = [...brands, ...brands];

  return (
    <div className={cn("marquee-track relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max items-center gap-10 px-5 md:gap-14 md:px-8",
          direction === "reverse"
            ? "animate-brand-marquee-reverse"
            : "animate-brand-marquee",
        )}
      >
        {loop.map((brand, i) => (
          <div
            key={`${brand.id}-${i}`}
            className="flex h-14 w-[100px] shrink-0 items-center justify-center md:h-20 md:w-[130px]"
          >
            <Image
              src={brand.imageSrc}
              alt={brand.name}
              width={130}
              height={80}
              unoptimized
              style={{
                width: "auto",
                height: "auto",
                maxHeight: "100%",
                maxWidth: "100%",
              }}
              className="object-contain opacity-90 grayscale-[15%] transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function BrandStrip() {
  const brands = await resolveBrands();
  if (brands.length === 0) return null;

  return (
    <section
      aria-label="Marcas seleccionadas"
      className="border-y border-neutral-900/5 bg-white py-5 md:py-7"
    >
      <MarqueeRow brands={brands} direction="forward" />
      <MarqueeRow brands={brands} direction="reverse" className="mt-4 md:mt-5" />
    </section>
  );
}
