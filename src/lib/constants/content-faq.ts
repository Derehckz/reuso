import type { LegalSection } from "@/components/legal/legal-page";

export const FAQ_SECTIONS: LegalSection[] = [
  {
    id: "compras",
    title: "Compras online",
    paragraphs: [
      "Puedes comprar en reuso.cl con envío a todo Chile vía Bluexpress o retiro en tiendas participantes.",
      "Los precios están en pesos chilenos (CLP) e incluyen IVA cuando corresponda.",
    ],
  },
  {
    id: "pagos",
    title: "Pagos",
    list: [
      "Aceptamos MercadoPago (tarjetas, débito y medios disponibles en tu cuenta).",
      "Tu pedido queda reservado al confirmar el checkout; el stock se confirma cuando el pago es aprobado.",
    ],
  },
  {
    id: "envios",
    title: "Envíos y seguimiento",
    paragraphs: [
      "Consulta plazos y costos en la página de Envíos. Puedes rastrear tu pedido en Seguimiento con tu número RU- y el email de la compra.",
    ],
  },
];
