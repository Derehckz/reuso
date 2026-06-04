"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { loginSchema } from "@/lib/validations/auth";
import {
  ADMIN_SIGN_IN_PATH,
  CUSTOMER_SIGN_IN_PATH,
} from "@/lib/constants/auth-routes";

function safeCustomerCallback(raw: string | null): string {
  if (!raw?.startsWith("/")) return "/cuenta";
  if (raw.startsWith("/admin") || raw.startsWith("/admin-print")) {
    return "/cuenta";
  }
  if (raw.startsWith(CUSTOMER_SIGN_IN_PATH) || raw.startsWith("/auth/registro")) {
    return "/cuenta";
  }
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCustomerCallback(searchParams.get("callbackUrl"));

  const [error, setError] = useState<string | null>(null);
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
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? "Datos inválidos");
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email.toLowerCase().trim(),
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error || result.ok === false) {
        setError(
          "No pudimos iniciar sesión. Verifica tu email y contraseña.",
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error temporal al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Logo className="mb-8" size="lg" />
      <h1 className="mb-8 text-xs font-bold uppercase tracking-widest">
        Iniciar sesión
      </h1>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="EMAIL"
          className="w-full border-b border-black/20 bg-transparent py-3 text-xs uppercase tracking-wider focus:border-brand-black focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="CONTRASEÑA"
          className="w-full border-b border-black/20 bg-transparent py-3 text-xs uppercase tracking-wider focus:border-brand-black focus:outline-none"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button type="submit" className="w-full" isLoading={loading}>
          INICIAR SESIÓN
        </Button>
        <p className="text-right text-xs text-neutral-500">
          <Link
            href="/auth/recuperar-contrasena"
            className="underline-offset-4 hover:text-brand-orange hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>

      <div className="my-6 w-full border-t border-black/10" />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        CONTINUAR CON GOOGLE
      </Button>

      <p className="mt-6 text-center text-xs text-brand-black/60">
        Si tenías cuenta en la web anterior, regístrate nuevamente con tu mismo
        email para activar acceso en este sitio.
      </p>

      <p className="mt-6 text-center text-xs text-brand-black/60">
        ¿No tienes cuenta?{" "}
        <Link
          href="/auth/registro"
          className="font-bold text-brand-black underline-offset-4 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
