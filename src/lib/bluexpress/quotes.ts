import { prisma } from "@/lib/prisma";
import { getOriginAddress, getQuoteEndpoint, isBluexpressConfigured } from "./config";
import { bluexpressFetch } from "./client";
import { resolveShippingZone, getRegionCode } from "./communes";
import { buildFallbackQuote } from "./rates";
import { estimatePackageDimensions } from "./weight";
import type { ShippingQuote, ShippingQuoteRequest } from "./types";
import { toBluexpressError } from "./errors";

type ApiQuoteResponse = {
  price?: number;
  total?: number;
  amount?: number;
  estimated_days?: number;
  estimatedDays?: number;
  service_code?: string;
  serviceCode?: string;
  delivery_days?: number;
};

async function getDatabaseZoneBasePrice(
  region: string,
): Promise<number | null> {
  const code = getRegionCode(region);
  const zone = await prisma.shippingZone.findFirst({
    where: { regionCode: code, isActive: true },
    select: { basePrice: true },
  });
  return zone?.basePrice ?? null;
}

async function fetchApiQuote(
  request: ShippingQuoteRequest,
  zone: ReturnType<typeof resolveShippingZone>,
): Promise<ShippingQuote | null> {
  if (!isBluexpressConfigured()) return null;

  const origin = getOriginAddress();
  const dimensions =
    request.dimensions ?? estimatePackageDimensions(request.weightKg);

  try {
    const data = await bluexpressFetch<ApiQuoteResponse>({
      method: "POST",
      path: getQuoteEndpoint(),
      body: {
        origin: {
          region: origin.region,
          region_code: origin.regionCode,
          commune: origin.commune,
        },
        destination: {
          region: request.destination.region,
          region_code: getRegionCode(request.destination.region),
          commune: request.destination.commune,
        },
        package: {
          weight_kg: request.weightKg,
          weight_unit: "KG",
          length_cm: dimensions.lengthCm,
          width_cm: dimensions.widthCm,
          height_cm: dimensions.heightCm,
          item_count: request.itemCount,
        },
        service_type: "EX",
        product_type: "P",
      },
    });

    const price = data.price ?? data.total ?? data.amount;
    if (price == null || price <= 0) return null;

    return {
      price: Math.round(price),
      estimatedDays:
        data.estimated_days ??
        data.estimatedDays ??
        data.delivery_days ??
        3,
      serviceCode:
        data.service_code ?? data.serviceCode ?? `BX-API-${zone.toUpperCase()}`,
      zone,
      weightKg: request.weightKg,
      commune: request.destination.commune,
      region: request.destination.region,
      source: "api",
      currency: "CLP",
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Bluexpress] API quote fallback:", toBluexpressError(error).message);
    }
    return null;
  }
}

/**
 * Cotiza envío Bluexpress: API → zonas DB → tarifas por comuna/peso.
 */
export async function quoteShipping(
  request: ShippingQuoteRequest,
): Promise<ShippingQuote> {
  const zone = resolveShippingZone(
    request.destination.region,
    request.destination.commune,
  );

  const dbBase = await getDatabaseZoneBasePrice(request.destination.region);

  const apiQuote = await fetchApiQuote(request, zone);
  if (apiQuote) return apiQuote;

  return buildFallbackQuote({
    region: request.destination.region,
    commune: request.destination.commune,
    zone,
    weightKg: request.weightKg,
    dbBasePrice: dbBase,
  });
}
