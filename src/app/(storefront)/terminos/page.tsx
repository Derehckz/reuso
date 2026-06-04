import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import {
  TERMINOS_INTRO,
  TERMINOS_SECTIONS,
} from "@/lib/constants/legal-terminos";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones generales de compra en RE-USO (Comercial Frohlich SPA). Ropa de segunda mano, despacho, retracto y garantía voluntaria.",
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      subtitle="WWW.RE-USO.CL"
      intro={TERMINOS_INTRO}
      sections={TERMINOS_SECTIONS}
      contactEmail="contacto@re-uso.cl"
    />
  );
}
