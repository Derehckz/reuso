import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { HERO_CAROUSEL_SLIDES } from "@/lib/constants/home-images";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

/** @deprecated Usar HeroCarousel en el home. */
export function HeroSection() {
  const imageSrc = HERO_CAROUSEL_SLIDES[0]?.imageSrc ?? "/images/placeholder.svg";

  return (
    <section className="relative min-h-[min(75vh,800px)] overflow-hidden">
      <Image
        src={imageSrc}
        alt="Colección editorial reuso"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <ModaCircularBadge />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-900/60 via-neutral-900/25 to-neutral-900/10" />

      <Container className="relative flex min-h-[min(75vh,800px)] flex-col items-center justify-end pb-16 pt-24 text-center lg:items-start lg:pb-20 lg:text-left">
        <p className="font-editorial text-4xl text-white drop-shadow-md sm:text-5xl md:text-6xl">
          reuso
        </p>
        <p className="text-label-sm mt-4 text-white/85">
          Lo normal es opcional
        </p>
        <Link
          href="/productos"
          className="text-nav mt-8 inline-block border-b border-white/80 pb-0.5 text-white transition hover:border-white"
        >
          Ver colección →
        </Link>
      </Container>
    </section>
  );
}
