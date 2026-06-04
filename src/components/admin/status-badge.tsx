import { cn } from "@/lib/utils";

const orderStatusStyles: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  AWAITING_PAYMENT: "bg-amber-50 text-amber-800",
  PAID: "bg-emerald-50 text-emerald-800",
  PROCESSING: "bg-blue-50 text-blue-800",
  SHIPPED: "bg-indigo-50 text-indigo-800",
  DELIVERED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  REFUNDED: "bg-red-50 text-red-700",
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  AWAITING_PAYMENT: "Esperando pago",
  PAID: "Pagado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        orderStatusStyles[status] ?? "bg-neutral-100 text-neutral-600",
      )}
    >
      {orderStatusLabels[status] ?? status}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        published
          ? "bg-emerald-50 text-emerald-800"
          : "bg-neutral-100 text-neutral-500",
      )}
    >
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-brand-green/10 text-brand-green",
    STAFF: "bg-blue-50 text-blue-800",
    CUSTOMER: "bg-neutral-100 text-neutral-600",
  };
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    STAFF: "Staff",
    CUSTOMER: "Cliente",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        styles[role] ?? "bg-neutral-100",
      )}
    >
      {labels[role] ?? role}
    </span>
  );
}

export function StockBadge({
  available,
  threshold = 1,
}: {
  available: number;
  threshold?: number;
}) {
  const low = available <= threshold;
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold tabular-nums",
        low ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-700",
      )}
    >
      {available} uds{low ? " · bajo" : ""}
    </span>
  );
}
