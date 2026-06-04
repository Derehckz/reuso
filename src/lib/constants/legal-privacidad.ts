import type { LegalSection } from "@/components/legal/legal-page";

export const PRIVACIDAD_INTRO = [
  "Comercial Frohlich SPA, operando bajo la marca Re-Uso (en adelante, «Re-Uso» o «la Empresa»), informa a los usuarios del sitio web www.re-uso.cl sobre su política de tratamiento de datos personales.",
  "Esta política se rige por la Ley N° 19.628 sobre Protección de la Vida Privada y normativa complementaria aplicable en Chile.",
];

export const PRIVACIDAD_SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    paragraphs: [
      "Razón Social: Comercial Frohlich SPA",
      "RUT: 76.517.927-0",
      "Domicilio: Patricio Lynch 1800, Osorno, Chile.",
      "Correo de contacto: contacto@re-uso.cl",
    ],
  },
  {
    id: "datos",
    title: "2. Datos que recopilamos",
    paragraphs: [
      "Podemos recopilar y tratar las siguientes categorías de datos personales, según el uso que hagas del Sitio Web:",
    ],
    list: [
      "Datos de identificación y contacto: nombre, apellidos, correo electrónico, teléfono y RUT cuando corresponda.",
      "Datos de despacho y facturación: dirección, comuna, región y otra información necesaria para entregar tu pedido.",
      "Datos de cuenta: credenciales de acceso si creas una cuenta registrada.",
      "Datos de compra: historial de pedidos, productos adquiridos, montos y estado de pago.",
      "Datos técnicos: dirección IP, tipo de navegador, páginas visitadas y cookies (ver sección 6).",
    ],
  },
  {
    id: "finalidad",
    title: "3. Finalidad del tratamiento",
    paragraphs: [
      "Los datos personales serán utilizados exclusivamente para las siguientes finalidades:",
    ],
    list: [
      "Procesar y gestionar tus compras en el Sitio Web.",
      "Coordinar el despacho, retiro en tienda o entrega de productos.",
      "Enviar comunicaciones relativas al estado del pedido, confirmaciones y seguimiento.",
      "Atender consultas, reclamos y solicitudes de servicio al cliente.",
      "Cumplir obligaciones legales y contractuales aplicables.",
      "Enviar información publicitaria o promocional solo si autorizas expresamente dicho tratamiento.",
    ],
  },
  {
    id: "base",
    title: "4. Base legal y consentimiento",
    paragraphs: [
      "El tratamiento de datos necesarios para ejecutar una compra se fundamenta en la ejecución del contrato de compraventa y en el cumplimiento de obligaciones legales.",
      "El envío de comunicaciones comerciales requiere tu consentimiento previo, libre e informado, el cual podrás revocar en cualquier momento.",
    ],
  },
  {
    id: "terceros",
    title: "5. Comunicación a terceros",
    paragraphs: [
      "Re-Uso podrá compartir datos con proveedores que prestan servicios esenciales para la operación del Sitio Web, tales como procesamiento de pagos (Mercado Pago), empresas de transporte (Bluexpress u otras courier) y servicios de hosting o correo electrónico.",
      "Estos terceros solo podrán usar los datos para las finalidades contratadas y deben mantener medidas de confidencialidad y seguridad adecuadas.",
      "No vendemos ni cedemos tus datos personales a terceros con fines comerciales ajenos a la operación del Sitio Web.",
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies y tecnologías similares",
    paragraphs: [
      "El Sitio Web puede utilizar cookies y tecnologías similares para mejorar la experiencia de navegación, recordar preferencias y analizar el uso del sitio.",
      "Puedes configurar tu navegador para rechazar cookies; sin embargo, algunas funcionalidades del Sitio Web podrían no operar correctamente.",
    ],
  },
  {
    id: "seguridad",
    title: "7. Seguridad y conservación",
    paragraphs: [
      "La Empresa adopta medidas técnicas y organizativas razonables para proteger los datos personales contra alteración, pérdida, tratamiento o acceso no autorizado.",
      "Los datos se conservarán durante el tiempo necesario para cumplir las finalidades indicadas y las obligaciones legales aplicables.",
    ],
  },
  {
    id: "derechos",
    title: "8. Derechos del titular",
    paragraphs: [
      "De acuerdo con la legislación chilena, puedes ejercer en cualquier momento los derechos de acceso, rectificación, cancelación y oposición (ARCO) respecto de tus datos personales.",
      "Para ejercer estos derechos, escríbenos a contacto@re-uso.cl indicando tu solicitud y datos de identificación. Responderemos en un plazo razonable conforme a la ley.",
    ],
  },
  {
    id: "menores",
    title: "9. Menores de edad",
    paragraphs: [
      "El Sitio Web no está dirigido a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos dicha situación, procederemos a eliminar la información correspondiente.",
    ],
  },
  {
    id: "cambios",
    title: "10. Cambios a esta política",
    paragraphs: [
      "Re-Uso podrá actualizar esta Política de Privacidad en cualquier momento. La versión vigente estará siempre publicada en esta página con su fecha de actualización.",
      "Te recomendamos revisar periódicamente este documento. El uso continuado del Sitio Web tras publicados los cambios implica tu conocimiento de la política actualizada, salvo que la ley exija un consentimiento adicional.",
    ],
  },
];
