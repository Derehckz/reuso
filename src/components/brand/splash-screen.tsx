"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SITE_LOGO } from "@/lib/constants/site-logo";
import { cn } from "@/lib/utils";

const SPLASH_KEY = "reuso-home-splash-seen";
const SPLASH_DURATION_MS = 4000;
const FADE_OUT_MS = 400;

/** Splash compacto solo en la primera visita al home por sesión. */
export function HomeSplash() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "hidden">("visible");

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setPhase("hidden");
      return;
    }

    const exitTimer = window.setTimeout(() => setPhase("exiting"), SPLASH_DURATION_MS);
    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setPhase("hidden");
    }, SPLASH_DURATION_MS + FADE_OUT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === "hidden") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center bg-brand-green transition-opacity duration-400 ease-out",
        phase === "exiting" && "pointer-events-none opacity-0",
      )}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className="flex flex-col items-center px-6">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-white/20 border-t-brand-beige splash-spinner"
            aria-hidden
          />
          <Image
            src={SITE_LOGO.isotipoBeige}
            alt=""
            width={SITE_LOGO.isotipoWidth}
            height={SITE_LOGO.isotipoHeight}
            priority
            unoptimized
            className="relative z-10 h-10 w-auto object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <p className="font-ui mt-4 max-w-[14rem] text-center text-[10px] uppercase leading-relaxed tracking-[0.2em] text-brand-beige">
          no es lo que usas, es cómo lo usas
        </p>
      </div>
    </div>
  );
}
