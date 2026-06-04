import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BlueExpressSettingsForm } from "@/components/admin/integrations/blueexpress-settings-form";
import { IntegrationStatusBadge } from "@/components/admin/integrations/integration-status-badge";
import { createPrismaIntegrationStore } from "@/modules/integrations/core/store-prisma";
import { getBlueExpressAdminView } from "@/modules/integrations/blueexpress";

export default async function AdminBlueExpressPage() {
  const view = await getBlueExpressAdminView(createPrismaIntegrationStore());

  return (
    <div>
      <AdminPageHeader
        title="Blue Express"
        description="Cotización en checkout, etiquetas y seguimiento."
        action={
          <Link
            href="/admin/integraciones"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← Integraciones
          </Link>
        }
      />
      <div className="mb-4">
        <IntegrationStatusBadge status={view.status} />
      </div>
      <BlueExpressSettingsForm view={view} />
    </div>
  );
}
