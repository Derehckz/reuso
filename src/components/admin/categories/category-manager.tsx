"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ListToolbar, AdminSearch } from "@/components/admin/list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { CategoryTreeSidebar } from "@/components/admin/categories/category-tree-sidebar";
import {
  CategoryDetailPanel,
  NewSubcategoryInline,
} from "@/components/admin/categories/category-detail-panel";
import { CategoriesFlatTable } from "@/components/admin/categories/categories-flat-table";
import { NewCategoryForm } from "@/components/admin/category-form";
import {
  bulkCategoryAction,
  quickUpdateCategoryNode,
  reorderCategories,
} from "@/server/actions/admin/categories.actions";
import type {
  AdminCategoryDetail,
  AdminCategoryTreeNode,
} from "@/types/admin-category";
import { cn } from "@/lib/utils";

type FlatRow = {
  id: string;
  type: "category" | "subcategory";
  parentName: string | null;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  subcategoryCount: number;
  isEmpty: boolean;
};

type CategoryManagerProps = {
  tree: AdminCategoryTreeNode[];
  flatItems: FlatRow[];
  flatTotal: number;
  flatPage: number;
  flatPerPage: number;
  selectedDetail: AdminCategoryDetail | null;
  filters: {
    q?: string;
    status?: string;
    empty?: string;
    view?: string;
  };
};

function parseKey(key: string): { id: string; type: "category" | "subcategory" } {
  const [type, id] = key.split(":") as ["category" | "subcategory", string];
  return { id, type };
}

export function CategoryManager({
  tree,
  flatItems,
  flatTotal,
  flatPage,
  flatPerPage,
  selectedDetail,
  filters,
}: CategoryManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showNewCategory, setShowNewCategory] = useState(
    searchParams.get("new") === "1",
  );

  const view = filters.view === "flat" ? "flat" : "tree";
  const selected = useMemo(() => {
    const type = searchParams.get("type") as "category" | "subcategory" | null;
    const id = searchParams.get("id");
    if (type && id) return { id, type };
    return null;
  }, [searchParams]);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.status && filters.status !== "all") p.set("status", filters.status);
    if (filters.empty && filters.empty !== "all") p.set("empty", filters.empty);
    if (view === "flat") p.set("view", "flat");
    return p;
  }, [filters, view]);

  const onSelect = useCallback(
    (node: { id: string; type: "category" | "subcategory" }) => {
      const p = new URLSearchParams(baseParams);
      p.set("type", node.type);
      p.set("id", node.id);
      router.push(`/admin/categorias?${p.toString()}`);
    },
    [baseParams, router],
  );

  const onCheck = (key: string, on: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const selectedItems = useMemo(
    () => [...checked].map(parseKey),
    [checked],
  );

  async function runBulk(action: "activate" | "deactivate" | "delete") {
    if (selectedItems.length === 0) {
      toast.error("Selecciona al menos una categoría");
      return;
    }
    if (action === "delete" && !confirm("¿Eliminar seleccionadas? Solo vacías.")) {
      return;
    }
    startTransition(async () => {
      const result = await bulkCategoryAction(
        selectedItems,
        action,
        action === "deactivate",
      );
      if (!result.success && "message" in result) {
        toast.error(result.message ?? "Error");
      } else {
        toast.success(
          "message" in result && result.message
            ? result.message
            : `${result.count ?? 0} actualizadas`,
        );
        setChecked(new Set());
        router.refresh();
      }
    });
  }

  async function handleReorder(
    items: { id: string; type: "category" | "subcategory"; sortOrder: number }[],
  ) {
    const result = await reorderCategories(items);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Orden actualizado");
      router.refresh();
    }
  }

  async function toggleActiveQuick() {
    if (!selectedDetail) return;
    const result = await quickUpdateCategoryNode({
      id: selectedDetail.id,
      type: selectedDetail.type,
      isActive: !selectedDetail.isActive,
    });
    if (!result.success) toast.error(result.message);
    else router.refresh();
  }

  return (
    <div className="-m-4 flex min-h-[calc(100vh-4rem)] flex-col md:-m-8">
      <div className="border-b border-neutral-200 bg-white px-4 py-4 md:px-8">
        <AdminPageHeader
          title="Categorías"
          description="Árbol de categorías y subcategorías"
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const p = new URLSearchParams(baseParams);
                  p.set("view", view === "tree" ? "flat" : "tree");
                  router.push(`/admin/categorias?${p.toString()}`);
                }}
              >
                {view === "tree" ? "Vista tabla" : "Vista árbol"}
              </Button>
              <Button type="button" size="sm" onClick={() => setShowNewCategory(true)}>
                Nueva categoría
              </Button>
            </div>
          }
        />

        <div className="mt-4">
        <ListToolbar>
          <AdminSearch
            defaultValue={filters.q}
            placeholder="Buscar nombre o slug..."
          />
          <select
            name="status"
            defaultValue={filters.status ?? "all"}
            className="border border-neutral-200 bg-white px-3 py-2 text-xs uppercase tracking-wider"
            onChange={(e) => {
              const p = new URLSearchParams(baseParams);
              if (e.target.value !== "all") p.set("status", e.target.value);
              else p.delete("status");
              router.push(`/admin/categorias?${p.toString()}`);
            }}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
          <select
            name="empty"
            defaultValue={filters.empty ?? "all"}
            className="border border-neutral-200 bg-white px-3 py-2 text-xs uppercase tracking-wider"
            onChange={(e) => {
              const p = new URLSearchParams(baseParams);
              if (e.target.value !== "all") p.set("empty", e.target.value);
              else p.delete("empty");
              router.push(`/admin/categorias?${p.toString()}`);
            }}
          >
            <option value="all">Todas</option>
            <option value="empty">Vacías</option>
            <option value="with_products">Con productos</option>
          </select>
        </ListToolbar>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2">
            <span className="text-xs text-neutral-600">
              {selectedItems.length} seleccionadas
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("activate")}
            >
              Activar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("deactivate")}
            >
              Desactivar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("delete")}
            >
              Eliminar vacías
            </Button>
          </div>
        )}
      </div>

      {showNewCategory && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-6 md:px-8">
          <div className="flex items-center justify-between">
            <h3 className="text-label">Nueva categoría</h3>
            <button
              type="button"
              className="text-xs uppercase text-neutral-500 hover:text-black"
              onClick={() => setShowNewCategory(false)}
            >
              Cerrar
            </button>
          </div>
          <div className="mt-4">
            <NewCategoryForm />
          </div>
        </div>
      )}

      {view === "flat" ? (
        <div className="flex-1 p-4 md:p-8">
          <CategoriesFlatTable
            items={flatItems}
            checked={checked}
            onCheck={onCheck}
          />
          <AdminPagination
            basePath="/admin/categorias"
            page={flatPage}
            perPage={flatPerPage}
            total={flatTotal}
            params={{
              q: filters.q,
              status: filters.status !== "all" ? filters.status : undefined,
              empty: filters.empty !== "all" ? filters.empty : undefined,
              view: "flat",
            }}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <aside className="w-full shrink-0 border-r border-neutral-200 md:w-72 lg:w-80">
            <CategoryTreeSidebar
              tree={tree}
              selected={selected}
              checked={checked}
              onSelect={onSelect}
              onCheck={onCheck}
              onReorder={handleReorder}
            />
          </aside>
          <main className="min-w-0 flex-1 bg-neutral-100">
            {selectedDetail ? (
              <div className="flex h-full flex-col">
                <CategoryDetailPanel
                  detail={selectedDetail}
                  onSaved={() => router.refresh()}
                  onDeleted={() => {
                    const p = new URLSearchParams(baseParams);
                    router.push(`/admin/categorias?${p.toString()}`);
                  }}
                />
                {selectedDetail.type === "category" && (
                  <div className="border-t border-neutral-200 bg-white px-4 py-4">
                    <NewSubcategoryInline
                      categoryId={selectedDetail.id}
                      onCreated={() => router.refresh()}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <p className="text-sm text-neutral-500">
                  Selecciona una categoría en el árbol o{" "}
                  <Link
                    href={`/admin/categorias?${baseParams.toString()}&new=1`}
                    className="text-brand-orange underline"
                  >
                    crea una nueva
                  </Link>
                </p>
                {selected && !selectedDetail && (
                  <p className="mt-2 text-xs text-red-600">Categoría no encontrada</p>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {selectedDetail && view === "tree" && (
        <div className="hidden border-t border-neutral-200 bg-white px-4 py-2 md:flex md:items-center md:gap-4">
          <button
            type="button"
            className={cn(
              "text-xs font-bold uppercase",
              selectedDetail.isActive ? "text-emerald-700" : "text-neutral-400",
            )}
            onClick={() => void toggleActiveQuick()}
          >
            {selectedDetail.isActive ? "Desactivar" : "Activar"} rápido
          </button>
          <span className="text-xs text-neutral-400">
            /productos?categoria={selectedDetail.slug}
          </span>
        </div>
      )}
    </div>
  );
}
