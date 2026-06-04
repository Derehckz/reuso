"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  CreditCard,
  Settings,
} from "lucide-react";

const links = [
  { href: "/cuenta", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta/pagos", label: "Pagos", icon: CreditCard },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cuenta/configuracion", label: "Configuración", icon: Settings },
];

export function AccountShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="section-editorial py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-label-sm text-brand-green">Mi cuenta</p>
        <h1 className="font-editorial mt-1 text-3xl text-foreground md:text-4xl">
          Hola{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-sm px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
                    active
                      ? "bg-brand-green text-white"
                      : "text-neutral-600 hover:bg-neutral-100",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
