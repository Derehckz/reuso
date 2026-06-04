"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { loginSchema } from "@/lib/validations/auth";
import {
  CUSTOMER_SIGN_IN_PATH,
  isStaffRole,
} from "@/lib/constants/auth-routes";

function safeAdminCallback(raw: string | null): string {
  if (!raw?.startsWith("/")) return "/admin";
  if (
    raw.startsWith("/admin/login") ||
    raw.startsWith("/auth/") ||
    raw === "/"
  ) {
    return "/admin";
  }
  if (raw.startsWith("/admin") || raw.startsWith("/admin-print")) {
    return raw;
  }
  return "/admin";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeAdminCallback(searchParams.get("callbackUrl"));
  const errorParam = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    errorParam === "staff_only"
      ? "Esta cuenta es de cliente. Usa el acceso de la tienda o un usuario con permisos de staff."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      setLoading(false);
      setError(
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Datos inválidos",
      );
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email.toLowerCase().trim(),
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error || result.ok === false) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as {
        user?: { role?: string };
      } | null;

      if (!isStaffRole(session?.user?.role)) {
        await signOut({ redirect: false });
        setError(
          "No tienes acceso al panel. Si eres cliente, inicia sesión en la tienda.",
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error temporal. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Logo className="mb-10 brightness-0 invert" size="lg" />
        <p className="text-label-sm mb-2 tracking-[0.25em] text-white/50">
          Acceso interno
        </p>
        <h1 className="font-editorial mb-10 text-3xl text-white md:text-4xl">
          Panel de administración
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-5 rounded-sm border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div>
            <label className="text-label-sm text-white/60">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1.5 w-full border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-orange focus:outline-none"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-label-sm text-white/60">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-orange focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm leading-relaxed text-red-300" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={loading}>
            Entrar al panel
          </Button>
        </form>

        <p className="mt-10 max-w-sm text-center text-xs leading-relaxed text-white/50">
          ¿Eres cliente de la tienda?{" "}
          <Link
            href={CUSTOMER_SIGN_IN_PATH}
            className="text-white underline-offset-4 hover:text-brand-orange hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
        <Link
          href="/"
          className="mt-6 text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
