import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PRODUCTS_DIR = path.join(process.cwd(), "public/images/products");

export type LocalImage = {
  /** Ruta pública, ej. /images/products/mi-slug/00.webp */
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

function extFromUrl(url: string): string {
  try {
    const p = new URL(url).pathname.toLowerCase();
    if (p.endsWith(".png")) return "png";
    if (p.endsWith(".webp")) return "webp";
    if (p.endsWith(".gif")) return "gif";
  } catch {
    /* ignore */
  }
  return "jpg";
}

/**
 * Descarga imágenes remotas y las guarda en public/images/products/{slug}/.
 * Siempre convierte a WebP para el catálogo.
 */
export async function downloadProductImages(
  productSlug: string,
  images: { src: string; alt?: string; position?: number }[],
  opts: { dryRun: boolean; skipExisting: boolean },
): Promise<LocalImage[]> {
  if (images.length === 0) return [];

  const sorted = [...images].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );

  const dir = path.join(PRODUCTS_DIR, productSlug);
  if (!opts.dryRun) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const out: LocalImage[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const img = sorted[i];
    const fileName = `${String(i).padStart(2, "0")}.webp`;
    const diskPath = path.join(dir, fileName);
    const publicUrl = `/images/products/${productSlug}/${fileName}`;

    if (opts.dryRun) {
      out.push({
        url: publicUrl,
        alt: img.alt ?? productSlug,
        sortOrder: i,
        isPrimary: i === 0,
      });
      continue;
    }

    if (opts.skipExisting && fs.existsSync(diskPath)) {
      out.push({
        url: publicUrl,
        alt: img.alt ?? productSlug,
        sortOrder: i,
        isPrimary: i === 0,
      });
      continue;
    }

    const res = await fetch(img.src, {
      headers: { "User-Agent": "reuso-import/1.0" },
    });
    if (!res.ok) {
      throw new Error(`Imagen HTTP ${res.status}: ${img.src}`);
    }

    const input = Buffer.from(await res.arrayBuffer());
    const ext = extFromUrl(img.src);

    let pipeline = sharp(input);
    if (ext === "gif") {
      pipeline = sharp(input, { animated: false });
    }

    await pipeline.webp({ quality: 85, effort: 4 }).toFile(diskPath);

    out.push({
      url: publicUrl,
      alt: img.alt ?? productSlug,
      sortOrder: i,
      isPrimary: i === 0,
    });
  }

  return out;
}
