import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { ENVIOS_INTRO, ENVIOS_SECTIONS } from "@/lib/constants/legal-envios";

export const metadata: Metadata = {
  title: "Política de envío",
  description:
    "Costos, plazos y condiciones de despacho y retiro en tienda de RE-USO en Chile.",
  robots: { index: true, follow: true },
};

export default function EnviosPage() {
  return (
    <LegalPage
      title="Política de envío"
      subtitle="WWW.RE-USO.CL"
      intro={ENVIOS_INTRO}
      sections={ENVIOS_SECTIONS}
    />
  );
}
