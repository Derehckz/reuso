"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  upsertShippingZone,
  deleteShippingZone,
} from "@/server/actions/admin/shipping-zones.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

type Zone = {
  id: string;
  name: string;
  regionCode: string;
  basePrice: number;
  isActive: boolean;
};

export function ShippingZonesForm({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await upsertShippingZone(new FormData(e.currentTarget));
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Zona guardada");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  return (
    <div className="mt-8 max-w-2xl rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-label">Zonas de envío</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Tarifas base por código de región (usadas en cotización de checkout).
      </p>

      <ul className="mt-4 divide-y divide-neutral-100">
        {zones.map((zone) => (
          <li key={zone.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div>
              <p className="font-medium">
                {zone.name}{" "}
                <span className="text-neutral-400">({zone.regionCode})</span>
              </p>
              <p className="text-xs text-neutral-500">
                ${zone.basePrice.toLocaleString("es-CL")} ·{" "}
                {zone.isActive ? "Activa" : "Inactiva"}
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-red-600 hover:underline"
              onClick={async () => {
                if (!confirm("¿Eliminar zona?")) return;
                await deleteShippingZone(zone.id);
                toast.success("Zona eliminada");
                router.refresh();
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value="" />
        <div className="sm:col-span-2">
          <label className="text-label-sm text-neutral-500">Nombre</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Código región</label>
          <input
            name="regionCode"
            required
            placeholder="RM"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Precio base (CLP)</label>
          <input
            name="basePrice"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="isActive" defaultChecked className="accent-brand-orange" />
          Activa
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" isLoading={loading}>
            Agregar zona
          </Button>
        </div>
      </form>
    </div>
  );
}
