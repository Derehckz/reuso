import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/product/product-grid";
import { NavLink } from "@/components/ui/nav-link";
import type { ProductListItem } from "@/types/product";

type ProductRowProps = {
  title: string;
  tabs?: { label: string; href: string; active?: boolean }[];
  products: ProductListItem[];
  viewAllHref: string;
};

export function ProductRow({
  title,
  tabs,
  products,
  viewAllHref,
}: ProductRowProps) {
  return (
    <section className="section-editorial">
      <Container>
        <div className="mb-8 flex flex-col gap-4 border-b border-neutral-900/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Badge variant="accent">{title}</Badge>
            {tabs?.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  tab.active
                    ? "text-nav text-foreground"
                    : "text-label-sm text-neutral-400 transition-colors hover:text-foreground"
                }
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <NavLink href={viewAllHref} className="shrink-0 self-start sm:self-auto">
            Ver todo
          </NavLink>
        </div>
        <ProductGrid products={products} columns={5} />
      </Container>
    </section>
  );
}
