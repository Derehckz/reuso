export {
  isBluexpressConfigured,
  getBluexpressPickupContact,
  getOriginAddress,
  getBluexpressApiUrl,
  getQuoteEndpoint,
  getTrackingEndpoint,
  getLabelEndpoint,
} from "./config";

export {
  quoteShipping,
} from "./quotes";

export {
  trackShipment,
  shipmentStatusLabels,
} from "./tracking";

export {
  buildLabelPayload,
  createShippingLabel,
} from "./labels";

export {
  calculatePackageWeight,
  estimatePackageDimensions,
  roundWeightUp,
} from "./weight";

export {
  resolveShippingZone,
  getRegionCode,
} from "./communes";

export {
  calculateZonePrice,
  buildFallbackQuote,
  getZoneRateInfo,
} from "./rates";

export { BluexpressError, toBluexpressError } from "./errors";

export type {
  ShippingQuote,
  ShippingQuoteRequest,
  ShippingAddressInput,
  ShippingZoneType,
  TrackingResult,
  TrackingEvent,
  CreateLabelRequest,
  CreateLabelResult,
  LabelAddress,
  LabelPackage,
  PackageDimensions,
} from "./types";
