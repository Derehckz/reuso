export const CHILE_REGIONS = [
  { code: "RM", name: "Región Metropolitana de Santiago" },
  { code: "XV", name: "Arica y Parinacota" },
  { code: "I", name: "Tarapacá" },
  { code: "II", name: "Antofagasta" },
  { code: "III", name: "Atacama" },
  { code: "IV", name: "Coquimbo" },
  { code: "V", name: "Valparaíso" },
  { code: "VI", name: "O'Higgins" },
  { code: "VII", name: "Maule" },
  { code: "XVI", name: "Ñuble" },
  { code: "VIII", name: "Biobío" },
  { code: "IX", name: "La Araucanía" },
  { code: "XIV", name: "Los Ríos" },
  { code: "X", name: "Los Lagos" },
  { code: "XI", name: "Aysén" },
  { code: "XII", name: "Magallanes" },
] as const;

export function isMetropolitanRegion(region: string): boolean {
  const r = region.toLowerCase();
  return r === "rm" || r.includes("metropolitana");
}
