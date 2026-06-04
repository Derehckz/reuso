/**
 * Design tokens — reuso
 * Identidad premium · minimalista editorial · fashion internacional
 */

export const colors = {
  brand: {
    green: "#1B3022",
    greenLight: "#2A4536",
    greenDark: "#0F1A14",
    beige: "#D2C1B0",
    beigeLight: "#E8DFD6",
    beigeMuted: "#F3EDE8",
    orange: "#F38121",
    orangeHover: "#E07010",
    orangeMuted: "#FEF3E8",
  },
  neutral: {
    black: "#0A0A0A",
    gray900: "#171717",
    gray700: "#404040",
    gray500: "#737373",
    gray400: "#A3A3A3",
    gray200: "#E5E5E5",
    gray100: "#F5F5F5",
    gray50: "#FAFAFA",
    white: "#FFFFFF",
  },
  semantic: {
    success: "#1B3022",
    error: "#B91C1C",
    warning: "#F38121",
  },
} as const;

/** Escala 4px — mobile-first */
export const spacing = {
  0: "0",
  1: "0.25rem", // 4
  2: "0.5rem", // 8
  3: "0.75rem", // 12
  4: "1rem", // 16
  5: "1.25rem", // 20
  6: "1.5rem", // 24
  8: "2rem", // 32
  10: "2.5rem", // 40
  12: "3rem", // 48
  16: "4rem", // 64
  20: "5rem", // 80
  24: "6rem", // 96
  32: "8rem", // 128
} as const;

export const typography = {
  fontFamily: {
    ui: '"Gotham", var(--font-fallback), system-ui, sans-serif',
    body: "var(--font-fallback), system-ui, sans-serif",
    editorial: "var(--font-editorial), Georgia, serif",
    logo: '"Reuso Script", "Brush Script MT", cursive',
  },
  fontSize: {
    "2xs": ["0.625rem", { lineHeight: "1", letterSpacing: "0.12em" }],
    xs: ["0.75rem", { lineHeight: "1.25", letterSpacing: "0.08em" }],
    sm: ["0.875rem", { lineHeight: "1.4" }],
    base: ["1rem", { lineHeight: "1.5" }],
    lg: ["1.125rem", { lineHeight: "1.4" }],
    xl: ["1.25rem", { lineHeight: "1.3" }],
    "2xl": ["1.5rem", { lineHeight: "1.2" }],
    "3xl": ["2rem", { lineHeight: "1.1" }],
    "4xl": ["2.5rem", { lineHeight: "1.05" }],
    "5xl": ["3.5rem", { lineHeight: "1" }],
    hero: ["clamp(2.5rem,8vw,5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const radius = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "8px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(10, 10, 10, 0.04)",
  md: "0 4px 12px rgba(10, 10, 10, 0.06)",
  lg: "0 12px 40px rgba(10, 10, 10, 0.08)",
  product: "0 8px 24px rgba(27, 48, 34, 0.06)",
} as const;

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

export const layout = {
  containerMax: "80rem", // 1280px
  containerPadding: {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem",
  },
  headerHeight: {
    announcement: "2.25rem",
    utility: "2.75rem",
    main: "4.5rem",
  },
} as const;
