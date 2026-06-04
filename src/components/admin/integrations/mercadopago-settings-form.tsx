"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  saveMercadoPagoIntegration,
  testMercadoPagoIntegration,
} from "@/server/actions/admin/integrations.actions";
import type { MercadoPagoAdminView } from "@/modules/integrations/mercadopago";
import { EnvOverrideHint } from "./env-override-hint";
import { SecretFieldHint } from "./secret-field-hint";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

export function MercadoPagoSettingsForm({
  view,
  webhookUrl,
}: {
  view: MercadoPagoAdminView;
  webhookUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const envFields = [
    view.envOverrides.accessToken && "MERCADOPAGO_ACCESS_TOKEN",
    view.envOverrides.publicKey && "MERCADOPAGO_PUBLIC_KEY",
    view.envOverrides.webhookSecret && "MERCADOPAGO_WEBHOOK_SECRET",
    view.envOverrides.environment && "MERCADOPAGO_ENV",
  ].filter(Boolean) as string[];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveMercadoPagoIntegration(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleTest() {
    setTesting(true);
    const result = await testMercadoPagoIntegration();
    setTesting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <EnvOverrideHint fields={envFields} />

      <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-label">Estado</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="hidden" name="enabled" value="false" />
            <input
              type="checkbox"
              name="enabled"
              value="true"
              defaultChecked={view.enabled}
              className="size-4"
            />
            Activar Mercado Pago en checkout
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-label-sm text-neutral-500">Entorno</label>
            <select
              name="environment"
              defaultValue={view.environment}
              className={inputClass}
              disabled={view.envOverrides.environment}
            >
              <option value="sandbox">Sandbox (TEST-)</option>
              <option value="production">Producción</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Public key</label>
            <input
              name="publicKey"
              placeholder={view.envOverrides.publicKey ? "(definida en .env)" : ""}
              defaultValue={view.envOverrides.publicKey ? "" : view.publicKey}
              className={inputClass}
              disabled={view.envOverrides.publicKey}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Access token</label>
            <input
              name="accessToken"
              type="password"
              autoComplete="off"
              placeholder="Nuevo token (opcional)"
              className={inputClass}
              disabled={view.envOverrides.accessToken}
            />
            <SecretFieldHint field={view.accessToken} label="Actual" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Webhook secret</label>
            <input
              name="webhookSecret"
              type="password"
              autoComplete="off"
              placeholder="Secret de firma (opcional)"
              className={inputClass}
              disabled={view.envOverrides.webhookSecret}
            />
            <SecretFieldHint field={view.webhookSecret} label="Actual" />
          </div>
        </div>
      </section>

      <p className="text-xs text-neutral-500">
        Webhook: <code className="text-neutral-700">{webhookUrl}</code>
        . En producción el secret es obligatorio.{" "}
        <Link href="/docs/MERCADOPAGO.md" className="text-brand-green underline">
          Documentación
        </Link>
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          Guardar
        </Button>
        <Button type="button" variant="outline" isLoading={testing} onClick={handleTest}>
          Probar conexión
        </Button>
      </div>
    </form>
  );
}
