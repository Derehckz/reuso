"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  catalogCategoryHref,
  catalogSubcategoryHref,
  type NavCategoryTree,
  type NavSubcategoryItem,
} from "@/lib/constants/category-subcategories";
import { isCategoryFamilyActive } from "@/lib/catalog-category";

export type NavCategory = NavCategoryTree;

function isSubcategoryActive(
  sub: NavSubcategoryItem,
  currentCategory: string | null,
) {
  if (!currentCategory) return false;
  if (sub.slug === currentCategory) return true;
  return sub.children?.some((c) => c.slug === currentCategory) ?? false;
}

type CategoryNavMenuProps = {
  categories: NavCategory[];
  overlay?: boolean;
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
};

export function CategoryNavMenu({
  categories,
  overlay = false,
  onNavigate,
  variant,
}: CategoryNavMenuProps) {
  const searchParams = useSearchParams();
  const currentCategory =
    searchParams.get("categoria") ?? searchParams.get("category");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (variant !== "desktop") return;
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpenSlug(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [variant]);

  const linkClass = (active: boolean, depth: "sub" | "child" = "sub") =>
    cn(
      "block transition-colors",
      variant === "desktop"
        ? cn(
            "px-4 py-2 text-sm",
            depth === "child" ? "pl-6" : "",
            active
              ? "font-semibold text-brand-orange"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-brand-orange",
          )
        : cn(
            "py-2 transition-colors",
            depth === "child" ? "text-sm" : "text-base",
            active
              ? "font-semibold text-brand-orange"
              : "text-neutral-600 hover:text-brand-orange",
          ),
    );

  const renderSubcategoryLinks = (
    cat: NavCategory,
    sub: NavSubcategoryItem,
    onClick?: () => void,
  ) => {
    const subActive = isSubcategoryActive(sub, currentCategory);

    return (
      <li key={sub.id}>
        <Link
          href={catalogSubcategoryHref(sub.slug, cat.gender)}
          onClick={onClick}
          className={linkClass(subActive, "sub")}
        >
          {sub.name}
        </Link>
        {sub.children && sub.children.length > 0 && (
          <ul className={variant === "desktop" ? "pb-1" : "ml-3 border-l border-neutral-200 pl-3"}>
            {sub.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={catalogSubcategoryHref(child.slug, cat.gender)}
                  onClick={onClick}
                  className={linkClass(currentCategory === child.slug, "child")}
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  if (variant === "mobile") {
    return (
      <ul className="flex flex-col gap-1">
        {categories.map((cat) => {
          const catHref = catalogCategoryHref(cat.slug, cat.gender);
          const familyActive = isCategoryFamilyActive(cat, currentCategory);

          return (
            <li key={cat.id} className="border-b border-neutral-900/5">
              <Link
                href={catHref}
                onClick={onNavigate}
                className={cn(
                  "font-editorial block py-4 text-3xl tracking-tight",
                  familyActive
                    ? "text-brand-orange"
                    : "text-foreground hover:text-brand-orange",
                )}
              >
                {cat.name.toUpperCase()}
              </Link>

              {cat.subcategories.length > 0 && (
                <ul className="mb-4 ml-1 space-y-1 border-l border-neutral-200 pl-4">
                  {cat.subcategories.map((sub) =>
                    renderSubcategoryLinks(cat, sub, onNavigate),
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul ref={menuRef} className="flex items-center gap-8 xl:gap-10">
      {categories.map((cat) => {
        const catHref = catalogCategoryHref(cat.slug, cat.gender);
        const isOpen = openSlug === cat.slug;
        const familyActive = isCategoryFamilyActive(cat, currentCategory);

        return (
          <li
            key={cat.id}
            className="group relative"
            onMouseEnter={() => setOpenSlug(cat.slug)}
            onMouseLeave={() => setOpenSlug(null)}
          >
            <div className="inline-flex items-center gap-0.5">
              <Link
                href={catHref}
                className={cn(
                  "text-nav transition-colors",
                  overlay
                    ? "text-white hover:text-brand-orange group-hover:text-brand-orange"
                    : "text-foreground hover:text-brand-orange group-hover:text-brand-orange",
                  (familyActive || isOpen) && "text-brand-orange",
                )}
              >
                {cat.name.toUpperCase()}
              </Link>
              {cat.subcategories.length > 0 && (
                <button
                  type="button"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    overlay
                      ? "text-white/90 hover:text-brand-orange group-hover:text-brand-orange"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-brand-orange group-hover:text-brand-orange",
                    isOpen && "text-brand-orange",
                  )}
                  aria-expanded={isOpen}
                  aria-label={`Atajos ${cat.name}`}
                  onClick={() => setOpenSlug(isOpen ? null : cat.slug)}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            {isOpen && cat.subcategories.length > 0 && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="min-w-[220px] rounded-sm border border-neutral-200 bg-white py-2 shadow-lg">
                  <ul>
                    {cat.subcategories.map((sub) =>
                      renderSubcategoryLinks(cat, sub, () => {
                        setOpenSlug(null);
                        onNavigate?.();
                      }),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
