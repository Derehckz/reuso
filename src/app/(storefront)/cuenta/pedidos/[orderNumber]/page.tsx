import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel } from "@/server/repositories/order.repository";
import { OrderStatusBadge } from "@/components/admin/status-badge";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export const metadata: Metadata = {
  title: "Detalle del pedido",
  robots: { index: false },
};

export default async function CuentaPedidoDetailPage({ params }: PageProps) {
  const session = await auth();
  const { orderNumber } = await params;

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session!.user!.id,
    },
    include: {
      items: true,
      payment: true,
      shipment: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/cuenta/pedidos"
          className="text-label-sm text-neutral-500 hover:text-foreground"
        >
          ← Mis pedidos
        </Link>
        <h2 className="font-editorial mt-2 text-2xl">{order.orderNumber}</h2>
        <p className="text-sm text-neutral-500">
          {new Date(order.createdAt).toLocaleString("es-CL")}
        </p>
      </div>

      <section className="rounded-sm border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OrderStatusBadge status={order.status} />
          <p className="text-xl font-semibold tabular-nums">
            {formatPrice(order.total)}
          </p>
        </div>
        {order.shipment?.trackingNumber && (
          <p className="mt-4 text-sm">
            Tracking:{" "}
            <span className="font-mono">{order.shipment.trackingNumber}</span>
          </p>
        )}
        <Link
          href={`/seguimiento?pedido=${order.orderNumber}`}
          className="text-label-sm mt-3 inline-block text-brand-orange hover:underline"
        >
          Seguir envío →
        </Link>
      </section>

      <section className="rounded-sm border border-neutral-200 bg-white p-6">
        <h3 className="text-label mb-4">Productos</h3>
        <ul className="divide-y divide-neutral-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-neutral-500">{item.variantLabel}</p>
                <p className="text-xs text-neutral-400">× {item.quantity}</p>
              </div>
              <p className="tabular-nums font-medium">{formatPrice(item.total)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-sm border border-neutral-200 bg-white p-6">
        <h3 className="text-label mb-3">Envío</h3>
        <p className="text-sm text-neutral-600">
          {address.firstName} {address.lastName}
          <br />
          {address.street} {address.number}
          <br />
          {address.commune}, {address.region}
        </p>
      </section>

      <section>
        <h3 className="text-label mb-3">Historial</h3>
        <ul className="space-y-2 text-sm">
          {order.statusHistory.map((h) => (
            <li key={h.id} className="flex gap-3 text-neutral-600">
              <span className="shrink-0 text-neutral-400">
                {new Date(h.createdAt).toLocaleString("es-CL")}
              </span>
              <span>{orderStatusLabel(h.status)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
