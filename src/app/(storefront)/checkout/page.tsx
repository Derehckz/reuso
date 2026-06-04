import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa tu compra de forma segura en reuso.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Container className="section-editorial !pt-8">
      <Link
        href="/carrito"
        className="text-nav mb-8 inline-flex items-center gap-1 text-neutral-500 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
        Volver al carrito
      </Link>

      <h1 className="font-editorial text-4xl text-foreground md:text-5xl">
        Checkout
      </h1>
      <p className="text-body-muted mt-2">
        Envío a todo Chile · Pago seguro con MercadoPago
      </p>

      <div className="mt-10">
        <CheckoutForm />
      </div>
    </Container>
  );
}
