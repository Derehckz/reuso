import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import {
  PRIVACIDAD_INTRO,
  PRIVACIDAD_SECTIONS,
} from "@/lib/constants/legal-privacidad";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de RE-USO (Comercial Frohlich SPA).",
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      subtitle="WWW.RE-USO.CL"
      intro={PRIVACIDAD_INTRO}
      sections={PRIVACIDAD_SECTIONS}
    />
  );
}
