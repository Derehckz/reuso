import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CatalogHero } from "@/types/catalog";

type CatalogHeroHeaderProps = {
  title: string;
  hero?: CatalogHero | null;
  className?: string;
};

const titleClass =
  "font-editorial text-center uppercase tracking-[0.12em] text-3xl md:text-4xl lg:text-5xl";

export function CatalogHeroHeader({
  title,
  hero,
  className,
}: CatalogHeroHeaderProps) {
  const displayTitle = hero?.title ?? title;
  const image = hero?.image ?? null;
  const eyebrow = hero?.eyebrow;

  if (!image) {
    return (
      <header className={cn("mb-6 text-center md:mb-8", className)}>
        {eyebrow && (
          <p className="text-label-sm mb-2 uppercase tracking-widest text-brand-orange">
            {eyebrow}
          </p>
        )}
        <h1 className={cn(titleClass, "text-foreground")}>{displayTitle}</h1>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "relative mb-6 w-full overflow-hidden md:mb-8",
        className,
      )}
    >
      <div className="relative h-[132px] w-full sm:h-[152px] md:h-[172px]">
        <Image
          src={image}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-neutral-900/45"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {eyebrow && (
            <p className="text-label-sm mb-2 uppercase tracking-[0.2em] text-white/90">
              {eyebrow}
            </p>
          )}
          <h1 className={cn(titleClass, "text-white drop-shadow-md")}>
            {displayTitle}
          </h1>
        </div>
      </div>
    </header>
  );
}
