import type { SecretFieldView, SecretSource } from "./types";

/** Variables de entorno tienen prioridad sobre valores guardados en BD. */
export function pickSecret(
  stored: string | null | undefined,
  envValue: string | undefined,
): string | null {
  const fromEnv = envValue?.trim();
  if (fromEnv) return fromEnv;
  const fromDb = stored?.trim();
  return fromDb || null;
}

export function secretSource(
  stored: string | null | undefined,
  envValue: string | undefined,
): SecretSource {
  if (envValue?.trim()) return "env";
  if (stored?.trim()) return "database";
  return "none";
}

export function maskSecret(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return "";
  if (v.length <= 8) return "••••••••";
  return `${v.slice(0, 6)}••••${v.slice(-4)}`;
}

export function secretFieldView(
  resolved: string | null,
  stored: string | null | undefined,
  envValue: string | undefined,
): SecretFieldView {
  return {
    configured: Boolean(resolved),
    source: secretSource(stored, envValue),
    masked: maskSecret(resolved),
  };
}
