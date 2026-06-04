import { ProductCardSkeleton } from "./product-card-skeleton";

type CatalogGridSkeletonProps = {
  count?: number;
  columns?: 2 | 3 | 4;
};

export function CatalogGridSkeleton({
  count = 8,
  columns = 4,
}: CatalogGridSkeletonProps) {
  const gridClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 ${gridClass}`}
      aria-busy
      aria-label="Cargando productos"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
