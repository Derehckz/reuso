import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  catalogCategoryHref,
  catalogSubcategoryHref,
} from "@/lib/constants/category-subcategories";

type CategoryLandingProps = {
  name: string;
  slug: string;
  description?: string | null;
  subcategories: { id: string; name: string; slug: string }[];
};

export function CategoryLanding({
  name,
  slug,
  description,
  subcategories,
}: CategoryLandingProps) {
  return (
    <Container className="section-editorial py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-label-sm text-brand-orange">{name}</p>
        <h1 className="font-editorial mt-2 text-4xl text-foreground md:text-5xl">
          {name}
        </h1>
        {description && (
          <p className="text-body-muted mt-4 text-sm leading-relaxed">
            {description}
          </p>
        )}
        <Link
          href={catalogCategoryHref(slug)}
          className="text-nav mt-6 inline-block text-brand-green underline-offset-4 hover:underline"
        >
          Ver todo {name.toLowerCase()}
        </Link>
      </header>

      {subcategories.length > 0 ? (
        <section className="mt-12 md:mt-16">
          <h2 className="text-label mb-6">Subcategorías</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={catalogSubcategoryHref(sub.slug)}
                  className="group flex items-center justify-between border border-neutral-200 bg-white px-5 py-4 transition-colors hover:border-brand-green hover:bg-brand-beige-muted/40"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-brand-green">
                    {sub.name}
                  </span>
                  <span
                    className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-orange"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-body-muted mt-12 text-sm">
          Pronto agregaremos subcategorías para esta colección.
        </p>
      )}
    </Container>
  );
}
