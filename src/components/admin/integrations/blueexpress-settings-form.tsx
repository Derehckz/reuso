"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  saveBlueExpressIntegration,
  testBlueExpressIntegration,
} from "@/server/actions/admin/integrations.actions";
import type { BlueExpressAdminView } from "@/modules/integrations/blueexpress";
import { EnvOverrideHint } from "./env-override-hint";
import { SecretFieldHint } from "./secret-field-hint";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

export function BlueExpressSettingsForm({ view }: { view: BlueExpressAdminView }) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const envFields = [
    view.envOverrides.apiKey && "BLUEXPRESS_API_KEY",
    view.envOverrides.apiUrl && "BLUEXPRESS_API_URL",
    view.envOverrides.accountId && "BLUEXPRESS_ACCOUNT_ID",
  ].filter(Boolean) as string[];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveBlueExpressIntegration(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleTest() {
    setTesting(true);
    const result = await testBlueExpressIntegration();
    setTesting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <EnvOverrideHint fields={envFields} />

      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-label">API</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="hidden" name="enabled" value="false" />
            <input
              type="checkbox"
              name="enabled"
              value="true"
              defaultChecked={view.enabled}
              className="size-4"
            />
            Activar cotización Blue Express
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">URL API</label>
            <input
              name="apiUrl"
              required
              defaultValue={view.apiUrl}
              className={inputClass}
              disabled={view.envOverrides.apiUrl}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">API key</label>
            <input
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder="Nueva key (opcional)"
              className={inputClass}
              disabled={view.envOverrides.apiKey}
            />
            <SecretFieldHint field={view.apiKey} label="Actual" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Account ID</label>
            <input
              name="accountId"
              defaultValue={view.envOverrides.accountId ? "" : view.accountId}
              placeholder={view.envOverrides.accountId ? "(definido en .env)" : ""}
              className={inputClass}
              disabled={view.envOverrides.accountId}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Ruta cotización</label>
            <input name="quotePath" defaultValue={view.quotePath} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Ruta tracking</label>
            <input name="trackingPath" defaultValue={view.trackingPath} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Ruta etiquetas</label>
            <input name="labelPath" defaultValue={view.labelPath} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-label">Origen del despacho</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Región</label>
            <input name="originRegion" required defaultValue={view.originRegion} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Comuna</label>
            <input name="originCommune" required defaultValue={view.originCommune} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Código región</label>
            <input name="originRegionCode" required defaultValue={view.originRegionCode} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Nombre remitente</label>
            <input name="originName" defaultValue={view.originName} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Teléfono</label>
            <input name="originPhone" defaultValue={view.originPhone} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Calle / bodega</label>
            <input name="originStreet" defaultValue={view.originStreet} className={inputClass} />
          </div>
        </div>
      </section>

      <p className="text-xs text-neutral-500">
        También puedes probar desde terminal:{" "}
        <code className="text-neutral-700">npm run bluexpress:test</code>.{" "}
        <Link href="/docs/BLUEXPRESS.md" className="text-brand-green underline">
          Documentación
        </Link>
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          Guardar
        </Button>
        <Button type="button" variant="outline" isLoading={testing} onClick={handleTest}>
          Probar cotización
        </Button>
      </div>
    </form>
  );
}
