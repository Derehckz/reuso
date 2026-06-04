import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/modules/integrations/core/types";

const labels: Record<IntegrationStatus, string> = {
  ready: "Listo",
  partial: "Incompleto",
  disabled: "Desactivado",
  unconfigured: "Sin configurar",
};

const styles: Record<IntegrationStatus, string> = {
  ready: "bg-emerald-50 text-emerald-800 border-emerald-200",
  partial: "bg-amber-50 text-amber-800 border-amber-200",
  disabled: "bg-neutral-100 text-neutral-600 border-neutral-200",
  unconfigured: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
