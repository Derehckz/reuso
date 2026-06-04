"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, Tag, X } from "lucide-react";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";
import { HighlightQuery } from "@/components/search/highlight-query";
import {
  getRecentSearches,
  POPULAR_SEARCH_QUERIES,
  pushRecentSearch,
} from "@/lib/search/popular-queries";
import { searchCatalog } from "@/server/actions/search.actions";
import type { SearchCatalogResult } from "@/types/search";
import { cn, formatPrice } from "@/lib/utils";

type ProSearchVariant = "header" | "catalog" | "overlay";

type ProSearchProps = {
  variant?: ProSearchVariant;
  initialQuery?: string;
  className?: string;
  /** Sincroniza query con URL del catálogo (debounced). */
  onQueryChange?: (q: string) => void;
  onNavigate?: () => void;
  autoFocus?: boolean;
};

type FlatItem =
  | { type: "product"; index: number; href: string }
  | { type: "brand"; index: number; href: string }
  | { type: "category"; index: number; href: string }
  | { type: "view-all"; index: number; href: string }
  | { type: "chip"; index: number; query: string };

const EMPTY_RESULT: SearchCatalogResult = {
  products: [],
  brands: [],
  categories: [],
  totalProducts: 0,
};

export function ProSearch({
  variant = "header",
  initialQuery = "",
  className,
  onQueryChange,
  onNavigate,
  autoFocus = false,
}: ProSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [result, setResult] = useState<SearchCatalogResult>(EMPTY_RESULT);
  const [isPending, startTransition] = useTransition();

  const trimmed = query.trim();
  const showPanel = open;
  const hasQuery = trimmed.length >= 1;
  const minChars = 1;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, [open]);

  useEffect(() => {
    if (variant === "overlay") {
      setOpen(true);
    }
  }, [variant]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const catalogHref = useCallback(
    (q: string) => `/productos?q=${encodeURIComponent(q)}`,
    [],
  );

  const runSearch = useCallback((q: string) => {
    const term = q.trim();
    if (term.length < minChars) {
      setResult(EMPTY_RESULT);
      return;
    }
    startTransition(async () => {
      const data = await searchCatalog(term);
      setResult(data);
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
      if (onQueryChange) {
        const term = query.trim();
        if (term.length >= 2 || term.length === 0) {
          onQueryChange(term);
        }
      }
    }, variant === "catalog" ? 280 : 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch, onQueryChange, variant]);

  const flatItems: FlatItem[] = [];

  if (!hasQuery) {
    recent.forEach((term, i) => {
      flatItems.push({ type: "chip", index: i, query: term });
    });
    POPULAR_SEARCH_QUERIES.forEach((term, i) => {
      if (!recent.includes(term)) {
        flatItems.push({
          type: "chip",
          index: recent.length + i,
          query: term,
        });
      }
    });
  } else {
    let idx = 0;
    result.products.forEach((p) => {
      flatItems.push({
        type: "product",
        index: idx++,
        href: `/productos/${p.slug}`,
      });
    });
    result.brands.forEach((b) => {
      flatItems.push({
        type: "brand",
        index: idx++,
        href: catalogHref(b.name),
      });
    });
    result.categories.forEach((c) => {
      flatItems.push({ type: "category", index: idx++, href: c.href });
    });
    if (result.totalProducts > 0) {
      flatItems.push({
        type: "view-all",
        index: idx,
        href: catalogHref(trimmed),
      });
    }
  }

  const commitSearch = useCallback(
    (term: string, href?: string) => {
      const q = term.trim();
      if (!q) return;
      pushRecentSearch(q);
      setOpen(false);
      setQuery(q);
      onNavigate?.();
      router.push(href ?? catalogHref(q));
    },
    [catalogHref, onNavigate, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) =>
        flatItems.length === 0 ? -1 : Math.min(i + 1, flatItems.length - 1),
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        const item = flatItems[activeIndex];
        if (item.type === "chip") {
          commitSearch(item.query);
        } else {
          commitSearch(trimmed || query, item.href);
        }
        return;
      }
      if (trimmed) commitSearch(trimmed);
    }
  };

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, result]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const isHeader = variant === "header";
  const isOverlay = variant === "overlay";
  let itemOffset = 0;

  const fieldClass = cn(
    "relative flex items-center transition-all",
    isOverlay &&
      "border-0 border-b-2 border-neutral-200 bg-transparent shadow-none focus-within:border-brand-green",
    !isOverlay &&
      "rounded-full border border-brand-green/15 bg-white shadow-sm focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20",
  );

  const iconClass = cn(
    "pointer-events-none absolute h-4 w-4 text-brand-green/45",
    isOverlay ? "left-0 top-1/2 -translate-y-1/2" : "left-3.5",
  );
  const inputClass = cn(
    "w-full bg-transparent focus:outline-none",
    isOverlay &&
      "font-editorial py-2 pl-8 pr-12 text-2xl text-foreground placeholder:text-neutral-300 md:text-4xl md:leading-tight",
    !isOverlay &&
      "py-2.5 pl-10 pr-10 text-sm text-brand-green placeholder:text-neutral-400",
    isHeader && !isOverlay && "md:py-2",
    variant === "catalog" && "py-3 text-base",
  );
  const clearClass = cn(
    "absolute flex items-center justify-center text-neutral-400 transition-colors hover:text-brand-orange",
    isOverlay
      ? "right-0 top-1/2 h-10 w-10 -translate-y-1/2"
      : "right-2 h-7 w-7 rounded-full hover:bg-brand-beige-muted",
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <label htmlFor={listboxId} className="sr-only">
        Buscar productos, marcas y categorías
      </label>

      <div className={fieldClass}>
        <Search className={iconClass} strokeWidth={1.5} aria-hidden />
        <input
          ref={inputRef}
          id={listboxId}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            isOverlay
              ? "Poleras, Nike, chaquetas…"
              : "Buscar productos, marcas..."
          }
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${listboxId}-panel`}
          aria-autocomplete="list"
          className={inputClass}
        />
        {isPending ? (
          <Loader2
            className="absolute right-3 h-4 w-4 animate-spin text-brand-orange"
            aria-hidden
          />
        ) : (
          query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResult(EMPTY_RESULT);
                onQueryChange?.("");
                inputRef.current?.focus();
              }}
              className={clearClass}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )
        )}
      </div>

      {showPanel && (
        <div
          id={`${listboxId}-panel`}
          role="listbox"
          className={cn(
            "overflow-hidden bg-white",
            isOverlay
              ? "mt-8 max-h-[min(50vh,28rem)] border-t border-neutral-100 pt-6"
              : cn(
                  "absolute z-[60] animate-slide-down rounded-sm border border-brand-green/10 shadow-[0_16px_48px_rgba(27,48,34,0.18)]",
                  isHeader
                    ? "right-0 top-[calc(100%+0.5rem)] w-[min(100vw-2rem,24rem)] sm:w-[28rem]"
                    : "left-0 right-0 top-[calc(100%+0.5rem)]",
                ),
          )}
        >
          <div
            className={cn(
              "px-1 py-2",
              isOverlay
                ? "border-b border-neutral-100"
                : "border-b border-brand-beige bg-brand-beige-muted/80 px-4 py-2.5",
            )}
          >
            <p
              className={cn(
                "text-label-sm font-medium",
                isOverlay ? "text-neutral-400" : "text-brand-green",
              )}
            >
              {hasQuery
                ? isPending
                  ? "Buscando…"
                  : `${result.totalProducts} resultado${result.totalProducts === 1 ? "" : "s"}`
                : isOverlay
                  ? "Sugerencias"
                  : "Búsquedas populares"}
            </p>
          </div>

          <div
            className={cn(
              "overflow-y-auto",
              isOverlay ? "max-h-[min(48vh,26rem)]" : "max-h-[min(70vh,22rem)]",
            )}
          >
            {!hasQuery && (
              <div className="p-3">
                {recent.length > 0 && (
                  <p className="text-label-sm mb-2 px-1 text-neutral-500">
                    Recientes
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {flatItems.map((item, i) => {
                    if (item.type !== "chip") return null;
                    const active = activeIndex === i;
                    return (
                      <button
                        key={`chip-${item.query}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider transition-colors",
                          isOverlay
                            ? cn(
                                "border-b-2 px-0 py-1",
                                active
                                  ? "border-brand-orange text-brand-orange"
                                  : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-foreground",
                              )
                            : cn(
                                "rounded-full border px-3 py-1",
                                active
                                  ? "border-brand-orange bg-brand-orange text-white"
                                  : "border-brand-green/20 bg-brand-beige-muted text-brand-green hover:border-brand-orange hover:text-brand-orange",
                              ),
                        )}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => commitSearch(item.query)}
                      >
                        {item.query}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasQuery && !isPending && result.totalProducts === 0 && (
              <p className="p-6 text-center text-sm text-neutral-500">
                Sin resultados para &quot;{trimmed}&quot;
              </p>
            )}

            {hasQuery && result.products.length > 0 && (
              <section className="py-1">
                <p className="text-label-sm px-4 py-2 text-neutral-400">
                  Productos
                </p>
                <ul>
                  {result.products.map((item) => {
                    const i = itemOffset++;
                    const active = activeIndex === i;
                    return (
                      <li key={item.id} role="presentation">
                        <Link
                          href={`/productos/${item.slug}`}
                          role="option"
                          aria-selected={active}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors",
                            active
                              ? "bg-brand-orange-muted"
                              : "hover:bg-brand-beige-muted",
                          )}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => {
                            pushRecentSearch(trimmed);
                            setOpen(false);
                            onNavigate?.();
                          }}
                        >
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-brand-beige-muted">
                            {item.image ? (
                              <>
                                <Image
                                  src={item.image}
                                  alt=""
                                  fill
                                  className="object-contain p-1"
                                  sizes="44px"
                                />
                                <ModaCircularBadge
                                  size="sm"
                                  className="origin-top-left scale-[0.7]"
                                />
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center text-neutral-300">
                                <Tag className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-brand-green">
                              <HighlightQuery text={item.name} query={trimmed} />
                            </p>
                            {item.brand && (
                              <p className="mt-0.5 truncate text-xs text-neutral-500">
                                <HighlightQuery
                                  text={item.brand}
                                  query={trimmed}
                                />
                              </p>
                            )}
                            <p className="mt-1 text-sm font-semibold text-brand-orange">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {hasQuery && result.brands.length > 0 && (
              <section className="border-t border-neutral-100 py-1">
                <p className="text-label-sm px-4 py-2 text-neutral-400">
                  Marcas
                </p>
                <ul>
                  {result.brands.map((brand) => {
                    const i = itemOffset++;
                    const active = activeIndex === i;
                    return (
                      <li key={brand.name} role="presentation">
                        <Link
                          href={catalogHref(brand.name)}
                          role="option"
                          aria-selected={active}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                            active
                              ? "bg-brand-orange-muted text-brand-green"
                              : "text-brand-green hover:bg-brand-beige-muted",
                          )}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => {
                            pushRecentSearch(brand.name);
                            setOpen(false);
                            onNavigate?.();
                          }}
                        >
                          <span className="font-medium">
                            <HighlightQuery text={brand.name} query={trimmed} />
                          </span>
                          <span className="text-xs text-neutral-400">
                            {brand.productCount} producto
                            {brand.productCount === 1 ? "" : "s"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {hasQuery && result.categories.length > 0 && (
              <section className="border-t border-neutral-100 py-1">
                <p className="text-label-sm px-4 py-2 text-neutral-400">
                  Categorías
                </p>
                <ul>
                  {result.categories.map((cat) => {
                    const i = itemOffset++;
                    const active = activeIndex === i;
                    return (
                      <li key={cat.href} role="presentation">
                        <Link
                          href={cat.href}
                          role="option"
                          aria-selected={active}
                          className={cn(
                            "block px-4 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-brand-orange-muted text-brand-green"
                              : "text-brand-green hover:bg-brand-beige-muted",
                          )}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => {
                            setOpen(false);
                            onNavigate?.();
                          }}
                        >
                          <HighlightQuery text={cat.name} query={trimmed} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {hasQuery && result.totalProducts > 0 && (
              <div className="border-t border-neutral-100 p-2">
                {(() => {
                  const i = itemOffset;
                  const active = activeIndex === i;
                  return (
                    <Link
                      href={catalogHref(trimmed)}
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
                        isOverlay
                          ? cn(
                              "border border-neutral-900 bg-neutral-900 text-white hover:bg-brand-green",
                              active && "bg-brand-orange border-brand-orange",
                            )
                          : cn(
                              "rounded-full",
                              active
                                ? "bg-brand-orange text-white"
                                : "bg-brand-green text-white hover:bg-brand-green-light",
                            ),
                      )}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        pushRecentSearch(trimmed);
                        setOpen(false);
                        onNavigate?.();
                      }}
                    >
                      Ver los {result.totalProducts} resultados
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
