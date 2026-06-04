import type { BlueExpressStoredConfig } from "./schema";

export const DEFAULT_BLUEEXPRESS_STORED: BlueExpressStoredConfig = {
  enabled: true,
  apiUrl: "https://apigw.bluex.cl/api",
  quotePath: "/cross/v1/quotes",
  trackingPath: "/cross/v1/tracking",
  labelPath: "/cross/v1/shipments/labels",
  originRegion: "Región Metropolitana de Santiago",
  originCommune: "Santiago",
  originRegionCode: "RM",
  originName: "reuso",
  originPhone: "+56900000000",
  originStreet: "Santiago",
};
