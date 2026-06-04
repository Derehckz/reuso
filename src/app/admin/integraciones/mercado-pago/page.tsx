import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MercadoPagoSettingsForm } from "@/components/admin/integrations/mercadopago-settings-form";
import { IntegrationStatusBadge } from "@/components/admin/integrations/integration-status-badge";
import { createPrismaIntegrationStore } from "@/modules/integrations/core/store-prisma";
import { getMercadoPagoAdminView } from "@/modules/integrations/mercadopago";

export default async function AdminMercadoPagoPage() {
  const view = await getMercadoPagoAdminView(createPrismaIntegrationStore());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const webhookUrl = appUrl
    ? `${appUrl}/api/webhooks/mercadopago`
    : "/api/webhooks/mercadopago";

  return (
    <div>
      <AdminPageHeader
        title="Mercado Pago"
        description="Checkout Pro y notificaciones de pago."
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
      <MercadoPagoSettingsForm view={view} webhookUrl={webhookUrl} />
    </div>
  );
}
