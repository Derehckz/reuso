import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { orderRepository } from "@/server/repositories/order.repository";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default async function CuentaDashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const orders = await orderRepository.findForAccount(userId, { limit: 3 });

  return (
    <div className="space-y-8">
      <section className="rounded-sm border border-neutral-200 bg-white p-6">
        <h2 className="text-label text-foreground">Resumen</h2>
        <p className="text-body-muted mt-2 text-sm">
          Gestiona tus pedidos, direcciones y favoritos desde un solo lugar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/productos"
            className="inline-flex items-center justify-center bg-brand-green px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-green/90"
          >
            Seguir comprando
          </Link>
          <Link
            href="/seguimiento"
            className="inline-flex items-center justify-center border border-neutral-300 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:border-brand-green"
          >
            Rastrear pedido
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-label text-foreground">Últimos pedidos</h2>
          <Link href="/cuenta/pedidos" className="text-label-sm text-brand-orange hover:underline">
            Ver todos
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-500">Aún no tienes pedidos.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href={`/cuenta/pedidos/${order.orderNumber}`}
                    className="font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <span className="font-medium tabular-nums">{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
