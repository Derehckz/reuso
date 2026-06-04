/** Términos sugeridos cuando el buscador está vacío (estilo tienda pro). */
export const POPULAR_SEARCH_QUERIES = [
  "Nike",
  "Jordan",
  "Coach",
  "Poleras",
  "Zapatillas",
  "Chaquetas",
  "Levi's",
  "AC Milan",
] as const;

const RECENT_KEY = "reuso-recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2 || typeof window === "undefined") return;
  const prev = getRecentSearches().filter(
    (q) => q.toLowerCase() !== trimmed.toLowerCase(),
  );
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([trimmed, ...prev].slice(0, MAX_RECENT)),
  );
}
