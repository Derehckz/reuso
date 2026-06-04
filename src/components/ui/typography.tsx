import { cn } from "@/lib/utils";

type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4";
};

export function TextLabel({
  className,
  children,
  as: Component = "span",
  ...props
}: TextProps) {
  return (
    <Component className={cn("text-label text-foreground", className)} {...props}>
      {children}
    </Component>
  );
}

export function TextNav({
  className,
  children,
  as: Component = "span",
  ...props
}: TextProps) {
  return (
    <Component className={cn("text-nav", className)} {...props}>
      {children}
    </Component>
  );
}

export function HeadingEditorial({
  className,
  children,
  as: Component = "h1",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn("text-editorial-hero font-editorial text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TextMuted({
  className,
  children,
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component className={cn("text-body-muted", className)} {...props}>
      {children}
    </Component>
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-label-sm text-neutral-500",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}
