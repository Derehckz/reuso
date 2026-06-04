"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ProSearch } from "@/components/search/pro-search";
import { Container } from "@/components/ui/container";

type HeaderSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function HeaderSearchOverlay({ open, onClose }: HeaderSearchOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en la tienda"
    >
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        className="absolute inset-0 bg-neutral-950/55 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-[1] animate-slide-down border-b border-neutral-200/90 bg-white shadow-[0_24px_80px_rgba(10,10,10,0.12)]">
        <Container className="py-8 md:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-label-sm text-neutral-400">Catálogo</p>
              <h2 className="font-editorial mt-0.5 text-2xl text-foreground md:text-3xl">
                ¿Qué buscas hoy?
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>

          <ProSearch
            variant="overlay"
            onNavigate={onClose}
            autoFocus
          />

          <p className="mt-6 hidden text-center text-xs text-neutral-400 md:block">
            Pulsa{" "}
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>{" "}
            para cerrar
          </p>
        </Container>
      </div>
    </div>
  );
}
