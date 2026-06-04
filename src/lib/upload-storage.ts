import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";

type UploadOptions = {
  folder: "products" | "avatars" | "banners" | "categories";
  prefix?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Recorta al tamaño exacto (cabeceras de catálogo). Por defecto: inside. */
  fit?: "inside" | "cover";
};

function safeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/**
 * Guarda imagen subida por formulario en `public/uploads/...` y retorna URL pública.
 */
export async function saveUploadedImage(
  file: File,
  opts: UploadOptions,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Archivo inválido: debe ser imagen");
  }
  if (file.size <= 0) {
    throw new Error("Archivo vacío");
  }
  // 8MB por archivo
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("La imagen supera el máximo de 8MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const slug = opts.prefix ? safeSlug(opts.prefix) : "img";
  const name = `${slug}-${randomUUID().slice(0, 8)}.webp`;

  const relativeDir = path.join("uploads", opts.folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, name);
  const maxWidth = opts.maxWidth ?? 1600;
  const maxHeight = opts.maxHeight ?? 1600;
  const quality = opts.quality ?? 84;
  const fit = opts.fit ?? "inside";

  let pipeline = sharp(bytes).rotate();

  if (fit === "cover") {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: "cover",
      position: "centre",
    });
  } else {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const output = await pipeline.webp({ quality, effort: 4 }).toBuffer();

  await writeFile(absolutePath, output);
  return `/${path.posix.join(relativeDir.replaceAll("\\", "/"), name)}`;
}
