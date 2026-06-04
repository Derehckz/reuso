import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Error en el pago",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutErrorPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-editorial text-4xl text-foreground">
        No se completó el pago
      </h1>
      <p className="text-body-muted mt-3 max-w-md">
        {orderNumber
          ? `El pedido ${orderNumber} quedó pendiente. Puedes intentar nuevamente desde tu carrito o contactarnos.`
          : "Hubo un problema al procesar el pago. Intenta nuevamente o contáctanos."}
      </p>
      <div className="mt-10 flex gap-3">
        <Link href="/carrito">
          <Button size="lg">Volver al carrito</Button>
        </Link>
        <Link href="/contacto">
          <Button variant="outline" size="lg">
            Ayuda
          </Button>
        </Link>
      </div>
    </Container>
  );
}
