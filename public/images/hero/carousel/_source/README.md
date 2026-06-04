# Originales del carrusel

Los PNG/JPG fuente viven aquí. Los WebP servidos al sitio están en la carpeta padre.

| Archivo fuente | Slide WebP |
|----------------|------------|
| `Banners-04-scaled.jpeg` | `01-footwear.webp` |
| `Banners-02-1-scaled.jpeg` | `02-yankees-polerones.webp` |
| `Banners-01-1-scaled.jpeg` | `03-chaquetas.webp` |
| `Banner-Reuso01-1.png` | `04-polerones-hoodies.webp` |
| `BYC-Banner.png` | `05-carteras-bolsos.webp` |
| `Banner-CM-01.png` | `06-castro.webp` |
| `Banner-CM-02.png` | `07-temuco.webp` |
| `Banner-CM-03.png` | `08-osorno.webp` |
| `Banner-10anos.jpg.jpeg` | `09-10-anos.webp` |
| `Banners-Home01.png` | `10-sportwear.webp` |

Regenerar WebP sin perder resolución:

```bash
npm run carousel:import
```

- PNG → WebP **lossless**
- JPEG → WebP **quality 100** (sin redimensionar)
