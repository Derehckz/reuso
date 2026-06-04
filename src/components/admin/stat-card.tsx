import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-neutral-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          {label}
        </p>
        {Icon && (
          <Icon className="h-4 w-4 text-brand-green" strokeWidth={1.5} />
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-foreground md:text-3xl">
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-brand-green",
            trend === "down" && "text-red-600",
            !trend && "text-neutral-400",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
