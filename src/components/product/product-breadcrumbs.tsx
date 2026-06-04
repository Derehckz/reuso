import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

type ProductBreadcrumbsProps = {
  items: Crumb[];
};

export function ProductBreadcrumbs({ items }: ProductBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-brand-green"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
