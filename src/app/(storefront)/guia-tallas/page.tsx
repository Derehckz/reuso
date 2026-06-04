import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description: "Cómo elegir tu talla en REUSO — ropa reutilizada americana.",
};

const SIZE_SECTIONS: LegalSection[] = [
  {
    id: "general",
    title: "Tallas americanas",
    paragraphs: [
      "La mayoría de nuestras prendas usa tallaje US (S, M, L, XL o numérico según categoría).",
      "Revisa siempre la ficha del producto: indicamos medidas cuando están disponibles.",
    ],
  },
  {
    id: "calzado",
    title: "Calzado",
    list: [
      "Zapatillas y botas suelen venir en talla US.",
      "Si dudas entre dos tallas, prioriza la más grande en calzado deportivo.",
    ],
  },
  {
    id: "consejo",
    title: "Consejo",
    paragraphs: [
      "Por ser piezas únicas de segunda vida, no hay reposición de la misma talla. Si te queda justa, considera el cambio limitado según nuestras políticas.",
    ],
  },
];

export default function GuiaTallasPage() {
  return (
    <LegalPage
      title="Guía de tallas"
      subtitle="REUSO"
      sections={SIZE_SECTIONS}
    />
  );
}
