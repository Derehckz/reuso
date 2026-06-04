import { cn } from "@/lib/utils";

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-neutral-200 bg-neutral-50">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableHead({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-neutral-100">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-neutral-50/80", className)}>
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3.5 text-sm text-foreground", className)}>
      {children}
    </td>
  );
}

export function DataTableEmpty({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-16 text-center text-sm text-neutral-500">
        {message}
      </td>
    </tr>
  );
}
