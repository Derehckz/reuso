const DEFAULT_SITE_URL = "https://reuso.dpcoding.cl";

/** URL pública válida para metadata, Auth y links absolutos. */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol).origin;
  } catch {
    console.warn(
      `[site] NEXT_PUBLIC_APP_URL inválida (${raw}), usando ${DEFAULT_SITE_URL}`,
    );
    return DEFAULT_SITE_URL;
  }
}
