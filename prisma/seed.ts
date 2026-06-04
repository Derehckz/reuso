import {
  PrismaClient,
  Gender,
  ProductCondition,
  CouponType,
  ReviewStatus,
} from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { PRODUCT_IMAGE_BY_SLUG } from "../src/lib/constants/home-images";
import { BRAND_LOGOS } from "../src/lib/constants/brand-logos";
import { syncCategories } from "../src/server/catalog/sync-categories";

async function seedInventory(
  variantId: string,
  quantity: number,
) {
  return prisma.inventory.upsert({
    where: { variantId },
    update: { quantityOnHand: quantity },
    create: {
      variantId,
      quantityOnHand: quantity,
      quantityReserved: 0,
      lowStockThreshold: 1,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@reuso.cl" },
    update: {},
    create: {
      email: "admin@reuso.cl",
      name: "Admin Reuso",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const { subBySlug } = await syncCategories(prisma);

  const productsData = [
    {
      name: "Polera Vintage 041",
      slug: "polera-vintage-041",
      brand: "J.Crew",
      gender: Gender.MUJER,
      basePrice: 25000,
      compareAtPrice: 35000,
      isFeatured: true,
      isNewArrival: true,
      subcategoryId: subBySlug["mujer-poleras"]!.id,
      variants: [
        { size: "S", color: "Blanco", colorHex: "#FFFFFF", stock: 2 },
        { size: "M", color: "Blanco", colorHex: "#FFFFFF", stock: 1 },
        { size: "L", color: "Beige", colorHex: "#D2C1B0", stock: 3 },
      ],
    },
    {
      name: "Jean Levi's 501",
      slug: "jean-levis-501",
      brand: "Levi's",
      gender: Gender.MUJER,
      basePrice: 45000,
      isFeatured: true,
      subcategoryId: subBySlug["mujer-pantalones"]!.id,
      variants: [
        { size: "28", color: "Azul", colorHex: "#1E3A5F", stock: 1 },
        { size: "30", color: "Azul", colorHex: "#1E3A5F", stock: 2 },
      ],
    },
    {
      name: "Polerón NY Yankees",
      slug: "poleron-ny-yankees",
      brand: "MLB",
      gender: Gender.HOMBRE,
      basePrice: 38000,
      isNewArrival: true,
      subcategoryId: subBySlug["hombre-polerones"]!.id,
      variants: [
        { size: "M", color: "Verde", colorHex: "#4A6741", stock: 2 },
        { size: "L", color: "Negro", colorHex: "#000000", stock: 1 },
      ],
    },
    {
      name: "Zapatilla Jordan 1",
      slug: "zapatilla-jordan-1",
      brand: "Nike",
      gender: Gender.UNISEX,
      basePrice: 120000,
      compareAtPrice: 150000,
      isFeatured: true,
      condition: ProductCondition.EXCELENTE,
      subcategoryId: subBySlug["mujer-zapatillas"]!.id,
      variants: [
        { size: "40", color: "Rojo/Negro", colorHex: "#C41E3A", stock: 1 },
        { size: "42", color: "Rojo/Negro", colorHex: "#C41E3A", stock: 1 },
      ],
    },
    {
      name: "Cartera Coach Vintage",
      slug: "cartera-coach-vintage",
      brand: "Coach",
      gender: Gender.MUJER,
      basePrice: 89000,
      isFeatured: true,
      subcategoryId: subBySlug["mujer-carteras"]!.id,
      variants: [
        { size: "Única", color: "Marrón", colorHex: "#8B4513", stock: 1 },
      ],
    },
    {
      name: "Camiseta AC Milan Away 2023",
      slug: "camiseta-ac-milan-away-2023",
      brand: "AC Milan",
      gender: Gender.HOMBRE,
      basePrice: 32990,
      compareAtPrice: 45990,
      isFeatured: true,
      isNewArrival: true,
      condition: ProductCondition.MUY_BUENO,
      subcategoryId: subBySlug["ropa-deportiva-camisetas-futbol"]!.id,
      variants: [
        { size: "S", color: "Blanco/Rojo", colorHex: "#FFFFFF", stock: 2 },
        { size: "M", color: "Blanco/Rojo", colorHex: "#FFFFFF", stock: 3 },
        { size: "L", color: "Blanco/Rojo", colorHex: "#FFFFFF", stock: 2 },
        { size: "XL", color: "Blanco/Rojo", colorHex: "#FFFFFF", stock: 1 },
      ],
    },
  ];

  for (const p of productsData) {
    const { variants, ...productData } = p;
    const imageUrl =
      PRODUCT_IMAGE_BY_SLUG[productData.slug] ?? "/images/placeholder.svg";

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        subcategoryId: productData.subcategoryId,
        isFeatured: productData.isFeatured ?? false,
        isNewArrival: productData.isNewArrival ?? false,
        isPublished: true,
        publishedAt: new Date(),
      },
      create: {
        ...productData,
        condition: productData.condition ?? ProductCondition.MUY_BUENO,
        isPublished: true,
        publishedAt: new Date(),
        images: {
          create: [
            {
              url: imageUrl,
              alt: productData.name,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    const primaryImage = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });

    if (primaryImage) {
      await prisma.productImage.update({
        where: { id: primaryImage.id },
        data: { url: imageUrl, alt: productData.name },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: productData.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    for (const v of variants) {
      const variant = await prisma.productVariant.upsert({
        where: {
          productId_size_color: {
            productId: product.id,
            size: v.size,
            color: v.color,
          },
        },
        update: {},
        create: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
        },
      });
      await seedInventory(variant.id, v.stock);
    }
  }

  await prisma.coupon.upsert({
    where: { code: "BIENVENIDO10" },
    update: {},
    create: {
      code: "BIENVENIDO10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minPurchase: 15000,
      isActive: true,
    },
  });

  await prisma.shippingZone.upsert({
    where: { regionCode: "RM" },
    update: {},
    create: { name: "Región Metropolitana", regionCode: "RM", basePrice: 3690 },
  });

  await prisma.shippingZone.upsert({
    where: { regionCode: "REGIONS" },
    update: {},
    create: { name: "Regiones", regionCode: "REGIONS", basePrice: 6390 },
  });

  for (const brand of BRAND_LOGOS) {
    await prisma.brandLogo.upsert({
      where: { id: brand.id },
      update: {
        name: brand.name,
        imageUrl: brand.imageSrc,
        sortOrder: brand.sortOrder,
        isActive: true,
      },
      create: {
        id: brand.id,
        name: brand.name,
        imageUrl: brand.imageSrc,
        sortOrder: brand.sortOrder,
        isActive: true,
      },
    });
  }

  const shippingZones = [
    { name: "Región Metropolitana", regionCode: "RM", basePrice: 3690 },
    { name: "Valparaíso", regionCode: "V", basePrice: 4990 },
    { name: "Biobío", regionCode: "VIII", basePrice: 6390 },
    { name: "La Araucanía", regionCode: "IX", basePrice: 6390 },
    { name: "Los Lagos", regionCode: "X", basePrice: 6990 },
    { name: "Magallanes", regionCode: "XII", basePrice: 8990 },
  ];

  for (const zone of shippingZones) {
    await prisma.shippingZone.upsert({
      where: { regionCode: zone.regionCode },
      update: { basePrice: zone.basePrice, name: zone.name },
      create: zone,
    });
  }

  await prisma.banner.createMany({
    data: [
      {
        title: "MUJER",
        subtitle: "Nueva colección editorial",
        imageUrl: "/images/placeholder.svg",
        link: "/mujer",
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed OK:", {
    admin: admin.email,
    categories: 3,
    subcategories: Object.keys(subBySlug).length,
    products: productsData.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
