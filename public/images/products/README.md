# Fotos de productos

Coloca imágenes en esta carpeta con el **slug del producto** como nombre:

| Archivo | Producto |
|---------|----------|
| `polera-vintage-041.webp` | Polera Vintage 041 |
| `jean-levis-501.webp` | Jean Levi's 501 |
| `poleron-ny-yankees.webp` | Polerón NY Yankees |
| `zapatilla-jordan-1.webp` | Zapatilla Jordan 1 |
| `cartera-coach-vintage.webp` | Cartera Coach |

Formato recomendado: **WebP o JPG**, proporción **3:4**, mínimo **900×1200 px**.

Tras añadir fotos, actualiza `src/lib/constants/home-images.ts` (`PRODUCT_IMAGE_BY_SLUG`) y ejecuta:

```bash
npm run db:seed
```
