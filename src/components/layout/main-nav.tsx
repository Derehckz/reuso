"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Menu, Search, ShoppingBag, X } from "lucide-react";
import {
  AccountNavMenu,
  MobileAccountLinks,
} from "@/components/layout/account-nav-menu";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CartCount } from "@/components/cart/cart-count";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { NavLink } from "@/components/ui/nav-link";
import { IconButton } from "@/components/ui/icon-button";
import { HeaderSearchOverlay } from "@/components/search/header-search-overlay";
import {
  CategoryNavMenu,
  type NavCategory,
} from "@/components/layout/category-nav-menu";

type MainNavProps = {
  /** Nav flotante sobre el hero del home */
  overlay?: boolean;
  navCategories: NavCategory[];
};

export function MainNav({ overlay = false, navCategories }: MainNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isOverlayActive = overlay && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "top-0 z-50 w-full transition-all duration-300",
          overlay ? "fixed" : "sticky",
          isOverlayActive
            ? "border-b border-white/15 bg-neutral-950/50 shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-md"
            : "border-b border-neutral-900/10 bg-white/95 shadow-sm backdrop-blur-md",
        )}
      >
        <Container className="flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
          <div className="flex items-center gap-1 lg:hidden">
            <IconButton
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                isOverlayActive &&
                  "text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.25} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.25} />
              )}
            </IconButton>
            <IconButton
              aria-label="Buscar"
              className={cn(
                isOverlayActive &&
                  "text-white hover:bg-white/10 hover:text-white",
              )}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </IconButton>
          </div>

          <Logo
            variant={isOverlayActive ? "light" : "default"}
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          />

          <nav
            className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-10"
            aria-label="Principal"
          >
            <NavLink
              href="/"
              active={pathname === "/"}
              className={cn(
                isOverlayActive &&
                  "text-white hover:text-brand-orange data-[active=true]:text-brand-orange",
              )}
            >
              INICIO
            </NavLink>
            <CategoryNavMenu
              categories={navCategories}
              overlay={isOverlayActive}
              variant="desktop"
            />
            <NavLink
              href="/tiendas"
              active={pathname === "/tiendas"}
              className={cn(
                isOverlayActive &&
                  "text-white hover:text-brand-orange data-[active=true]:text-brand-orange",
              )}
            >
              TIENDAS
            </NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton
              aria-label="Buscar"
              className={cn(
                "hidden lg:inline-flex",
                isOverlayActive &&
                  "text-white hover:bg-white/10 hover:text-white",
              )}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </IconButton>
            <Link
              href="/cuenta/favoritos"
              aria-label="Favoritos"
              className={cn(
                "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
                isOverlayActive
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-brand-orange",
              )}
            >
              <Bookmark className="h-5 w-5" strokeWidth={1.25} />
            </Link>
            <AccountNavMenu overlay={isOverlayActive} />
            <Link
              href="/carrito"
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isOverlayActive
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-brand-orange",
              )}
              aria-label="Carrito"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
              <CartCount
                bracketed={false}
                hideWhenZero
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                  isOverlayActive
                    ? "bg-brand-orange text-white"
                    : "bg-brand-green text-white",
                )}
              />
            </Link>
          </div>
        </Container>

      </header>

      <HeaderSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="animate-slide-down fixed inset-x-0 top-[var(--mobile-nav-top,4.5rem)] z-50 max-h-[calc(100dvh-4.5rem)] overflow-y-auto bg-white px-4 pb-8 pt-6 lg:hidden"
            aria-label="Menú móvil"
          >
            <ul className="flex flex-col gap-1">
              <li className="animate-fade-in-up border-b border-neutral-900/5">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "font-editorial block py-4 text-3xl tracking-tight transition-colors",
                    pathname === "/"
                      ? "text-brand-orange"
                      : "text-foreground hover:text-brand-orange",
                  )}
                >
                  INICIO
                </Link>
              </li>
            </ul>
            <CategoryNavMenu
              categories={navCategories}
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
            <ul className="mt-2 flex flex-col gap-1">
              <li className="border-b border-neutral-900/5">
                <Link
                  href="/tiendas"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "font-editorial block py-4 text-3xl tracking-tight",
                    pathname === "/tiendas"
                      ? "text-brand-orange"
                      : "text-foreground hover:text-brand-orange",
                  )}
                >
                  TIENDAS
                </Link>
              </li>
            </ul>

            <div className="mt-8 space-y-4 border-t border-neutral-900/5 pt-6">
              <MobileAccountLinks onNavigate={() => setMobileOpen(false)} />
              <Link
                href="/contacto"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-neutral-600 hover:text-brand-orange"
              >
                Contacto
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center gap-2 py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:text-brand-orange"
              >
                <Search className="h-4 w-4" strokeWidth={1.25} />
                Buscar en el catálogo
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
