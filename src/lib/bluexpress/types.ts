export type ShippingZoneType =
  | "metro"
  | "central"
  | "north"
  | "south"
  | "extreme";

export type PackageDimensions = {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type ShippingAddressInput = {
  region: string;
  commune: string;
  street?: string;
  number?: string;
  postalCode?: string;
};

export type ShippingQuoteRequest = {
  originRegion: string;
  originCommune: string;
  destination: ShippingAddressInput;
  weightKg: number;
  dimensions?: PackageDimensions;
  itemCount?: number;
};

export type ShippingQuote = {
  price: number;
  estimatedDays: number;
  serviceCode: string;
  zone: ShippingZoneType;
  weightKg: number;
  commune: string;
  region: string;
  source: "api" | "fallback" | "database";
  currency: "CLP";
};

export type TrackingEvent = {
  date: string;
  status: string;
  description: string;
  location?: string;
};

export type TrackingResult = {
  trackingNumber: string;
  carrier: string;
  status: string;
  statusLabel: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  deliveredAt?: string;
};

export type LabelAddress = {
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  number?: string;
  apartment?: string;
  commune: string;
  region: string;
  regionCode?: string;
  communeCode?: string;
};

export type LabelPackage = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity: number;
};

export type CreateLabelRequest = {
  orderId: string;
  orderNumber: string;
  serviceCode: string;
  pickup: LabelAddress;
  dropoff: LabelAddress;
  packages: LabelPackage[];
  references?: string[];
};

export type CreateLabelResult = {
  success: boolean;
  trackingNumber?: string;
  externalId?: string;
  labelUrl?: string;
  labelPdfBase64?: string;
  rawResponse?: unknown;
  errorCode?: string;
  message?: string;
};
