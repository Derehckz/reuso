# reuso — Plataforma ecommerce

Arquitectura escalable sobre Next.js 16 + Prisma 7, inspirada en PrestaShop/Shopify.

## Capas

```
src/
├── app/                 # Routing (storefront, admin, API)
├── modules/             # Dominios (navigation, futuro: catalog, checkout)
├── server/
│   ├── actions/         # Server Actions (validación + permisos)
│   ├── repositories/    # Acceso a datos
│   └── services/        # Orquestación (checkout, pago, envío)
├── shared/              # auth/permissions, audit, rate-limit, errors
└── components/          # UI por contexto (admin, account, catalog)
```

## Admin (`/admin`)

| Módulo | Ruta |
|--------|------|
| Dashboard | `/admin` |
| Productos | `/admin/productos` |
| Categorías | `/admin/categorias` |
| Inventario | `/admin/inventario` |
| Órdenes + export CSV | `/admin/ordenes` |
| Clientes | `/admin/usuarios` |
| Cupones | `/admin/cupones` |
| Contenido (banners) | `/admin/contenido` |
| Configuración tienda | `/admin/configuracion` |

## Cuenta cliente (`/cuenta`)

| Ruta | Función |
|------|---------|
| `/cuenta` | Dashboard resumen |
| `/cuenta/pedidos` | Historial |
| `/cuenta/pedidos/[orderNumber]` | Detalle |
| `/cuenta/direcciones` | Libreta de direcciones |
| `/cuenta/favoritos` | Wishlist |
| `/cuenta/configuracion` | Perfil y contraseña |

## RBAC

Permisos en `src/shared/auth/permissions.ts`. Uso:

```ts
import { requirePermission } from "@/lib/auth-admin";
await requirePermission("coupons:write");
```

## Schema extendido

- `Tag`, `Collection`, `OrderNote`, `AuditLog`, `StoreSetting`
- Producto: `vintageYear`, `internalCode`, SEO
- Usuario: `isBlocked`

## Próximos pasos sugeridos

- Colecciones y tags en UI de producto
- Upload multi-imagen con drag & drop
- Cola de trabajos (emails, etiquetas)
- Full-text search (PostgreSQL / Algolia)
