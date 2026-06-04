import { Container } from "@/components/ui/container";
import { NavLink } from "@/components/ui/nav-link";
import { siteConfig } from "@/config/site";
import { SearchInput } from "@/components/search/search-input";

export function UtilityBar() {
  return (
    <div className="hidden border-b border-brand-green/10 bg-brand-beige md:block">
      <Container className="flex min-h-12 items-center justify-between gap-6 py-2.5">
        <nav aria-label="Utilidades" className="flex items-center gap-6">
          {siteConfig.nav.utility.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="text-neutral-700 hover:text-brand-orange"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="w-full max-w-md shrink-0">
          <SearchInput />
        </div>
      </Container>
    </div>
  );
}
