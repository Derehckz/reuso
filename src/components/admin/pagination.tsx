import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageCount } from "@/lib/admin/query";

export function AdminPagination({
  basePath,
  page,
  perPage,
  total,
  params = {},
}: {
  basePath: string;
  page: number;
  perPage: number;
  total: number;
  params?: Record<string, string | undefined>;
}) {
  const pageCount = buildPageCount(total, perPage);
  if (pageCount <= 1) return null;

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row">
      <p className="text-xs text-neutral-500">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <PaginationLink
          href={buildHref(page - 1)}
          disabled={page <= 1}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </PaginationLink>
        {getPageNumbers(page, pageCount).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">
              …
            </span>
          ) : (
            <PaginationLink
              key={p}
              href={buildHref(p)}
              active={p === page}
            >
              {p}
            </PaginationLink>
          ),
        )}
        <PaginationLink
          href={buildHref(page + 1)}
          disabled={page >= pageCount}
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({
  href,
  children,
  disabled,
  active,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center text-neutral-300">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-sm px-2 text-xs font-medium transition-colors",
        active
          ? "bg-brand-green text-white"
          : "text-neutral-600 hover:bg-neutral-200",
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
