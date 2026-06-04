/** Rutas en `public/images/logo/` (PNG con transparencia). */
function logoPath(filename: string) {
  return `/images/logo/${encodeURIComponent(filename)}`;
}

export const SITE_LOGO = {
  default: "/images/logo/reuso.webp",
  light: "/images/logo/reuso-light.webp",
  horizontalLightSlogan: logoPath("Logo horizontal-blanco-slogan.png"),
  isotipoBeige: logoPath("Isotipo-beige.png"),
  isotipoWhite: logoPath("Isotipo-blanco.png"),
  width: 3552,
  height: 987,
  /** Logo horizontal + slogan (splash y piezas editoriales) */
  horizontalWidth: 1200,
  horizontalHeight: 320,
  isotipoWidth: 512,
  isotipoHeight: 512,
} as const;
