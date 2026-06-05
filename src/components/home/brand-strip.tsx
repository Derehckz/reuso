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

type BrandStripVariant = "default" | "compact";

const VARIANT_STYLES: Record<
  BrandStripVariant,
  {
    section: string;
    rowGap: string;
    marqueeGap: string;
    logoCell: string;
    imageMax: { width: number; height: number };
  }
> = {
  default: {
    section: "border-y border-neutral-900/5 py-5 md:py-7",
    rowGap: "mt-4 md:mt-5",
    marqueeGap: "gap-10 px-5 md:gap-14 md:px-8",
    logoCell: "h-14 w-[100px] md:h-20 md:w-[130px]",
    imageMax: { width: 130, height: 80 },
  },
  compact: {
    section: "border-b border-neutral-900/5 py-2.5 md:py-3",
    rowGap: "mt-2 md:mt-2.5",
    marqueeGap: "gap-6 px-4 md:gap-8 md:px-6",
    logoCell: "h-8 w-[56px] md:h-10 md:w-[72px]",
    imageMax: { width: 72, height: 40 },
  },
};

function MarqueeRow({
  brands,
  direction,
  variant,
  className,
}: {
  brands: BrandItem[];
  direction: "forward" | "reverse";
  variant: BrandStripVariant;
  className?: string;
}) {
  const loop = [...brands, ...brands];
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn("marquee-track relative w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max items-center",
          styles.marqueeGap,
          direction === "reverse"
            ? "animate-brand-marquee-reverse"
            : "animate-brand-marquee",
        )}
      >
        {loop.map((brand, i) => (
          <div
            key={`${brand.id}-${i}`}
            className={cn(
              "flex shrink-0 items-center justify-center",
              styles.logoCell,
            )}
          >
            <Image
              src={brand.imageSrc}
              alt={brand.name}
              width={styles.imageMax.width}
              height={styles.imageMax.height}
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

type BrandStripProps = {
  variant?: BrandStripVariant;
};

export async function BrandStrip({ variant = "default" }: BrandStripProps) {
  const brands = await resolveBrands();
  if (brands.length === 0) return null;

  const styles = VARIANT_STYLES[variant];

  return (
    <section
      aria-label="Marcas seleccionadas"
      className={cn("w-full bg-white", styles.section)}
    >
      <MarqueeRow brands={brands} direction="forward" variant={variant} />
      <MarqueeRow
        brands={brands}
        direction="reverse"
        variant={variant}
        className={styles.rowGap}
      />
    </section>
  );
}
