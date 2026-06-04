/**
 * Convierte banners originales del carrusel a WebP sin pérdida de resolución.
 *
 * Coloca PNG/JPG en public/images/hero/carousel/_source/ con el nombre original
 * (ver MAP abajo) y ejecuta: npm run carousel:import
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.join(
  process.cwd(),
  "public/images/hero/carousel/_source",
);
const OUT_DIR = path.join(process.cwd(), "public/images/hero/carousel");

/** [archivo fuente, webp de salida] */
const MAP = [
  ["Banners-04-scaled.jpeg", "01-footwear.webp"],
  ["Banners-02-1-scaled.jpeg", "02-yankees-polerones.webp"],
  ["Banners-01-1-scaled.jpeg", "03-chaquetas.webp"],
  ["Banner-Reuso01-1.png", "04-polerones-hoodies.webp"],
  ["BYC-Banner.png", "05-carteras-bolsos.webp"],
  ["Banner-CM-01.png", "06-castro.webp"],
  ["Banner-CM-02.png", "07-temuco.webp"],
  ["Banner-CM-03.png", "08-osorno.webp"],
  ["Banner-10anos.jpg.jpeg", "09-10-anos.webp"],
  ["Banners-Home01.png", "10-sportwear.webp"],
];

fs.mkdirSync(SOURCE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

async function convertOne(srcName, outName) {
  const input = path.join(SOURCE_DIR, srcName);
  if (!fs.existsSync(input)) {
    console.warn(`⚠ Falta: _source/${srcName}`);
    return;
  }

  const output = path.join(OUT_DIR, outName);
  const meta = await sharp(input).metadata();
  const isPng = meta.format === "png";

  if (isPng) {
    await sharp(input).webp({ lossless: true, effort: 6 }).toFile(output);
  } else {
    await sharp(input)
      .webp({ quality: 100, effort: 6, smartSubsample: false, nearLossless: true })
      .toFile(output);
  }

  const outMeta = await sharp(output).metadata();
  const outKb = Math.round(fs.statSync(output).size / 1024);
  console.log(
    `✓ ${outName}  ${meta.width}×${meta.height}  (${outKb} KB, ${isPng ? "lossless" : "q100"})`,
  );
}

console.log("Convirtiendo carrusel → WebP (sin redimensionar)\n");
await Promise.all(MAP.map(([src, out]) => convertOne(src, out)));
console.log("\nListo.");
