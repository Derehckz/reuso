# MercadoPago — Checkout Pro

Integración con **Checkout Pro** (preferencias + redirect + webhooks).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `MERCADOPAGO_ENV` | `sandbox` o `production`. Si no se define, se infiere por prefijo `TEST-` del token. |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de la aplicación (TEST- en sandbox, APP_USR- en producción). |
| `MERCADOPAGO_PUBLIC_KEY` | Public key (opcional, para Bricks futuros). |
| `MERCADOPAGO_WEBHOOK_SECRET` | Firma secreta del panel **Webhooks** (obligatoria en producción). |

## Flujo

1. Checkout crea `Order` en estado `AWAITING_PAYMENT` y reserva inventario.
2. Se crea una **preferencia** con `external_reference = orderId`.
3. El cliente paga en MercadoPago (`init_point` o `sandbox_init_point` según entorno).
4. MP notifica `POST/GET /api/webhooks/mercadopago`.
5. Se valida firma HMAC (`x-signature`) y se consulta el pago por API.
6. Se actualizan `Payment` y `Order` y se confirma/libera inventario.

## Webhook en el panel MP

1. [Tus integraciones](https://www.mercadopago.cl/developers/panel/app) → tu app → **Webhooks**.
2. URL de prueba: `https://<tunnel>/api/webhooks/mercadopago`
3. URL de producción: `https://reuso.cl/api/webhooks/mercadopago`
4. Evento: **Pagos** (`payment`)
5. Copia la **firma secreta** a `MERCADOPAGO_WEBHOOK_SECRET`.

Para desarrollo local usa [ngrok](https://ngrok.com/) o similar; MP debe poder alcanzar la URL.

## Estados

| MP `status` | `Payment.status` | `Order.status` (si aplica) |
|-------------|------------------|----------------------------|
| approved | APPROVED | PAID |
| pending, in_process | PENDING | — |
| rejected | REJECTED | CANCELLED |
| cancelled | CANCELLED | CANCELLED |
| refunded, charged_back | REFUNDED | REFUNDED |

## Sandbox vs producción

- **Sandbox**: token `TEST-`, checkout en `sandbox_init_point`, pagos con [usuarios de prueba](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-users).
- **Producción**: token `APP_USR-`, `init_point` de producción, webhooks con firma obligatoria.

## Tarjetas de prueba (Chile)

Ver documentación oficial de MercadoPago para tarjetas y estados (aprobado, rechazado, pendiente).

## Verificación en el servidor

```bash
cd /var/www/reuso
npm run healthcheck -- --url https://reuso.dpcoding.cl
```

Valida token MP (`users/me`), crea una preferencia de prueba, comprueba el webhook y la BD. Ver `docs/DEPLOY-VPS.md` §7.

## Código relevante

- `src/lib/mercadopago/` — cliente, preferencias, firma webhook, mapeo estados
- `src/server/services/payment.service.ts` — sincronización pago → orden
- `src/app/api/webhooks/mercadopago/route.ts` — endpoint webhook
- `scripts/test-server-health.ts` — healthcheck integral
