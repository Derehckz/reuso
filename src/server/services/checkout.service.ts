import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/prisma-soft-delete";
import {
  createShipmentForOrder,
  quoteForCheckout,
} from "@/server/services/shipping.service";
import {
  createCheckoutPreference,
  getMercadoPagoUserMessage,
  isMercadoPagoConfigured,
  resetMercadoPagoClient,
  toMercadoPagoError,
} from "@/lib/mercadopago";
import { loadMercadoPagoConfig } from "@/modules/integrations/mercadopago";
import { loadBlueExpressConfig } from "@/modules/integrations/blueexpress";
import { assertCheckoutShippingDestination } from "@/lib/checkout/shipping";
import { generateOrderNumber } from "@/lib/utils";
import type { CheckoutFormData } from "@/lib/validations/checkout";
import {
  reserveCouponAtomic,
  reserveInventoryAtomic,
} from "@/server/services/inventory.service";
import { cancelAwaitingPaymentOrder } from "@/server/services/order-lifecycle.service";

export type CartItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type ValidatedLine = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
  image: string | null;
  slug: string;
  maxStock: number;
};

export type CheckoutTotals = {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  couponCode: string | null;
};

export async function validateCartLines(
  items: CartItemInput[],
): Promise<{ lines: ValidatedLine[]; errors: string[] }> {
  const errors: string[] = [];
  const lines: ValidatedLine[] = [];

  if (items.length === 0) {
    return { lines, errors };
  }

  const variantIds = [...new Set(items.map((i) => i.variantId))];

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      deletedAt: null,
      product: { isPublished: true, deletedAt: null },
    },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      inventory: true,
    },
  });

  const variantById = new Map(variants.map((v) => [v.id, v]));

  for (const item of items) {
    const variant = variantById.get(item.variantId);

    if (!variant || variant.productId !== item.productId) {
      errors.push("Un producto del carrito ya no está disponible.");
      continue;
    }

    const stock = availableStock(variant.inventory);
    if (stock < 1) {
      errors.push(`${variant.product.name} está agotado.`);
      continue;
    }

    const maxQty = Math.min(stock, 10);
    if (item.quantity > maxQty) {
      errors.push(
        `${variant.product.name}: solo hay ${maxQty} unidad${maxQty === 1 ? "" : "es"} disponible${maxQty === 1 ? "" : "s"}.`,
      );
      continue;
    }

    const qty = Math.min(item.quantity, maxQty);
    const unitPrice = variant.price ?? variant.product.basePrice;

    lines.push({
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.product.name,
      variantLabel: `${variant.size} / ${variant.color}`,
      sku: variant.sku,
      unitPrice,
      quantity: qty,
      total: unitPrice * qty,
      image: variant.product.images[0]?.url ?? null,
      slug: variant.product.slug,
      maxStock: stock,
    });
  }

  return { lines, errors };
}

export async function calculateShippingAmount(
  region: string,
  commune: string,
  itemCount: number,
  totalQuantity?: number,
): Promise<{
  amount: number;
  estimatedDays: number;
  serviceCode: string;
  weightKg: number;
  zone: string;
}> {
  const quote = await quoteForCheckout({
    region,
    commune,
    itemCount,
    totalQuantity,
  });

  return {
    amount: quote.price,
    estimatedDays: quote.estimatedDays,
    serviceCode: quote.serviceCode,
    weightKg: quote.weightKg,
    zone: quote.zone,
  };
}

export async function applyCoupon(
  code: string | undefined,
  subtotal: number,
): Promise<{ discountAmount: number; couponId: string | null; code: string | null }> {
  if (!code?.trim()) {
    return { discountAmount: 0, couponId: null, code: null };
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase().trim(),
      isActive: true,
      deletedAt: null,
    },
  });

  if (!coupon) {
    throw new Error("Cupón inválido o expirado");
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error("Este cupón aún no está activo");
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("Este cupón ha expirado");
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Este cupón alcanzó su límite de uso");
  }
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new Error(
      `Compra mínima de $${coupon.minPurchase.toLocaleString("es-CL")} para este cupón`,
    );
  }

  let discountAmount = 0;
  if (coupon.type === "PERCENTAGE") {
    discountAmount = Math.round((subtotal * coupon.value) / 100);
  } else {
    discountAmount = coupon.value;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    discountAmount,
    couponId: coupon.id,
    code: coupon.code,
  };
}

function computeTotals(
  lines: ValidatedLine[],
  discountAmount: number,
  shippingAmount: number,
  couponCode: string | null = null,
): CheckoutTotals {
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);
  return {
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    couponCode,
  };
}

async function resolveCheckoutTotals(
  lines: ValidatedLine[],
  region: string,
  commune: string,
  couponCode?: string,
) {
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const { discountAmount, couponId, code } = await applyCoupon(
    couponCode,
    subtotal,
  ).catch((e) => {
    throw e instanceof Error ? e : new Error("Cupón inválido");
  });

  const totalQuantity = lines.reduce((s, l) => s + l.quantity, 0);
  const shippingQuote = await quoteForCheckout({
    region,
    commune,
    itemCount: totalQuantity,
    totalQuantity,
  });
  const shippingAmount = shippingQuote.price;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    subtotal,
    discountAmount,
    couponId,
    couponCode: code,
    shippingAmount,
    shippingQuote,
    total,
  };
}

export async function previewCheckoutTotals(params: {
  items: CartItemInput[];
  region: string;
  commune: string;
  couponCode?: string;
}): Promise<CheckoutTotals & { errors: string[] }> {
  try {
    assertCheckoutShippingDestination(params.region, params.commune);
  } catch (e) {
    return {
      subtotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      total: 0,
      couponCode: null,
      errors: [e instanceof Error ? e.message : "Envío inválido"],
    };
  }

  const { lines, errors } = await validateCartLines(params.items);
  if (errors.length > 0 || lines.length === 0) {
    return {
      subtotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      total: 0,
      couponCode: null,
      errors: errors.length ? errors : ["Carrito inválido"],
    };
  }

  try {
    const resolved = await resolveCheckoutTotals(
      lines,
      params.region,
      params.commune,
      params.couponCode,
    );
    return {
      ...computeTotals(
        lines,
        resolved.discountAmount,
        resolved.shippingAmount,
        resolved.couponCode,
      ),
      errors: [],
    };
  } catch (e) {
    return {
      subtotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      total: 0,
      couponCode: null,
      errors: [e instanceof Error ? e.message : "No se pudo calcular el total"],
    };
  }
}

export async function createCheckoutOrder(params: {
  userId: string | null;
  form: CheckoutFormData;
  items: CartItemInput[];
}) {
  await Promise.all([loadMercadoPagoConfig(), loadBlueExpressConfig()]);
  resetMercadoPagoClient();

  assertCheckoutShippingDestination(params.form.region, params.form.commune);

  const { lines, errors } = await validateCartLines(params.items);
  if (errors.length > 0 || lines.length === 0) {
    throw new Error(errors[0] ?? "Carrito inválido");
  }

  const {
    subtotal,
    discountAmount,
    couponId,
    couponCode,
    shippingAmount,
    shippingQuote,
    total,
  } = await resolveCheckoutTotals(
    lines,
    params.form.region,
    params.form.commune,
    params.form.couponCode,
  );

  const orderNumber = generateOrderNumber();

  const shippingAddress = {
    firstName: params.form.firstName,
    lastName: params.form.lastName,
    email: params.form.email,
    phone: params.form.phone,
    street: params.form.street,
    number: params.form.number ?? "",
    apartment: params.form.apartment ?? "",
    commune: params.form.commune,
    region: params.form.region,
    postalCode: params.form.postalCode ?? "",
    notes: params.form.notes ?? "",
  };

  const order = await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const reserved = await reserveInventoryAtomic(
        tx,
        line.variantId,
        line.quantity,
      );
      if (!reserved) {
        throw new Error(`Stock insuficiente para ${line.productName}`);
      }
    }

    if (couponId) {
      const couponOk = await reserveCouponAtomic(tx, couponId);
      if (!couponOk) {
        throw new Error("El cupón ya no está disponible");
      }
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: params.userId,
        guestEmail: params.userId ? null : params.form.email,
        status: "AWAITING_PAYMENT",
        subtotal,
        discountAmount,
        shippingAmount,
        total,
        couponId,
        couponCode,
        shippingAddress,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.productName,
            variantLabel: l.variantLabel,
            sku: l.sku,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            total: l.total,
          })),
        },
        statusHistory: {
          create: {
            status: "AWAITING_PAYMENT",
            note: "Orden creada — pendiente de pago",
          },
        },
        payment: {
          create: {
            amount: total,
            status: "PENDING",
          },
        },
      },
    });

    if (params.userId && params.form.saveAddress) {
      const duplicate = await tx.address.findFirst({
        where: {
          userId: params.userId,
          deletedAt: null,
          street: params.form.street,
          commune: params.form.commune,
          region: params.form.region,
        },
        select: { id: true },
      });
      if (!duplicate) {
        const existingDefault = await tx.address.findFirst({
          where: { userId: params.userId, isDefault: true, deletedAt: null },
        });
        await tx.address.create({
          data: {
            userId: params.userId,
            label: "Checkout",
            firstName: params.form.firstName,
            lastName: params.form.lastName,
            street: params.form.street,
            number: params.form.number,
            apartment: params.form.apartment,
            commune: params.form.commune,
            region: params.form.region,
            postalCode: params.form.postalCode,
            phone: params.form.phone,
            isDefault: !existingDefault,
          },
        });
      }
    }

    return created;
  });

  try {
    await createShipmentForOrder(order.id, shippingQuote);
  } catch (shipmentError) {
    console.error("[checkout] No se pudo crear envío", {
      orderId: order.id,
      error: shipmentError,
    });
  }

  let paymentUrl: string | null = null;

  if (isMercadoPagoConfigured()) {
    let mpItems = lines.map((l) => ({
      id: l.variantId,
      title: l.productName,
      quantity: l.quantity,
      unit_price: l.unitPrice,
    }));

    if (discountAmount > 0) {
      const itemsSub = mpItems.reduce(
        (s, i) => s + i.unit_price * i.quantity,
        0,
      );
      const ratio = Math.max(0, (itemsSub - discountAmount) / itemsSub);
      mpItems = mpItems.map((i) => ({
        ...i,
        unit_price: Math.max(1, Math.round(i.unit_price * ratio)),
      }));
    }

    if (shippingAmount > 0) {
      mpItems.push({
        id: "shipping",
        title: "Envío",
        quantity: 1,
        unit_price: shippingAmount,
      });
    }

    try {
      const preference = await createCheckoutPreference({
        orderId: order.id,
        orderNumber: order.orderNumber,
        payerEmail: params.form.email,
        payerName: `${params.form.firstName} ${params.form.lastName}`.trim(),
        items: mpItems,
        totalAmount: total,
      });

      paymentUrl = preference.checkoutUrl ?? null;

      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          preferenceId: preference.preferenceId ?? undefined,
          rawResponse: {
            preferenceId: preference.preferenceId,
            environment: preference.environment,
          },
        },
      });
    } catch (error) {
      const mpError = toMercadoPagoError(error);
      console.error("[checkout] Error creando preferencia MP", {
        orderId: order.id,
        code: mpError.code,
        message: mpError.message,
      });

      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          rawResponse: {
            error: mpError.message,
            code: mpError.code,
            status: mpError.status,
          },
        },
      });

      await cancelAwaitingPaymentOrder(
        order.id,
        "Cancelada: no se pudo iniciar el pago con Mercado Pago",
      );
      throw new Error(getMercadoPagoUserMessage(error));
    }
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    total,
    paymentUrl,
    totals: {
      subtotal,
      discountAmount,
      shippingAmount,
      total,
      couponCode,
    } satisfies CheckoutTotals,
  };
}

export { computeTotals };
