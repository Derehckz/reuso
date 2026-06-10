import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { orderRepository } from "@/server/repositories/order.repository";
import { syncOrderFromMercadoPagoReturn } from "@/server/services/checkout-return.service";

export const metadata: Metadata = {
  title: "Pago pendiente",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPendingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber =
    typeof params.order === "string" ? params.order : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;

  await syncOrderFromMercadoPagoReturn(params);

  if (orderNumber) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (order?.status === "PAID") {
      const qs = new URLSearchParams({ order: orderNumber });
      if (token) qs.set("token", token);
      redirect(`/checkout/exito?${qs.toString()}`);
    }
    if (order?.status === "CANCELLED") {
      const qs = new URLSearchParams({ order: orderNumber });
      if (token) qs.set("token", token);
      redirect(`/checkout/error?${qs.toString()}`);
    }
  }

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
