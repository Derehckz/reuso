import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "main" | "article";
  narrow?: boolean;
};

export function Container({
  as: Component = "div",
  narrow,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "container-store",
        narrow && "max-w-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
