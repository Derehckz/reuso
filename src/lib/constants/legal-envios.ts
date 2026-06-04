import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

const envioRm = formatPrice(siteConfig.shipping.rm);
const envioRegiones = formatPrice(siteConfig.shipping.regions);

export const ENVIOS_INTRO = [
  "Esta política describe las modalidades, costos y plazos de despacho de Re-Uso (Comercial Frohlich SPA) para compras realizadas en www.re-uso.cl.",
  `Los valores referenciales de envío son ${envioRm} para Región Metropolitana y ${envioRegiones} para el resto de regiones, salvo que en el checkout se indique otro monto según destino, peso o promociones vigentes.`,
];

export const ENVIOS_SECTIONS: LegalSection[] = [
  {
    id: "modalidades",
    title: "1. Modalidades de entrega",
    subsections: [
      {
        title: "Despacho a domicilio",
        paragraphs: [
          "Enviamos a domicilio a través de empresas de courier (principalmente Bluexpress) a direcciones dentro de Chile continental, según cobertura del operador logístico.",
          "El costo y plazo de despacho se informan de forma desglosada antes de confirmar tu compra, conforme al Reglamento de Comercio Electrónico.",
        ],
      },
      {
        title: "Retiro en tienda",
        paragraphs: [
          "Puedes retirar tu pedido sin costo en las tiendas Re-Uso participantes, sujeto a disponibilidad y confirmación por correo electrónico.",
          "Consulta direcciones y horarios en la sección Tiendas del Sitio Web.",
        ],
      },
    ],
  },
  {
    id: "costos",
    title: "2. Costos de envío",
    paragraphs: [
      `Tarifas de referencia publicadas en el Sitio Web: Región Metropolitana desde ${envioRm}; demás regiones desde ${envioRegiones}.`,
      "El precio final de despacho se calcula en el checkout según comuna, región, peso estimado del pedido y tarifas vigentes del courier o promociones aplicables.",
      "Los costos de envío no están incluidos en el precio del producto y se muestran por separado antes del pago.",
    ],
  },
  {
    id: "plazos",
    title: "3. Plazos de entrega",
    paragraphs: [
      "Los plazos se expresan en días hábiles y comienzan a contar desde la confirmación del pago, una vez validada la transacción.",
      "El rango estimado de entrega se informa en el resumen del pedido y en el correo de confirmación. Los plazos pueden variar por zona geográfica, feriados o contingencias del operador logístico.",
      "Re-Uso no se hace responsable por retrasos imputables a fuerza mayor, catástrofes o hechos ajenos a su control razonable.",
    ],
  },
  {
    id: "preparacion",
    title: "4. Preparación y despacho",
    paragraphs: [
      "Una vez confirmado el pago, prepararemos tu pedido y te notificaremos por correo electrónico cuando sea despachado.",
      "Recibirás un número de seguimiento para rastrear tu envío en la página Seguimiento del Sitio Web o en el sitio del courier.",
    ],
  },
  {
    id: "recepcion",
    title: "5. Recepción del pedido",
    paragraphs: [
      "Es responsabilidad del Comprador proporcionar una dirección válida, completa y con personas disponibles para recibir el envío.",
      "Revisa el estado del paquete al momento de la entrega. Si observas daños evidentes en el embalaje, documenta el hecho con el courier y contáctanos a la brevedad en contacto@re-uso.cl.",
    ],
  },
  {
    id: "imposibilidad",
    title: "6. Imposibilidad de entrega",
    paragraphs: [
      "Si la entrega no puede realizarse por causas imputables al Comprador (dirección incorrecta, ausencia de receptor, etc.), el courier realizará un segundo intento según sus políticas.",
      "Si el producto retorna a nuestras bodegas, te contactaremos para coordinar un nuevo envío. Los costos del reenvío serán de cargo del Comprador.",
      "El producto se mantendrá en bodega por 30 días corridos. Transcurrido ese plazo sin coordinación, podremos anular la compra y devolver el precio del producto, descontando costos de bodegaje y administrativos, conforme a nuestros Términos y Condiciones.",
    ],
  },
  {
    id: "stock",
    title: "7. Falta de stock",
    paragraphs: [
      "Si un producto deja de estar disponible tras confirmada la compra, te contactaremos en un plazo máximo de 5 días hábiles para ofrecerte anulación con devolución del dinero o cambio por otro producto disponible.",
    ],
  },
  {
    id: "contacto",
    title: "8. Consultas sobre envíos",
    paragraphs: [
      "Para dudas sobre tu despacho, escríbenos a contacto@re-uso.cl indicando tu número de pedido, o utiliza la página de seguimiento con tu código de compra o tracking.",
    ],
  },
];
