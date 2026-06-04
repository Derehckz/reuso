/**
 * Importa productos desde https://re-uso.cl/ (WooCommerce REST API v3).
 * - Categorías alineadas con el árbol de reuso (re-uso.cl).
 * - Imágenes descargadas a public/images/products/{slug}/*.webp
 *
 * Uso:
 *   npm run import:woocommerce -- --dry-run
 *   npm run import:woocommerce -- --limit=5 --publish
 *   npm run import:woocommerce -- --force
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Gender, ProductCondition } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/utils";
import { syncCategories } from "../src/server/catalog/sync-categories";
import { downloadProductImages } from "./lib/download-product-images";
import {
  buildWcCategoryTree,
  extractBrandFromWcCategories,
  resolveReusoSubcategorySlug,
  type WcCategoryNode,
} from "./lib/reuso-category-resolver";

const WC_URL = (
  process.env.WC_STORE_URL ?? "https://re-uso.cl"
).replace(/\/$/, "");
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

const MAP_PATH = path.join(
  process.cwd(),
  "scripts/woocommerce-category-map.json",
);

type WcImage = { src: string; alt?: string; position?: number };
type WcCategory = { id: number; name: string; slug: string };
type WcAttribute = {
  name: string;
  slug?: string;
  options: string[];
  variation?: boolean;
};
type WcProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  regular_price: string;
  sale_price: string;
  sku: string;
  categories: WcCategory[];
  images: WcImage[];
  attributes: WcAttribute[];
  stock_quantity: number | null;
  manage_stock: boolean;
  meta_data?: { key: string; value: unknown }[];
  tags?: { name: string }[];
  date_created?: string;
  date_modified?: string;
};

type WcVariation = {
  id: number;
  sku: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  image: WcImage | null;
  attributes: { name: string; option: string }[];
};

type VariantRow = {
  size: string;
  color: string;
  stock: number;
  price: number | null;
  sku: string | null;
};

type CategoryOverrides = Record<string, string>;

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const publish = process.argv.includes("--publish");
  const skipExisting = !process.argv.includes("--force");
  const skipImages = process.argv.includes("--skip-images");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const onlySlug = slugArg ? slugArg.split("=")[1] : undefined;
  return { dryRun, publish, skipExisting, skipImages, limit, onlySlug };
}

/** Evita choque en `sku` @unique entre productos WC distintos. */
async function resolveProductSku(
  sku: string | undefined,
  wcProductId: number,
  productSlug: string,
): Promise<string | null> {
  const trimmed = sku?.trim();
  if (!trimmed) return null;

  const conflict = await prisma.product.findFirst({
    where: { sku: trimmed, NOT: { slug: productSlug } },
  });
  if (conflict) return `${trimmed}-wc${wcProductId}`;
  return trimmed;
}

function loadCategoryOverrides(): CategoryOverrides {
  if (!fs.existsSync(MAP_PATH)) return {};
  const raw = JSON.parse(fs.readFileSync(MAP_PATH, "utf-8")) as CategoryOverrides & {
    _comment?: string;
  };
  const { _comment, ...map } = raw;
  void _comment;
  return map;
}

function wcApiUrl(apiPath: string, query: Record<string, string> = {}): string {
  const url = new URL(`${WC_URL}/wp-json/wc/v3${apiPath}`);
  url.searchParams.set("consumer_key", WC_KEY!);
  url.searchParams.set("consumer_secret", WC_SECRET!);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

async function wcFetch<T>(
  apiPath: string,
  query: Record<string, string> = {},
): Promise<T> {
  const res = await fetch(wcApiUrl(apiPath, query));
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WooCommerce ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllWcCategories(): Promise<WcCategoryNode[]> {
  const out: WcCategoryNode[] = [];
  let page = 1;

  while (true) {
    const batch = await wcFetch<WcCategoryNode[]>("/products/categories", {
      per_page: "100",
      page: String(page),
    });
    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return out;
}

async function fetchAllProducts(limit?: number): Promise<WcProduct[]> {
  const out: WcProduct[] = [];
  let page = 1;

  while (true) {
    const batch = await wcFetch<WcProduct[]>("/products", {
      per_page: "100",
      page: String(page),
      status: "publish",
    });
    if (batch.length === 0) break;
    out.push(...batch);
    if (limit && out.length >= limit) return out.slice(0, limit);
    if (batch.length < 100) break;
    page += 1;
  }

  return limit ? out.slice(0, limit) : out;
}

async function fetchVariations(productId: number): Promise<WcVariation[]> {
  const out: WcVariation[] = [];
  let page = 1;

  while (true) {
    const batch = await wcFetch<WcVariation[]>(
      `/products/${productId}/variations`,
      {
        per_page: "100",
        page: String(page),
      },
    );
    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return out;
}

function parseWcDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function publishedAtFromWc(p: WcProduct, isPublished: boolean): Date | null {
  if (!isPublished) return null;
  return parseWcDate(p.date_created) ?? new Date();
}

function parsePriceCLP(regular: string, sale: string): {
  basePrice: number;
  compareAtPrice: number | null;
} {
  const reg = Math.round(Number(regular) || 0);
  const sal = sale ? Math.round(Number(sale)) : 0;
  if (sal > 0 && sal < reg) {
    return { basePrice: sal, compareAtPrice: reg };
  }
  return { basePrice: reg, compareAtPrice: null };
}

function attrNameMatches(name: string, patterns: string[]): boolean {
  const n = name.toLowerCase();
  return patterns.some((p) => n.includes(p));
}

function genderFromSubcategorySlug(subSlug: string): Gender {
  if (subSlug.startsWith("hombre-")) return Gender.HOMBRE;
  if (subSlug.startsWith("mujer-")) return Gender.MUJER;
  return Gender.UNISEX;
}

function extractBrand(
  p: WcProduct,
  tree: ReturnType<typeof buildWcCategoryTree>,
): string | null {
  const fromMarcas = extractBrandFromWcCategories(p.categories, tree);
  if (fromMarcas) return fromMarcas;

  const brandAttr = p.attributes.find((a) =>
    attrNameMatches(a.name, ["marca", "brand"]),
  );
  if (brandAttr?.options[0]) return brandAttr.options[0];

  const metaBrand = p.meta_data?.find((m) =>
    ["_brand", "brand", "marca"].includes(m.key),
  );
  if (metaBrand && typeof metaBrand.value === "string" && metaBrand.value.trim()) {
    return metaBrand.value.trim();
  }

  return null;
}

function buildVariantsFromSimple(p: WcProduct): VariantRow[] {
  const sizeAttr = p.attributes.find((a) =>
    attrNameMatches(a.name, ["talla", "size", "tamaño"]),
  );
  const colorAttr = p.attributes.find((a) =>
    attrNameMatches(a.name, ["color", "colour"]),
  );

  const sizes = sizeAttr?.options.length ? sizeAttr.options : ["Única"];
  const colors = colorAttr?.options.length ? colorAttr.options : ["Único"];
  const { basePrice } = parsePriceCLP(p.regular_price, p.sale_price);
  const stock = p.manage_stock ? Math.max(0, p.stock_quantity ?? 0) : 1;

  const rows: VariantRow[] = [];
  for (const size of sizes) {
    for (const color of colors) {
      rows.push({
        size,
        color,
        stock: Math.max(
          1,
          Math.floor(stock / (sizes.length * colors.length)) || 1,
        ),
        price: basePrice,
        sku: p.sku || null,
      });
    }
  }
  return rows;
}

function buildVariantsFromWcVariations(
  variations: WcVariation[],
  fallbackPrice: number,
): VariantRow[] {
  return variations.map((v) => {
    const { basePrice } = parsePriceCLP(
      v.regular_price || String(fallbackPrice),
      v.sale_price,
    );
    let size = "Única";
    let color = "Único";
    for (const a of v.attributes) {
      if (attrNameMatches(a.name, ["talla", "size", "tamaño"])) size = a.option;
      if (attrNameMatches(a.name, ["color", "colour"])) color = a.option;
    }
    return {
      size,
      color,
      stock: v.manage_stock ? Math.max(0, v.stock_quantity ?? 0) : 1,
      price: basePrice,
      sku: v.sku || null,
    };
  });
}

async function upsertProduct(
  p: WcProduct,
  subBySlug: Record<string, { id: string }>,
  wcTree: ReturnType<typeof buildWcCategoryTree>,
  overrides: CategoryOverrides,
  opts: {
    dryRun: boolean;
    publish: boolean;
    skipExisting: boolean;
    skipImages: boolean;
  },
) {
  if (p.type === "grouped" || p.type === "external") {
    console.log(`  ⊘ Omitido (tipo ${p.type}): ${p.name}`);
    return;
  }

  const slug = p.slug || slugify(p.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && opts.skipExisting) {
    console.log(`  ↷ Ya existe: ${slug}`);
    return;
  }

  const subSlug = resolveReusoSubcategorySlug(p.categories, wcTree, overrides);
  const sub = subBySlug[subSlug];
  if (!sub) {
    console.warn(
      `  ⚠ Subcategoría desconocida «${subSlug}» para «${p.name}»`,
    );
    return;
  }

  let variants: VariantRow[] = [];
  if (p.type === "variable") {
    const wcVars = await fetchVariations(p.id);
    const { basePrice } = parsePriceCLP(p.regular_price, p.sale_price);
    variants = buildVariantsFromWcVariations(wcVars, basePrice);
  } else {
    variants = buildVariantsFromSimple(p);
  }

  if (variants.length === 0) {
    variants = [
      {
        size: "Única",
        color: "Único",
        stock: 1,
        price: parsePriceCLP(p.regular_price, p.sale_price).basePrice,
        sku: p.sku || null,
      },
    ];
  }

  const { basePrice, compareAtPrice } = parsePriceCLP(
    p.regular_price,
    p.sale_price,
  );
  const brand = extractBrand(p, wcTree);
  const gender = genderFromSubcategorySlug(subSlug);
  const isPublished = opts.publish || p.status === "publish";
  const productSku = await resolveProductSku(p.sku, p.id, slug);

  let localImages: Awaited<ReturnType<typeof downloadProductImages>> = [];
  if (!opts.skipImages && p.images.length > 0) {
    localImages = await downloadProductImages(slug, p.images, {
      dryRun: opts.dryRun,
      skipExisting: opts.skipExisting,
    });
  }

  if (opts.dryRun) {
    console.log(
      `  ✓ [dry-run] ${p.name}\n` +
        `      → ${subSlug} | ${variants.length} var. | ${localImages.length} imgs → public/images/products/${slug}/`,
    );
    return;
  }

  const description = p.description?.replace(/<[^>]+>/g, " ").trim() || null;
  const shortDescription =
    p.short_description?.replace(/<[^>]+>/g, " ").trim() || null;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        description,
        shortDescription,
        subcategoryId: sub.id,
        sku: productSku,
        brand,
        gender,
        basePrice,
        compareAtPrice,
        isPublished,
        publishedAt: publishedAtFromWc(p, isPublished),
        condition: ProductCondition.MUY_BUENO,
      },
      create: {
        name: p.name,
        slug,
        description,
        shortDescription,
        subcategoryId: sub.id,
        sku: productSku,
        brand,
        gender,
        basePrice,
        compareAtPrice,
        condition: ProductCondition.MUY_BUENO,
        isPublished,
        publishedAt: publishedAtFromWc(p, isPublished),
      },
    });

    await tx.productImage.deleteMany({ where: { productId: product.id } });
    if (localImages.length > 0) {
      await tx.productImage.createMany({
        data: localImages.map((img) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt || p.name,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
      });
    }

    for (const v of variants) {
      let variantSku = v.sku;
      if (variantSku) {
        const skuTaken = await tx.productVariant.findFirst({
          where: {
            sku: variantSku,
            NOT: { productId: product.id, size: v.size, color: v.color },
          },
        });
        if (skuTaken) variantSku = `${variantSku}-wc${p.id}`;
      }

      const variant = await tx.productVariant.upsert({
        where: {
          productId_size_color: {
            productId: product.id,
            size: v.size,
            color: v.color,
          },
        },
        update: {
          sku: variantSku,
          price: v.price,
          isActive: true,
          deletedAt: null,
        },
        create: {
          productId: product.id,
          size: v.size,
          color: v.color,
          sku: variantSku,
          price: v.price,
        },
      });

      await tx.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantityOnHand: v.stock },
        create: {
          variantId: variant.id,
          quantityOnHand: v.stock,
          quantityReserved: 0,
          lowStockThreshold: 1,
        },
      });
    }
  });

  console.log(`  ✓ ${p.name} → ${subSlug} (${localImages.length} imgs locales)`);
}

async function syncPublishedDates(
  products: WcProduct[],
  dryRun: boolean,
) {
  let updated = 0;
  for (const p of products) {
    const slug = p.slug || slugify(p.name);
    const publishedAt = parseWcDate(p.date_created);
    if (!publishedAt) continue;

    if (!dryRun) {
      const result = await prisma.product.updateMany({
        where: { slug },
        data: { publishedAt },
      });
      if (result.count > 0) updated += 1;
    } else {
      updated += 1;
    }
  }
  console.log(
    dryRun
      ? `[dry-run] Actualizaría publishedAt en ${updated} productos`
      : `publishedAt sincronizado desde WooCommerce: ${updated} productos`,
  );
}

async function main() {
  const { dryRun, publish, skipExisting, skipImages, limit, onlySlug } =
    parseArgs();
  const syncDates = process.argv.includes("--sync-dates");

  if (!WC_KEY || !WC_SECRET) {
    console.error(
      "Define WC_CONSUMER_KEY y WC_CONSUMER_SECRET en .env\n" +
        "WooCommerce en re-uso.cl → Ajustes → Avanzado → REST API (Lectura)",
    );
    process.exit(1);
  }

  console.log("Descargando productos…");
  let products = await fetchAllProducts(limit);

  if (syncDates) {
    await syncPublishedDates(products, dryRun);
    return;
  }

  const overrides = loadCategoryOverrides();

  console.log("Sincronizando categorías reuso (árbol re-uso.cl)…");
  const { subBySlug } = await syncCategories(prisma);

  console.log(`Cargando categorías WooCommerce desde ${WC_URL}…`);
  const wcCategories = await fetchAllWcCategories();
  const wcTree = buildWcCategoryTree(wcCategories);
  console.log(`  ${wcCategories.length} categorías WC indexadas`);
  if (onlySlug) {
    products = products.filter((p) => (p.slug || slugify(p.name)) === onlySlug);
    console.log(`  Filtro slug=${onlySlug}: ${products.length} producto(s)`);
  } else {
    console.log(`  ${products.length} productos publicados`);
  }

  if (dryRun) console.log("\n(modo dry-run — no escribe DB ni descarga archivos)\n");
  if (skipImages) console.log("(omitiendo descarga de imágenes)\n");

  let ok = 0;
  let fail = 0;

  for (const p of products) {
    try {
      await upsertProduct(p, subBySlug, wcTree, overrides, {
        dryRun,
        publish,
        skipExisting,
        skipImages,
      });
      ok += 1;
    } catch (err) {
      fail += 1;
      console.error(`  ✗ ${p.name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nListo: ${ok} procesados, ${fail} errores.`);
  if (!dryRun && !skipImages) {
    console.log(
      "Imágenes en public/images/products/ — rutas /images/products/... en la BD.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
