"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSearch({
  placeholder = "Buscar...",
  defaultValue = "",
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const q = String(fd.get("q") ?? "").trim();
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <form onSubmit={onSubmit} className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        strokeWidth={1.5}
      />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "w-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm",
          "placeholder:text-neutral-400 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green",
          isPending && "opacity-60",
        )}
      />
    </form>
  );
}

export function AdminFilterSelect({
  name,
  label,
  options,
  defaultValue = "",
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set(name, e.target.value);
        else params.delete(name);
        params.delete("page");
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`);
        });
      }}
      className="border border-neutral-200 bg-white px-3 py-2.5 text-xs uppercase tracking-wider text-neutral-700 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ListToolbar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}
