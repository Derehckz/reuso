"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/server/actions/newsletter.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextMuted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type NewsletterFormProps = {
  tone?: "light" | "dark";
};

export function NewsletterForm({ tone = "light" }: NewsletterFormProps) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const isDark = tone === "dark";

  return (
    <div>
      <h3
        className={cn(
          "font-editorial text-2xl leading-tight md:text-3xl",
          isDark ? "text-white" : "text-foreground",
        )}
      >
        Regístrate y obtén 10% dcto
      </h3>
      <TextMuted
        className={cn("mt-3 max-w-sm", isDark && "text-white/70")}
      >
        Lanzamientos exclusivos, piezas curadas y novedades de moda reutilizada
        premium.
      </TextMuted>
      <form action={action} className="mt-6 space-y-4">
        <Input
          type="email"
          name="email"
          required
          variant={isDark ? "underline-light" : "underline"}
          placeholder="Tu correo electrónico"
          className="placeholder:normal-case placeholder:tracking-normal"
        />
        <Button type="submit" size="md" isLoading={pending} fullWidth>
          Suscribirse
        </Button>
        {state?.message && (
          <p
            className={cn(
              "text-xs",
              state.success
                ? isDark
                  ? "text-brand-beige"
                  : "text-brand-green"
                : "text-red-400",
            )}
            role="status"
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
