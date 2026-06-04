"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_SIGN_IN_PATH } from "@/lib/constants/auth-routes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma/client";
import {
  roleHasPermission,
  type Permission,
} from "@/shared/auth/permissions";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingCart,
  Users,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Ticket,
  Image,
  Settings,
  SwatchBook,
  Plug,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Operación",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard:view",
      },
      {
        label: "Órdenes",
        href: "/admin/ordenes",
        icon: ShoppingCart,
        permission: "orders:read",
      },
      {
        label: "Clientes",
        href: "/admin/usuarios",
        icon: Users,
        permission: "customers:read",
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        label: "Productos",
        href: "/admin/productos",
        icon: Package,
        permission: "products:read",
      },
      {
        label: "Categorías",
        href: "/admin/categorias",
        icon: FolderTree,
        permission: "categories:write",
      },
      {
        label: "Atributos",
        href: "/admin/atributos",
        icon: SwatchBook,
        permission: "attributes:read",
      },
      {
        label: "Inventario",
        href: "/admin/inventario",
        icon: Warehouse,
        permission: "inventory:write",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        label: "Cupones",
        href: "/admin/cupones",
        icon: Ticket,
        permission: "coupons:read",
      },
      {
        label: "Contenido",
        href: "/admin/contenido",
        icon: Image,
        permission: "content:write",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Integraciones",
        href: "/admin/integraciones",
        icon: Plug,
        permission: "settings:read",
      },
      {
        label: "Configuración",
        href: "/admin/configuracion",
        icon: Settings,
        permission: "settings:read",
      },
    ],
  },
];

export function AdminShell({
  children,
  userEmail,
  userRole,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: UserRole;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = userRole ?? "STAFF";

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        roleHasPermission(role, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-green text-white transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <Link href="/admin" className="font-ui text-sm font-bold uppercase tracking-[0.2em]">
            reuso
            <span className="mt-0.5 block text-[10px] font-normal tracking-widest opacity-60">
              commerce
            </span>
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <p className="truncate px-5 py-2 text-[10px] text-white/50">
          {userEmail}
          {userRole ? ` · ${userRole}` : ""}
        </p>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-sm px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: ADMIN_SIGN_IN_PATH })}
            className="flex w-full items-center gap-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <span className="font-ui text-xs font-bold uppercase tracking-widest">
            Panel admin
          </span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
