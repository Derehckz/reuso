import type { PackageDimensions } from "./types";

/** Peso estimado por prenda (kg) — ropa reutilizada, empaque ligero. */
const KG_PER_ITEM = 0.35;
const PACKAGING_KG = 0.15;
const MIN_WEIGHT_KG = 0.5;
const WEIGHT_STEP_KG = 0.5;

export function calculatePackageWeight(params: {
  itemCount: number;
  totalQuantity?: number;
}): number {
  const qty = params.totalQuantity ?? params.itemCount;
  const raw = qty * KG_PER_ITEM + PACKAGING_KG;
  return roundWeightUp(Math.max(MIN_WEIGHT_KG, raw));
}

export function roundWeightUp(weightKg: number): number {
  return Math.ceil(weightKg / WEIGHT_STEP_KG) * WEIGHT_STEP_KG;
}

/** Dimensiones estándar según peso (sobre / caja pequeña). */
export function estimatePackageDimensions(weightKg: number): PackageDimensions {
  if (weightKg <= 1) {
    return { lengthCm: 35, widthCm: 28, heightCm: 8 };
  }
  if (weightKg <= 3) {
    return { lengthCm: 40, widthCm: 32, heightCm: 15 };
  }
  return { lengthCm: 50, widthCm: 40, heightCm: 25 };
}
