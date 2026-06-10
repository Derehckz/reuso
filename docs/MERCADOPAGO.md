# MercadoPago — Checkout Pro

Integración con **Checkout Pro** (preferencias + redirect + webhooks).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `MERCADOPAGO_ENV` | `sandbox` o `production`. Con credenciales de **prueba** en Chile (cuenta `TESTUSER…`, token `APP_USR-`) usa **`sandbox`**. |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de la aplicación. Prueba: `TEST-` o `APP_USR-` del panel *Credenciales de prueba*. |
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

- **Sandbox (pruebas en Chile)**:
  - `MERCADOPAGO_ENV=sandbox`
  - Credenciales del panel → **Credenciales de prueba** (aunque el token sea `APP_USR-`)
  - Checkout usa `sandbox_init_point`
  - El comprador debe ser un **usuario de prueba comprador** del panel MP (no tu cuenta real de Mercado Pago)
  - Ventana de incógnito recomendada si antes iniciaste sesión con MP real
- **Producción (cobro real)**:
  - `MERCADOPAGO_ENV=production`
  - Credenciales de **producción** (`APP_USR-` de cuenta real)
  - `init_point` de producción

## Error «Una de las partes es de prueba»

Significa que vendedor y comprador no están en el mismo modo. Con credenciales `TESTUSER…`:

1. Deja `MERCADOPAGO_ENV=sandbox` en `.env`
2. En [Cuentas de prueba](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-users) crea o copia el **usuario Comprador**
3. En el checkout de MP, **inicia sesión** con ese comprador (solo la tarjeta de prueba no basta si tu navegador tiene sesión MP real)
4. Tarjeta aprobada Chile: `5031 7555 3456 7890` · CVV `123` · venc. `11/30`

Los avisos CSP / `requestStorageAccessFor` en la consola vienen del checkout de Mercado Pago, no de reuso; se pueden ignorar.

## Error `ERR_TOO_MANY_REDIRECTS` en sandbox.mercadopago.cl/login

La URL correcta es `sandbox.mercadopago.cl`. El bucle en **`/login/`** casi siempre es:

1. **Cookies** de tu cuenta real de MP mezcladas con sandbox
2. **Email del checkout** = tu email real → MP intenta login y entra en bucle

### Solución (orden recomendado)

1. Panel MP → **Cuentas de prueba** → copia el **Comprador** (usuario, contraseña y email tipo `test_user_…@testuser.com`)
2. En el VPS `.env`:
   ```env
   MERCADOPAGO_ENV=sandbox
   MERCADOPAGO_SANDBOX_PAYER_EMAIL="test_user_XXXXX@testuser.com"
   ```
3. `pm2 restart reuso --update-env`
4. **Ventana de incógnito** (o borra cookies de `mercadopago.cl` y `sandbox.mercadopago.cl`)
5. Checkout **nuevo** en reuso (no reutilices links viejos de MP)
6. En la pantalla de login de MP usa **usuario y contraseña del comprador de prueba** (no “entrar con tu cuenta” de MP real)
7. Si pide verificación, usa el **código de 6 dígitos** que muestra el panel en Cuentas de prueba
8. Tarjeta Mastercard: `5416 7526 0258 2580` · CVV `123` · `11/30` · titular **`APRO`** · doc `(otro) 123456789`
9. Al terminar: botón **Volver al sitio**

Si ves **«No se completó el pago»** en `/checkout/error`, Mercado Pago rechazó o no finalizó el cobro. La orden sigue en *Esperando pago* hasta que expire el cron (48 h) o la canceles en admin. Reintenta con titular **APRO** en incógnito.

**No** inicies sesión antes en mercadopago.cl con tu cuenta personal.

## Tarjetas de prueba (Chile)

Ver [tarjetas de prueba](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards) en la documentación oficial.

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
