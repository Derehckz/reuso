import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function AuthCtaSection() {
  return (
    <section className="border-t border-neutral-200 bg-white text-foreground">
      <Container className="section-editorial flex flex-col items-center py-16 text-center md:py-20">
        <p className="font-editorial max-w-md text-2xl leading-snug md:text-3xl">
          Cada prenda tiene una historia que contar.
        </p>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
          Inicia sesión o crea tu cuenta en REUSO y comienza a escribir la tuya
          con nosotros.
        </p>
        <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:justify-center">
          <Link href="/auth/iniciar-sesion" className="w-full sm:w-auto">
            <Button
              size="lg"
              fullWidth
              className="sm:min-w-[200px] bg-brand-orange hover:bg-brand-orange-hover"
            >
              Iniciar sesión
            </Button>
          </Link>
          <Link
            href="/auth/registro"
            className="text-nav text-foreground underline-offset-4 transition hover:underline"
          >
            Regístrate
          </Link>
        </div>
      </Container>
    </section>
  );
}
