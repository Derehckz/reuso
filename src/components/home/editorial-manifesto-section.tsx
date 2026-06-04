import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HOME_IMAGES } from "@/lib/constants/home-images";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

export function EditorialManifestoSection() {
  return (
    <section className="border-t border-neutral-200 bg-white">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/5] min-h-[320px] lg:aspect-auto lg:min-h-[480px]">
          <Image
            src={HOME_IMAGES.manifesto}
            alt="Moda reutilizada americana curada"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <ModaCircularBadge />
        </div>

        <Container className="flex flex-col items-center justify-center py-16 text-center lg:items-start lg:py-24 lg:text-left">
          <p className="max-w-md font-editorial text-2xl leading-snug text-brand-green md:text-3xl lg:text-[1.75rem]">
            Moda reutilizada americana, curada con estándar premium.
          </p>
          <p className="text-body-muted mt-6 max-w-sm">
            Piezas únicas con historia. Calidad editorial, conciencia circular y
            estilo atemporal.
          </p>
          <div className="mt-10">
            <Link href="/productos">
              <Button size="lg" className="sm:min-w-[200px]">
                Explorar catálogo
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}
