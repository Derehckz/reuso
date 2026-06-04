/**
 * Convierte logos en public/images/brands/_source/ → WebP sin perder resolución.
 * Nombres: 01.png … 20.png (o marcas reuso-01.png)
 *
 * npm run brands:import
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.join(process.cwd(), "public/images/brands/_source");
const BRANDS_DIR = path.join(process.cwd(), "public/images/brands");
const OUT_DIR = BRANDS_DIR;

fs.mkdirSync(SOURCE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

async function convertOne(num) {
  const id = num.padStart(2, "0");
  const source =
    fs.readdirSync(SOURCE_DIR).find((f) => {
      if (!IMAGE_EXT.test(f)) return false;
      const base = f.replace(IMAGE_EXT, "").toLowerCase();
      return base === id || base === `marcas reuso-${parseInt(id, 10)}`;
    }) ??
    fs.readdirSync(BRANDS_DIR).find((f) => {
      if (!IMAGE_EXT.test(f)) return false;
      const base = f.replace(IMAGE_EXT, "").toLowerCase();
      return base === `marcas reuso-${parseInt(id, 10)}`;
    });

  if (!source) {
    console.warn(`⚠ Falta logo para ${id} en _source/`);
    return;
  }

  const input = fs.existsSync(path.join(SOURCE_DIR, source))
    ? path.join(SOURCE_DIR, source)
    : path.join(BRANDS_DIR, source);
  const output = path.join(OUT_DIR, `${id}.webp`);
  const inputMeta = await sharp(input).metadata();
  const stats = await sharp(input).stats();
  const max = Math.max(...stats.channels.slice(0, 3).map((c) => c.max));
  const avg = stats.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;

  if (max < 5) {
    console.warn(`⚠ ${id}: archivo vacío o negro sólido — reemplaza el original`);
    return;
  }

  let pipeline = sharp(input).ensureAlpha();

  if (inputMeta.hasAlpha === false && avg < 80 && max > 100) {
    pipeline = pipeline.negate({ alpha: false });
  }

  await pipeline.trim({ threshold: 20 }).webp({ lossless: true, effort: 6 }).toFile(output);

  const outMeta = await sharp(output).metadata();
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`✓ ${id}.webp  ${outMeta.width}×${outMeta.height}  (${kb} KB)`);
}

const nums =
  process.argv.length > 2
    ? process.argv.slice(2)
    : Array.from({ length: 20 }, (_, i) => String(i + 1));

console.log("Importando marcas → WebP\n");
await Promise.all(nums.map(convertOne));
console.log("\nListo.");
