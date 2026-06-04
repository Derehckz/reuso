import { cn } from "@/lib/utils";

type DividerProps = React.HTMLAttributes<HTMLHRElement> & {
  subtle?: boolean;
};

export function Divider({ className, subtle, ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-0 border-t",
        subtle ? "border-neutral-900/5" : "border-neutral-900/10",
        className,
      )}
      {...props}
    />
  );
}
