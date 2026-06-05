export type StoreLocation = {
  id: string;
  /** Calle y número */
  address: string;
  city: string;
  /** Foto de fachada; por defecto imagen referencial hasta cargar una por tienda */
  imageSrc?: string;
};

/** Horario de atención (todas las sucursales). */
export const STORE_HOURS = {
  weekdays: "Lunes a sábado: 10:30 – 19:30",
  sunday: "Domingo: 11:00 – 18:30",
} as const;

/** Imagen referencial de fachada hasta tener foto por sucursal. */
export const DEFAULT_STORE_IMAGE = "/images/tiendas/ejemplo-tienda.webp";

export type StoreCityGroup = {
  city: string;
  locations: StoreLocation[];
};

const osorno: StoreLocation[] = [
  { id: "osorno-patricio-lynch-1800", address: "Patricio Lynch 1800", city: "Osorno" },
  { id: "osorno-balmaceda-681", address: "Balmaceda 681", city: "Osorno" },
  { id: "osorno-patricio-lynch-1622", address: "Patricio Lynch 1622", city: "Osorno" },
  { id: "osorno-balmaceda-685", address: "Balmaceda 685", city: "Osorno" },
  { id: "osorno-lastarria-644", address: "Lastarria 644", city: "Osorno" },
  { id: "osorno-lastarria-630", address: "Lastarria 630", city: "Osorno" },
  { id: "osorno-patricio-lynch-1700", address: "Patricio Lynch 1700", city: "Osorno" },
  { id: "osorno-eleuterio-ramirez-514", address: "Eleuterio Ramírez 514", city: "Osorno" },
  { id: "osorno-patricio-lynch-1732", address: "Patricio Lynch 1732", city: "Osorno" },
  { id: "osorno-eleuterio-ramirez-663", address: "Eleuterio Ramírez 663", city: "Osorno" },
  { id: "osorno-patricio-lynch-1655", address: "Patricio Lynch 1655", city: "Osorno" },
  { id: "osorno-patricio-lynch-1814", address: "Patricio Lynch 1814", city: "Osorno" },
];

const valdivia: StoreLocation[] = [
  { id: "valdivia-ramon-picarte-399", address: "Calle Ramón Picarte 399", city: "Valdivia" },
  { id: "valdivia-arauco-381", address: "Calle Arauco 381", city: "Valdivia" },
  { id: "valdivia-ohiggins-442", address: "Bernardo O'Higgins 442", city: "Valdivia" },
];

export const STORE_CITY_GROUPS: StoreCityGroup[] = [
  { city: "Osorno", locations: osorno },
  { city: "Valdivia", locations: valdivia },
  {
    city: "Rancagua",
    locations: [{ id: "rancagua-paseo-independencia-762", address: "Paseo Independencia 762", city: "Rancagua" }],
  },
  {
    city: "Concepción",
    locations: [
      { id: "concepcion-anibal-pinto-613", address: "Aníbal Pinto 613", city: "Concepción" },
      { id: "concepcion-anibal-pinto-557", address: "Aníbal Pinto 557", city: "Concepción" },
    ],
  },
  {
    city: "Temuco",
    locations: [
      { id: "temuco-diego-portales-1042", address: "Calle Diego Portales 1042", city: "Temuco" },
      { id: "temuco-diego-portales-936", address: "Calle Diego Portales 936", city: "Temuco" },
      { id: "temuco-arturo-prat-530", address: "Calle Arturo Prat 530", city: "Temuco" },
    ],
  },
  {
    city: "Talca",
    locations: [{ id: "talca-uno-sur-1246", address: "Uno sur 1246", city: "Talca" }],
  },
  {
    city: "Puerto Montt",
    locations: [{ id: "puerto-montt-antonio-varas-650", address: "Antonio Varas 650", city: "Puerto Montt" }],
  },
  {
    city: "Los Ángeles",
    locations: [{ id: "los-angeles-colon-523", address: "Colón 523", city: "Los Ángeles" }],
  },
  {
    city: "Viña del Mar",
    locations: [{ id: "vina-valparaiso-532", address: "Av. Valparaíso 532", city: "Viña del Mar" }],
  },
  {
    city: "Río Bueno",
    locations: [{ id: "rio-bueno-comercio-430", address: "Comercio 430", city: "Río Bueno" }],
  },
  {
    city: "Castro",
    locations: [{ id: "castro-san-martin-471", address: "San Martín 471", city: "Castro" }],
  },
  {
    city: "Panguipulli",
    locations: [
      {
        id: "panguipulli-ohiggins-484",
        address: "Bernardo O'Higgins 484",
        city: "Panguipulli",
      },
    ],
  },
];

export function storeImageSrc(location: StoreLocation): string {
  return location.imageSrc ?? DEFAULT_STORE_IMAGE;
}

export const ALL_STORE_LOCATIONS: StoreLocation[] = STORE_CITY_GROUPS.flatMap(
  (group) => group.locations,
);

export const STORE_LOCATION_COUNT = ALL_STORE_LOCATIONS.length;
export const STORE_CITY_COUNT = STORE_CITY_GROUPS.length;

/** Texto completo para búsqueda en mapas */
export function formatStoreQuery(location: StoreLocation): string {
  return `${location.address}, ${location.city}, Chile`;
}

export function googleMapsSearchUrl(location: StoreLocation): string {
  const query = encodeURIComponent(formatStoreQuery(location));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function googleMapsDirectionsUrl(location: StoreLocation): string {
  const destination = encodeURIComponent(formatStoreQuery(location));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Embed sin API key (vista previa en sitio) */
export function googleMapsEmbedUrl(location: StoreLocation): string {
  const q = encodeURIComponent(formatStoreQuery(location));
  return `https://maps.google.com/maps?q=${q}&hl=es&z=17&output=embed`;
}
