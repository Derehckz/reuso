import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { categoryRepository } from "@/server/repositories/category.repository";

function CategoryTileCard({
  title,
  titleLines,
  href,
  imageSrc,
  imageAlt,
  titleAlign = "left",
  className,
}: {
  title: string;
  titleLines?: [string, string];
  href: string;
  imageSrc: string;
  imageAlt: string;
  titleAlign?: "left" | "right";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block h-full min-h-[220px] overflow-hidden bg-neutral-900",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/20 to-black/5 transition-opacity duration-500 group-hover:from-black/75"
        aria-hidden
      />
      <ModaCircularBadge />
      {titleLines ? (
        <span
          className={cn(
            "font-editorial absolute bottom-5 flex flex-col gap-0 leading-[0.9] tracking-tight text-white md:bottom-6",
            titleAlign === "right"
              ? "right-5 items-end md:right-10"
              : "left-5 md:left-8",
          )}
        >
          {titleLines.map((line) => (
            <span key={line} className="text-4xl md:text-5xl lg:text-6xl">
              {line}
            </span>
          ))}
        </span>
      ) : (
        <span
          className={cn(
            "font-editorial absolute bottom-5 text-4xl leading-none tracking-tight text-white md:bottom-6 md:text-5xl lg:text-6xl",
            titleAlign === "right" ? "right-5 md:right-8" : "left-5 md:left-8",
          )}
        >
          {title}
        </span>
      )}
    </Link>
  );
}

export async function CategoryGrid() {
  const tiles = await categoryRepository.getHomeCategoryTiles();
  const topTiles = tiles.filter((t) => t.row === "top");
  const bottomTiles = tiles.filter((t) => t.row === "bottom");

  return (
    <section aria-label="Comprar por categoría" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {topTiles.map((tile) => (
          <CategoryTileCard
            key={tile.id}
            title={tile.title}
            titleLines={tile.titleLines}
            href={tile.href}
            imageSrc={tile.imageSrc}
            imageAlt={tile.imageAlt}
            titleAlign={tile.titleAlign}
            className="aspect-square sm:aspect-[4/5] lg:aspect-square"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4">
        {bottomTiles.map((tile) => (
          <CategoryTileCard
            key={tile.id}
            title={tile.title}
            titleLines={tile.titleLines}
            href={tile.href}
            imageSrc={tile.imageSrc}
            imageAlt={tile.imageAlt}
            titleAlign={tile.titleAlign}
            className={cn(
              tile.bottomColSpan === 3
                ? "aspect-[21/9] sm:col-span-3 sm:aspect-[3/1]"
                : "aspect-[4/5] sm:col-span-1 sm:aspect-[3/4]",
            )}
          />
        ))}
      </div>
    </section>
  );
}
