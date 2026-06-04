import { ProductCard } from "@/components/ui/product-card";
import type { ProductListItem } from "@/types/product";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: ProductListItem[];
  columns?: 2 | 3 | 4 | 5;
};

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-label text-neutral-400">Sin productos</p>
        <p className="mt-2 text-sm text-neutral-500">
          Pronto tendremos nuevas piezas curadas.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10",
        columnClasses[columns],
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
