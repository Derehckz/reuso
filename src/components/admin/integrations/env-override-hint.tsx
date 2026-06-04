export function EnvOverrideHint({ fields }: { fields: string[] }) {
  if (fields.length === 0) return null;

  return (
    <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      Algunos valores vienen de variables de entorno ({fields.join(", ")}) y
      tienen prioridad sobre lo guardado aquí.
    </p>
  );
}
