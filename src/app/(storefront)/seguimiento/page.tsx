import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { TrackingForm } from "@/components/shipping/tracking-form";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Rastrea tu pedido reuso con Bluexpress.",
};

type PageProps = {
  searchParams: Promise<{ pedido?: string; tracking?: string; token?: string }>;
};

export default async function SeguimientoPage({ searchParams }: PageProps) {
  const { pedido, tracking, token } = await searchParams;
  const initialCode = pedido ?? tracking ?? "";

  return (
    <Container className="section-editorial py-16 md:py-24">
      <h1 className="font-editorial text-center text-4xl text-foreground md:text-5xl">
        Seguimiento
      </h1>
      <p className="text-body-muted mx-auto mt-3 max-w-md text-center">
        Ingresa tu número de pedido o el código de seguimiento Bluexpress.
      </p>

      <div className="mt-12">
        <TrackingForm initialCode={initialCode} initialToken={token ?? ""} />
      </div>
    </Container>
  );
}
