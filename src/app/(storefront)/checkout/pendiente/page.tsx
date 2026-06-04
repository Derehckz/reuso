import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pago pendiente",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutPendingPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-editorial text-4xl text-foreground">
        Pago en revisión
      </h1>
      <p className="text-body-muted mt-3 max-w-md">
        {orderNumber
          ? `Tu pedido ${orderNumber} está pendiente de confirmación de pago. Te avisaremos por email.`
          : "Tu pago está siendo procesado. Te notificaremos cuando se confirme."}
      </p>
      <Link href="/productos" className="mt-10">
        <Button size="lg">Volver a la tienda</Button>
      </Link>
    </Container>
  );
}
