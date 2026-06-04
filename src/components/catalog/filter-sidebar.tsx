import { FilterPanel, type FilterOptions } from "./filter-panel";
import type { CatalogCategory } from "@/types/catalog";

type FilterSidebarProps = {
  options: FilterOptions;
  categories: CatalogCategory[];
};

export function FilterSidebar({ options, categories }: FilterSidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
      <div className="sticky top-28">
        <FilterPanel options={options} categories={categories} />
      </div>
    </aside>
  );
}

export type { FilterOptions };
