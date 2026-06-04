import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <Skeleton className="mt-3 h-2 w-16" />
      <Skeleton className="mt-2 h-3 w-3/4" />
      <Skeleton className="mt-2 h-4 w-20" />
    </article>
  );
}
