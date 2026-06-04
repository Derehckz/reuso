"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HERO_CAROUSEL_SLIDES,
  HERO_CAROUSEL_ASPECT,
} from "@/lib/constants/home-images";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type HeroCarouselProps = {
  autoPlayMs?: number;
};

export function HeroCarousel({ autoPlayMs = 6000 }: HeroCarouselProps) {
  const slides = HERO_CAROUSEL_SLIDES;
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
      className="relative w-full overflow-hidden bg-neutral-950"
      aria-roledescription="carousel"
      aria-label="Colecciones destacadas"
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: HERO_CAROUSEL_ASPECT }}
      >
        {slides.map((slide, i) => (
          <Link
            key={slide.imageSrc}
            href={slide.href}
            className={cn(
              "absolute inset-0 block transition-opacity duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset",
              i === active
                ? "z-10 opacity-100"
                : "z-0 opacity-0 pointer-events-none",
            )}
            aria-hidden={i !== active}
            tabIndex={i === active ? 0 : -1}
          >
            <Image
              src={slide.imageSrc}
              alt={slide.imageAlt}
              fill
              priority={i === 0}
              unoptimized
              sizes="100vw"
              draggable={false}
              className="object-cover object-center"
            />
            <ModaCircularBadge />
            <span className="sr-only">{slide.title}</span>
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
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-5">
          {slides.map((slide, i) => (
            <button
              key={slide.imageSrc}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Ir a ${slide.title}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </section>
  );
}
