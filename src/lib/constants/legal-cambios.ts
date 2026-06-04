import type { LegalSection } from "@/components/legal/legal-page";

export const CAMBIOS_INTRO = [
  "En Re-Uso (Comercial Frohlich SPA) queremos que tu experiencia de compra sea transparente. Esta página resume tus derechos y nuestras políticas de cambios y devoluciones para compras en www.re-uso.cl.",
  "Los productos comercializados son de segunda mano (usados). Te recomendamos revisar con atención la descripción, fotografías y estado de conservación indicado en cada ficha antes de comprar.",
];

export const CAMBIOS_SECTIONS: LegalSection[] = [
  {
    id: "naturaleza",
    title: "1. Naturaleza de los productos",
    paragraphs: [
      "Todos los artículos ofrecidos son prendas usadas o de segunda mano. De conformidad con el artículo 14 de la Ley N° 19.496, no están sujetos a la garantía legal de los artículos 19 y 20 de dicha ley.",
      "Cada producto describe marca, talla, color, composición, estado y otros antecedentes relevantes para una compra informada.",
    ],
  },
  {
    id: "retracto",
    title: "2. Derecho a retracto (devolución)",
    paragraphs: [
      "De conformidad con el artículo 3° bis de la Ley N° 19.496, tienes derecho a poner término al contrato (retracto) dentro de 10 días corridos contados desde que recibes el producto, sin necesidad de invocar causa.",
    ],
    subsections: [
      {
        title: "Cómo ejercer el retracto",
        paragraphs: [
          "Envía tu solicitud a contacto@re-uso.cl dentro del plazo de 10 días, indicando número de pedido y producto.",
          "Devuelve la prenda sin uso, en las mismas condiciones en que la recibiste, con etiquetas, embalajes y accesorios originales cuando corresponda.",
        ],
      },
      {
        title: "Costos",
        paragraphs: [
          "El costo del envío de devolución es de cargo del Comprador, salvo que la ley o estos términos dispongan otra cosa.",
        ],
      },
      {
        title: "Reembolso",
        paragraphs: [
          "Una vez recibido y verificado el producto, reembolsaremos las sumas pagadas sin retención de gastos, en un plazo máximo de 45 días corridos desde tu comunicación de retracto.",
        ],
      },
    ],
  },
  {
    id: "garantia",
    title: "3. Garantía voluntaria de satisfacción (cambios)",
    paragraphs: [
      "Además del retracto legal, ofrecemos una garantía voluntaria: si el producto presenta una falla o anomalía no informada en su descripción, puedes solicitar una solución en un plazo de 10 días hábiles desde la recepción.",
    ],
    subsections: [
      {
        title: "Opción disponible",
        paragraphs: [
          "Podrás optar por un cupón de descuento por el valor del producto para utilizar en el Sitio Web, según evaluación de Re-Uso.",
        ],
      },
      {
        title: "Procedimiento",
        paragraphs: [
          "Contacta a contacto@re-uso.cl con fotografías, descripción del problema y número de pedido. Nuestro equipo revisará el caso y te indicará los pasos a seguir.",
        ],
      },
    ],
  },
  {
    id: "exclusiones",
    title: "4. Exclusiones",
    paragraphs: [
      "Las políticas anteriores no aplican, salvo obligación legal en contrario, a:",
      "Las exclusiones aplicables se indicarán en la ficha de cada producto cuando corresponda.",
    ],
    list: [
      "Ropa interior y trajes de baño.",
      "Productos en liquidación o sección «SALE».",
      "Compras realizadas de forma presencial en tiendas, las que se rigen por condiciones informadas en el local.",
      "Productos que presenten desgaste propio del uso normal de una prenda usada, debidamente descrito en la ficha.",
    ],
  },
  {
    id: "no-aplica",
    title: "5. Casos no elegibles",
    paragraphs: [
      "No procederán cambios ni devoluciones si el producto fue usado, lavado o alterado después de la entrega, si falta documentación o elementos declarados en la compra, o si la solicitud se presenta fuera de los plazos indicados.",
    ],
  },
  {
    id: "anulacion",
    title: "6. Anulación por falta de stock",
    paragraphs: [
      "Si un producto no está disponible tras confirmada la compra, te contactaremos en hasta 5 días hábiles para ofrecer devolución íntegra del dinero (en hasta 10 días hábiles desde la anulación) o cambio por otro producto disponible.",
    ],
  },
  {
    id: "relacion",
    title: "7. Relación con otros documentos",
    paragraphs: [
      "Esta política complementa los Términos y Condiciones generales y la Política de Envío. Ante cualquier duda, prevalecerá lo dispuesto en la ley chilena y en los Términos y Condiciones vigentes al momento de la compra.",
      "Consulta también: Términos y Condiciones (/terminos) y Política de Envío (/envios).",
    ],
  },
];
