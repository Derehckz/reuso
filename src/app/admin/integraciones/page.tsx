import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { IntegrationStatusBadge } from "@/components/admin/integrations/integration-status-badge";
import { getIntegrationsOverview } from "@/server/actions/admin/integrations.actions";
import { integrationRegistry } from "@/modules/integrations/registry";
import { ChevronRight } from "lucide-react";

export default async function AdminIntegrationsPage() {
  const { mercadopago, blueexpress } = await getIntegrationsOverview();

  const statusById = {
    mercadopago: mercadopago.status,
    blueexpress: blueexpress.status,
  } as const;

  return (
    <div>
      <AdminPageHeader
        title="Integraciones"
        description="Pagos y envíos. Las credenciales pueden guardarse aquí o en variables de entorno (prioridad .env)."
      />

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {integrationRegistry.map((mod) => (
          <li key={mod.id}>
            <Link
              href={mod.adminPath}
              className="flex items-center justify-between rounded-sm border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-green/40"
            >
              <div>
                <p className="font-medium text-neutral-900">{mod.name}</p>
                <p className="mt-1 text-sm text-neutral-500">{mod.description}</p>
                <div className="mt-3">
                  <IntegrationStatusBadge
                    status={statusById[mod.id as keyof typeof statusById]}
                  />
                </div>
              </div>
              <ChevronRight className="size-5 shrink-0 text-neutral-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
