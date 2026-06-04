"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CHILE_REGIONS } from "@/lib/constants/chile-regions";
import { Button } from "@/components/ui/button";
import { deleteAddress, saveAddress } from "@/server/actions/account.actions";

type Address = {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  street: string;
  number: string | null;
  apartment: string | null;
  commune: string;
  region: string;
  phone: string;
  isDefault: boolean;
};

const inputClass =
  "mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

export function AddressesManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveAddress(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) {
      toast.success("Dirección guardada");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {addresses.length === 0 ? (
          <li className="p-6 text-sm text-neutral-500">Sin direcciones guardadas.</li>
        ) : (
          addresses.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:justify-between">
              <div className="text-sm">
                {a.isDefault && (
                  <span className="text-label-sm mb-1 inline-block text-brand-orange">
                    Predeterminada
                  </span>
                )}
                <p className="font-medium">
                  {a.firstName} {a.lastName}
                </p>
                <p className="text-neutral-600">
                  {a.street} {a.number}
                  {a.apartment ? `, ${a.apartment}` : ""}
                </p>
                <p className="text-neutral-500">
                  {a.commune}, {a.region} · {a.phone}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await deleteAddress(a.id);
                  toast.success("Dirección eliminada");
                  router.refresh();
                }}
              >
                Eliminar
              </Button>
            </li>
          ))
        )}
      </ul>

      {!open ? (
        <Button type="button" onClick={() => setOpen(true)}>
          Agregar dirección
        </Button>
      ) : (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-sm border border-neutral-200 bg-white p-6"
        >
          <h3 className="text-label">Nueva dirección</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="firstName" placeholder="Nombre" required className={inputClass} />
            <input name="lastName" placeholder="Apellido" required className={inputClass} />
            <input name="street" placeholder="Calle" required className={inputClass} />
            <input name="number" placeholder="Número" className={inputClass} />
            <input name="commune" placeholder="Comuna" required className={inputClass} />
            <select name="region" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Región
              </option>
              {CHILE_REGIONS.map((r) => (
                <option key={r.code} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <input name="phone" placeholder="Teléfono" required className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" className="accent-brand-orange" />
            Usar como predeterminada
          </label>
          <div className="flex gap-2">
            <Button type="submit" isLoading={loading}>
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
