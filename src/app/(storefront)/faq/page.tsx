import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { FAQ_SECTIONS } from "@/lib/constants/content-faq";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas sobre compras, pagos y envíos en REUSO.",
};

export default function FaqPage() {
  return (
    <LegalPage
      title="Preguntas frecuentes"
      subtitle="Centro de ayuda"
      sections={FAQ_SECTIONS}
    />
  );
}
