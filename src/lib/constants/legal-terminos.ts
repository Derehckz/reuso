import type { LegalSection } from "@/components/legal/legal-page";

export const TERMINOS_INTRO = [
  "Estos Términos y Condiciones (en adelante, «TyC») regulan la relación entre Comercial Frohlich SPA (en adelante, «la Empresa» o «Re-Uso») y los usuarios compradores (en adelante, el «Comprador» o «Usuario») del sitio web http://www.re-uso.cl (en adelante, el «Sitio Web»).",
  "La aceptación de estos TyC es un requisito indispensable para realizar compras en el Sitio Web.",
];

export const TERMINOS_SECTIONS: LegalSection[] = [
  {
    id: "antecedentes",
    title: "1. Antecedentes generales",
    paragraphs: [
      "Razón Social: Comercial Frohlich SPA",
      "RUT: 76.517.927-0",
      "Domicilio: Patricio Lynch 1800, Osorno, Chile.",
      "Giro: Venta de ropa y otros artículos de segunda mano a través del Sitio Web y establecimientos físicos.",
      "Contacto: contacto@re-uso.cl",
      "La Empresa promueve la reutilización de prendas para extender su vida útil, en un modelo de economía circular.",
    ],
  },
  {
    id: "productos",
    title: "2. Productos y condición de venta",
    paragraphs: [
      "Todos los productos ofrecidos en el Sitio Web son de segunda mano (usados). De conformidad con el artículo 14 de la Ley N° 19.496, se informa expresamente al Comprador que los productos, por su naturaleza de usados, refaccionados o elaborados con partes usadas, no están sujetos a la garantía legal establecida en los artículos 19 y 20 de dicha ley.",
      "La información de cada producto detallará sus características esenciales, incluyendo marca, talla, color, composición, estado de conservación y cualquier otro antecedente relevante para una decisión de compra informada, conforme al artículo 9 del Reglamento de Comercio Electrónico.",
    ],
  },
  {
    id: "compra",
    title: "3. Proceso de compra",
    subsections: [
      {
        title: "Precio",
        paragraphs: [
          "El precio de cada producto será el publicado en el Sitio Web e incluirá los impuestos correspondientes. Los costos de envío se indicarán de forma separada y desglosada antes de la confirmación del pedido, de acuerdo con el artículo 11 del Reglamento de Comercio Electrónico.",
        ],
      },
      {
        title: "Confirmación del pedido",
        paragraphs: [
          "Antes de finalizar la compra, se presentará al Comprador un resumen del pedido con el detalle de los productos, el costo total a pagar (incluyendo despacho) y la fecha o rango de entrega. La confirmación del pedido por parte del Comprador implica la aceptación de estos TyC y perfecciona el contrato de compraventa.",
        ],
      },
      {
        title: "Falta de stock",
        paragraphs: [
          "Si un producto deja de estar disponible después de confirmada la compra, la Empresa contactará al Comprador en un plazo máximo de 5 días hábiles para ofrecer alguna de las siguientes opciones, a elección del Comprador:",
        ],
        list: [
          "La anulación de la compra y la devolución íntegra del dinero.",
          "El cambio por otro producto disponible en el Sitio Web. La devolución del dinero se realizará en un plazo máximo de 10 días hábiles desde la anulación de la compra.",
        ],
      },
      {
        title: "Confirmación escrita",
        paragraphs: [
          "Una vez perfeccionado el contrato, la Empresa enviará una confirmación escrita al correo electrónico informado por el Comprador, la cual contendrá una copia íntegra y legible de estos TyC, en cumplimiento del artículo 12 A de la Ley N° 19.496.",
        ],
      },
    ],
  },
  {
    id: "despacho",
    title: "4. Despacho y entrega",
    subsections: [
      {
        title: "Costos y plazos",
        paragraphs: [
          "Los costos y plazos de despacho serán informados al Comprador antes de confirmar la compra. Los plazos de entrega se expresarán en días hábiles y comenzarán a contar desde la confirmación del pago.",
        ],
      },
      {
        title: "Responsabilidad",
        paragraphs: [
          "La Empresa es responsable de la gestión del despacho hasta la correcta entrega del producto en la dirección informada por el Comprador. Es obligación del Comprador proporcionar una dirección de despacho válida y correcta.",
        ],
      },
      {
        title: "Seguimiento",
        paragraphs: [
          "La Empresa notificará al Comprador el despacho del pedido y proporcionará el número de seguimiento correspondiente.",
        ],
      },
      {
        title: "Imposibilidad de entrega",
        paragraphs: [
          "Si la entrega no puede realizarse por causas imputables al Comprador (ej. dirección incorrecta, ausencia de moradores), la empresa de transporte realizará un segundo intento de entrega. Si este también resulta fallido, el producto será devuelto a las bodegas de Re-Uso. La Empresa contactará al Comprador para coordinar un nuevo envío, cuyos costos deberán ser cubiertos por este último. El producto se mantendrá en bodega por un plazo de 30 días corridos. Si transcurrido este plazo el Comprador no ha coordinado el reenvío, la Empresa podrá anular la compra y devolver el precio pagado por el producto, descontando los costos de bodegaje y administrativos.",
        ],
      },
    ],
  },
  {
    id: "retracto",
    title: "5. Derecho a retracto",
    paragraphs: [
      "De conformidad con el artículo 3° bis de la Ley N° 19.496, el Comprador tiene derecho a poner término unilateralmente al contrato (retracto) en el plazo de 10 días corridos contados desde la recepción del producto.",
    ],
    subsections: [
      {
        title: "Procedimiento",
        paragraphs: [
          "Para ejercer este derecho, el Comprador deberá comunicar su intención a la Empresa a través del correo electrónico contacto@re-uso.cl dentro del plazo señalado, y restituir el producto sin uso, con todos sus elementos originales (etiquetas, embalajes, etc.).",
        ],
      },
      {
        title: "Costos de devolución",
        paragraphs: [
          "Los costos de envío para la devolución del producto serán de cargo del Comprador.",
        ],
      },
      {
        title: "Devolución del dinero",
        paragraphs: [
          "Una vez recibido y verificado el estado del producto, la Empresa procederá a la devolución de las sumas abonadas por el Comprador, sin retención de gastos, en un plazo máximo de 45 días corridos desde la comunicación del retracto.",
        ],
      },
    ],
  },
  {
    id: "cambios",
    title: "6. Política de cambios (garantía voluntaria)",
    paragraphs: [
      "Sin perjuicio del derecho a retracto, la Empresa ofrece una garantía voluntaria de satisfacción.",
      "Si el producto presenta una falla o anomalía no informada en su descripción, el Comprador podrá solicitar el cambio en un plazo de 10 días hábiles desde la recepción del producto.",
    ],
    subsections: [
      {
        title: "Opciones",
        paragraphs: [
          "El Comprador podrá optar por un cupón de descuento por el valor del producto para ser utilizado en el Sitio Web.",
        ],
      },
      {
        title: "Exclusiones",
        paragraphs: [
          "Esta garantía no aplica para las siguientes categorías: ropa interior, trajes de baño, productos en liquidación («SALE») o compras realizadas de forma presencial. Dichas exclusiones serán debidamente informadas en la ficha de cada producto.",
        ],
      },
    ],
  },
  {
    id: "datos",
    title: "7. Tratamiento de datos personales",
    paragraphs: [
      "El tratamiento de los datos personales del Comprador se rige por la Ley N° 19.628 sobre Protección de la Vida Privada.",
    ],
    subsections: [
      {
        title: "Finalidad",
        paragraphs: [
          "Los datos recolectados serán utilizados exclusivamente para procesar la compra, realizar el despacho, enviar comunicaciones relativas al estado del pedido y, solo si el Usuario lo autoriza expresamente, para el envío de información publicitaria.",
        ],
      },
      {
        title: "Confidencialidad",
        paragraphs: [
          "La Empresa se compromete a resguardar la seguridad y confidencialidad de los datos personales, adoptando las medidas necesarias para evitar su alteración, pérdida o tratamiento no autorizado.",
        ],
      },
      {
        title: "Derechos del titular",
        paragraphs: [
          "El Comprador podrá en todo momento ejercer los derechos de acceso, rectificación, cancelación y oposición al tratamiento de sus datos, comunicándose al correo contacto@re-uso.cl.",
        ],
      },
    ],
  },
  {
    id: "modificacion",
    title: "8. Modificación de los términos y condiciones",
    paragraphs: [
      "La Empresa podrá modificar estos TyC en cualquier momento. Sin embargo, las compras realizadas por el Usuario se regirán por los términos y condiciones vigentes al momento de perfeccionarse el contrato.",
    ],
  },
  {
    id: "jurisdiccion",
    title: "9. Legislación aplicable y jurisdicción",
    paragraphs: [
      "El presente contrato se rige por las leyes de la República de Chile. Cualquier dificultad o controversia que se suscite entre las partes será de competencia de los tribunales ordinarios de justicia, pudiendo el Comprador recurrir, a su elección, al juzgado de policía local correspondiente a su domicilio o al domicilio del proveedor, de acuerdo con lo dispuesto en el artículo 50 A de la Ley N° 19.496.",
    ],
  },
];
