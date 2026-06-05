import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { categoryRepository } from "@/server/repositories/category.repository";
import type { CategoryTile } from "@/lib/constants/category-tiles";

function titlePositionClass(position: CategoryTile["titlePosition"]): string {
  if (position === "top-left") return "top-4 left-4 md:top-5 md:left-5";
  if (position === "center-right") {
    return "right-4 top-1/2 -translate-y-1/2 md:right-6";
  }
  if (position === "bottom-right") return "bottom-4 right-4 md:bottom-5 md:right-6";
  return "bottom-4 left-4 md:bottom-5 md:left-5";
}

function CategoryTileCard({
  tile,
}: {
  tile: CategoryTile & { imageSrc: string };
}) {
  const titlePos = tile.titlePosition ?? "bottom-left";
  const titleColor = tile.titleColor ?? "light";
  const aspectClass = tile.aspect === "wide" ? "aspect-[2/1]" : "aspect-square";

  return (
    <Link
      href={tile.href}
      className={cn(
        "group relative block overflow-hidden rounded-sm bg-neutral-100",
        aspectClass,
      )}
    >
      <Image
        src={tile.imageSrc}
        alt={tile.imageAlt}
        fill
        unoptimized
        sizes="(max-width: 640px) 30vw, 220px"
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div
        className={cn(
          "absolute inset-0 z-[1]",
          titlePos === "top-left" && titleColor === "dark"
            ? "bg-gradient-to-b from-white/50 via-transparent to-black/15"
            : titlePos === "top-left"
              ? "bg-gradient-to-b from-black/35 via-transparent to-black/25"
              : "bg-gradient-to-t from-black/55 via-black/10 to-transparent",
        )}
        aria-hidden
      />
      <ModaCircularBadge size="sm" />
      {tile.titleLines ? (
        <span
          className={cn(
            "font-editorial absolute z-[2] flex flex-col gap-0 leading-[0.9] tracking-tight drop-shadow-sm",
            titleColor === "dark" ? "text-neutral-800" : "text-white",
            titlePositionClass(titlePos),
            tile.titleAlign === "right" && "items-end text-right",
          )}
        >
          {tile.titleLines.map((line) => (
            <span key={line} className="text-xl md:text-2xl lg:text-3xl">
              {line}
            </span>
          ))}
        </span>
      ) : (
        <span
          className={cn(
            "font-editorial absolute z-[2] text-xl leading-none tracking-tight drop-shadow-sm md:text-2xl lg:text-3xl",
            titleColor === "dark" ? "text-neutral-800" : "text-white",
            titlePositionClass(titlePos),
          )}
        >
          {tile.title}
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
    <section aria-label="Comprar por categoría" className="section-editorial py-10 md:py-14">
      <Container>
        <div className="mx-auto w-full max-w-3xl px-2 sm:px-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {topTiles.map((tile) => (
              <CategoryTileCard key={tile.id} tile={tile} />
            ))}
          </div>

          <div className="mt-1.5 flex gap-1.5 sm:mt-2.5 sm:gap-2.5">
            {bottomTiles.map((tile) => (
              <div
                key={tile.id}
                className={cn(tile.bottomColSpan === 2 ? "flex-[2]" : "flex-1")}
              >
                <CategoryTileCard tile={tile} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
