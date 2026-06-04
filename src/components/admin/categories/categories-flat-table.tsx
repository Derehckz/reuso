"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { quickUpdateCategoryNode } from "@/server/actions/admin/categories.actions";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";

type FlatRow = {
  id: string;
  type: "category" | "subcategory";
  parentName: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  subcategoryCount: number;
  isEmpty: boolean;
};

export function CategoriesFlatTable({
  items,
  checked,
  onCheck,
}: {
  items: FlatRow[];
  checked: Set<string>;
  onCheck: (key: string, checked: boolean) => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveQuick(id: string, type: "category" | "subcategory") {
    setLoading(true);
    const result = await quickUpdateCategoryNode({
      id,
      type,
      name: editName,
    });
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Actualizado");
      setEditingId(null);
      router.refresh();
    }
  }

  return (
    <DataTable>
      <table className="w-full min-w-[720px]">
        <DataTableHeader>
          <DataTableHead className="w-8" />
          <DataTableHead>Nombre</DataTableHead>
          <DataTableHead>Padre</DataTableHead>
          <DataTableHead>Slug</DataTableHead>
          <DataTableHead>Productos</DataTableHead>
          <DataTableHead>Estado</DataTableHead>
          <DataTableHead />
        </DataTableHeader>
        <DataTableBody>
          {items.length === 0 ? (
            <DataTableEmpty message="Sin resultados" />
          ) : (
            items.map((row) => {
              const key = `${row.type}:${row.id}`;
              return (
                <DataTableRow key={key}>
                  <DataTableCell>
                    <input
                      type="checkbox"
                      checked={checked.has(key)}
                      onChange={(e) => onCheck(key, e.target.checked)}
                      className="accent-brand-orange"
                    />
                  </DataTableCell>
                  <DataTableCell className="font-medium">
                    {editingId === row.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border px-2 py-1 text-sm"
                        disabled={loading}
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        {row.name}
                        {row.isEmpty && (
                          <span className="rounded bg-neutral-200 px-1.5 text-[9px] uppercase text-neutral-500">
                            vacía
                          </span>
                        )}
                      </span>
                    )}
                  </DataTableCell>
                  <DataTableCell className="text-neutral-500">
                    {row.parentName ?? "—"}
                  </DataTableCell>
                  <DataTableCell className="text-neutral-500">{row.slug}</DataTableCell>
                  <DataTableCell>
                    {row.productCount}
                    {row.type === "category" && row.subcategoryCount > 0
                      ? ` (${row.subcategoryCount} sub)`
                      : ""}
                  </DataTableCell>
                  <DataTableCell>
                    <span
                      className={
                        row.isActive
                          ? "text-[10px] font-bold uppercase text-emerald-700"
                          : "text-[10px] font-bold uppercase text-neutral-400"
                      }
                    >
                      {row.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </DataTableCell>
                  <DataTableCell>
                    {editingId === row.id ? (
                      <button
                        type="button"
                        className="text-xs font-bold text-brand-orange"
                        disabled={loading}
                        onClick={() => saveQuick(row.id, row.type)}
                      >
                        OK
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="mr-3 text-xs font-bold uppercase text-brand-orange hover:underline"
                          onClick={() => {
                            setEditingId(row.id);
                            setEditName(row.name);
                          }}
                        >
                          Rápido
                        </button>
                        <Link
                          href={`/admin/categorias?type=${row.type}&id=${row.id}`}
                          className="text-xs font-bold uppercase text-neutral-600 hover:underline"
                        >
                          Abrir
                        </Link>
                      </>
                    )}
                  </DataTableCell>
                </DataTableRow>
              );
            })
          )}
        </DataTableBody>
      </table>
    </DataTable>
  );
}
