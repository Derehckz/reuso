import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import {
  CAMBIOS_INTRO,
  CAMBIOS_SECTIONS,
} from "@/lib/constants/legal-cambios";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description:
    "Política de retracto, devoluciones y garantía voluntaria de RE-USO para compras en línea.",
  robots: { index: true, follow: true },
};

export default function CambiosDevolucionesPage() {
  return (
    <LegalPage
      title="Cambios y devoluciones"
      subtitle="WWW.RE-USO.CL"
      intro={CAMBIOS_INTRO}
      sections={CAMBIOS_SECTIONS}
    />
  );
}
