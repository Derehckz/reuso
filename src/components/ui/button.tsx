import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "link";

type ButtonSize = "xs" | "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-orange-hover active:scale-[0.98] focus-visible:ring-brand-orange",
  secondary:
    "bg-brand-green text-white hover:bg-brand-green-light active:scale-[0.98] focus-visible:ring-brand-green",
  ghost:
    "bg-transparent text-foreground hover:bg-neutral-100 focus-visible:ring-neutral-400",
  outline:
    "border border-neutral-900 bg-transparent text-foreground hover:bg-neutral-900 hover:text-white focus-visible:ring-neutral-900",
  link: "bg-transparent p-0 text-foreground underline-offset-4 hover:underline focus-visible:ring-0",
};

const sizes: Record<ButtonSize, string> = {
  xs: "min-h-8 px-3 text-label",
  sm: "min-h-9 px-4 text-label-sm",
  md: "min-h-11 px-6 text-label-sm",
  lg: "min-h-13 px-8 text-label",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      isLoading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "font-ui inline-flex items-center justify-center gap-2 uppercase tracking-widest",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant !== "link" && "rounded-sm",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Cargando</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = "Button";
