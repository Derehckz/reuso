# Despliegue en VPS — staging `reuso.dpcoding.cl`

Guía para mostrar el avance al cliente en **https://reuso.dpcoding.cl** (Cloudflare SSL + Nginx + PM2 + Docker Postgres).

**No uses Certbot** si el certificado lo termina Cloudflare.

## DNS y SSL (Cloudflare)

En **Cloudflare** → zona `dpcoding.cl`:

| Campo | Valor |
|-------|--------|
| Tipo | **A** |
| Nombre | `reuso` |
| Contenido | IP del VPS |
| Proxy | **Activado** (nube naranja) |

**SSL/TLS → Overview** (modo recomendado con Nginx solo en puerto 80):

| Modo | Origen (VPS) |
|------|----------------|
| **Full** | Nginx escucha **80** → proxy a `:3000` (sin cert en el VPS) |
| **Full (strict)** | Nginx **443** con [Origin Certificate](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/) de Cloudflare |

Evita **Flexible** si Auth/cookies dan problemas (Cloudflare→origen en HTTP plano).

Prueba: `https://reuso.dpcoding.cl` (HTTPS lo da Cloudflare, no el VPS).

## Requisitos en el VPS

| Componente | Versión |
|------------|---------|
| Node.js | **22.12+** (Prisma 7 no acepta 20.18) |
| PostgreSQL | 16 (`docker compose up -d`) |
| Nginx | reverse proxy |
| PM2 | proceso `reuso` |

**No uses `prisma dev` en el VPS.**

## 1. Código y base de datos

```bash
cd /var/www
git clone https://github.com/Derehckz/reuso.git
cd reuso
docker compose up -d
```

## 2. `.env` en el servidor

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/reuso?schema=public"

NEXT_PUBLIC_APP_URL="https://reuso.dpcoding.cl"
AUTH_URL="https://reuso.dpcoding.cl"
NEXT_PUBLIC_APP_NAME="reuso"

AUTH_SECRET="openssl rand -base64 32"
CRON_SECRET="otro-secreto-largo"
```

Cambia la contraseña de Postgres en producción (edita `docker-compose.yml` o solo `DATABASE_URL`).

## 3. Node, build y PM2

```bash
# Node 22 si hace falta
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.12+

cd /var/www/reuso
rm -rf node_modules
npm ci
npx prisma db push
npm run db:seed
npm run build

npm i -g pm2
pm2 delete reuso 2>/dev/null
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Comprobar app:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000
pm2 logs reuso --lines 30
```

## 4. Nginx (igual que el vhost WordPress + Cloudflare)

Mismo patrón que WordPress + Cloudflare. Next.js en **127.0.0.1:3010** (PM2; puertos 3000/3001 están ocupados en este VPS).

Plantilla: [`deploy/nginx/reuso.dpcoding.cl.conf`](../deploy/nginx/reuso.dpcoding.cl.conf)

```bash
cd /var/www/reuso
cp deploy/nginx/reuso.dpcoding.cl.conf /etc/nginx/sites-available/reuso.dpcoding.cl
ln -sf /etc/nginx/sites-available/reuso.dpcoding.cl /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Prueba con el dominio (HTTP):

```bash
curl -I -H "Host: reuso.dpcoding.cl" http://127.0.0.1
```

## 5. Comprobar detrás de Cloudflare

En el VPS (origen HTTP):

```bash
curl -I -H "Host: reuso.dpcoding.cl" http://127.0.0.1
```

Desde tu PC:

```bash
curl -I https://reuso.dpcoding.cl
```

Si ves **522** o **521**: Cloudflare no alcanza el VPS (firewall, Nginx caído, IP DNS mal).

Si cambias `.env`:

```bash
cd /var/www/reuso && npm run build && pm2 restart reuso
```

## 6. URLs para el cliente

| Qué | URL |
|-----|-----|
| Tienda | https://reuso.dpcoding.cl |
| Admin | https://reuso.dpcoding.cl/admin/login |
| Integraciones | https://reuso.dpcoding.cl/admin/integraciones |

Seed: `admin@reuso.cl` / `Admin123!` — cambiar en staging.

## 7. Mercado Pago (sandbox)

Webhook: `https://reuso.dpcoding.cl/api/webhooks/mercadopago`

## 8. Cron (órdenes sin pago)

```cron
*/15 * * * * curl -fsS -H "Authorization: Bearer TU_CRON_SECRET" https://reuso.dpcoding.cl/api/cron/expire-orders
```

## 9. Actualizar código (cada push)

Guía detallada: **[DEPLOY-WORKFLOW.md](./DEPLOY-WORKFLOW.md)** (local → VPS, sin borrar productos ni órdenes).

```bash
cd /var/www/reuso
git pull origin master
npm run build
pm2 restart reuso
```

`npm ci` solo si cambió `package-lock.json`. `npx prisma db push` solo si cambió `schema.prisma`.

## Checklist

- [ ] DNS **A** `reuso` → IP VPS
- [ ] Node **≥ 22.12**
- [ ] `pm2 status` → `reuso` online
- [ ] `curl http://127.0.0.1:3000` → 200
- [ ] Nginx `nginx -t` OK (solo puerto 80 si usas Cloudflare **Full**)
- [ ] Cloudflare proxy ON + SSL **Full** (o strict + origin cert)
- [ ] `.env` con `https://reuso.dpcoding.cl`

`next.config.ts` ya permite imágenes desde `reuso.dpcoding.cl`.
