/**
 * Resuelve DATABASE_URL para el driver `pg`.
 * Prisma CLI acepta `prisma+postgres://`; el adapter necesita `postgres://`.
 */
export function resolveDatabaseUrl(connectionString?: string): string {
  const url = connectionString ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL no está definida");
  }

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return url;
  }

  if (url.startsWith("prisma+postgres://")) {
    try {
      const parsed = new URL(url);
      const apiKey = parsed.searchParams.get("api_key");
      if (apiKey) {
        const payload = JSON.parse(
          Buffer.from(apiKey, "base64url").toString("utf-8"),
        ) as { databaseUrl?: string };

        if (payload.databaseUrl) {
          return payload.databaseUrl;
        }
      }
    } catch {
      /* intentar base64 estándar */
      try {
        const parsed = new URL(url);
        const apiKey = parsed.searchParams.get("api_key");
        if (apiKey) {
          const payload = JSON.parse(
            Buffer.from(apiKey, "base64").toString("utf-8"),
          ) as { databaseUrl?: string };
          if (payload.databaseUrl) return payload.databaseUrl;
        }
      } catch {
        /* fall through */
      }
    }

    throw new Error(
      "No se pudo extraer la URL de Postgres desde DATABASE_URL (prisma+postgres). " +
        "Usa postgresql://user:pass@localhost:5432/reuso o ejecuta `npx prisma dev`.",
    );
  }

  return url;
}
