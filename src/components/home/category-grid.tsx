import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { categoryRepository } from "@/server/repositories/category.repository";

function CategoryTileCard({
  title,
  href,
  imageSrc,
  imageAlt,
  titleAlign = "left",
  aspectClass,
}: {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  titleAlign?: "left" | "right";
  aspectClass: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden bg-neutral-900",
        aspectClass,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/65 via-black/25 to-black/10"
        aria-hidden
      />
      <ModaCircularBadge />
      <span
        className={cn(
          "font-editorial absolute bottom-5 text-4xl leading-none tracking-tight text-white md:bottom-6 md:text-5xl lg:text-6xl",
          titleAlign === "right" ? "right-5 md:right-8" : "left-5 md:left-8",
        )}
      >
        {title}
      </span>
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
            href={tile.href}
            imageSrc={tile.imageSrc}
            imageAlt={tile.imageAlt}
            aspectClass="aspect-[4/5] sm:aspect-[3/4]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {bottomTiles.map((tile) => (
          <CategoryTileCard
            key={tile.id}
            title={tile.title}
            href={tile.href}
            imageSrc={tile.imageSrc}
            imageAlt={tile.imageAlt}
            titleAlign={tile.titleAlign}
            aspectClass="aspect-[16/10] sm:aspect-[2/1]"
          />
        ))}
      </div>
    </section>
  );
}
