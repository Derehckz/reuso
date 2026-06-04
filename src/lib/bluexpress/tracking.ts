import type { ShipmentStatus } from "@/generated/prisma/client";
import { getTrackingEndpoint, isBluexpressConfigured } from "./config";
import { bluexpressFetch } from "./client";
import { BluexpressError } from "./errors";
import type { TrackingEvent, TrackingResult } from "./types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Preparando envío",
  LABEL_CREATED: "Etiqueta generada",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  FAILED: "Incidencia en entrega",
  RETURNED: "Devuelto al remitente",
};

type ApiTrackingResponse = {
  status?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  events?: Array<{
    date?: string;
    datetime?: string;
    status?: string;
    description?: string;
    message?: string;
    location?: string;
    office?: string;
  }>;
};

function mapApiStatusToShipmentStatus(apiStatus?: string): ShipmentStatus {
  const s = (apiStatus ?? "").toLowerCase();
  if (s.includes("entreg") || s === "delivered") return "DELIVERED";
  if (s.includes("transit") || s.includes("tráns") || s.includes("transito")) {
    return "IN_TRANSIT";
  }
  if (s.includes("label") || s.includes("etiqueta")) return "LABEL_CREATED";
  if (s.includes("fail") || s.includes("incid")) return "FAILED";
  if (s.includes("return") || s.includes("devol")) return "RETURNED";
  return "IN_TRANSIT";
}

function parseApiEvents(data: ApiTrackingResponse): TrackingEvent[] {
  if (!data.events?.length) return [];

  return data.events.map((e) => ({
    date: e.date ?? e.datetime ?? new Date().toISOString(),
    status: e.status ?? "update",
    description: e.description ?? e.message ?? "Actualización de envío",
    location: e.location ?? e.office,
  }));
}

function mockTracking(trackingNumber: string): TrackingResult {
  return {
    trackingNumber,
    carrier: "bluexpress",
    status: "IN_TRANSIT",
    statusLabel: STATUS_LABELS.IN_TRANSIT,
    events: [
      {
        date: new Date().toISOString(),
        status: "in_transit",
        description:
          "Tu pedido está en camino. El seguimiento en vivo estará disponible cuando Bluexpress confirme el despacho.",
      },
    ],
  };
}

/**
 * Consulta seguimiento por número de tracking Bluexpress.
 */
export async function trackShipment(
  trackingNumber: string,
): Promise<TrackingResult> {
  if (!trackingNumber.trim()) {
    throw new BluexpressError("Número de seguimiento requerido", "INVALID_INPUT");
  }

  if (!isBluexpressConfigured()) {
    return mockTracking(trackingNumber);
  }

  try {
    const data = await bluexpressFetch<ApiTrackingResponse>({
      method: "GET",
      path: `${getTrackingEndpoint()}/${encodeURIComponent(trackingNumber)}`,
    });

    const status = mapApiStatusToShipmentStatus(data.status);
    const events = parseApiEvents(data);

    return {
      trackingNumber: data.tracking_number ?? trackingNumber,
      carrier: "bluexpress",
      status,
      statusLabel: STATUS_LABELS[status] ?? data.status ?? "En proceso",
      events,
      estimatedDelivery: data.estimated_delivery,
      deliveredAt: data.delivered_at,
    };
  } catch (error) {
    if (error instanceof BluexpressError && error.code === "NOT_CONFIGURED") {
      return mockTracking(trackingNumber);
    }
    throw error;
  }
}

export { STATUS_LABELS as shipmentStatusLabels };
