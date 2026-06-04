"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/server/actions/admin/orders.actions";
import {
  canTransitionOrderStatus,
  validateAdminOrderTransition,
} from "@/lib/order-status-transitions";
import type { OrderStatus } from "@/generated/prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  AWAITING_PAYMENT: "Esperando pago",
  PAID: "Pagado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const DESTRUCTIVE: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentStatus);

  useEffect(() => {
    setSelected(currentStatus);
  }, [currentStatus]);

  const allowedStatuses = useMemo(() => {
    const options = new Set<OrderStatus>([currentStatus]);
    for (const status of Object.keys(statusLabels) as OrderStatus[]) {
      if (
        status !== currentStatus &&
        canTransitionOrderStatus(currentStatus, status) &&
        !validateAdminOrderTransition(currentStatus, status)
      ) {
        options.add(status);
      }
    }
    return [...options];
  }, [currentStatus]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-label-sm text-neutral-500">Estado del pedido</label>
        <select
          value={selected}
          disabled={loading}
          onChange={async (e) => {
            const next = e.target.value as OrderStatus;
            if (next === currentStatus) {
              setSelected(currentStatus);
              return;
            }

            const transitionError = validateAdminOrderTransition(
              currentStatus,
              next,
            );
            if (transitionError) {
              toast.error(transitionError);
              setSelected(currentStatus);
              return;
            }

            if (DESTRUCTIVE.includes(next)) {
              const label = statusLabels[next];
              const ok = window.confirm(
                `¿Confirmas cambiar el pedido a «${label}»? Esta acción afecta inventario y pagos.`,
              );
              if (!ok) {
                setSelected(currentStatus);
                return;
              }
            }

            setSelected(next);
            setLoading(true);
            const result = await updateOrderStatus(orderId, next);
            setLoading(false);

            if (!result.success) {
              toast.error(result.message);
              setSelected(currentStatus);
              return;
            }

            toast.success("Estado actualizado");
            router.refresh();
          }}
          className="mt-1 block min-w-[200px] border border-neutral-200 bg-white px-3 py-2.5 text-sm"
        >
          {allowedStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <Button size="sm" isLoading disabled>
          Guardando
        </Button>
      )}
    </div>
  );
}
