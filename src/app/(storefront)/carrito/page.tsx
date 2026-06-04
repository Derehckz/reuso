import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa tu selección de ropa reutilizada premium antes de pagar.",
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return <CartPageContent />;
}
