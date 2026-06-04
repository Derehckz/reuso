"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

export const ACCOUNT_NAV_LINKS = [
  { href: "/cuenta", label: "Mi cuenta", icon: User },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta/pagos", label: "Pagos", icon: CreditCard },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cuenta/configuracion", label: "Configuración", icon: Settings },
] as const;

type AccountNavMenuProps = {
  overlay?: boolean;
  onNavigate?: () => void;
};

function initials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

/** Enlaces de cuenta para menú móvil expandido. */
export function MobileAccountLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 animate-pulse rounded-full bg-neutral-200" />;
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <ul className="space-y-1">
        <li>
          <Link
            href="/auth/iniciar-sesion"
            onClick={onNavigate}
            className="font-editorial block py-3 text-2xl text-foreground hover:text-brand-orange"
          >
            Iniciar sesión
          </Link>
        </li>
        <li>
          <Link
            href="/auth/registro"
            onClick={onNavigate}
            className="block py-2 text-sm text-neutral-600 hover:text-brand-orange"
          >
            Crear cuenta
          </Link>
        </li>
      </ul>
    );
  }

  const user = session.user;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-brand-green">
              {initials(user.name, user.email)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {user.name ?? "Mi cuenta"}
          </p>
          {user.email && (
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          )}
        </div>
      </div>
      <ul className="space-y-0.5">
        {ACCOUNT_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className="flex items-center gap-2.5 py-2.5 text-sm text-neutral-700 hover:text-brand-orange"
              >
                <Icon className="h-4 w-4" strokeWidth={1.25} />
                {link.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              void signOut({ callbackUrl: "/" });
            }}
            className="flex w-full items-center gap-2.5 py-2.5 text-left text-sm text-neutral-700 hover:text-brand-orange"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.25} />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
}

export function AccountNavMenu({ overlay = false, onNavigate }: AccountNavMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isAuthenticated = status === "authenticated" && !!user;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [status]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  const triggerClass = cn(
    "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors",
    overlay
      ? "border-white/25 text-white hover:border-white/50 hover:bg-white/10"
      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-brand-orange hover:text-brand-orange",
  );

  if (status === "loading") {
    return (
      <div
        className={cn(
          "h-10 w-10 animate-pulse rounded-full",
          overlay ? "bg-white/20" : "bg-neutral-200",
        )}
        aria-hidden
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/iniciar-sesion"
        onClick={onNavigate}
        className={triggerClass}
        aria-label="Iniciar sesión"
        title="Iniciar sesión"
      >
        <User className="h-5 w-5" strokeWidth={1.25} />
      </Link>
    );
  }

  const label = user.name ?? user.email ?? "Mi cuenta";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Cuenta de ${label}`}
        title={label}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "text-xs font-semibold",
              overlay ? "text-white" : "text-brand-green",
            )}
          >
            {initials(user.name, user.email)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[13.5rem] border border-neutral-200 bg-white py-2 shadow-lg"
        >
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name ?? "Mi cuenta"}
            </p>
            {user.email && (
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            )}
          </div>

          <ul className="py-1">
            {ACCOUNT_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    role="menuitem"
                    onClick={close}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand-orange"
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-neutral-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                void signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand-orange"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.25} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
