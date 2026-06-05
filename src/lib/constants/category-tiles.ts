export type CategoryTile = {
  id: string;
  title: string;
  /** Título en dos líneas (ej. FOOT + WEAR) */
  titleLines?: [string, string];
  href: string;
  imageSrc: string;
  imageAlt: string;
  titleAlign?: "left" | "right";
  row: "top" | "bottom";
  /** Columnas en fila inferior (grid de 4) */
  bottomColSpan?: 1 | 3;
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
    id: "polerones",
    title: "POLERONES",
    href: "/productos?categoria=mujer-polerones",
    imageSrc: "/images/categories/polerones.webp",
    imageAlt: "Polerones reuso",
    row: "top",
  },
  {
    id: "bolsos",
    title: "BOLSOS",
    href: "/productos?categoria=mujer-carteras",
    imageSrc: "/images/categories/bolsos.webp",
    imageAlt: "Bolsos y carteras reuso",
    row: "bottom",
    bottomColSpan: 1,
  },
  {
    id: "footwear",
    title: "FOOT WEAR",
    titleLines: ["FOOT", "WEAR"],
    href: "/productos?categoria=hombre-zapatillas",
    imageSrc: "/images/categories/footwear.webp",
    imageAlt: "Calzado reuso",
    titleAlign: "right",
    row: "bottom",
    bottomColSpan: 3,
  },
];
