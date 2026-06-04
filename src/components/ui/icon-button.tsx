import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  variant?: "ghost" | "outline";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", variant = "ghost", children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        variant === "ghost" &&
          "text-neutral-700 hover:bg-neutral-100 hover:text-brand-orange",
        variant === "outline" &&
          "border border-neutral-200 text-neutral-700 hover:border-neutral-900",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-10 w-10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = "IconButton";
