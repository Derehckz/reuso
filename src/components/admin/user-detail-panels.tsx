import Link from "next/link";
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

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
};

type AddressRow = {
  id: string;
  label: string | null;
  street: string;
  commune: string;
  region: string;
  isDefault: boolean;
};

export function UserOrdersPanel({ orders }: { orders: OrderSummary[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-neutral-500">Sin pedidos</p>;
  }

  return (
    <DataTable>
      <table className="w-full min-w-[400px]">
        <DataTableHeader>
          <DataTableHead>Pedido</DataTableHead>
          <DataTableHead>Total</DataTableHead>
          <DataTableHead>Estado</DataTableHead>
          <DataTableHead>Fecha</DataTableHead>
        </DataTableHeader>
        <DataTableBody>
          {orders.map((order) => (
            <DataTableRow key={order.id}>
              <DataTableCell>
                <Link
                  href={`/admin/ordenes/${order.id}`}
                  className="font-medium hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </DataTableCell>
              <DataTableCell className="tabular-nums">
                {formatPrice(order.total)}
              </DataTableCell>
              <DataTableCell>
                <OrderStatusBadge status={order.status as never} />
              </DataTableCell>
              <DataTableCell className="text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString("es-CL")}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </table>
    </DataTable>
  );
}

export function UserAddressesPanel({ addresses }: { addresses: AddressRow[] }) {
  if (addresses.length === 0) {
    return <p className="text-sm text-neutral-500">Sin direcciones guardadas</p>;
  }

  return (
    <ul className="space-y-3 text-sm">
      {addresses.map((addr) => (
        <li
          key={addr.id}
          className="rounded-sm border border-neutral-100 bg-neutral-50 p-3"
        >
          <p className="font-medium">
            {addr.label ?? "Dirección"}
            {addr.isDefault && (
              <span className="ml-2 text-[10px] uppercase text-brand-orange">
                Principal
              </span>
            )}
          </p>
          <p className="text-neutral-600">
            {addr.street}, {addr.commune}, {addr.region}
          </p>
        </li>
      ))}
    </ul>
  );
}
