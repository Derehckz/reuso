import { Suspense } from "react";
import Link from "next/link";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import { listAdminOrders } from "@/server/repositories/admin/orders.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ListToolbar, AdminSearch, AdminFilterSelect } from "@/components/admin/list-toolbar";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";
import { ExportOrdersButton } from "@/components/admin/export-orders-button";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "AWAITING_PAYMENT", label: "Esperando pago" },
  { value: "PAID", label: "Pagado" },
  { value: "PROCESSING", label: "Preparando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp);
  const status = getStringParam(sp, "status") as OrderStatus | undefined;

  const { items, total } = await listAdminOrders(params, {
    status: status || undefined,
  });

  return (
    <div>
      <AdminPageHeader title="Órdenes" description={`${total} pedidos`} />

      <ListToolbar>
        <Suspense fallback={null}>
          <AdminSearch
            defaultValue={params.q}
            placeholder="Nº pedido, email, cliente..."
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="status"
            label="Estado"
            defaultValue={status ?? ""}
            options={statusOptions}
          />
        </Suspense>
        <ExportOrdersButton status={status} />
      </ListToolbar>

      <DataTable>
        <table className="w-full min-w-[800px]">
          <DataTableHeader>
            <DataTableHead>Pedido</DataTableHead>
            <DataTableHead>Cliente</DataTableHead>
            <DataTableHead>Items</DataTableHead>
            <DataTableHead>Total</DataTableHead>
            <DataTableHead>Pago</DataTableHead>
            <DataTableHead>Estado</DataTableHead>
            <DataTableHead>Fecha</DataTableHead>
          </DataTableHeader>
          <DataTableBody>
            {items.length === 0 ? (
              <DataTableEmpty message="No hay órdenes" />
            ) : (
              items.map((order) => (
                <DataTableRow key={order.id}>
                  <DataTableCell>
                    <Link
                      href={`/admin/ordenes/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </DataTableCell>
                  <DataTableCell className="max-w-[180px] truncate text-neutral-600">
                    {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "—"}
                  </DataTableCell>
                  <DataTableCell>{order._count.items}</DataTableCell>
                  <DataTableCell className="tabular-nums font-medium">
                    {formatPrice(order.total)}
                  </DataTableCell>
                  <DataTableCell className="text-xs text-neutral-500">
                    {order.payment?.status ?? "—"}
                  </DataTableCell>
                  <DataTableCell>
                    <OrderStatusBadge status={order.status} />
                  </DataTableCell>
                  <DataTableCell className="text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </table>
        <AdminPagination
          basePath="/admin/ordenes"
          page={params.page}
          perPage={params.perPage}
          total={total}
          params={{ q: params.q, status }}
        />
      </DataTable>
    </div>
  );
}
