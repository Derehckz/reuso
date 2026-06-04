import type { SecretFieldView } from "@/modules/integrations/core/types";

const sourceLabels = {
  env: "definido en .env",
  database: "guardado en admin",
  none: "no configurado",
};

export function SecretFieldHint({ field, label }: { field: SecretFieldView; label: string }) {
  return (
    <p className="mt-1 text-xs text-neutral-500">
      {label}:{" "}
      {field.configured ? (
        <>
          <span className="font-mono text-neutral-700">{field.masked}</span>
          {" · "}
          {sourceLabels[field.source]}
        </>
      ) : (
        "no configurado — deja vacío al guardar para mantener el valor actual"
      )}
    </p>
  );
}
