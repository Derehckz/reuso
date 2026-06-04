"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/server/actions/admin/coupons.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

type CouponFormProps = {
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
    minPurchase: number | null;
    maxUses: number | null;
    startsAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
    usedCount: number;
  };
};

function toDateInput(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const isEdit = Boolean(coupon);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateCoupon(coupon!.id, fd)
      : await createCoupon(fd);
    setLoading(false);
    if (!isEdit) return;
    if (result && "success" in result && !result.success) {
      toast.error(result.message);
    } else {
      toast.success("Cupón actualizado");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-label-sm text-neutral-500">Código *</label>
            <input
              name="code"
              required
              defaultValue={coupon?.code}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Tipo *</label>
            <select name="type" defaultValue={coupon?.type ?? "PERCENTAGE"} className={inputClass}>
              <option value="PERCENTAGE">Porcentaje</option>
              <option value="FIXED">Monto fijo</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Valor *</label>
            <input
              name="value"
              type="number"
              required
              min={1}
              defaultValue={coupon?.value}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Compra mínima</label>
            <input
              name="minPurchase"
              type="number"
              min={0}
              defaultValue={coupon?.minPurchase ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Máx. usos</label>
            <input
              name="maxUses"
              type="number"
              min={1}
              defaultValue={coupon?.maxUses ?? ""}
              className={inputClass}
            />
          </div>
          {isEdit && (
            <div>
              <label className="text-label-sm text-neutral-500">Usos actuales</label>
              <p className="mt-2 text-sm font-medium">{coupon!.usedCount}</p>
            </div>
          )}
          <div>
            <label className="text-label-sm text-neutral-500">Inicio</label>
            <input
              name="startsAt"
              type="date"
              defaultValue={toDateInput(coupon?.startsAt ?? null)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Expira</label>
            <input
              name="expiresAt"
              type="date"
              defaultValue={toDateInput(coupon?.expiresAt ?? null)}
              className={inputClass}
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={coupon?.isActive ?? true}
            className="accent-brand-orange"
          />
          Activo
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          {isEdit ? "Guardar" : "Crear cupón"}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("¿Eliminar cupón?")) return;
              await deleteCoupon(coupon!.id);
              router.push("/admin/cupones");
            }}
          >
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
