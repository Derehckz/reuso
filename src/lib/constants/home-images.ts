/** Rutas locales en `public/images` para preview del home y seed. */
const CAROUSEL = "/images/hero/carousel";

/** Proporción nativa de los banners originales (3050×1218). */
export const HERO_CAROUSEL_ASPECT = "3050 / 1218";

export const HOME_IMAGES = {
  manifesto: "/images/products/jean-501.svg",
} as const;

export type HeroCarouselSlide = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const HERO_CAROUSEL_SLIDES: HeroCarouselSlide[] = [
  {
    title: "FOOTWEAR",
    href: "/productos/zapatilla-jordan-1",
    imageSrc: `${CAROUSEL}/01-footwear.webp`,
    imageAlt: "Footwear — Colección calzado reuso",
  },
  {
    title: "New York Yankees",
    href: "/productos/poleron-ny-yankees",
    imageSrc: `${CAROUSEL}/02-yankees-polerones.webp`,
    imageAlt: "Especial polerones New York Yankees",
  },
  {
    title: "Chaquetas",
    href: "/productos",
    imageSrc: `${CAROUSEL}/03-chaquetas.webp`,
    imageAlt: "Chaquetas hombre y mujer — Fall Winter 2025",
  },
  {
    title: "Polerones & Hoodies",
    href: "/hombre",
    imageSrc: `${CAROUSEL}/04-polerones-hoodies.webp`,
    imageAlt: "Polerones y hoodies hombre y mujer",
  },
  {
    title: "Carteras & Bolsos",
    href: "/productos/cartera-coach-vintage",
    imageSrc: `${CAROUSEL}/05-carteras-bolsos.webp`,
    imageAlt: "Carteras y bolsos seleccionados",
  },
  {
    title: "Lo normal es opcional",
    href: "/productos",
    imageSrc: `${CAROUSEL}/06-castro.webp`,
    imageAlt: "Tienda reuso Castro — Lo normal es opcional",
  },
  {
    title: "Lo normal es opcional",
    href: "/productos",
    imageSrc: `${CAROUSEL}/07-temuco.webp`,
    imageAlt: "Tienda reuso Temuco — Lo normal es opcional",
  },
  {
    title: "Lo normal es opcional",
    href: "/productos",
    imageSrc: `${CAROUSEL}/08-osorno.webp`,
    imageAlt: "Tienda reuso Osorno — Lo normal es opcional",
  },
  {
    title: "10 años reuso",
    href: "/productos",
    imageSrc: `${CAROUSEL}/09-10-anos.webp`,
    imageAlt: "10 años reuso",
  },
  {
    title: "Sportwear",
    href: "/productos",
    imageSrc: `${CAROUSEL}/10-sportwear.webp`,
    imageAlt: "Colección sportwear reuso",
  },
];

/** @deprecated Usar HeroCarousel. Slides legacy del carrusel de categorías. */
export type CollectionSlide = {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const COLLECTION_CAROUSEL_SLIDES: CollectionSlide[] = [
  {
    title: "MUJER",
    subtitle: "Nueva colección",
    href: "/mujer",
    imageSrc: "/images/banners/mujer-hero.svg",
    imageAlt: "Colección mujer reuso",
  },
  {
    title: "HOMBRE",
    subtitle: "Nueva colección",
    href: "/hombre",
    imageSrc: "/images/products/poleron-yankees.svg",
    imageAlt: "Colección hombre reuso",
  },
  {
    title: "ROPA DEPORTIVA",
    subtitle: "Camisetas y más",
    href: "/ropa-deportiva",
    imageSrc: "/images/products/polera-041.svg",
    imageAlt: "Ropa deportiva reuso",
  },
];

export const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  "polera-vintage-041": "/images/products/polera-vintage-041.webp",
  "jean-levis-501": "/images/products/jean-levis-501.webp",
  "poleron-ny-yankees": "/images/products/poleron-ny-yankees.webp",
  "zapatilla-jordan-1": "/images/products/zapatilla-jordan-1.webp",
  "cartera-coach-vintage": "/images/products/cartera-coach-vintage.webp",
  "camiseta-ac-milan-away-2023": "/images/products/poleron-ny-yankees.webp",
};
