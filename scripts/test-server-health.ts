/**
 * Verificación de salud del servidor (DB, env, Mercado Pago, webhook, app).
 *
 * Uso en VPS:
 *   cd /var/www/reuso
 *   npm run healthcheck
 *
 * Opciones:
 *   --url https://reuso.dpcoding.cl   (sobrescribe NEXT_PUBLIC_APP_URL para probar webhook)
 *   --skip-mp                         (omitir pruebas Mercado Pago)
 *   --skip-webhook                    (no hacer HTTP al endpoint webhook)
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  createCheckoutPreference,
  isMercadoPagoConfigured,
  isWebhookMisconfiguredInProduction,
  resetMercadoPagoClient,
} from "../src/lib/mercadopago";
import {
  getResolvedMercadoPagoConfig,
  loadMercadoPagoConfig,
} from "../src/modules/integrations/mercadopago";
import { isBluexpressConfigured } from "../src/lib/bluexpress/config";
import { loadBlueExpressConfig } from "../src/modules/integrations/blueexpress";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
  critical?: boolean;
};

const args = process.argv.slice(2);

function arg(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
}

const flag = (name: string) => args.includes(name);
const overrideAppUrl = arg("--url");
const skipMp = flag("--skip-mp");
const skipWebhook = flag("--skip-webhook");

function maskSecret(value: string | null | undefined): string {
  if (!value?.trim()) return "(vacío)";
  const v = value.trim();
  if (v.length <= 8) return "****";
  return `${v.slice(0, 6)}…${v.slice(-4)} (${v.length} chars)`;
}

function tokenKind(token: string | null | undefined): "TEST" | "APP_USR" | "otro" | "vacío" {
  if (!token?.trim()) return "vacío";
  if (token.startsWith("TEST-")) return "TEST";
  if (token.startsWith("APP_USR-")) return "APP_USR";
  return "otro";
}

function printResults(results: CheckResult[]) {
  console.log("\n--- Resultados ---\n");
  for (const r of results) {
    const icon = r.ok ? "✅" : r.critical === false ? "⚠️ " : "❌";
    console.log(`${icon} ${r.name}`);
    console.log(`   ${r.detail}\n`);
  }
}

async function checkDatabase(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      name: "PostgreSQL",
      ok: true,
      detail: "Conexión OK",
      critical: true,
    });
  } catch (error) {
    results.push({
      name: "PostgreSQL",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: true,
    });
    return results;
  }

  try {
    const [products, orders, users] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);
    results.push({
      name: "Datos en BD",
      ok: products > 0,
      detail: `${products} productos · ${orders} órdenes · ${users} usuarios`,
      critical: false,
    });
  } catch (error) {
    results.push({
      name: "Datos en BD",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: false,
    });
  }

  return results;
}

function checkEnv(): CheckResult[] {
  const appUrl = overrideAppUrl ?? process.env.NEXT_PUBLIC_APP_URL?.trim();
  const authUrl = process.env.AUTH_URL?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();
  const nodeEnv = process.env.NODE_ENV ?? "development";

  const results: CheckResult[] = [];

  results.push({
    name: "NODE_ENV",
    ok: true,
    detail: nodeEnv,
    critical: false,
  });

  results.push({
    name: "NEXT_PUBLIC_APP_URL",
    ok: Boolean(appUrl?.startsWith("http")),
    detail: appUrl ?? "NO configurada — necesaria para MP y webhooks",
    critical: true,
  });

  results.push({
    name: "AUTH_URL",
    ok: !authUrl || authUrl === appUrl,
    detail: authUrl
      ? authUrl === appUrl
        ? `OK (${authUrl})`
        : `Distinta de APP_URL: ${authUrl} vs ${appUrl}`
      : "no configurada (usa APP_URL)",
    critical: false,
  });

  results.push({
    name: "AUTH_SECRET",
    ok: Boolean(authSecret && authSecret.length >= 16),
    detail: authSecret ? `configurado (${authSecret.length} chars)` : "NO configurado",
    critical: true,
  });

  return results;
}

async function checkMercadoPago(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  await loadMercadoPagoConfig();
  resetMercadoPagoClient();

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? null;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY?.trim() ?? null;
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() ?? null;
  const envVar = process.env.MERCADOPAGO_ENV?.trim() ?? "(no definido)";

  const kind = tokenKind(accessToken);

  results.push({
    name: "Mercado Pago — Access Token",
    ok: Boolean(accessToken),
    detail: accessToken
      ? `tipo ${kind} · ${maskSecret(accessToken)}`
      : "MERCADOPAGO_ACCESS_TOKEN vacío",
    critical: true,
  });

  if (!accessToken) return results;

  const effectiveEnv = getResolvedMercadoPagoConfig().environment;

  results.push({
    name: "Mercado Pago — entorno efectivo",
    ok: true,
    detail: `${effectiveEnv} · MERCADOPAGO_ENV=${envVar} · token ${kind}`,
    critical: true,
  });

  if (kind === "TEST" && envVar === "production") {
    results.push({
      name: "Mercado Pago — MERCADOPAGO_ENV",
      ok: false,
      detail: "Token TEST- con MERCADOPAGO_ENV=production → usa sandbox",
      critical: false,
    });
  }

  if (kind === "APP_USR" && envVar === "production") {
    results.push({
      name: "Mercado Pago — credenciales de prueba Chile",
      ok: true,
      detail:
        "Si users/me muestra TESTUSER…, usa MERCADOPAGO_ENV=sandbox aunque el token sea APP_USR-",
      critical: false,
    });
  }

  results.push({
    name: "Mercado Pago — Public Key",
    ok: Boolean(publicKey),
    detail: publicKey
      ? `tipo ${tokenKind(publicKey)} · ${maskSecret(publicKey)}`
      : "opcional para Checkout Pro",
    critical: false,
  });

  const webhookRequired = process.env.NODE_ENV === "production";
  results.push({
    name: "Mercado Pago — Webhook Secret",
    ok: webhookRequired ? Boolean(webhookSecret) : true,
    detail: webhookSecret
      ? maskSecret(webhookSecret)
      : webhookRequired
        ? "Obligatorio en producción (webhook responde 503)"
        : "vacío (aceptable en desarrollo local)",
    critical: webhookRequired,
  });

  if (isWebhookMisconfiguredInProduction()) {
    results.push({
      name: "Mercado Pago — webhook en producción",
      ok: false,
      detail: "Falta MERCADOPAGO_WEBHOOK_SECRET",
      critical: true,
    });
  }

  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = (await res.json().catch(() => ({}))) as {
      id?: number;
      nickname?: string;
      message?: string;
    };

    const nickname = body.nickname ?? "";
    const isTestSeller = /testuser/i.test(nickname);

    results.push({
      name: "Mercado Pago — API (users/me)",
      ok: res.ok,
      detail: res.ok
        ? `Cuenta MP id=${body.id ?? "?"} · ${nickname || "OK"}`
        : `HTTP ${res.status}: ${body.message ?? JSON.stringify(body).slice(0, 120)}`,
      critical: true,
    });

    if (res.ok && isTestSeller && effectiveEnv !== "sandbox") {
      results.push({
        name: "Mercado Pago — vendedor de prueba",
        ok: false,
        detail:
          "Cuenta TESTUSER con entorno production → pon MERCADOPAGO_ENV=sandbox en .env",
        critical: true,
      });
    }
  } catch (error) {
    results.push({
      name: "Mercado Pago — API (users/me)",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: true,
    });
  }

  if (!isMercadoPagoConfigured()) {
    results.push({
      name: "Mercado Pago — checkout",
      ok: false,
      detail: "Integración no lista (falta token)",
      critical: true,
    });
    return results;
  }

  try {
    const preference = await createCheckoutPreference({
      orderId: `healthcheck-${Date.now()}`,
      orderNumber: `HC-${Date.now().toString(36).toUpperCase()}`,
      items: [
        {
          id: "healthcheck",
          title: "Prueba healthcheck reuso",
          quantity: 1,
          unit_price: 1000,
        },
      ],
      payerEmail: "test_user_123456@testuser.com",
      payerName: "Healthcheck",
      totalAmount: 1000,
    });

    const hasUrl = Boolean(preference.checkoutUrl);
    results.push({
      name: "Mercado Pago — preferencia de prueba",
      ok: hasUrl,
      detail: hasUrl
        ? `OK · entorno ${preference.environment} · id ${preference.preferenceId ?? "?"}`
        : "No se obtuvo URL de checkout",
      critical: true,
    });

    if (hasUrl && preference.environment === "sandbox") {
      results.push({
        name: "Mercado Pago — pago sandbox",
        ok: true,
        detail:
          "En sandbox paga con USUARIO DE PRUEBA del panel MP (no tu cuenta real) + tarjeta de prueba",
        critical: false,
      });
    }
  } catch (error) {
    results.push({
      name: "Mercado Pago — preferencia de prueba",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: true,
    });
  }

  return results;
}

async function checkWebhook(appUrl: string | undefined): Promise<CheckResult> {
  if (!appUrl) {
    return {
      name: "Webhook HTTP",
      ok: false,
      detail: "Sin NEXT_PUBLIC_APP_URL",
      critical: true,
    };
  }

  const url = `${appUrl.replace(/\/$/, "")}/api/webhooks/mercadopago`;

  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    let parsed: { received?: boolean; error?: string } = {};
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      /* ignore */
    }

    const ok = res.ok && parsed.received === true && !parsed.error;

    return {
      name: "Webhook HTTP",
      ok,
      detail: ok
        ? `GET ${url} → ${res.status} OK`
        : `GET ${url} → ${res.status} ${text.slice(0, 120)}`,
      critical: true,
    };
  } catch (error) {
    return {
      name: "Webhook HTTP",
      ok: false,
      detail: `${url} — ${error instanceof Error ? error.message : String(error)}`,
      critical: true,
    };
  }
}

async function checkBlueExpress(): Promise<CheckResult> {
  try {
    await loadBlueExpressConfig();
    const ok = isBluexpressConfigured();
    return {
      name: "Blue Express",
      ok,
      detail: ok
        ? "API key configurada (prueba completa: npm run bluexpress:test)"
        : "No configurado — checkout usa tarifas estimadas",
      critical: false,
    };
  } catch (error) {
    return {
      name: "Blue Express",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: false,
    };
  }
}

async function checkAppHttp(appUrl: string | undefined): Promise<CheckResult> {
  if (!appUrl) {
    return {
      name: "App HTTP",
      ok: false,
      detail: "Sin URL pública",
      critical: false,
    };
  }

  try {
    const res = await fetch(appUrl, { method: "GET", redirect: "follow" });
    return {
      name: "App HTTP",
      ok: res.ok,
      detail: `GET ${appUrl} → ${res.status}`,
      critical: false,
    };
  } catch (error) {
    return {
      name: "App HTTP",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      critical: false,
    };
  }
}

async function main() {
  console.log("=== Healthcheck reuso ===\n");
  console.log(`Fecha: ${new Date().toISOString()}`);

  const appUrl = overrideAppUrl ?? process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (overrideAppUrl) {
    process.env.NEXT_PUBLIC_APP_URL = overrideAppUrl;
  }

  const results: CheckResult[] = [];

  results.push(...checkEnv());
  results.push(...(await checkDatabase()));

  if (!skipMp) {
    results.push(...(await checkMercadoPago()));
  }

  if (!skipWebhook && appUrl) {
    results.push(await checkWebhook(appUrl));
  }

  results.push(await checkAppHttp(appUrl));
  results.push(await checkBlueExpress());

  printResults(results);

  const criticalFailed = results.some((r) => r.critical !== false && !r.ok);
  const warnings = results.some((r) => r.critical === false && !r.ok);

  if (criticalFailed) {
    console.log("❌ Hay fallos críticos. Revisa .env y pm2 restart reuso --update-env\n");
    process.exit(1);
  }

  if (warnings) {
    console.log("⚠️  Todo lo crítico OK; hay advertencias opcionales.\n");
    process.exit(2);
  }

  console.log("✅ Servidor listo para checkout y webhooks.\n");
  console.log("Prueba manual: agrega al carrito → /checkout → paga en MP.\n");
  if (tokenKind(process.env.MERCADOPAGO_ACCESS_TOKEN) === "TEST") {
    console.log(
      "Sandbox: inicia sesión en MP con un usuario COMPRADOR de prueba del panel developers.\n",
    );
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
