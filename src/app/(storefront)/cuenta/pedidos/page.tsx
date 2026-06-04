import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import {
  orderRepository,
  orderStatusLabel,
} from "@/server/repositories/order.repository";

export const metadata: Metadata = {
  title: "Mis pedidos",
  robots: { index: false },
};

export default async function MisPedidosPage() {
  const session = await auth();
  const orders = await orderRepository.findForAccount(session!.user!.id);

  return (
    <div>
      <h2 className="text-label text-foreground">Mis pedidos</h2>
      <p className="text-body-muted mt-1 text-sm">
        Historial completo de tus compras en REUSO.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-neutral-600">Aún no tienes pedidos.</p>
          <Link
            href="/productos"
            className="mt-4 inline-block text-sm underline hover:text-brand-green"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200 border border-neutral-200 bg-white">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-col gap-2 p-5 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/cuenta/pedidos/${order.orderNumber}`}
                  className="font-medium hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("es-CL", {
                    dateStyle: "long",
                  })}
                  {" · "}
                  {orderStatusLabel(order.status)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium tabular-nums">
                  {formatPrice(order.total)}
                </span>
                <Link
                  href={`/cuenta/pedidos/${order.orderNumber}`}
                  className="text-label-sm text-brand-orange hover:underline"
                >
                  Detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
