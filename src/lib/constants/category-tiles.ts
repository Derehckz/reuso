export type CategoryTile = {
  id: string;
  title: string;
  titleLines?: [string, string];
  href: string;
  imageSrc: string;
  imageAlt: string;
  titleAlign?: "left" | "right";
  /** Posición del título sobre la imagen */
  titlePosition?: "bottom-left" | "top-left" | "bottom-right" | "center-right";
  /** Color del título (sport wear usa oscuro sobre fondo claro) */
  titleColor?: "light" | "dark";
  /** Proporción del tile en el grid */
  aspect?: "square" | "wide";
  row: "top" | "bottom";
  /** Columnas en fila inferior (grid de 4 → 1 + 2 + 1) */
  bottomColSpan?: 1 | 2;
};

export const HOME_CATEGORY_TILES: CategoryTile[] = [
  {
    id: "mujer",
    title: "MUJER",
    href: "/productos?categoria=mujer&genero=MUJER",
    imageSrc: "/images/categories/mujer.webp",
    imageAlt: "Colección mujer reuso",
    row: "top",
  },
  {
    id: "hombre",
    title: "HOMBRE",
    href: "/productos?categoria=hombre&genero=HOMBRE",
    imageSrc: "/images/categories/hombre.webp",
    imageAlt: "Colección hombre reuso",
    row: "top",
  },
  {
    id: "ninos",
    title: "NIÑOS",
    href: "/productos?genero=NINO",
    imageSrc: "/images/categories/ninos.webp",
    imageAlt: "Colección niños reuso",
    row: "top",
  },
  {
    id: "sport-wear",
    title: "SPORT WEAR",
    titleLines: ["SPORT", "WEAR"],
    href: "/productos?categoria=ropa-deportiva&genero=UNISEX",
    imageSrc: "/images/categories/sport-wear.webp",
    imageAlt: "Ropa deportiva reuso",
    titleAlign: "left",
    titlePosition: "top-left",
    titleColor: "dark",
    row: "bottom",
    bottomColSpan: 1,
    aspect: "square",
  },
  {
    id: "footwear",
    title: "FOOT WEAR",
    titleLines: ["FOOT", "WEAR"],
    href: "/productos?categoria=hombre-zapatillas",
    imageSrc: "/images/categories/footwear.webp",
    imageAlt: "Calzado reuso",
    titleAlign: "right",
    titlePosition: "center-right",
    row: "bottom",
    bottomColSpan: 2,
    aspect: "wide",
  },
  {
    id: "bolsos",
    title: "BOLSOS",
    href: "/productos?categoria=mujer-carteras",
    imageSrc: "/images/categories/bolsos.webp",
    imageAlt: "Bolsos y carteras reuso",
    row: "bottom",
    bottomColSpan: 1,
    aspect: "square",
  },
];
