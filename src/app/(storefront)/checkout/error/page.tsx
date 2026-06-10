import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { orderRepository } from "@/server/repositories/order.repository";
import { syncOrderFromMercadoPagoReturn } from "@/server/services/checkout-return.service";

export const metadata: Metadata = {
  title: "Error en el pago",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function mpStatusHint(status: string | null): string | null {
  if (!status) return null;
  const map: Record<string, string> = {
    rejected: "Mercado Pago rechazó el pago (revisa titular APRO y tarjeta de prueba).",
    cancelled: "El pago fue cancelado en Mercado Pago.",
    pending: "El pago quedó pendiente; puede confirmarse más tarde.",
    in_process: "El pago está en proceso.",
  };
  return map[status] ?? `Estado en MP: ${status}.`;
}

export default async function CheckoutErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber =
    typeof params.order === "string" ? params.order : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;

  const sync = await syncOrderFromMercadoPagoReturn(params);

  if (orderNumber) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (order?.status === "PAID") {
      const qs = new URLSearchParams({ order: orderNumber });
      if (token) qs.set("token", token);
      redirect(`/checkout/exito?${qs.toString()}`);
    }
  }

  const mpHint = mpStatusHint(sync.mpStatus);

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
      {mpHint && (
        <p className="mt-3 max-w-md text-sm text-neutral-600">{mpHint}</p>
      )}
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
