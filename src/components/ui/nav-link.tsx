"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
};

export function NavLink({
  href,
  children,
  active,
  className,
  onClick,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className={cn(
        "link-underline text-nav transition-colors duration-300",
        active
          ? "text-brand-orange data-[active=true]:text-brand-orange"
          : "text-foreground hover:text-brand-orange",
        className,
      )}
    >
      {children}
    </Link>
  );
}
