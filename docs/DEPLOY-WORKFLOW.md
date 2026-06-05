# Flujo de deploy — local → producción (VPS)

Staging/producción: **https://reuso.dpcoding.cl**  
Repo: **https://github.com/Derehckz/reuso**  
Servidor: `/var/www/reuso` · PM2 `reuso` en puerto **3010** · Nginx → `127.0.0.1:3010`

Con el catálogo y la BD ya cargados, **cada deploy solo actualiza código**. No vuelvas a correr seed, import WooCommerce ni `db push` salvo que cambies el schema a propósito.

---

## En tu PC (cada cambio listo)

```bash
cd ruta/a/reuso

# Probar en local
npm run dev

# Subir a GitHub
git add .
git commit -m "Describe el cambio"
git push origin master
```

- El archivo **`.env` no va al repo** (está en `.gitignore`).
- Si agregas variables nuevas en `.env.example`, cópialas manualmente al `.env` del VPS.

---

## En el VPS (después del push)

Conéctate por SSH y ejecuta:

```bash
cd /var/www/reuso
git pull origin master
```

### Deploy rutinario (no toca los datos de la BD)

Usa esto **casi siempre**:

```bash
npm run build
pm2 restart reuso
```

### Si cambiaron dependencias (`package-lock.json`)

```bash
npm ci
npm run build
pm2 restart reuso
```

### Solo si cambió `prisma/schema.prisma`

```bash
npx prisma db push
npm run build
pm2 restart reuso
```

`db push` ajusta tablas/columnas; **no reemplaza** productos ni órdenes. Revisa el diff del schema antes en producción.

---

## Comandos que NO van en un deploy normal

| Comando | Por qué evitarlo |
|---------|------------------|
| `npm run db:seed` | Datos demo; no hace falta con catálogo real |
| `npm run import:woocommerce` | Solo cuando quieras re-sincronizar desde re-uso.cl |
| `npx prisma migrate reset` | **Borra toda la base de datos** |
| `docker compose down -v` | **Borra el volumen de Postgres** |

---

## Comprobar que quedó bien

```bash
pm2 status reuso
curl -s -o /dev/null -w "app:%{http_code}\n" http://127.0.0.1:3010
```

En el navegador: https://reuso.dpcoding.cl

Logs si algo falla:

```bash
pm2 logs reuso --lines 40
pm2 logs reuso --err --lines 50
```

### Error en el navegador: «Server Components render» (sin detalle)

En producción Next **oculta** el mensaje real. El error suele estar en los logs del servidor:

```bash
pm2 logs reuso --err --lines 80
```

Causas frecuentes en el VPS:

| Causa | Solución |
|-------|----------|
| `NEXT_PUBLIC_APP_URL` sin `https://` o vacía | `.env`: `NEXT_PUBLIC_APP_URL="https://reuso.dpcoding.cl"` y `AUTH_URL` igual |
| Falta `AUTH_SECRET` | `openssl rand -base64 32` en `.env` |
| Postgres caído | `docker compose ps` en `/var/www/reuso` |
| Cambiaste `.env` sin rebuild | `npm run build && pm2 restart reuso` |

Tras corregir `.env`, **siempre** `npm run build` antes de `pm2 restart` (las vars `NEXT_PUBLIC_*` se embeben en el build).

---

## Resumen en dos pasos

| Dónde | Qué hacer |
|-------|-----------|
| **Local** | `git commit` + `git push origin master` |
| **VPS** | `git pull` → `npm run build` → `pm2 restart reuso` |

Opcional: `npm ci` si cambió el lockfile · `npx prisma db push` solo si cambió el schema.

---

## Qué sigue guardándose en la BD (con el sitio arriba)

No se pierde con `git pull` + build + restart:

- Productos (admin, WooCommerce ya importado)
- Órdenes y pagos
- Usuarios y clientes
- Configuración en admin / integraciones (`StoreSetting`)
- Cupones, categorías editadas, etc.

---

## Seguridad Postgres (evitar que borren la BD otra vez)

El ataque anterior fue posible porque Postgres escuchaba en **0.0.0.0:5432** con contraseña débil. Hay que aplicar **las tres capas** (no basta con una).

### 1. Puerto solo en localhost (repo actualizado)

Tras `git pull`, recrea el contenedor para que tome el binding nuevo:

```bash
cd /var/www/reuso
docker compose down
docker compose up -d
```

Comprueba que **no** diga `0.0.0.0:5432`:

```bash
ss -tlnp | grep 5432
# Correcto: 127.0.0.1:5432
```

### 2. Contraseña fuerte (misma en Docker y en la app)

Genera una:

```bash
openssl rand -base64 24
```

En `/var/www/reuso/.env` (no va al repo):

```env
POSTGRES_PASSWORD="la-contraseña-generada"
DATABASE_URL="postgresql://postgres:la-contraseña-generada@127.0.0.1:5432/reuso?schema=public"
```

Si el volumen **ya existe**, cambiar solo `docker-compose.yml` no actualiza la clave. Aplícala dentro de Postgres:

```bash
docker compose exec postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'la-contraseña-generada';"
```

Luego `npm run build && pm2 restart reuso`.

### 3. Firewall del VPS (bloqueo extra)

Aunque el puerto quede en 127.0.0.1, cierra 5432 hacia internet por si algo vuelve a publicarlo mal:

```bash
ufw status
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5432/tcp
ufw enable
```

Solo deben quedar abiertos **22** (SSH), **80** y **443** (Nginx). No abras 5432, 3000 ni 3010 al mundo.

### 4. Backups automáticos

Si vuelven a borrar datos, sin backup solo queda reimportar WooCommerce.

```bash
chmod +x /var/www/reuso/deploy/scripts/backup-postgres.sh
mkdir -p /var/backups/reuso
/var/www/reuso/deploy/scripts/backup-postgres.sh
```

Cron (todos los días a las 3:00):

```cron
0 3 * * * /var/www/reuso/deploy/scripts/backup-postgres.sh >> /var/log/reuso-backup.log 2>&1
```

Restaurar un backup:

```bash
gunzip -c /var/backups/reuso/reuso_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U postgres -d reuso
```

### 5. Señales de alerta

| Síntoma | Acción |
|---------|--------|
| Base `readme_to_recover` en `psql -l` | Postgres estuvo expuesto; repetir pasos 1–3 y restaurar backup o reimportar |
| `P1003` database does not exist | Recrear `CREATE DATABASE reuso;` + `npx prisma db push` + restaurar backup |
| `ss` muestra `0.0.0.0:5432` | `docker compose down && up -d` con el compose del repo |

---

## Referencias

- Primera instalación del servidor: [DEPLOY-VPS.md](./DEPLOY-VPS.md)
- Importación catálogo WooCommerce: [WOOCOMMERCE-MIGRATION.md](./WOOCOMMERCE-MIGRATION.md)
- Nginx plantilla: [`deploy/nginx/reuso.dpcoding.cl.conf`](../deploy/nginx/reuso.dpcoding.cl.conf)
- PM2 plantilla: [`deploy/ecosystem.config.cjs`](../deploy/ecosystem.config.cjs)
