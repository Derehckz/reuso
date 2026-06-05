"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
import {
  ALL_STORE_LOCATIONS,
  STORE_CITY_GROUPS,
  STORE_CITY_COUNT,
  STORE_HOURS,
  STORE_LOCATION_COUNT,
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
  storeImageSrc,
  type StoreLocation,
} from "@/lib/constants/store-locations";
import { cn } from "@/lib/utils";

const DEFAULT_LOCATION = ALL_STORE_LOCATIONS[0]!;

export function StoreLocator() {
  const [selectedCity, setSelectedCity] = useState<string | "all">("all");
  const [selected, setSelected] = useState<StoreLocation>(DEFAULT_LOCATION);

  const visibleGroups = useMemo(() => {
    if (selectedCity === "all") return STORE_CITY_GROUPS;
    return STORE_CITY_GROUPS.filter((g) => g.city === selectedCity);
  }, [selectedCity]);

  const visibleCount = useMemo(
    () => visibleGroups.reduce((n, g) => n + g.locations.length, 0),
    [visibleGroups],
  );

  function selectLocation(location: StoreLocation) {
    setSelected(location);
    setSelectedCity(location.city);
  }

  return (
    <div className="mt-12">
      <div className="mx-auto mb-10 flex max-w-md flex-col gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-700">
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 shrink-0 text-brand-green" aria-hidden />
          <span className="text-label-sm uppercase tracking-widest">Horario</span>
        </div>
        <p>{STORE_HOURS.weekdays}</p>
        <p>{STORE_HOURS.sunday}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterChip
          active={selectedCity === "all"}
          onClick={() => setSelectedCity("all")}
        >
          Todas ({STORE_LOCATION_COUNT})
        </FilterChip>
        {STORE_CITY_GROUPS.map((group) => (
          <FilterChip
            key={group.city}
            active={selectedCity === group.city}
            onClick={() => {
              setSelectedCity(group.city);
              setSelected(group.locations[0]!);
            }}
          >
            {group.city} ({group.locations.length})
          </FilterChip>
        ))}
      </div>

      <p className="text-body-muted mt-6 text-center text-sm">
        {visibleCount} {visibleCount === 1 ? "tienda" : "tiendas"} en{" "}
        {selectedCity === "all" ? `${STORE_CITY_COUNT} ciudades` : selectedCity}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
        <div className="max-h-[32rem] overflow-y-auto rounded-sm border border-neutral-200 bg-white pr-1 lg:max-h-[36rem] lg:sticky lg:top-24">
          {visibleGroups.map((group) => (
            <section key={group.city} className="border-b border-neutral-100 last:border-0">
              <h2 className="text-label sticky top-0 z-10 bg-neutral-50/95 px-4 py-3 backdrop-blur-sm">
                {group.city}
              </h2>
              <ul>
                {group.locations.map((location) => {
                  const isActive = selected.id === location.id;
                  const image = storeImageSrc(location);
                  return (
                    <li key={location.id}>
                      <button
                        type="button"
                        onClick={() => selectLocation(location)}
                        className={cn(
                          "flex w-full gap-3 border-l-2 px-3 py-3 text-left transition-colors",
                          isActive
                            ? "border-brand-orange bg-brand-beige/30"
                            : "border-transparent hover:bg-neutral-50",
                        )}
                      >
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100">
                          <Image
                            src={image}
                            alt={`Fachada ${location.address}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-1.5">
                            <MapPin
                              className={cn(
                                "mt-0.5 h-3.5 w-3.5 shrink-0",
                                isActive ? "text-brand-orange" : "text-neutral-400",
                              )}
                              strokeWidth={1.5}
                            />
                            <span className="block text-sm font-medium text-foreground">
                              {location.address}
                            </span>
                          </span>
                          <span className="mt-0.5 block pl-5 text-xs text-neutral-500">
                            {location.city}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-sm border border-neutral-200 bg-neutral-900">
            <div className="relative aspect-[16/10] w-full">
              <Image
                key={selected.id}
                src={storeImageSrc(selected)}
                alt={`Tienda REUSO — ${selected.address}, ${selected.city}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="font-editorial text-2xl md:text-3xl">{selected.address}</p>
                <p className="mt-1 text-sm text-white/85">{selected.city}, Chile</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100">
            <iframe
              key={selected.id}
              title={`Mapa — ${selected.address}, ${selected.city}`}
              src={googleMapsEmbedUrl(selected)}
              className="aspect-[4/3] w-full min-h-[240px] border-0 md:min-h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-start gap-2 text-sm text-neutral-700">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
              <div>
                <p>{STORE_HOURS.weekdays}</p>
                <p>{STORE_HOURS.sunday}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={googleMapsDirectionsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-brand-orange px-6 text-label-sm uppercase tracking-widest text-white transition-all hover:bg-brand-orange-hover"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                Cómo llegar
              </a>
              <a
                href={googleMapsSearchUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-neutral-900 bg-transparent px-6 text-label-sm uppercase tracking-widest text-foreground transition-all hover:bg-neutral-900 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-label-sm transition-colors",
        active
          ? "border-brand-green bg-brand-green text-white"
          : "border-neutral-200 bg-white text-foreground hover:border-neutral-400",
      )}
    >
      {children}
    </button>
  );
}
