export type CategoryTile = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  /** Alineación del título en tiles anchos */
  titleAlign?: "left" | "right";
  row: "top" | "bottom";
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
    id: "ropa-deportiva",
    title: "ROPA DEPORTIVA",
    href: "/productos?categoria=ropa-deportiva&genero=UNISEX",
    imageSrc: "/images/categories/nino.webp",
    imageAlt: "Ropa deportiva reuso",
    row: "top",
  },
  {
    id: "carteras",
    title: "CARTERAS",
    href: "/productos?categoria=mujer-carteras",
    imageSrc: "/images/categories/carteras.webp",
    imageAlt: "Carteras reuso",
    row: "bottom",
  },
  {
    id: "zapatillas",
    title: "ZAPATILLAS",
    href: "/productos?categoria=mujer-zapatillas",
    imageSrc: "/images/categories/footwear.webp",
    imageAlt: "Zapatillas reuso",
    titleAlign: "right",
    row: "bottom",
  },
];
