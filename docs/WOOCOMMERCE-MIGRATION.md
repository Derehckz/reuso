# Migración desde re-uso.cl (WooCommerce)

Importación del catálogo de **[re-uso.cl](https://re-uso.cl/)** hacia reuso:

- **Categorías** alineadas con el menú actual (Mujer / Hombre / Ropa Deportiva y subcategorías del proyecto).
- **Imágenes** descargadas al repo en `public/images/products/{slug}/` (WebP). No dependen del WordPress cuando el sitio viejo se apague.
- **Marcas** desde la rama «Marcas › Nike» de WooCommerce (campo `brand` del producto).

---

## Requisitos

1. Postgres local (`npm run dev:db` + `npx prisma db push`).
2. Claves REST API en WordPress:
   - **WooCommerce → Ajustes → Avanzado → REST API → Añadir clave** (permiso **Lectura**).
3. Variables en `.env`:

```env
WC_STORE_URL="https://re-uso.cl"
WC_CONSUMER_KEY="ck_..."
WC_CONSUMER_SECRET="cs_..."
```

---

## Categorías (coinciden con re-uso.cl)

El script **no usa solo un CSV manual**: lee el árbol de categorías de WooCommerce y lo mapea al árbol definido en `src/lib/constants/category-subcategories.ts` (el mismo que la navegación de la tienda nueva).

| re-uso.cl | Subcategorías reuso (ejemplos) |
|-----------|--------------------------------|
| Mujer | `mujer-zapatillas`, `mujer-poleras`, `mujer-carteras`, … |
| Hombre | `hombre-zapatillas`, `hombre-chaquetas`, … |
| Ropa Deportiva | `ropa-deportiva-camisetas-basketball`, `…-futbol`, `…-nfl`, `ropa-deportiva-otros` |

Se **ignoran** categorías de merchandising: Marcas, Best Sellers, New Arrivals, etc. La marca va al campo `brand`, no a la subcategoría.

Si un producto queda mal clasificado, crea `scripts/woocommerce-category-map.json` (copia del `.example`) con overrides por slug WC.

---

## Imágenes locales

Cada producto:

```
public/images/products/{slug}/00.webp   ← principal
public/images/products/{slug}/01.webp   ← galería
```

En la base de datos la URL es `/images/products/{slug}/00.webp` (servida por Next desde `public/`).

**Tamaño del repo:** muchos productos = muchos MB. Puedes versionar las imágenes en git o añadir `public/images/products/**` al `.gitignore` y respaldar aparte (S3, etc.).

---

## Comandos

```bash
npm run categories:sync          # asegura árbol de categorías en DB

# Prueba (sin DB ni archivos)
npm run import:woocommerce -- --dry-run --limit=3

# Import real + publicar
npm run import:woocommerce -- --publish

# Reimportar actualizando existentes (mismo slug)
npm run import:woocommerce -- --force --publish

# Solo datos, sin volver a bajar imágenes
npm run import:woocommerce -- --force --skip-images
```

La primera importación completa puede tardar según cantidad de productos e imágenes.

---

## Home: destacados y nuevos ingresos

Tras el import, el home usa datos reales de WooCommerce (no hace falta marcar flags en admin):

| Bloque | Regla |
|--------|--------|
| **DESTACADOS** | Productos con oferta: `compareAtPrice` > `basePrice` (precio tachado en WC). |
| **NUEVOS INGRESOS** | `publishedAt` dentro de las últimas **3 semanas**, orden **aleatorio**. |

Las fechas de publicación deben venir de WooCommerce. Si importaste antes sin fechas WC, ejecuta una vez:

```bash
npm run import:woocommerce:dates
```

## Después del import

1. Revisar en **Admin → Productos** subcategoría, precios y stock.
2. `npm run dev` y abrir una ficha de producto: las fotos deben cargar desde `/images/products/...` sin depender de re-uso.cl.

---

## Problemas frecuentes

| Problema | Qué hacer |
|----------|-----------|
| `401` en API | Revisar claves WC en `.env`. |
| Producto en categoría rara | Añadir override en `woocommerce-category-map.json`. |
| Imagen falla al descargar | URL rota en WP; reintentar con `--force` o subir manual en admin. |
| Bolso en «Poleras» | Override `"bolsos": "mujer-carteras"` en el mapa JSON. |

---

## Archivos

| Archivo | Rol |
|---------|-----|
| `scripts/import-woocommerce.ts` | Orquestación |
| `scripts/lib/reuso-category-resolver.ts` | Mapeo categorías re-uso.cl → reuso |
| `scripts/lib/download-product-images.ts` | Descarga + WebP |
| `scripts/woocommerce-category-map.json` | Overrides opcionales |
