import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  STORE_CITY_COUNT,
  STORE_LOCATION_COUNT,
} from "@/lib/constants/store-locations";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce REUSO: moda reutilizada premium en Chile. Más de 27 tiendas, consumo consciente y prendas con historia.",
};

export default function NosotrosPage() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-brand-green text-white">
        <Container className="section-editorial py-16 text-center md:py-24">
          <p className="text-label-sm text-brand-beige">REUSO</p>
          <h1 className="font-editorial mt-3 text-4xl md:text-5xl lg:text-6xl">
            Sobre nosotros
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            La moda no tiene fecha de vencimiento. Rescatamos lo mejor de la
            ropa reutilizada para darle una nueva vida.
          </p>
        </Container>
      </section>

      <Container className="section-editorial max-w-3xl py-16 md:py-20">
        <div className="space-y-6 text-sm leading-relaxed text-neutral-700 md:text-base">
          <p>
            En <strong className="font-medium text-foreground">REUSO</strong>{" "}
            creemos que la moda no tiene fecha de vencimiento. Somos una marca
            que rescata lo mejor de la ropa reutilizada, seleccionando prendas
            únicas, con estilo y calidad, para darles una nueva vida.
          </p>
          <p>
            Estamos presentes en más de{" "}
            <Link
              href="/tiendas"
              className="font-medium text-brand-green underline-offset-4 hover:underline"
            >
              {STORE_LOCATION_COUNT} tiendas
            </Link>{" "}
            a lo largo de Chile, en {STORE_CITY_COUNT} ciudades desde Viña del
            Mar hasta Castro, acercando a muchos clientes a una forma diferente
            de vestir: más original, más consciente y con identidad propia.
          </p>
          <p>
            Cada prenda en REUSO tiene una historia, y cada cliente la
            transforma en algo nuevo. Promovemos la reutilización como una
            elección inteligente, responsable y con estilo.
          </p>
        </div>

        <blockquote className="font-editorial mt-12 border-l-2 border-brand-orange pl-6 text-2xl leading-snug text-brand-green md:text-3xl">
          Porque no es lo que usas, es cómo lo usas.
        </blockquote>
      </Container>

      <section className="border-t border-neutral-200 bg-brand-beige-muted/50">
        <Container className="section-editorial grid gap-10 py-16 md:grid-cols-2 md:gap-12 md:py-20">
          <article className="rounded-sm border border-neutral-200/80 bg-white p-8 md:p-10">
            <h2 className="text-label text-brand-orange">Misión</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-700 md:text-base">
              <p>
                En REUSO trabajamos para transformar la forma en que se vive la
                moda, ofreciendo prendas únicas, con estilo y carácter, que
                merecen una segunda oportunidad.
              </p>
              <p>
                Somos parte activa del ciclo de la moda circular, seleccionando
                cuidadosamente ropa de calidad para quienes buscan
                diferenciarse, consumir con conciencia y generar un impacto
                positivo.
              </p>
              <p>
                Nuestro propósito es dar nueva vida a cada prenda, fomentando un
                consumo responsable que beneficie a las personas, las
                comunidades y el medioambiente.
              </p>
            </div>
          </article>

          <article className="rounded-sm border border-neutral-200/80 bg-white p-8 md:p-10">
            <h2 className="text-label text-brand-orange">Visión</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-700 md:text-base">
              <p>
                Ser la marca líder en moda reutilizada en Chile, reconocida por
                ofrecer prendas únicas, con estilo y autenticidad, que conectan
                con personas que valoran la originalidad y el buen vestir.
              </p>
              <p>
                Queremos consolidar una nueva forma de consumir moda: más
                consciente, más personal y siempre con identidad propia.
              </p>
            </div>
          </article>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <Container className="section-editorial flex flex-col items-center py-16 text-center md:py-20">
          <p className="font-editorial max-w-md text-2xl leading-snug text-foreground md:text-3xl">
            Lo normal es opcional
          </p>
          <p className="text-body-muted mt-4 max-w-sm text-sm">
            Explora el catálogo o visita una de nuestras tiendas en Chile.
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/productos" className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="sm:min-w-[200px]">
                Ver catálogo
              </Button>
            </Link>
            <Link href="/tiendas" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                fullWidth
                className="sm:min-w-[200px]"
              >
                Nuestras tiendas
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
