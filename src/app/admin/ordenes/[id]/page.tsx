import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderById } from "@/server/repositories/admin/orders.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusSelect } from "@/components/admin/order-actions";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/lib/utils";
import { createShipmentLabel } from "@/server/actions/admin/shipping.actions";
import { OrderNotesPanel } from "@/components/admin/order-notes-panel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;

  return (
    <div>
      <AdminPageHeader
        title={order.orderNumber}
        description={new Date(order.createdAt).toLocaleString("es-CL")}
        backHref="/admin/ordenes"
        action={
          <Link
            href={`/admin-print/${order.id}`}
            target="_blank"
            className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline"
          >
            Imprimir
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-4">Productos</h2>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-neutral-500">{item.variantLabel}</p>
                    <p className="text-xs text-neutral-400">× {item.quantity}</p>
                  </div>
                  <p className="tabular-nums font-medium">
                    {formatPrice(item.total)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Descuento</dt>
                  <dd className="tabular-nums">−{formatPrice(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-neutral-500">Envío</dt>
                <dd className="tabular-nums">{formatPrice(order.shippingAmount)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-4">Historial</h2>
            <ul className="space-y-3">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <span className="shrink-0 text-neutral-400">
                    {new Date(h.createdAt).toLocaleString("es-CL")}
                  </span>
                  <div>
                    <OrderStatusBadge status={h.status} />
                    {h.note && (
                      <p className="mt-0.5 text-neutral-500">{h.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
          </section>

          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-3">Cliente</h2>
            <p className="text-sm">
              {order.user?.name ?? "Invitado"}
              <br />
              <span className="text-neutral-500">
                {order.user?.email ?? order.guestEmail}
              </span>
            </p>
          </section>

          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-3">Envío</h2>
            <p className="text-sm text-neutral-600">
              {address.firstName} {address.lastName}
              <br />
              {address.street} {address.number}
              <br />
              {address.commune}, {address.region}
              <br />
              {address.phone}
            </p>
            {order.shipment && (
              <div className="mt-3 text-sm">
                <p>
                  Tracking:{" "}
                  {order.shipment.trackingNumber ? (
                    <span className="font-mono">
                      {order.shipment.trackingNumber}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                {order.shipment.labelUrl && (
                  <a
                    href={order.shipment.labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-orange hover:underline"
                  >
                    Ver etiqueta
                  </a>
                )}
              </div>
            )}
            {order.status === "PAID" && !order.shipment?.trackingNumber && (
              <form
                action={async () => {
                  "use server";
                  await createShipmentLabel(order.id);
                }}
                className="mt-4"
              >
                <button
                  type="submit"
                  className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline"
                >
                  Generar etiqueta Bluexpress
                </button>
              </form>
            )}
            <Link
              href={`/seguimiento?pedido=${order.orderNumber}`}
              className="text-label-sm mt-3 inline-block text-neutral-500 hover:text-foreground"
            >
              Ver seguimiento público →
            </Link>
          </section>

          {order.payment && (
            <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-label mb-3">Pago</h2>
              <p className="text-sm">
                Estado: <strong>{order.payment.status}</strong>
                <br />
                Monto: {formatPrice(order.payment.amount)}
              </p>
            </section>
          )}

          <OrderNotesPanel
            orderId={order.id}
            notes={order.adminNotes}
            customerNote={order.notes}
          />
        </div>
      </div>
    </div>
  );
}
