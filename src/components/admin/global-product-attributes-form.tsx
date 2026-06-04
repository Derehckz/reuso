"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveGlobalProductAttributes } from "@/server/actions/admin/settings.actions";
import type { GlobalProductAttributeSet } from "@/server/repositories/admin/settings.repository";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

export function GlobalProductAttributesForm({
  values,
}: {
  values: GlobalProductAttributeSet;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveGlobalProductAttributes(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) toast.success(result.message ?? "Guardado");
    else toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-label">Atributos globales de catálogo</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Estos valores se reutilizan al crear/editar productos, como en Prestashop.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
            <label className="text-label-sm text-neutral-500">Nombre atributo 1</label>
            <input
              name="colorLabel"
              defaultValue={values.color.label}
              className={inputClass}
            />
            <label className="mt-3 block text-label-sm text-neutral-500">
              Valores (coma separada)
            </label>
            <textarea
              name="colorValues"
              rows={4}
              defaultValue={values.color.values.join(", ")}
              className={inputClass}
            />
          </div>
          <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
            <label className="text-label-sm text-neutral-500">Nombre atributo 2</label>
            <input
              name="sizeLabel"
              defaultValue={values.size.label}
              className={inputClass}
            />
            <label className="mt-3 block text-label-sm text-neutral-500">
              Valores (coma separada)
            </label>
            <textarea
              name="sizeValues"
              rows={4}
              defaultValue={values.size.values.join(", ")}
              className={inputClass}
            />
          </div>
        </div>
      </section>
      <Button type="submit" isLoading={loading}>
        Guardar atributos globales
      </Button>
    </form>
  );
}
