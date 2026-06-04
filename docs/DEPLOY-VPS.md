# Despliegue en VPS — staging `reuso.dpcoding.cl`

Guía para mostrar el avance al cliente en **https://reuso.dpcoding.cl**.

## DNS

En el panel de **dpcoding.cl** (o tu DNS):

| Tipo | Nombre | Valor |
|------|--------|--------|
| **A** | `reuso` | IP pública del VPS |

Propagación: unos minutos a 1 h. Prueba: `ping reuso.dpcoding.cl`.

## Qué necesitas en el VPS

| Componente | Versión |
|------------|---------|
| Node.js | 20 LTS |
| PostgreSQL | 16 (Docker: `docker compose up -d`) |
| Reverse proxy | Caddy o Nginx |
| Proceso | PM2 |

**No uses `prisma dev` en el VPS.** Solo `postgresql://...`.

## 1. Variables de entorno (`.env` en el servidor)

```env
DATABASE_URL="postgresql://postgres:CAMBIA_PASSWORD@127.0.0.1:5432/reuso?schema=public"

NEXT_PUBLIC_APP_URL="https://reuso.dpcoding.cl"
NEXT_PUBLIC_APP_NAME="reuso"
AUTH_SECRET="genera-con-openssl-rand-base64-32"
AUTH_URL="https://reuso.dpcoding.cl"

MERCADOPAGO_ENV="sandbox"
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
MERCADOPAGO_PUBLIC_KEY="TEST-..."
MERCADOPAGO_WEBHOOK_SECRET=""

CRON_SECRET="otro-secreto-largo"
```

`AUTH_URL` y `NEXT_PUBLIC_APP_URL` deben coincidir **exactamente** con la URL pública (con `https://`).

## 2. Base de datos y app

```bash
cd /var/www/reuso   # o tu ruta
docker compose up -d
npm ci
npx prisma migrate deploy   # o: npx prisma db push
npm run db:seed
npm run build
pm2 start npm --name reuso -- start
pm2 save
```

## 3. Caddy (HTTPS automático)

`/etc/caddy/Caddyfile`:

```caddy
reuso.dpcoding.cl {
  reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy pide el certificado Let's Encrypt solo si el DNS ya apunta al VPS.

## 4. URLs para el cliente

| Qué | URL |
|-----|-----|
| Tienda | https://reuso.dpcoding.cl |
| Login clientes | https://reuso.dpcoding.cl/auth/iniciar-sesion |
| Admin | https://reuso.dpcoding.cl/admin/login |
| Integraciones | https://reuso.dpcoding.cl/admin/integraciones |

Seed demo: `admin@reuso.cl` / `Admin123!` — **cambia la contraseña** en staging.

## 5. Mercado Pago (panel developers)

Webhook de notificaciones:

```text
https://reuso.dpcoding.cl/api/webhooks/mercadopago
```

## 6. Cron (órdenes sin pago)

```cron
*/15 * * * * curl -fsS -H "Authorization: Bearer TU_CRON_SECRET" https://reuso.dpcoding.cl/api/cron/expire-orders
```

## 7. Actualizar después de cambios

```bash
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart reuso
```

## 8. Opcional: staging no indexable

En Caddy, `basicauth` o cabecera `X-Robots-Tag` / `robots.txt` con `Disallow: /` mientras sea solo demo.

## Checklist

- [ ] Registro DNS **A** `reuso` → IP VPS
- [ ] `npm run build` OK en servidor
- [ ] `public/fonts/Gotham-Bold.woff2` presente
- [ ] `.env` con URLs `https://reuso.dpcoding.cl`
- [ ] Google OAuth: si lo usas, agregar redirect URI en Google Cloud con esa URL

`next.config.ts` ya incluye `reuso.dpcoding.cl` para imágenes remotas del mismo host.
