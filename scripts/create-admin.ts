/**
 * Crea o resetea el usuario admin (sin tocar productos).
 * Uso: npm run admin:create
 * Opcional: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
 */
import bcrypt from "bcryptjs";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@reuso.cl").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      isBlocked: false,
      deletedAt: null,
    },
    create: {
      email,
      name: "Admin Reuso",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  console.log(`Admin listo: ${admin.email} (${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
