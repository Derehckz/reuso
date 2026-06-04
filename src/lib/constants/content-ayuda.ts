import type { LegalSection } from "@/components/legal/legal-page";

export const AYUDA_SECTIONS: LegalSection[] = [
  {
    id: "cuenta",
    title: "Mi cuenta",
    list: [
      "Regístrate para guardar favoritos y ver tus pedidos en Mis pedidos.",
      "Si compraste como invitado, usa Seguimiento con tu número de pedido y email.",
    ],
  },
  {
    id: "cambios",
    title: "Cambios y devoluciones",
    paragraphs: [
      "Revisa las condiciones en Cambios y devoluciones. Por tratarse de moda reutilizada, aplican políticas de cambio limitado según estado de la prenda.",
    ],
  },
  {
    id: "contacto",
    title: "¿Necesitas más ayuda?",
    paragraphs: ["Escríbenos desde la página de Contacto o visita una de nuestras tiendas."],
  },
];
