import { isMetropolitanRegion } from "@/lib/constants/chile-regions";
import type { ShippingZoneType } from "./types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Comunas RM con tarifa metropolitana explícita. */
const RM_COMMUNES = new Set([
  "santiago",
  "providencia",
  "las condes",
  "nunoa",
  "maipu",
  "puente alto",
  "la florida",
  "san miguel",
  "la reina",
  "vitacura",
  "lo barnechea",
  "penalolen",
  "macul",
  "san joaquin",
  "la cisterna",
  "el bosque",
  "la granja",
  "pedro aguirre cerda",
  "lo espejo",
  "san ramon",
  "la pintana",
  "cerrillos",
  "estacion central",
  "quinta normal",
  "recoleta",
  "independencia",
  "conchali",
  "renca",
  "quilicura",
  "huechuraba",
  "colina",
  "lampa",
  "til til",
  "pudahuel",
  "cerro navia",
  "lo prado",
  "san bernardo",
  "calera de tango",
  "buin",
  "paine",
  "talagante",
  "el monte",
  "isla de maipo",
  "padre hurtado",
  "penaflor",
  "melipilla",
  "alhue",
  "curacavi",
  "maria pinto",
  "san pedro",
]);

/** Comunas con recargo zona extrema (ejemplos). */
const EXTREME_COMMUNES = new Set([
  "coyhaique",
  "aysen",
  "chiloe",
  "ancud",
  "castro",
  "punta arenas",
  "puerto natales",
  "porvenir",
  "puerto williams",
]);

const CENTRAL_REGIONS = new Set([
  "valparaiso",
  "ohiggins",
  "maule",
  "nuble",
  "coquimbo",
]);

const NORTH_REGIONS = new Set([
  "arica",
  "tarapaca",
  "antofagasta",
  "atacama",
]);

const SOUTH_REGIONS = new Set([
  "biobio",
  "araucania",
  "los rios",
  "los lagos",
]);

function regionNameToZone(region: string): ShippingZoneType {
  const r = normalize(region);

  if (isMetropolitanRegion(region) || r.includes("metropolitana")) {
    return "metro";
  }

  if (
    NORTH_REGIONS.has(r) ||
    [...NORTH_REGIONS].some((z) => r.includes(z))
  ) {
    return "north";
  }

  if (
    SOUTH_REGIONS.has(r) ||
    [...SOUTH_REGIONS].some((z) => r.includes(z))
  ) {
    return "south";
  }

  if (
    CENTRAL_REGIONS.has(r) ||
    [...CENTRAL_REGIONS].some((z) => r.includes(z))
  ) {
    return "central";
  }

  if (
    r.includes("aysen") ||
    r.includes("magallanes") ||
    r.includes("antartica")
  ) {
    return "extreme";
  }

  return "central";
}

/**
 * Resuelve zona tarifaria según región y comuna de destino.
 */
export function resolveShippingZone(
  region: string,
  commune: string,
): ShippingZoneType {
  const communeNorm = normalize(commune);

  if (EXTREME_COMMUNES.has(communeNorm)) return "extreme";

  if (isMetropolitanRegion(region)) {
    if (RM_COMMUNES.has(communeNorm) || communeNorm.length > 0) {
      return "metro";
    }
    return "metro";
  }

  return regionNameToZone(region);
}

export function getRegionCode(region: string): string {
  const r = normalize(region);
  if (isMetropolitanRegion(region) || r.includes("metropolitana")) return "RM";
  if (r.includes("valparaiso")) return "V";
  if (r.includes("biobio")) return "VIII";
  if (r.includes("araucania")) return "IX";
  if (r.includes("los lagos")) return "X";
  if (r.includes("aysen")) return "XI";
  if (r.includes("magallanes")) return "XII";
  if (r.includes("tarapaca")) return "I";
  if (r.includes("antofagasta")) return "II";
  if (r.includes("atacama")) return "III";
  if (r.includes("coquimbo")) return "IV";
  if (r.includes("ohiggins") || r.includes("higgins")) return "VI";
  if (r.includes("maule")) return "VII";
  if (r.includes("nuble")) return "XVI";
  if (r.includes("los rios")) return "XIV";
  if (r.includes("arica")) return "XV";
  return "RM";
}
