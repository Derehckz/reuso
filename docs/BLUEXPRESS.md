# Bluexpress / Blue Express

Integración logística para cotización, seguimiento y generación de etiquetas.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `BLUEXPRESS_API_URL` | Base API (default: `https://apigw.bluex.cl/api`) |
| `BLUEXPRESS_API_KEY` | Bearer token / API key de agencia |
| `BLUEXPRESS_ACCOUNT_ID` | ID cuenta / company para etiquetas |
| `BLUEXPRESS_*_PATH` | Rutas opcionales quote / tracking / labels |
| `BLUEXPRESS_ORIGIN_*` | Dirección de origen del despacho |

Sin credenciales API se usan **tarifas fallback** por zona y peso.

## Cotización automática

1. **Peso**: `0.35 kg` por prenda + empaque, mínimo `0.5 kg`, redondeo a `0.5 kg`.
2. **Zona**: región + comuna → `metro` | `central` | `north` | `south` | `extreme`.
3. **Precio**: base por zona + recargo cada 500 g adicionales.
4. **API**: si hay credenciales, `POST /cross/v1/quotes` (configurable).
5. **DB**: tabla `shipping_zones` puede sobreescribir precio base por `regionCode`.

## Flujo en checkout

```
Comuna + región + ítems del carrito
  → quoteForCheckout()
  → precio + días estimados en UI
  → al crear orden: Shipment (PENDING) con quote en rawResponse
  → pago aprobado: labelStatus = ready
```

## Seguimiento

- Página pública: `/seguimiento?pedido=RU-...`
- Server Action: `trackShipmentByCode`
- Consulta API Bluexpress o estado local si aún no hay tracking

## Etiquetas (preparado)

`generateLabelForOrder(orderId)` en `shipping.service.ts`:

- Construye payload con `buildLabelPayload()` (formato agencias Blue Express)
- Llama `createShippingLabel()` → guarda `trackingNumber`, `labelUrl`, status `LABEL_CREATED`
- Sin API: devuelve payload en `rawResponse` para generación manual

Uso admin (Server Action):

```typescript
import { createShipmentLabel } from "@/server/actions/admin/shipping.actions";
await createShipmentLabel(orderId); // requiere sesión admin
```

## Estructura de código

```
src/lib/bluexpress/
  quotes.ts      — cotización API + fallback
  rates.ts       — tarifas por zona/peso
  communes.ts    — resolución comuna → zona
  weight.ts      — cálculo peso/dimensiones
  tracking.ts    — seguimiento
  labels.ts      — generación etiquetas
src/server/services/shipping.service.ts
src/server/actions/shipping.actions.ts
```

## Probar con tus credenciales (local)

1. En `.env` (ver `.env.example`):

```env
BLUEXPRESS_API_KEY="tu-bearer-token"
BLUEXPRESS_API_URL="https://apigw.bluex.cl/api"
BLUEXPRESS_ACCOUNT_ID="id-cuenta-si-aplica"
# Si Blue te dio otra ruta, ajústala:
# BLUEXPRESS_QUOTE_PATH="/cross/v1/quotes"
```

2. Terminal:

```bash
npm run bluexpress:test
```

3. Si sale **`Fuente: API BlueExpress`** → el checkout usará la API.  
   Si sale **`FALLBACK local`** → la API falló (revisa token, URL o path en la consola).

4. Prueba en la tienda: carrito con productos → `/checkout` → elige región y comuna → debe cotizar envío.

Comuna/region custom:

```bash
npm run bluexpress:test -- --commune "Valparaíso" --region "Región de Valparaíso"
```

## ¿Dónde encuentro esto en mi cuenta Blue Express?

Hay **dos productos distintos**. La tienda reuso usa la **API de agencias / B2B**, no solo la web donde compras etiquetas sueltas.

### Lo que NO suele servir para reuso

| Portal | URL típica | Qué ves |
|--------|------------|---------|
| **Plataforma de envíos** (emprendedor) | [blue.cl](https://www.blue.cl/) → cotizar / generar etiqueta | Usuario, contraseña, saldo, puntos Blue. **No aparece un “API key”** para pegar en `.env`. |
| App / panel solo operativo | Misma cuenta de envíos manuales | Sirve para despachar a mano, no para cotizar automático en tu checkout. |

Si solo tienes esa cuenta, las credenciales de API las debe **habilitar comercial** (plan ecommerce con integración API).

### Lo que SÍ necesitas (integración API / agencia)

Blue documenta la integración técnica en la **plataforma B2B de Bluex** y plugins de agencia:

- Documentación plugins: [plugins.bluex.cl](https://plugins.bluex.cl/) (Pricing, regiones/comunas).
- API base que usa reuso: `https://apigw.bluex.cl/api` (cotización, etiquetas, tracking según contrato).

En contratos **agencia / ecommerce con API**, el ejecutivo o el panel B2B suelen entregar algo equivalente a:

| Te lo puede nombrar Blue | Variable en reuso `.env` |
|--------------------------|---------------------------|
| Token / API key / Bearer | `BLUEXPRESS_API_KEY` |
| Company ID / cuenta / `companyId` | `BLUEXPRESS_ACCOUNT_ID` |
| URL base API | `BLUEXPRESS_API_URL` (casi siempre `https://apigw.bluex.cl/api`) |
| Ruta de cotización (si la customizan) | `BLUEXPRESS_QUOTE_PATH` |

En documentación antigua de agencias también aparecen **`client_id`**, **`account`** y **`password`** dentro de `carrier_information` (no es el mismo formato que nuestro Bearer). Si Blue te dio solo esos tres, **pregunta por token Bearer para API REST** o documentación del endpoint de **quotes** — reuso hoy envía `Authorization: Bearer …`.

### Dónde mirar paso a paso

1. **Correo o contrato** cuando contrataste “integración API” o “servicio agencias” → ahí suele venir URL + credenciales.
2. **Ejecutivo comercial Blue Express** — WhatsApp en [blue.cl](https://www.blue.cl/) (+56 9 8953 7233 en sitio público) o tu ejecutivo asignado. Pide explícitamente:
   - *“Credenciales API REST para cotización en checkout (apigw.bluex.cl), ambiente prueba o producción.”*
3. **Panel B2B Bluex** (si te dieron acceso aparte del portal emprendedor) → sección integraciones / API / WooCommerce. Los plugins oficiales configuran cuenta en **WooCommerce → Ajustes → Envíos → Bluex** ([plugins.bluex.cl](https://plugins.bluex.cl/)); las mismas credenciales de **cuenta cliente Bluex** alimentan Pricing.
4. Si tienes **WooCommerce + plugin Bluex Pricing**, revisa en WordPress la configuración del plugin; a veces ahí está el ID de cuenta (no siempre el token completo).

### Si aún no tienes API habilitada

En [Integra tu ecommerce con Blue Express](https://www.blue.cl/emprendedores/plataforma-ecommerce) el plan con **“Integración vía API”** y **“Atención personalizada”** es el camino habitual para volumen ecommerce — no el plan solo plugin básico.

Mientras tanto, reuso puede cotizar con **tarifas fallback** (sin API) si `BLUEXPRESS_API_KEY` está vacío.

## Obtener credenciales API

Contactar comercial Blue Express para integración por API (volúmenes ecommerce).  
Documentación agencias: [plugins.bluex.cl](https://plugins.bluex.cl/)
