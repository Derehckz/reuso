import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_LOGO } from "@/lib/constants/site-logo";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
  /** Altura visual del logo */
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-7 md:h-8",
  md: "h-9 md:h-11",
  lg: "h-11 md:h-14",
} as const;

export function Logo({
  className,
  variant = "default",
  size = "md",
}: LogoProps) {
  const src = variant === "light" ? SITE_LOGO.light : SITE_LOGO.default;

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80",
        className,
      )}
      aria-label="reuso — inicio"
    >
      <Image
        src={src}
        alt="reuso"
        width={SITE_LOGO.width}
        height={SITE_LOGO.height}
        priority
        unoptimized
        className={cn("w-auto max-w-[min(100vw-8rem,220px)] object-contain", sizeClass[size])}
        style={{ width: "auto", height: "auto" }}
      />
    </Link>
  );
}
