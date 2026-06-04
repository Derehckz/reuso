"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveStoreSettings } from "@/server/actions/admin/settings.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

type SettingsFormProps = {
  values: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    socialInstagram: string;
    socialFacebook: string;
    seoTitle: string;
    seoDescription: string;
    analyticsId: string;
  };
};

export function StoreSettingsForm({ values }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveStoreSettings(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) toast.success(result.message ?? "Guardado");
    else toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-label">Tienda</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Nombre</label>
            <input name="storeName" required defaultValue={values.storeName} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Email</label>
            <input name="storeEmail" type="email" required defaultValue={values.storeEmail} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Teléfono</label>
            <input name="storePhone" defaultValue={values.storePhone} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-label">Redes y SEO</h2>
        <div className="mt-4 grid gap-4">
          <input name="socialInstagram" placeholder="Instagram URL" defaultValue={values.socialInstagram} className={inputClass} />
          <input name="socialFacebook" placeholder="Facebook URL" defaultValue={values.socialFacebook} className={inputClass} />
          <input name="seoTitle" placeholder="SEO title" defaultValue={values.seoTitle} className={inputClass} />
          <textarea name="seoDescription" rows={2} placeholder="SEO description" defaultValue={values.seoDescription} className={inputClass} />
          <input name="analyticsId" placeholder="Google Analytics ID" defaultValue={values.analyticsId} className={inputClass} />
        </div>
      </section>

      <p className="text-xs text-neutral-500">
        Mercado Pago y Blue Express se configuran en{" "}
        <a href="/admin/integraciones" className="text-brand-green underline">
          Integraciones
        </a>{" "}
        (o en .env; las variables de entorno tienen prioridad).
      </p>

      <Button type="submit" isLoading={loading}>
        Guardar configuración
      </Button>
    </form>
  );
}
