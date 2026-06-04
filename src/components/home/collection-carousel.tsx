"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COLLECTION_CAROUSEL_SLIDES,
  type CollectionSlide,
} from "@/lib/constants/home-images";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

export type { CollectionSlide };

const DEFAULT_SLIDES: CollectionSlide[] = [...COLLECTION_CAROUSEL_SLIDES];

type CollectionCarouselProps = {
  slides?: CollectionSlide[];
  autoPlayMs?: number;
};

export function CollectionCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayMs = 6000,
}: CollectionCarouselProps) {
  const [active, setActive] = useState(0);
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setActive((index + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (count <= 1 || autoPlayMs <= 0) return;
    const id = window.setInterval(next, autoPlayMs);
    return () => window.clearInterval(id);
  }, [active, autoPlayMs, count, next]);

  if (count === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-neutral-100"
      aria-roledescription="carousel"
      aria-label="Nueva colección"
    >
      <div className="relative aspect-[4/5] sm:aspect-[21/9]">
        {slides.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              "group absolute inset-0 block transition-opacity duration-700 ease-out",
              i === active ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none",
            )}
            aria-hidden={i !== active}
            tabIndex={i === active ? 0 : -1}
          >
            <Image
              src={s.imageSrc}
              alt={s.imageAlt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="100vw"
              priority={i === 0}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-900/55 via-neutral-900/15 to-transparent" />
            <ModaCircularBadge />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-label-sm mb-3 text-white/85 sm:mb-4">
                {s.subtitle}
              </span>
              <h2 className="font-editorial text-4xl text-white drop-shadow-sm sm:text-5xl md:text-6xl">
                {s.title}
              </h2>
              <span className="text-nav mt-5 text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:mt-6">
                Explorar →
              </span>
            </div>
          </Link>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white sm:left-6"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white sm:right-6"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-6">
          {slides.map((s, i) => (
            <button
              key={s.href}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Ir a ${s.title}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </section>
  );
}
