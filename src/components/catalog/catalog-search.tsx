"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProSearch } from "@/components/search/pro-search";

type CatalogSearchProps = {
  initialQuery?: string;
  className?: string;
};

export function CatalogSearch({ initialQuery = "", className }: CatalogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const pushQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
      params.delete("page");
      startTransition(() => {
        router.push(`/productos?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <ProSearch
      variant="catalog"
      initialQuery={initialQuery}
      className={className}
      onQueryChange={pushQuery}
    />
  );
}
