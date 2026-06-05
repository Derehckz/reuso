import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { categoryRepository } from "@/server/repositories/category.repository";
import type { CategoryTile } from "@/lib/constants/category-tiles";

function tileAspectClass(tile: CategoryTile): string {
  if (tile.row === "top") {
    return "aspect-[4/5] sm:aspect-[3/4]";
  }
  if (tile.bottomColSpan === 3) {
    return "aspect-[2/1] sm:col-span-3 sm:aspect-[3/1]";
  }
  return "aspect-[4/5] sm:col-span-1 sm:aspect-[3/4]";
}

function CategoryTileCard({
  tile,
}: {
  tile: CategoryTile & { imageSrc: string };
}) {
  const {
    title,
    titleLines,
    href,
    imageSrc,
    imageAlt,
    titleAlign = "left",
  } = tile;

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden bg-neutral-900",
        tileAspectClass(tile),
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        unoptimized
        sizes={
          tile.bottomColSpan === 3
            ? "(max-width: 640px) 100vw, 75vw"
            : "(max-width: 640px) 100vw, 33vw"
        }
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/15 to-transparent"
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
          <CategoryTileCard key={tile.id} tile={tile} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4">
        {bottomTiles.map((tile) => (
          <CategoryTileCard key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}
