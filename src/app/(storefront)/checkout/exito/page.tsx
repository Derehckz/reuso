import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getCheckoutSuccessCopy } from "@/lib/checkout/success-messaging";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import { cn, formatPrice } from "@/lib/utils";
import { orderRepository } from "@/server/repositories/order.repository";
import { CheckCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedido registrado",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ order?: string; token?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { order: orderNumber, token } = await searchParams;

  if (!orderNumber) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <CheckCircle
          className="h-16 w-16 text-brand-green"
          strokeWidth={1}
          aria-hidden
        />
        <h1 className="font-editorial mt-6 text-4xl text-foreground">
          Pedido registrado
        </h1>
        <p className="text-body-muted mt-3 max-w-md">
          Si acabas de comprar, revisa tu correo para el detalle del pedido.
        </p>
        <Link href="/productos" className="mt-10">
          <Button size="lg">Seguir comprando</Button>
        </Link>
      </Container>
    );
  }

  const session = await auth();
  const order = await orderRepository.findByOrderNumber(orderNumber);

  if (!order) {
    redirect("/productos");
  }

  const ownerOk = session?.user?.id && order.userId === session.user.id;
  const tokenOk = token && verifyOrderAccessToken(token, orderNumber).valid;

  if (!ownerOk && !tokenOk) {
    redirect(`/seguimiento?pedido=${encodeURIComponent(orderNumber)}`);
  }

  const copy = getCheckoutSuccessCopy(order.status, order.orderNumber, order.total);
  const Icon = copy.showPaymentPending ? Clock : CheckCircle;
  const iconClass = copy.showPaymentPending
    ? "text-amber-600"
    : "text-brand-green";

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Icon className={cn("h-16 w-16", iconClass)} strokeWidth={1} aria-hidden />
      <h1 className="font-editorial mt-6 text-4xl text-foreground">{copy.title}</h1>
      <p className="text-body-muted mt-3 max-w-md">{copy.description}</p>
      {copy.showPaymentPending && (
        <p className="mt-4 text-sm text-neutral-600">
          Total pendiente: {formatPrice(order.total)}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/productos">
          <Button size="lg">Seguir comprando</Button>
        </Link>
        <Link
          href={`/seguimiento?pedido=${order.orderNumber}${token ? `&token=${token}` : ""}`}
        >
          <Button variant="outline" size="lg">
            Seguir envío
          </Button>
        </Link>
        {session?.user && (
          <Link href="/cuenta/pedidos">
            <Button variant="outline" size="lg">
              Ver mis pedidos
            </Button>
          </Link>
        )}
      </div>
    </Container>
  );
}
