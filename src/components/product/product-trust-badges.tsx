import { RotateCcw, Shield, Store, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

const badges = [
  {
    icon: Truck,
    label: `Envío RM ${formatPrice(siteConfig.shipping.rm)} y regiones ${formatPrice(siteConfig.shipping.regions)}`,
  },
  {
    icon: RotateCcw,
    label: "Cambios limitados sin costo",
  },
  {
    icon: Shield,
    label: "Prendas curadas con calidad",
  },
  {
    icon: Store,
    label: "Retira gratis en tienda",
  },
] as const;

export function ProductTrustBadges() {
  return (
    <ul className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6 sm:grid-cols-4">
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-beige-muted text-brand-green">
            <Icon className="h-5 w-5" strokeWidth={1.25} />
          </span>
          <span className="mt-2 text-[10px] leading-snug text-neutral-600">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
