"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/server/actions/password-reset.actions";

export default function RecoverPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Logo className="mb-8" size="lg" />
      <h1 className="mb-2 text-xs font-bold uppercase tracking-widest">
        Recuperar contraseña
      </h1>
      <p className="mb-8 text-center text-xs text-neutral-500">
        Ingresa tu email y te enviaremos un enlace para restablecer acceso.
      </p>

      <form action={action} className="w-full space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="EMAIL"
          className="w-full border-b border-black/20 bg-transparent py-3 text-xs uppercase tracking-wider focus:border-brand-black focus:outline-none"
        />

        {state?.message && (
          <p className={`text-xs ${state.success ? "text-brand-green" : "text-red-600"}`}>
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={pending}>
          Enviar enlace
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-brand-black/60">
        ¿Recordaste tu contraseña?{" "}
        <Link
          href="/auth/iniciar-sesion"
          className="font-bold text-brand-black underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
