export const siteConfig = {
  name: "reuso",
  description:
    "Ropa reutilizada americana de alta calidad. Moda premium, selección curada y diseño editorial.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://reuso.cl",
  locale: "es-CL",
  currency: "CLP",
  links: {
    instagram: "https://instagram.com/reuso",
    facebook: "https://facebook.com/reuso",
    pinterest: "https://pinterest.com/reuso",
  },
  shipping: {
    rm: 3690,
    regions: 6390,
  },
  announcement: [
    "10% off en tu primera compra*",
    "Envíos a RM $3.690 y regiones a $6.390",
    "Cambios limitados sin costo",
    "Retira en tiendas gratis",
  ],
  nav: {
    main: [
      { label: "INICIO", href: "/" },
      { label: "MUJER", href: "/mujer" },
      { label: "HOMBRE", href: "/hombre" },
      { label: "ROPA DEPORTIVA", href: "/ropa-deportiva" },
      { label: "TIENDAS", href: "/tiendas" },
    ],
    /** @deprecated Barra superior eliminada; cuenta en `AccountNavMenu`. */
    utility: [] as { label: string; href: string }[],
  },
  footer: {
    categories: [
      { label: "Mujer", href: "/mujer" },
      { label: "Hombre", href: "/hombre" },
      { label: "Ropa Deportiva", href: "/ropa-deportiva" },
      { label: "Zapatillas", href: "/productos?categoria=mujer-zapatillas" },
      { label: "Carteras", href: "/productos?categoria=mujer-carteras" },
      { label: "Tiendas", href: "/tiendas" },
    ],
    consultas: [
      { label: "Mis Pedidos", href: "/cuenta/pedidos" },
      { label: "Seguir mi pedido", href: "/seguimiento" },
      { label: "Mis Favoritos", href: "/cuenta/favoritos" },
      { label: "Guía de Tallas", href: "/guia-tallas" },
      { label: "Nosotros", href: "/nosotros" },
      { label: "Tiendas", href: "/tiendas" },
      { label: "Preguntas Frecuentes", href: "/faq" },
    ],
    informacion: [
      { label: "Cambios y devoluciones", href: "/cambios-devoluciones" },
      { label: "Centro de ayuda", href: "/ayuda" },
      { label: "Políticas de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Políticas de envío", href: "/envios" },
    ],
  },
} as const;

/** @deprecated Usar design-system/tokens.ts */
export const brandColors = {
  green: "#1B3022",
  beige: "#D2C1B0",
  orange: "#F38121",
  black: "#0A0A0A",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  grayMuted: "#737373",
} as const;
