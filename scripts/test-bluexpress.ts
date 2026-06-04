/**
 * Prueba BlueExpress / Bluexpress sin levantar la web.
 *
 * Uso:
 *   1. Completa BLUEXPRESS_* en .env
 *   2. npm run bluexpress:test
 *   3. npm run bluexpress:test -- --commune "Providencia" --region "Región Metropolitana de Santiago"
 */
import "dotenv/config";
import {
  getBluexpressApiUrl,
  getOriginAddress,
  getQuoteEndpoint,
  isBluexpressConfigured,
} from "../src/lib/bluexpress/config";
import { quoteShipping } from "../src/lib/bluexpress/quotes";
import { loadBlueExpressConfig } from "../src/modules/integrations/blueexpress";

const args = process.argv.slice(2);
function arg(name: string, fallback: string) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const testCommune = arg("--commune", "Providencia");
const testRegion = arg(
  "--region",
  "Región Metropolitana de Santiago",
);
const itemCount = Number(arg("--items", "2")) || 2;
const weightKg = Number(arg("--kg", "1")) || 1;

async function rawApiProbe() {
  const apiKey = process.env.BLUEXPRESS_API_KEY?.trim();
  const apiUrl = getBluexpressApiUrl();
  const path = getQuoteEndpoint();
  const accountId = process.env.BLUEXPRESS_ACCOUNT_ID?.trim();

  const originRegion =
    process.env.BLUEXPRESS_ORIGIN_REGION?.trim() ||
    "Región Metropolitana de Santiago";
  const originCommune =
    process.env.BLUEXPRESS_ORIGIN_COMMUNE?.trim() || "Santiago";
  const originCode =
    process.env.BLUEXPRESS_ORIGIN_REGION_CODE?.trim() || "RM";

  const body = {
    origin: {
      region: originRegion,
      region_code: originCode,
      commune: originCommune,
    },
    destination: {
      region: testRegion,
      region_code: "RM",
      commune: testCommune,
    },
    package: {
      weight_kg: weightKg,
      weight_unit: "KG",
      length_cm: 30,
      width_cm: 25,
      height_cm: 10,
      item_count: itemCount,
    },
    service_type: "EX",
    product_type: "P",
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (accountId) headers["X-Account-Id"] = accountId;

  const url = `${apiUrl}${path}`;
  console.log("\n--- Llamada directa a la API ---");
  console.log("POST", url);
  console.log("Body:", JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log("Status:", res.status, res.statusText);
  console.log("Response:", text.slice(0, 2000));

  if (!res.ok) {
    throw new Error(`API respondió ${res.status}`);
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text };
  }
}

async function main() {
  await loadBlueExpressConfig();

  console.log("=== Prueba BlueExpress (reuso) ===\n");

  console.log("Configuración:");
  console.log("  API_URL:", getBluexpressApiUrl());
  console.log("  QUOTE_PATH:", getQuoteEndpoint());
  console.log(
    "  API_KEY:",
    process.env.BLUEXPRESS_API_KEY?.trim()
      ? `sí (${process.env.BLUEXPRESS_API_KEY.trim().length} caracteres)`
      : "NO — agrega BLUEXPRESS_API_KEY en .env",
  );
  console.log(
    "  ACCOUNT_ID:",
    process.env.BLUEXPRESS_ACCOUNT_ID?.trim() || "(opcional)",
  );
  console.log(
    "  Origen:",
    `${process.env.BLUEXPRESS_ORIGIN_COMMUNE ?? "Santiago"}, ${process.env.BLUEXPRESS_ORIGIN_REGION ?? "RM"}`,
  );
  console.log("  Destino prueba:", `${testCommune}, ${testRegion}`);
  console.log("  Paquete:", `${weightKg} kg, ${itemCount} ítem(s)`);

  if (!isBluexpressConfigured()) {
    console.log(
      "\n❌ Falta BLUEXPRESS_API_KEY y/o BLUEXPRESS_API_URL en .env.",
    );
    console.log("\nCopia en .env (con tus credenciales reales):");
    console.log(`
BLUEXPRESS_API_KEY="tu-token"
BLUEXPRESS_API_URL="https://apigw.bluex.cl/api"
BLUEXPRESS_ACCOUNT_ID="tu-account-id"
BLUEXPRESS_QUOTE_PATH="/cross/v1/quotes"
`);
    process.exit(1);
  }

  try {
    const raw = await rawApiProbe();
    console.log("\n✅ API respondió OK (parseo manual arriba).");
    const price =
      (raw.price as number) ??
      (raw.total as number) ??
      (raw.amount as number);
    if (price != null) console.log("   Precio detectado:", price, "CLP");
  } catch (e) {
    console.log(
      "\n⚠️  La llamada directa falló:",
      e instanceof Error ? e.message : e,
    );
    console.log(
      "   Revisa URL, path, token o formato del body con Blue Express.",
    );
  }

  console.log("\n--- Cotización vía quoteShipping (como el checkout) ---");
  const origin = getOriginAddress();
  const quote = await quoteShipping({
    originRegion: origin.region,
    originCommune: origin.commune,
    destination: { region: testRegion, commune: testCommune },
    weightKg,
    itemCount,
  });

  console.log("  Fuente:", quote.source === "api" ? "✅ API BlueExpress" : "⚠️ FALLBACK local (sin API)");
  console.log("  Precio:", quote.price, quote.currency);
  console.log("  Días estimados:", quote.estimatedDays);
  console.log("  Zona:", quote.zone);
  console.log("  Código servicio:", quote.serviceCode);

  if (quote.source !== "api") {
    console.log(
      "\n⚠️  El checkout usará tarifas estimadas hasta que la API responda bien.",
    );
    process.exit(2);
  }

  console.log("\n✅ Listo: en checkout deberías ver el mismo monto (fuente API).");
  console.log("   Prueba: http://localhost:3000/checkout con región + comuna.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
