import type { ShipmentStatus } from "@/generated/prisma/client";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import { prisma } from "@/lib/prisma";
import { loadBlueExpressConfig } from "@/modules/integrations/blueexpress";
import { orderRepository } from "@/server/repositories/order.repository";
import {
  buildLabelPayload,
  calculatePackageWeight,
  createShippingLabel,
  estimatePackageDimensions,
  getBluexpressPickupContact,
  getOriginAddress,
  quoteShipping,
  trackShipment,
  type CreateLabelRequest,
  type ShippingQuote,
} from "@/lib/bluexpress";

type ShippingAddressJson = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  apartment?: string;
  commune?: string;
  region?: string;
  postalCode?: string;
};

export async function quoteForCheckout(params: {
  region: string;
  commune: string;
  itemCount: number;
  totalQuantity?: number;
}): Promise<ShippingQuote> {
  await loadBlueExpressConfig();

  const weightKg = calculatePackageWeight({
    itemCount: params.itemCount,
    totalQuantity: params.totalQuantity ?? params.itemCount,
  });

  const origin = getOriginAddress();

  return quoteShipping({
    originRegion: origin.region,
    originCommune: origin.commune,
    destination: {
      region: params.region,
      commune: params.commune,
    },
    weightKg,
    dimensions: estimatePackageDimensions(weightKg),
    itemCount: params.itemCount,
  });
}

export async function createShipmentForOrder(
  orderId: string,
  quote: ShippingQuote,
) {
  return prisma.shipment.upsert({
    where: { orderId },
    create: {
      orderId,
      carrier: "bluexpress",
      status: "PENDING",
      estimatedDays: quote.estimatedDays,
      shippingMethod: quote.serviceCode,
      rawResponse: {
        quote,
        labelStatus: "pending",
      },
    },
    update: {
      estimatedDays: quote.estimatedDays,
      shippingMethod: quote.serviceCode,
      rawResponse: {
        quote,
        labelStatus: "pending",
      },
    },
  });
}

/** Tras pago aprobado: envío listo para generar etiqueta en admin o automático. */
export async function markShipmentReadyForLabel(orderId: string) {
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) return null;

  const raw =
    shipment.rawResponse && typeof shipment.rawResponse === "object"
      ? (shipment.rawResponse as Record<string, unknown>)
      : {};

  return prisma.shipment.update({
    where: { orderId },
    data: {
      rawResponse: {
        ...raw,
        labelStatus: "ready",
        readyAt: new Date().toISOString(),
      },
    },
  });
}

export async function trackOrderShipment(params: {
  code: string;
  email?: string;
  accessToken?: string;
  userId?: string;
}) {
  const code = params.code.trim();
  const normalized = code.toUpperCase();

  const order = await orderRepository.findByOrderNumberWithShipment(code);

  if (!order) {
    return { success: false as const, message: "Pedido no encontrado" };
  }

  const isTrackingNumberLookup =
    order.shipment?.trackingNumber &&
    order.shipment.trackingNumber === code;

  const isOrderNumberLookup =
    order.orderNumber === normalized || order.orderNumber === code;

  if (isOrderNumberLookup && !isTrackingNumberLookup) {
    const ownerMatch = params.userId && order.userId === params.userId;
    const tokenMatch =
      params.accessToken &&
      verifyOrderAccessToken(params.accessToken, order.orderNumber).valid;
    const emailMatch =
      params.email && orderRepository.matchesGuestEmail(order, params.email);

    if (!ownerMatch && !tokenMatch && !emailMatch) {
      return {
        success: false as const,
        message:
          "Para rastrear por número de pedido, ingresa el email usado en la compra.",
      };
    }
  }

  if (!order.shipment?.trackingNumber) {
    const awaitingPayment = order.status === "AWAITING_PAYMENT";
    return {
      success: true as const,
      orderNumber: order.orderNumber,
      status: order.shipment?.status ?? "PENDING",
      statusLabel: awaitingPayment ? "Pendiente de pago" : "Preparando tu envío",
      trackingNumber: null,
      events: [],
      estimatedDays: order.shipment?.estimatedDays ?? undefined,
      message: awaitingPayment
        ? "El envío se activará cuando se confirme el pago."
        : "Tu pedido está siendo preparado. Te enviaremos el número de seguimiento pronto.",
    };
  }

  await loadBlueExpressConfig();
  const tracking = await trackShipment(order.shipment.trackingNumber);

  const mappedStatus = tracking.status as ShipmentStatus;
  if (mappedStatus !== order.shipment.status) {
    await prisma.shipment.update({
      where: { id: order.shipment.id },
      data: {
        status: mappedStatus,
        deliveredAt:
          mappedStatus === "DELIVERED" ? new Date() : order.shipment.deliveredAt,
        shippedAt:
          mappedStatus === "IN_TRANSIT" && !order.shipment.shippedAt
            ? new Date()
            : order.shipment.shippedAt,
        rawResponse: {
          ...(typeof order.shipment.rawResponse === "object"
            ? order.shipment.rawResponse
            : {}),
          lastTracking: tracking,
        },
      },
    });
  }

  return {
    success: true as const,
    orderNumber: order.orderNumber,
    trackingNumber: tracking.trackingNumber,
    status: tracking.status,
    statusLabel: tracking.statusLabel,
    events: tracking.events,
    estimatedDays: order.shipment.estimatedDays,
    estimatedDelivery: tracking.estimatedDelivery,
  };
}

/**
 * Genera etiqueta Bluexpress para una orden pagada.
 * Pensado para panel admin o job en background.
 */
export async function generateLabelForOrder(orderId: string) {
  await loadBlueExpressConfig();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shipment: true, items: true },
  });

  if (!order) {
    return { success: false as const, message: "Orden no encontrada" };
  }

  if (!["PAID", "PROCESSING"].includes(order.status)) {
    return {
      success: false as const,
      message: "La orden debe estar pagada para generar etiqueta",
    };
  }

  const addr = order.shippingAddress as ShippingAddressJson;
  const quoteRaw = order.shipment?.rawResponse as { quote?: ShippingQuote } | null;
  const quote = quoteRaw?.quote;

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const weightKg = quote?.weightKg ?? calculatePackageWeight({ itemCount: totalQty });
  const dims = estimatePackageDimensions(weightKg);
  const origin = getOriginAddress();
  const pickupContact = getBluexpressPickupContact();

  const labelRequest: CreateLabelRequest = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    serviceCode: quote?.serviceCode ?? order.shipment?.shippingMethod ?? "BX-EX-STD-RM",
    pickup: {
      fullName: pickupContact.fullName,
      phone: pickupContact.phone,
      street: pickupContact.street,
      commune: origin.commune,
      region: origin.region,
      regionCode: origin.regionCode,
    },
    dropoff: {
      fullName: `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim() || "Cliente",
      phone: addr.phone ?? "",
      email: addr.email,
      street: addr.street ?? "",
      number: addr.number,
      apartment: addr.apartment,
      commune: addr.commune ?? "",
      region: addr.region ?? "",
    },
    packages: [
      {
        weightKg,
        lengthCm: dims.lengthCm,
        widthCm: dims.widthCm,
        heightCm: dims.heightCm,
        quantity: 1,
      },
    ],
    references: [order.orderNumber],
  };

  const payload = buildLabelPayload(labelRequest);
  const result = await createShippingLabel(labelRequest);

  if (!result.success) {
    await prisma.shipment.upsert({
      where: { orderId },
      create: {
        orderId,
        carrier: "bluexpress",
        status: "PENDING",
        rawResponse: { labelRequest: payload, labelError: result.message },
      },
      update: {
        rawResponse: {
          labelRequest: payload,
          labelError: result.message,
          labelStatus: "failed",
        },
      },
    });

    return {
      success: false as const,
      message: result.message ?? "No se pudo generar la etiqueta",
      errorCode: result.errorCode,
    };
  }

  await prisma.shipment.upsert({
    where: { orderId },
    create: {
      orderId,
      carrier: "bluexpress",
      trackingNumber: result.trackingNumber,
      externalId: result.externalId,
      labelUrl: result.labelUrl,
      status: "LABEL_CREATED",
      shippingMethod: labelRequest.serviceCode,
      rawResponse: {
        labelRequest: payload,
        labelResponse: result.rawResponse as object,
      },
      shippedAt: new Date(),
    },
    update: {
      trackingNumber: result.trackingNumber,
      externalId: result.externalId,
      labelUrl: result.labelUrl,
      status: "LABEL_CREATED",
      rawResponse: {
        labelRequest: payload,
        labelResponse: result.rawResponse as object,
        labelStatus: "created",
      },
      shippedAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PROCESSING" },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: "PROCESSING",
      note: `Etiqueta Bluexpress ${result.trackingNumber}`,
    },
  });

  return {
    success: true as const,
    trackingNumber: result.trackingNumber,
    labelUrl: result.labelUrl,
  };
}
