/**
 * Cancela órdenes en AWAITING_PAYMENT / PENDING más antiguas que N horas
 * y libera inventario + cupones reservados.
 *
 * Uso:
 *   npm run orders:expire              # default 48h (igual que el cron)
 *   npm run orders:expire -- --hours 0 # todas las pendientes (pruebas)
 *   npm run orders:expire -- --hours 2 # más de 2 horas sin pago
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { expireStaleAwaitingPaymentOrders } from "../src/server/services/order-lifecycle.service";

const args = process.argv.slice(2);

function arg(name: string, fallback: string): string {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const hours = Number.parseInt(arg("--hours", "48"), 10);
const safeHours = Number.isNaN(hours) ? 48 : Math.max(0, hours);

async function main() {
  console.log("=== Expirar órdenes sin pago ===\n");

  const pending = await prisma.order.findMany({
    where: { status: { in: ["AWAITING_PAYMENT", "PENDING"] } },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      guestEmail: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log(`Pendientes ahora: ${pending.length}`);
  for (const o of pending) {
    const ageH = Math.round(
      (Date.now() - o.createdAt.getTime()) / (60 * 60 * 1000),
    );
    console.log(
      `  · ${o.orderNumber} · ${o.status} · ${ageH}h · $${o.total.toLocaleString("es-CL")}`,
    );
  }

  console.log(`\nCancelando órdenes con más de ${safeHours}h sin pago…\n`);

  const cancelled = await expireStaleAwaitingPaymentOrders(safeHours);

  console.log(`✅ Canceladas: ${cancelled}`);
  if (cancelled > 0) {
    console.log("   Inventario y cupones reservados fueron liberados.\n");
  } else if (pending.length > 0 && safeHours > 0) {
    console.log(
      `   Aún hay pendientes más nuevas que ${safeHours}h. Usa --hours 0 para limpiar pruebas.\n`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
