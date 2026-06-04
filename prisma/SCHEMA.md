# Schema Prisma — reuso

## Diagrama relacional (resumen)

```
User ──┬── Account / Session
       ├── Address
       ├── Cart ── CartItem ── Product / ProductVariant
       ├── Wishlist ── WishlistItem ── Product
       ├── Order ── OrderItem
       └── Review

Category ── Subcategory ── Product ──┬── ProductImage
                                       ├── ProductVariant ── Inventory ── InventoryAdjustment
                                       └── ProductRelation

Order ── Payment / Shipment / OrderStatusHistory
Coupon ── Order
```

## Modelos solicitados

| Modelo | Tabla | Notas |
|--------|-------|-------|
| User | `users` | Soft delete `deletedAt` |
| Account | `accounts` | Auth.js OAuth |
| Session | `sessions` | Auth.js |
| Category | `categories` | Nivel superior (Mujer, Hombre) |
| Subcategory | `subcategories` | Jeans, Poleras, etc. |
| Product | `products` | FK → `subcategoryId` |
| ProductImage | `product_images` | Galería ordenada |
| ProductVariant | `product_variants` | Talla + color (sin stock directo) |
| Inventory | `inventory` | Stock real por variante |
| Cart | `carts` | Usuario o `sessionId` guest |
| CartItem | `cart_items` | Unique `[cartId, variantId]` |
| Wishlist | `wishlists` | 1:1 con User |
| WishlistItem | `wishlist_items` | |
| Order | `orders` | Snapshot dirección en JSON |
| OrderItem | `order_items` | Snapshot nombre/precio |
| Coupon | `coupons` | Soft delete |
| Address | `addresses` | Soft delete |
| Review | `reviews` | Enum `ReviewStatus` |

## Soft delete

Campos `deletedAt DateTime?` en:

- User, Address, Category, Subcategory, Product, ProductVariant, Coupon, Review

**No** se usa soft delete en: Order, Cart, CartItem (operacional).

Filtrar en queries públicos con `src/lib/prisma-soft-delete.ts`:

```ts
import { publishedProduct, notDeleted } from "@/lib/prisma-soft-delete";

await prisma.product.findMany({ where: publishedProduct });
```

## Inventario

- `quantityOnHand` — unidades físicas
- `quantityReserved` — reservadas (carrito/checkout pendiente)
- Disponible = `onHand - reserved` (helper `availableStock()`)
- `InventoryAdjustment` — auditoría de movimientos

## Índices destacados

- Búsqueda catálogo: `[isPublished, isFeatured]`, `[isPublished, publishedAt]`
- Slugs únicos: Product, Category, Subcategory, Coupon
- FKs indexadas en todas las relaciones
- Orders: `[userId]`, `[status]`, `[createdAt DESC]`

## Migración

```bash
npm run db:migrate   # crea migración
npm run db:seed      # datos demo
```

Si partes de schema anterior con `Category` anidado:

```bash
npx prisma migrate dev --name refactor_catalog_inventory
```

O en desarrollo limpio: `npx prisma db push` + `npm run db:seed`.
