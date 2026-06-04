# reuso — E-commerce premium

Tienda de ropa reutilizada americana de alta calidad. Stack: **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **PostgreSQL**, **Prisma**, **Auth.js**, **MercadoPago**, **Bluexpress**.

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- Cuenta MercadoPago (producción o sandbox)
- Fuente **Gotham Bold** (manual de marca) en `public/fonts/Gotham-Bold.woff2`

## Inicio rápido

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completa al menos:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reuso"
AUTH_SECRET="tu-secreto-generado"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Genera `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 2. Base de datos

**Opción A — PostgreSQL local (recomendado)**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reuso?schema=public"
```

Con Docker: `docker compose up -d` (ver `docker-compose.yml`).

**Opción B — Prisma Dev** (si tu `.env` usa `prisma+postgres://`)

En otra terminal, deja corriendo:

```bash
npx prisma dev
```

Luego aplica el schema y datos:

```bash
npm install
npx prisma db push
npm run db:seed
```

> La app usa el driver `pg` y resuelve automáticamente la URL real desde `prisma+postgres://` (ver `src/lib/database-url.ts`).

**Credenciales admin seed:** `admin@reuso.cl` / `Admin123!`

**Categorías (admin):** [http://localhost:3000/admin/categorias](http://localhost:3000/admin/categorias) — árbol, SEO, banner, acciones masivas.

**Cronograma cliente (PDF):** [docs/cronograma-reuso-cliente.pdf](docs/cronograma-reuso-cliente.pdf) · [versión editable](docs/CRONOGRAMA-CLIENTE.md)  
**Cronograma técnico (equipo dev):** [docs/PROJECT-GANTT.md](docs/PROJECT-GANTT.md)

**Accesos de sesión (desarrollo):**

| Quién | URL |
|-------|-----|
| Clientes (tienda) | [http://localhost:3000/auth/iniciar-sesion](http://localhost:3000/auth/iniciar-sesion) |
| Staff / admin (panel) | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |

El panel (`/admin/*`) redirige a `/admin/login` si no hay sesión de staff; la tienda usa `/auth/iniciar-sesion`.

### 3. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para arquitectura completa, capas y escalabilidad.

```
src/
├── app/
│   ├── (storefront)/     # Tienda pública
│   ├── admin/            # Panel administración
│   └── api/              # Auth, webhooks
├── components/           # UI reutilizable
├── config/               # Site config, marca
├── lib/                  # Prisma, auth, integraciones
├── server/
│   ├── actions/          # Server Actions
│   └── repositories/     # Acceso a datos
├── stores/               # Estado cliente (carrito, wishlist)
└── types/
prisma/
├── schema.prisma         # Modelo completo
└── seed.ts
```

## Módulo funcional incluido

- Home editorial con hero, banner, destacados y nuevos ingresos
- Header de 3 niveles (anuncios, utilidades, navegación)
- Catálogo con filtros (orden, talla, color, precio)
- Ficha de producto con galería zoom, variantes y carrito
- Búsqueda en tiempo real
- Carrito persistente (localStorage)
- Wishlist (localStorage)
- Auth: registro, login, Google OAuth
- Admin: dashboard y listado de productos
- Integraciones preparadas: MercadoPago, Bluexpress
- SEO: metadata, sitemap, robots

## Próximos pasos recomendados

1. Subir imágenes reales del manual de marca a `public/images/`
2. Configurar MercadoPago (`docs/MERCADOPAGO.md`) y webhook en producción
3. Completar flujo checkout (Server Actions + órdenes)
4. CRUD admin con formularios y upload de imágenes (S3/Cloudinary)
5. Sincronizar carrito guest → usuario autenticado
6. Emails transaccionales (Resend/SendGrid)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo |
| `npm run build` | Build producción |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:seed` | Datos demo |
| `npm run import:woocommerce` | Importar catálogo desde WooCommerce (ver `docs/WOOCOMMERCE-MIGRATION.md`) |
| `npm run db:studio` | Prisma Studio |

## Colores de marca

| Token | Hex |
|-------|-----|
| Verde | `#1B3022` |
| Beige | `#D2C1B0` |
| Naranja | `#F38121` |
| Negro | `#000000` |
| Gris producto | `#F5F5F5` |

## Licencia

Privado — reuso © 2026
