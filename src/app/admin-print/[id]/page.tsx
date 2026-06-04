import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminOrderById } from "@/server/repositories/admin/orders.repository";
import { formatPrice } from "@/lib/utils";
import { roleHasPermission } from "@/shared/auth/permissions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintOrderPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.role || !roleHasPermission(session.user.role, "orders:read")) {
    redirect("/admin");
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;

  return (
    <html lang="es">
      <head>
        <title>Pedido {order.orderNumber}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; padding: 24px; max-width: 720px; margin: 0 auto; }
          h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
          .meta { color: #737373; font-size: 13px; }
          @media print { body { padding: 0; } }
        `}</style>
      </head>
      <body>
        <h1>Pedido {order.orderNumber}</h1>
        <p className="meta">
          {new Date(order.createdAt).toLocaleString("es-CL")} · {order.status}
        </p>
        <p>
          <strong>Cliente:</strong>{" "}
          {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "—"}
        </p>
        {address && (
          <p>
            <strong>Envío:</strong> {address.street}, {address.commune},{" "}
            {address.region}
          </p>
        )}
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 16, textAlign: "right" }}>
          <strong>Total: {formatPrice(order.total)}</strong>
        </p>
        <script
          dangerouslySetInnerHTML={{
            __html: "window.onload = () => window.print();",
          }}
        />
      </body>
    </html>
  );
}
