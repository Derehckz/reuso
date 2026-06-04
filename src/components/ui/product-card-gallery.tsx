"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HOVER_INTERVAL_MS = 550;

type ProductCardGalleryProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function ProductCardGallery({
  images,
  alt,
  priority,
  sizes,
  className,
}: ProductCardGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasGallery = images.length > 1;

  const stopCycle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCycle = useCallback(() => {
    stopCycle();
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, HOVER_INTERVAL_MS);
  }, [images.length, stopCycle]);

  useEffect(() => () => stopCycle(), [stopCycle]);

  const onPointerEnter = () => {
    if (!hasGallery) return;
    setIsHovering(true);
    setActiveIndex(0);
    startCycle();
  };

  const onPointerLeave = () => {
    setIsHovering(false);
    stopCycle();
    setActiveIndex(0);
  };

  return (
    <div
      className={cn("relative h-full w-full", className)}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onFocus={onPointerEnter}
      onBlur={onPointerLeave}
    >
      {images.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src}
          alt={index === 0 ? alt : `${alt} — foto ${index + 1}`}
          fill
          priority={priority && index === 0}
          loading={priority && index === 0 ? undefined : "lazy"}
          className={cn(
            "object-cover object-center transition-opacity duration-500 ease-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
            "image-zoom",
          )}
          sizes={sizes}
          aria-hidden={index !== activeIndex}
        />
      ))}

      {hasGallery && isHovering && (
        <div
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1"
          aria-hidden
        >
          {images.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-0.5 w-3 rounded-full transition-colors duration-300",
                index === activeIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
