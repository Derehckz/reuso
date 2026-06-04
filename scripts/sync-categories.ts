import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { syncCategories } from "../src/server/catalog/sync-categories";

async function main() {
  const { subBySlug } = await syncCategories(prisma);
  console.log(
    "Categorías sincronizadas:",
    Object.keys(subBySlug).length,
    "subcategorías",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
