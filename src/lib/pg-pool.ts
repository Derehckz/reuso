import pg from "pg";
import { resolveDatabaseUrl } from "@/lib/database-url";

export function isPoolClosedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { message?: string };
  return e.message?.includes("Cannot use a pool after calling end") === true;
}

export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if (isPoolClosedError(error)) return true;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "ECONNREFUSED" ||
    e.code === "ECONNRESET" ||
    e.code === "P1017" ||
    e.message?.includes("Connection terminated") === true ||
    e.message?.includes("Connection closed") === true ||
    e.message?.includes("Server has closed the connection") === true ||
    e.message?.includes("timeout exceeded") === true
  );
}

export function createPgPool(): pg.Pool {
  return new pg.Pool({
    connectionString: resolveDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  });
}
