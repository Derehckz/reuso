import {
  getBluexpressAccountId,
  getBluexpressApiKey,
  getBluexpressApiUrl,
  isBluexpressConfigured,
} from "./config";
import { BluexpressError } from "./errors";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  path: string;
  body?: unknown;
  cache?: RequestCache;
};

export async function bluexpressFetch<T>(options: RequestOptions): Promise<T> {
  if (!isBluexpressConfigured()) {
    throw new BluexpressError(
      "Bluexpress API no configurada",
      "NOT_CONFIGURED",
    );
  }

  const apiKey = getBluexpressApiKey();
  const apiUrl = getBluexpressApiUrl();
  const accountId = getBluexpressAccountId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (accountId) {
    headers["X-Account-Id"] = accountId;
  }

  const response = await fetch(`${apiUrl}${options.path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errBody = (await response.json()) as { message?: string };
      detail = errBody.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new BluexpressError(
      `Bluexpress API error: ${detail}`,
      "API_ERROR",
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
