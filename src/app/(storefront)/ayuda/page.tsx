import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { AYUDA_SECTIONS } from "@/lib/constants/content-ayuda";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description: "Guías y soporte para comprar en REUSO.",
};

export default function AyudaPage() {
  return (
    <LegalPage
      title="Centro de ayuda"
      subtitle="REUSO"
      sections={AYUDA_SECTIONS}
    />
  );
}
