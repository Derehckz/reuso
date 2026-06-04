import {
  getBluexpressAccountId,
  getLabelEndpoint,
  isBluexpressConfigured,
} from "./config";
import { bluexpressFetch } from "./client";
import { BluexpressError } from "./errors";
import { getRegionCode } from "./communes";
import type { CreateLabelRequest, CreateLabelResult, LabelAddress } from "./types";

function mapAddressToApi(address: LabelAddress) {
  return {
    contact: {
      fullname: address.fullName,
      phone: address.phone,
      email: address.email,
    },
    location: {
      state_id: address.regionCode ?? getRegionCode(address.region),
      district_name: address.commune,
      district_id: address.communeCode,
      address: [address.street, address.number].filter(Boolean).join(" "),
      apartment: address.apartment,
    },
  };
}

/**
 * Construye el payload estándar Blue Express para generación de etiqueta.
 * Listo para enviar cuando la API esté habilitada con credenciales de agencia.
 */
export function buildLabelPayload(request: CreateLabelRequest) {
  const accountId = getBluexpressAccountId();

  return {
    printFormatCode: 3,
    orderNumber: request.orderNumber,
    references: request.references ?? [request.orderNumber],
    serviceType: request.serviceCode.split("-")[2] ?? "EX",
    productType: "P",
    productCategory: "PAQU",
    currency: "CLP",
    companyId: accountId ? Number(accountId) || accountId : undefined,
    pickup: mapAddressToApi(request.pickup),
    dropoff: mapAddressToApi(request.dropoff),
    packages: request.packages.map((pkg) => ({
      weightUnit: "KG",
      lengthUnit: "CM",
      weight: pkg.weightKg,
      length: pkg.lengthCm,
      width: pkg.widthCm,
      height: pkg.heightCm,
      quantity: pkg.quantity,
    })),
  };
}

type ApiLabelResponse = {
  tracking_number?: string;
  trackingNumber?: string;
  shipment_id?: string;
  id?: string;
  label_url?: string;
  labelUrl?: string;
  label_pdf?: string;
  labelPdf?: string;
};

/**
 * Genera etiqueta de envío en Bluexpress.
 * Requiere credenciales de agencia (`BLUEXPRESS_API_KEY` + `BLUEXPRESS_ACCOUNT_ID`).
 */
export async function createShippingLabel(
  request: CreateLabelRequest,
): Promise<CreateLabelResult> {
  if (!isBluexpressConfigured()) {
    return {
      success: false,
      errorCode: "NOT_CONFIGURED",
      message:
        "Configura BLUEXPRESS_API_KEY y BLUEXPRESS_API_URL para generar etiquetas.",
      rawResponse: { labelRequest: buildLabelPayload(request) },
    };
  }

  const payload = buildLabelPayload(request);

  try {
    const data = await bluexpressFetch<ApiLabelResponse>({
      method: "POST",
      path: getLabelEndpoint(),
      body: payload,
    });

    const trackingNumber = data.tracking_number ?? data.trackingNumber;
    const labelUrl = data.label_url ?? data.labelUrl;

    if (!trackingNumber) {
      return {
        success: false,
        errorCode: "NO_TRACKING",
        message: "La API no devolvió número de seguimiento",
        rawResponse: data,
      };
    }

    return {
      success: true,
      trackingNumber,
      externalId: data.shipment_id ?? data.id,
      labelUrl,
      labelPdfBase64: data.label_pdf ?? data.labelPdf,
      rawResponse: data,
    };
  } catch (error) {
    const message =
      error instanceof BluexpressError
        ? error.message
        : "No se pudo generar la etiqueta";

    return {
      success: false,
      errorCode: "LABEL_FAILED",
      message,
      rawResponse: { labelRequest: payload, error: message },
    };
  }
}
