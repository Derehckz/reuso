import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type pg from "pg";
import { createPgPool, isConnectionError } from "@/lib/pg-pool";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let resetInFlight: Promise<PrismaClient> | null = null;

function createPool() {
  const pool = createPgPool();

  pool.on("error", (err) => {
    console.error("[prisma] Error en conexión del pool:", err.message);
  });

  globalForPrisma.pool = pool;
  return pool;
}

function getPool() {
  return globalForPrisma.pool ?? createPool();
}

function createPrismaClient() {
  return new PrismaClient({ adapter: new PrismaPg(getPool()) });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Crea pool + cliente nuevos y cierra el pool anterior sin bloquear requests en vuelo. */
export async function resetPrismaClient(): Promise<PrismaClient> {
  if (resetInFlight) {
    return resetInFlight;
  }

  resetInFlight = (async () => {
    const oldPool = globalForPrisma.pool;
    globalForPrisma.pool = undefined;
    globalForPrisma.prisma = undefined;

    const client = getPrismaClient();

    if (oldPool) {
      void oldPool.end().catch(() => {
        /* pool ya cerrado */
      });
    }

    return client;
  })().finally(() => {
    resetInFlight = null;
  });

  return resetInFlight;
}

async function reconnectAfterConnectionError<TArgs extends unknown[], TResult>(
  rerun: () => (...args: TArgs) => Promise<TResult>,
  args: TArgs,
): Promise<TResult> {
  if (resetInFlight) {
    await resetInFlight;
  } else {
    console.warn("[prisma] Reconectando tras error de conexión…");
    await resetPrismaClient();
  }
  return rerun()(...args);
}

function withRetry<TArgs extends unknown[], TResult>(
  run: (...args: TArgs) => Promise<TResult>,
  rerun: () => (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await run(...args);
    } catch (error) {
      if (!isConnectionError(error)) throw error;
      return reconnectAfterConnectionError(rerun, args);
    }
  };
}

function proxyModelDelegate(modelKey: string | symbol) {
  return new Proxy(
    {},
    {
      get(_target, methodKey) {
        const delegate = Reflect.get(getPrismaClient(), modelKey) as Record<
          string | symbol,
          unknown
        >;
        const method = delegate[methodKey];

        if (typeof method !== "function") {
          return method;
        }

        return withRetry(
          (...args: unknown[]) =>
            (method as (...a: unknown[]) => Promise<unknown>).apply(
              delegate,
              args,
            ),
          () => {
            const freshDelegate = Reflect.get(
              getPrismaClient(),
              modelKey,
            ) as Record<string | symbol, unknown>;
            const freshMethod = freshDelegate[methodKey];
            return (...args: unknown[]) =>
              (freshMethod as (...a: unknown[]) => Promise<unknown>).apply(
                freshDelegate,
                args,
              );
          },
        );
      },
    },
  );
}

function bindClientMethod(client: PrismaClient, prop: string | symbol) {
  const value = Reflect.get(client, prop);
  if (typeof value === "function") {
    return (value as (...args: unknown[]) => unknown).bind(client);
  }
  return value;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;

    const client = getPrismaClient();

    // $transaction, $queryRaw, etc. — sin proxy/retry (Prisma valida los argumentos)
    if (typeof prop === "string" && prop.startsWith("$")) {
      return bindClientMethod(client, prop);
    }

    if (typeof prop === "string") {
      const value = Reflect.get(client, prop);
      if (value && typeof value === "object") {
        return proxyModelDelegate(prop);
      }
    }

    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return withRetry(
        (...args: unknown[]) =>
          (value as (...a: unknown[]) => Promise<unknown>).apply(client, args),
        () => {
          const freshClient = getPrismaClient();
          const freshFn = Reflect.get(freshClient, prop) as (
            ...a: unknown[]
          ) => Promise<unknown>;
          return (...args: unknown[]) => freshFn.apply(freshClient, args);
        },
      );
    }

    return value;
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = getPrismaClient();
}
