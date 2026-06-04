import { NextResponse } from "next/server";
import { expireStaleAwaitingPaymentOrders } from "@/server/services/order-lifecycle.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hours = Number.parseInt(
    new URL(request.url).searchParams.get("hours") ?? "48",
    10,
  );

  const cancelled = await expireStaleAwaitingPaymentOrders(
    Number.isNaN(hours) ? 48 : hours,
  );

  return NextResponse.json({ ok: true, cancelled });
}
