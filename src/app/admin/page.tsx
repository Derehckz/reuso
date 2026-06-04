import Link from "next/link";
import { getDashboardMetrics } from "@/server/repositories/admin/dashboard.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const maxRevenue = Math.max(...metrics.last7Days.map((d) => d.total), 1);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Resumen de tu tienda reuso"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos totales"
          value={formatPrice(metrics.revenueAll)}
          hint={`${formatPrice(metrics.revenueMonth)} este mes`}
          icon={DollarSign}
        />
        <StatCard
          label="Órdenes"
          value={metrics.orderCount}
          hint={`${metrics.ordersToday} hoy · ${metrics.pendingOrders} pendientes`}
          icon={ShoppingCart}
        />
        <StatCard
          label="Productos"
          value={metrics.productCount}
          hint={`${metrics.publishedCount} publicados`}
          icon={Package}
        />
        <StatCard
          label="Clientes"
          value={metrics.customerCount}
          icon={Users}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conversión (30d)"
          value={`${metrics.conversionRate}%`}
          hint="Pedidos pagados / total pedidos"
        />
        <StatCard
          label="Pendientes"
          value={metrics.pendingOrders}
          hint="Pago o preparación"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-label mb-4 text-foreground">
            Ventas últimos 7 días
          </h2>
          <div className="flex h-40 items-end gap-2 rounded-sm border border-neutral-200 bg-white p-4 shadow-sm">
            {metrics.last7Days.map((day) => (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full max-w-[48px] rounded-t bg-brand-green/80 transition-all"
                  style={{
                    height: `${Math.max(4, (day.total / maxRevenue) * 100)}%`,
                  }}
                  title={formatPrice(day.total)}
                />
                <span className="text-[9px] text-neutral-400">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-label mb-4 text-foreground">Por estado</h2>
            <ul className="rounded-sm border border-neutral-200 bg-white p-4 shadow-sm space-y-2 text-sm">
              {metrics.ordersByStatus.map((s) => (
                <li key={s.status} className="flex justify-between">
                  <OrderStatusBadge status={s.status} />
                  <span className="tabular-nums font-medium">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-label mb-4 text-foreground">Más vendidos (30d)</h2>
            <ul className="rounded-sm border border-neutral-200 bg-white p-4 shadow-sm space-y-2 text-sm">
              {metrics.topProducts.length === 0 ? (
                <li className="text-neutral-500">Sin datos</li>
              ) : (
                metrics.topProducts.map((row) => (
                  <li key={row.productId} className="flex justify-between gap-2">
                    <Link
                      href={row.product ? `/admin/productos/${row.productId}` : "#"}
                      className="truncate font-medium hover:underline"
                    >
                      {row.product?.name ?? row.productId}
                    </Link>
                    <span className="shrink-0 tabular-nums text-neutral-500">
                      {row.quantity} uds
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h2 className="text-label mb-4 text-foreground">Stock bajo</h2>
            <div className="rounded-sm border border-neutral-200 bg-white p-4 shadow-sm">
              {metrics.lowStock.length === 0 ? (
                <p className="text-sm text-neutral-500">Sin alertas</p>
              ) : (
                <ul className="space-y-2">
                  {metrics.lowStock.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>
                        <Link
                          href={`/admin/productos/${item.productId}`}
                          className="font-medium hover:underline"
                        >
                          {item.productName}
                        </Link>
                        <span className="block text-xs text-neutral-500">
                          {item.size} / {item.color} · {item.stock} uds
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/admin/inventario?lowStock=1"
                className="text-label-sm mt-4 inline-block text-brand-orange hover:underline"
              >
                Ver inventario →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-label mb-4 text-foreground">Clientes recientes</h2>
        <DataTable>
          <table className="w-full min-w-[400px]">
            <DataTableHeader>
              <DataTableHead>Cliente</DataTableHead>
              <DataTableHead>Pedidos</DataTableHead>
              <DataTableHead>Registro</DataTableHead>
            </DataTableHeader>
            <DataTableBody>
              {metrics.recentCustomers.map((u) => (
                <DataTableRow key={u.id}>
                  <DataTableCell>
                    <Link href={`/admin/usuarios/${u.id}`} className="hover:underline">
                      {u.name ?? u.email}
                    </Link>
                  </DataTableCell>
                  <DataTableCell>{u._count.orders}</DataTableCell>
                  <DataTableCell className="text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString("es-CL")}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-label text-foreground">Órdenes recientes</h2>
          <Link
            href="/admin/ordenes"
            className="text-label-sm text-brand-orange hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <DataTable>
          <table className="w-full min-w-[600px]">
            <DataTableHeader>
              <DataTableHead>Pedido</DataTableHead>
              <DataTableHead>Cliente</DataTableHead>
              <DataTableHead>Total</DataTableHead>
              <DataTableHead>Estado</DataTableHead>
              <DataTableHead>Fecha</DataTableHead>
            </DataTableHeader>
            <DataTableBody>
              {metrics.recentOrders.map((order) => (
                <DataTableRow key={order.id}>
                  <DataTableCell>
                    <Link
                      href={`/admin/ordenes/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </DataTableCell>
                  <DataTableCell className="text-neutral-600">
                    {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "—"}
                  </DataTableCell>
                  <DataTableCell className="tabular-nums">
                    {formatPrice(order.total)}
                  </DataTableCell>
                  <DataTableCell>
                    <OrderStatusBadge status={order.status} />
                  </DataTableCell>
                  <DataTableCell className="text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      </div>
    </div>
  );
}
