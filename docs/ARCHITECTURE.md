# Arquitectura — reuso E-commerce

## Visión general

Arquitectura **monolito modular** sobre Next.js App Router. El servidor (RSC + Server Actions) concentra la lógica de negocio; el cliente solo maneja interactividad (carrito, filtros, zoom).

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Browser)                      │
│  Zustand (carrito/wishlist) · React 19 · Tailwind v4      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js App Router (Edge/Node)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Storefront  │  │ Admin Panel  │  │ API Routes       │  │
│  │ (RSC pages) │  │ (protected)  │  │ Auth · Webhooks  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                │                    │            │
│  ┌──────▼────────────────▼────────────────────▼─────────┐  │
│  │           Server Actions + Repositories              │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   PostgreSQL           MercadoPago            Bluexpress
   (Prisma ORM)         (Checkout API)         (Envíos)
```

## Capas

### 1. Presentación (`src/app`, `src/components`)

- **Route groups**: `(storefront)` separa la tienda del admin.
- **Componentes**: dumb UI vs contenedores con `"use client"` solo donde hay estado.
- **Mobile first**: grids responsivos 2→4→5 columnas.

### 2. Aplicación (`src/server`)

- **Repositories**: única fuente de queries Prisma (evita queries dispersas).
- **Server Actions**: mutaciones validadas con Zod; retorno tipado `ActionResult`.
- **Servicios** (futuro): orquestación checkout, pagos, envíos.

### 3. Dominio (`prisma/schema.prisma`)

Entidades principales:

| Módulo | Modelos |
|--------|---------|
| Auth | User, Account, Session, VerificationToken |
| Catálogo | Category, Product, ProductVariant, ProductImage, Review |
| Carrito | Cart, CartItem, WishlistItem |
| Pedidos | Order, OrderItem, Payment, Shipment, Coupon |
| CMS | Banner, BrandLogo, NewsletterSubscriber |

### 4. Infraestructura (`src/lib`)

- `prisma.ts` — singleton cliente DB
- `auth.ts` — Auth.js v5 con JWT + Google + Credentials
- `mercadopago/` — preferencias, pagos, firma webhook (sandbox/producción)
- `bluexpress/` — cotización comuna/peso, tracking, etiquetas (ver `docs/BLUEXPRESS.md`)

## Flujo ecommerce

```
Explorar → Producto → Carrito (Zustand) → Checkout
    → Crear Order (Server Action)
    → MercadoPago Preference
    → Redirect pago
    → Webhook → Actualizar Payment/Order
    → Bluexpress cotización → Shipment
    → Email confirmación
```

## Seguridad

- **Middleware**: protege `/admin/*` y `/cuenta/*`
- **Roles**: `CUSTOMER`, `STAFF`, `ADMIN`
- **Webhooks**: firma HMAC `x-signature` + `MERCADOPAGO_WEBHOOK_SECRET` (ver `docs/MERCADOPAGO.md`)
- **Validación**: Zod en todas las Server Actions
- **Contraseñas**: bcrypt cost 12

## SEO y performance

- Metadata dinámica por producto
- `sitemap.ts` y `robots.ts` generados
- `next/image` con AVIF/WebP
- RSC para HTML inicial rápido
- `dynamic = force-dynamic` en páginas con datos DB

## Escalabilidad

### Corto plazo (single VPS / Vercel)

- PostgreSQL managed (Neon, Supabase, RDS)
- Redis para sesiones/caché de catálogo (opcional)
- CDN para assets en `public/` o S3

### Mediano plazo

- **Cola de jobs** (Inngest/BullMQ): webhooks, emails, etiquetas Bluexpress
- **Read replicas** PostgreSQL para catálogo
- **ISR** en listados de productos estables
- Separar **admin** en subdominio `admin.reuso.cl`

### Largo plazo

- Extracción de microservicio pagos si el volumen lo exige
- Event sourcing de órdenes para auditoría
- Multi-tienda / multi-región

## Convenciones de código

- Imports absolutos `@/*`
- Tipos compartidos en `src/types`
- Sin lógica de negocio en componentes UI
- Errores de dominio con códigos (`UNAUTHORIZED`, `FORBIDDEN`)

## Integraciones pendientes de configuración

| Integración | Variable | Estado |
|-------------|----------|--------|
| MercadoPago | `MERCADOPAGO_ACCESS_TOKEN` | Cliente listo |
| Google OAuth | `AUTH_GOOGLE_*` | Provider configurado |
| Bluexpress | `BLUEXPRESS_API_*` | Fallback tarifas CL |
| SMTP | `SMTP_*` | Por implementar |

## Testing (recomendado)

- **Unit**: repositories con Prisma mock
- **E2E**: Playwright flujo compra
- **Contract**: webhooks MercadoPago con fixtures
