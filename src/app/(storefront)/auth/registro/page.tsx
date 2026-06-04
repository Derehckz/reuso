"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, null);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Logo className="mb-8" size="lg" />
      <h1 className="mb-8 text-xs font-bold uppercase tracking-widest">
        Crear cuenta
      </h1>

      <form action={action} className="w-full space-y-4">
        <input
          name="name"
          required
          placeholder="NOMBRE"
          className="w-full rounded-full bg-brand-beige/50 px-6 py-3 text-xs uppercase tracking-wider placeholder:text-brand-black/40 focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="EMAIL"
          className="w-full rounded-full bg-brand-beige/50 px-6 py-3 text-xs uppercase tracking-wider placeholder:text-brand-black/40 focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="CONTRASEÑA"
          className="w-full rounded-full bg-brand-beige/50 px-6 py-3 text-xs uppercase tracking-wider placeholder:text-brand-black/40 focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="CONFIRMAR CONTRASEÑA"
          className="w-full rounded-full bg-brand-beige/50 px-6 py-3 text-xs uppercase tracking-wider placeholder:text-brand-black/40 focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />

        {state?.message && (
          <p
            className={`text-xs ${state.success ? "text-brand-green" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={pending}>
          REGISTRARSE
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-brand-black/60">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/iniciar-sesion"
          className="font-bold underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
