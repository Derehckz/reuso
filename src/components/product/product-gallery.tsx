"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type ProductGalleryProps = {
  images: { id: string; url: string; alt: string | null }[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-neutral-100 text-sm text-neutral-400">
        Sin imágenes
      </div>
    );
  }

  return (
    <div className="flex gap-3 lg:gap-4">
      {images.length > 1 && (
        <div className="hidden w-[72px] shrink-0 flex-col gap-2 sm:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[3/4] w-full overflow-hidden border bg-neutral-50 transition-all",
                i === activeIndex
                  ? "border-brand-green ring-1 ring-brand-green"
                  : "border-neutral-200 opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                className="object-cover object-center"
                sizes="72px"
              />
              <ModaCircularBadge size="sm" />
            </button>
          ))}
          {images.length > 5 && (
            <span className="flex justify-center text-neutral-400" aria-hidden>
              <ChevronDown className="h-4 w-4" />
            </span>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
          <Image
            key={active.id}
            src={active.url}
            alt={active.alt ?? productName}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          <ModaCircularBadge />
        </div>

        {images.length > 1 && (
          <>
            <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Imagen ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeIndex
                      ? "w-6 bg-brand-green"
                      : "w-1.5 bg-neutral-300",
                  )}
                />
              ))}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto sm:hidden">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative h-16 w-12 shrink-0 border",
                    i === activeIndex
                      ? "border-brand-green"
                      : "border-neutral-200",
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  <ModaCircularBadge size="sm" className="scale-75 origin-top-left" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
