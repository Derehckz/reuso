"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FooterAccordionProps = {
  title: string;
  links: readonly { label: string; href: string }[];
  defaultOpen?: boolean;
  tone?: "light" | "dark";
};

export function FooterAccordion({
  title,
  links,
  defaultOpen = false,
  tone = "light",
}: FooterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "border-b lg:border-0",
        isDark ? "border-white/15" : "border-neutral-900/10",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left lg:pointer-events-none lg:py-0"
        aria-expanded={open}
      >
        <span
          className={cn(
            "text-label",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300 lg:hidden",
            open && "rotate-180",
            isDark ? "text-white/80" : "text-foreground",
          )}
          strokeWidth={1.5}
        />
      </button>
      <ul
        className={cn(
          "grid gap-2 overflow-hidden transition-all duration-300 lg:!grid lg:mt-4",
          open
            ? "max-h-96 pb-4 opacity-100"
            : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100",
        )}
      >
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                isDark
                  ? "text-white/75 hover:text-white"
                  : "text-neutral-600 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
