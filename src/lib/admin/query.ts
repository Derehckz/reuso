export type ListParams = {
  page: number;
  perPage: number;
  q?: string;
  sort?: string;
  order: "asc" | "desc";
};

export type ListParamsInput = Record<
  string,
  string | string[] | undefined
>;

export function parseListParams(
  searchParams: ListParamsInput,
  defaults?: { perPage?: number },
): ListParams {
  const page = Math.max(
    1,
    Number.parseInt(String(searchParams.page ?? "1"), 10) || 1,
  );
  const perPage = Math.min(
    50,
    Math.max(
      10,
      Number.parseInt(
        String(searchParams.perPage ?? defaults?.perPage ?? 20),
        10,
      ) || 20,
    ),
  );
  const q =
    typeof searchParams.q === "string" && searchParams.q.trim()
      ? searchParams.q.trim()
      : undefined;
  const order =
    searchParams.order === "asc" || searchParams.order === "desc"
      ? searchParams.order
      : "desc";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;

  return { page, perPage, q, sort, order };
}

export function getStringParam(
  searchParams: ListParamsInput,
  key: string,
): string | undefined {
  const v = searchParams[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export function buildPageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

export function buildPaginationHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
