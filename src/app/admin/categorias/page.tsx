import { Suspense } from "react";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import {
  getCategoryDetail,
  listAdminCategoriesFlat,
  listCategoryTree,
} from "@/server/repositories/admin/categories.repository";
import { CategoryManager } from "@/components/admin/categories/category-manager";
import type { CategoryTreeFilters } from "@/types/admin-category";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp, { perPage: 50 });

  const treeFilters: CategoryTreeFilters = {
    q: getStringParam(sp, "q"),
    status: (getStringParam(sp, "status") as CategoryTreeFilters["status"]) ?? "all",
    empty: (getStringParam(sp, "empty") as CategoryTreeFilters["empty"]) ?? "all",
  };

  const view = getStringParam(sp, "view") ?? "tree";
  const type = getStringParam(sp, "type") as "category" | "subcategory" | undefined;
  const id = getStringParam(sp, "id");

  const [tree, flatResult, selectedDetail] = await Promise.all([
    listCategoryTree(treeFilters),
    view === "flat"
      ? listAdminCategoriesFlat(params)
      : Promise.resolve({ items: [], total: 0 }),
    type && id ? getCategoryDetail(id, type) : Promise.resolve(null),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
          Cargando categorías...
        </div>
      }
    >
      <CategoryManager
        tree={tree}
        flatItems={flatResult.items}
        flatTotal={flatResult.total}
        flatPage={params.page}
        flatPerPage={params.perPage}
        selectedDetail={selectedDetail}
        filters={{
          q: treeFilters.q,
          status: treeFilters.status ?? "all",
          empty: treeFilters.empty ?? "all",
          view,
        }}
      />
    </Suspense>
  );
}
