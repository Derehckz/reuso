import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
  backHref,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="text-label-sm mb-2 inline-block text-neutral-500 hover:text-foreground"
          >
            ← Volver
          </Link>
        )}
        <h1 className="font-ui text-2xl font-bold uppercase tracking-widest text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
