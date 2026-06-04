import { cn } from "@/lib/utils";

type ModaCircularBadgeProps = {
  className?: string;
  /** Tamaño compacto para miniaturas */
  size?: "default" | "sm";
};

export function ModaCircularBadge({
  className,
  size = "default",
}: ModaCircularBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute left-2 top-2 z-[30]",
        "bg-brand-orange font-ui font-semibold uppercase leading-tight text-white",
        size === "default" && "px-2 py-1 text-[9px] tracking-[0.14em] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]",
        size === "sm" && "left-1 top-1 px-1.5 py-0.5 text-[7px] tracking-[0.1em] sm:left-1.5 sm:top-1.5 sm:text-[8px]",
        className,
      )}
      aria-hidden
    >
      Moda circular
    </span>
  );
}
