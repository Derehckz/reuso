import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { StoreLocator } from "@/components/stores/store-locator";
import {
  STORE_CITY_COUNT,
  STORE_LOCATION_COUNT,
} from "@/lib/constants/store-locations";

export const metadata: Metadata = {
  title: "Tiendas",
  description:
    "Encuentra nuestras tiendas REUSO en Chile. Retira tu pedido gratis en la sucursal más cercana.",
};

export default function TiendasPage() {
  return (
    <Container className="section-editorial py-16 md:py-24">
      <h1 className="font-editorial text-center text-4xl text-foreground md:text-5xl">
        Nuestras tiendas
      </h1>
      <p className="text-body-muted mx-auto mt-3 max-w-lg text-center">
        {STORE_LOCATION_COUNT} puntos de retiro en {STORE_CITY_COUNT} ciudades.
        Selecciona una dirección para ver el mapa y obtener indicaciones en
        Google Maps.
      </p>

      <StoreLocator />
    </Container>
  );
}
