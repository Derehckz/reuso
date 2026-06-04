import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogGridSkeleton } from "./catalog-grid-skeleton";

export function CatalogPageSkeleton() {
  return (
    <Container className="section-editorial !pt-8 md:!pt-10">
      <Skeleton className="h-12 w-48 md:h-14 md:w-64" />
      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-28 space-y-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-6 h-11 w-full max-w-xl" />
          <Skeleton className="mb-4 h-4 w-24" />
          <div className="mb-6 flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <CatalogGridSkeleton count={12} columns={4} />
          <div className="mt-12 flex justify-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </Container>
  );
}
