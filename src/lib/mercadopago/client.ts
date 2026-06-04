import { MercadoPagoConfig } from "mercadopago";
import {
  getMercadoPagoAccessToken,
  getMercadoPagoEnvironment,
} from "./config";

let cachedClient: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (cachedClient) return cachedClient;

  const accessToken = getMercadoPagoAccessToken();
  const env = getMercadoPagoEnvironment();

  cachedClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 15_000 },
  });

  if (process.env.NODE_ENV === "development") {
    console.info(`[MercadoPago] Cliente inicializado (${env})`);
  }

  return cachedClient;
}

/** Limpia caché (útil en tests). */
export function resetMercadoPagoClient(): void {
  cachedClient = null;
}
