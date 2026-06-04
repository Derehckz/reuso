import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos — REUSO Chile.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-brand-green text-white">
        <Container className="section-editorial py-14 text-center md:py-20">
          <p className="text-label-sm text-brand-beige">REUSO</p>
          <h1 className="font-editorial mt-2 text-3xl md:text-4xl">Contacto</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80">
            Estamos para ayudarte con tu compra, envío o visita a tienda.
          </p>
        </Container>
      </section>

      <Container className="section-editorial max-w-2xl py-12 md:py-16">
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          <div>
            <h2 className="text-label text-foreground">Email</h2>
            <p className="mt-2">
              <a
                href="mailto:contacto@re-uso.cl"
                className="underline hover:text-brand-green"
              >
                contacto@re-uso.cl
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-label text-foreground">Tiendas</h2>
            <p className="mt-2">
              Encuentra direcciones y horarios en{" "}
              <Link href="/tiendas" className="underline hover:text-brand-green">
                nuestras tiendas
              </Link>
              .
            </p>
          </div>
          <div>
            <h2 className="text-label text-foreground">Redes</h2>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href={siteConfig.links.instagram}
                  className="underline hover:text-brand-green"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </>
  );
}
