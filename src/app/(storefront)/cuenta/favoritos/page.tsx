import type { Metadata } from "next";
import { FavoritesPageContent } from "@/components/account/favorites-page-content";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description: "Tus piezas guardadas en REUSO — moda reutilizada premium.",
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return (
    <div>
      <h2 className="text-label text-foreground">Favoritos</h2>
      <p className="text-body-muted mt-1 text-sm">
        Piezas que guardaste para más tarde.
      </p>
      <div className="mt-8">
        <FavoritesPageContent />
      </div>
    </div>
  );
}
