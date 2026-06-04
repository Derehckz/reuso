import type { ShippingQuote, ShippingZoneType } from "./types";
import { roundWeightUp } from "./weight";

type ZoneRate = {
  basePrice: number;
  extraPerHalfKg: number;
  includedKg: number;
  estimatedDays: number;
  serviceCode: string;
};

const ZONE_RATES: Record<ShippingZoneType, ZoneRate> = {
  metro: {
    basePrice: 3690,
    extraPerHalfKg: 400,
    includedKg: 0.5,
    estimatedDays: 2,
    serviceCode: "BX-EX-STD-RM",
  },
  central: {
    basePrice: 4990,
    extraPerHalfKg: 550,
    includedKg: 0.5,
    estimatedDays: 3,
    serviceCode: "BX-EX-STD-CTR",
  },
  north: {
    basePrice: 6390,
    extraPerHalfKg: 650,
    includedKg: 0.5,
    estimatedDays: 5,
    serviceCode: "BX-EX-STD-NOR",
  },
  south: {
    basePrice: 6390,
    extraPerHalfKg: 650,
    includedKg: 0.5,
    estimatedDays: 5,
    serviceCode: "BX-EX-STD-SUR",
  },
  extreme: {
    basePrice: 8990,
    extraPerHalfKg: 850,
    includedKg: 0.5,
    estimatedDays: 7,
    serviceCode: "BX-EX-STD-EXT",
  },
};

export function calculateZonePrice(
  zone: ShippingZoneType,
  weightKg: number,
): number {
  const rate = ZONE_RATES[zone];
  const billableKg = roundWeightUp(weightKg);
  const extraKg = Math.max(0, billableKg - rate.includedKg);
  const halfKgSteps = Math.ceil(extraKg / 0.5);
  return rate.basePrice + halfKgSteps * rate.extraPerHalfKg;
}

export function buildFallbackQuote(params: {
  region: string;
  commune: string;
  zone: ShippingZoneType;
  weightKg: number;
  dbBasePrice?: number | null;
}): ShippingQuote {
  const rate = ZONE_RATES[params.zone];
  const billableKg = roundWeightUp(params.weightKg);
  const computed = calculateZonePrice(params.zone, billableKg);
  const extraCharge = computed - rate.basePrice;
  const price =
    params.dbBasePrice != null && params.dbBasePrice > 0
      ? params.dbBasePrice + extraCharge
      : computed;

  return {
    price,
    estimatedDays: rate.estimatedDays,
    serviceCode: rate.serviceCode,
    zone: params.zone,
    weightKg: billableKg,
    commune: params.commune,
    region: params.region,
    source: params.dbBasePrice != null ? "database" : "fallback",
    currency: "CLP",
  };
}

export function getZoneRateInfo(zone: ShippingZoneType): ZoneRate {
  return ZONE_RATES[zone];
}
