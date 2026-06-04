import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "underline" | "underline-light" | "pill" | "minimal";
}

const variants = {
  underline:
    "w-full border-0 border-b border-neutral-900/20 bg-transparent py-3 text-nav placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0",
  "underline-light":
    "w-full border-0 border-b border-white/35 bg-transparent py-3 text-nav text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0",
  pill: "w-full rounded-full bg-brand-beige-muted px-6 py-3.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30",
  minimal:
    "w-full bg-transparent py-2 text-sm placeholder:text-neutral-400 focus:outline-none",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "underline", ...props }, ref) => (
    <input
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  ),
);

Input.displayName = "Input";
