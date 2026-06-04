import { cn } from "@/lib/utils";

type BadgeVariant = "accent" | "dark" | "outline" | "muted";

const variants: Record<BadgeVariant, string> = {
  accent: "bg-brand-orange text-white",
  dark: "bg-brand-green text-white",
  outline: "border border-neutral-900/20 bg-transparent text-foreground",
  muted: "bg-neutral-100 text-neutral-700",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "accent",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-label",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
