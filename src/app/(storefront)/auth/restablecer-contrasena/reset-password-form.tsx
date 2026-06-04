"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { resetPasswordWithToken } from "@/server/actions/password-reset.actions";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, action, pending] = useActionState(resetPasswordWithToken, null);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Logo className="mb-8" size="lg" />
      <h1 className="mb-2 text-xs font-bold uppercase tracking-widest">
        Restablecer contraseña
      </h1>
      <p className="mb-8 text-center text-xs text-neutral-500">
        Crea una nueva contraseña segura para tu cuenta.
      </p>

      <form action={action} className="w-full space-y-4">
        <input name="token" type="hidden" value={token} />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="NUEVA CONTRASEÑA"
          className="w-full border-b border-black/20 bg-transparent py-3 text-xs uppercase tracking-wider focus:border-brand-black focus:outline-none"
        />
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="CONFIRMAR CONTRASEÑA"
          className="w-full border-b border-black/20 bg-transparent py-3 text-xs uppercase tracking-wider focus:border-brand-black focus:outline-none"
        />

        {state?.message && (
          <p
            className={`text-xs ${state.success ? "text-brand-green" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={pending}>
          Guardar nueva contraseña
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-brand-black/60">
        <Link
          href="/auth/iniciar-sesion"
          className="font-bold text-brand-black underline-offset-4 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
