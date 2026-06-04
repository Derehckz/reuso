"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bulkUpdateProducts } from "@/server/actions/admin/products.actions";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { PublishedBadge, StockBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/lib/utils";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  isPublished: boolean;
  categoryName: string;
  subcategoryName: string;
  imageUrl: string | null;
  stock: number;
};

type BulkAction = "publish" | "unpublish" | "feature" | "unfeature";

export function ProductsListClient({ items }: { items: ProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const allSelected = items.length > 0 && selected.size === items.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run(action: BulkAction) {
    if (selected.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    setLoading(true);
    const result = await bulkUpdateProducts([...selected], action);
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      const msg =
        "message" in result && result.message
          ? result.message
          : "published" in result
            ? `${result.published ?? 0} productos actualizados`
            : "Productos actualizados";
      toast.success(msg);
      setSelected(new Set());
      router.refresh();
    }
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-sm border border-brand-orange/30 bg-brand-orange/5 px-4 py-3">
          <span className="text-sm font-medium">{selected.size} seleccionados</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => run("publish")}
          >
            Publicar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => run("unpublish")}
          >
            Despublicar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => run("feature")}
          >
            Destacar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => run("unfeature")}
          >
            Quitar destacado
          </Button>
        </div>
      )}

      <DataTable>
        <table className="w-full min-w-[800px]">
          <DataTableHeader>
            <DataTableHead className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-brand-orange"
                aria-label="Seleccionar todos"
              />
            </DataTableHead>
            <DataTableHead>Producto</DataTableHead>
            <DataTableHead>Categoría</DataTableHead>
            <DataTableHead>Precio</DataTableHead>
            <DataTableHead>Oferta</DataTableHead>
            <DataTableHead>Stock</DataTableHead>
            <DataTableHead>Estado</DataTableHead>
            <DataTableHead />
          </DataTableHeader>
          <DataTableBody>
            {items.length === 0 ? (
              <DataTableEmpty message="No hay productos" />
            ) : (
              items.map((p) => (
                <DataTableRow key={p.id}>
                  <DataTableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="accent-brand-orange"
                      aria-label={`Seleccionar ${p.name}`}
                    />
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-neutral-100">
                        {p.imageUrl ? (
                          <>
                            <Image
                              src={p.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                            <ModaCircularBadge
                              size="sm"
                              className="scale-[0.65] origin-top-left"
                            />
                          </>
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.slug}</p>
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-neutral-600">
                    {p.categoryName} / {p.subcategoryName}
                  </DataTableCell>
                  <DataTableCell className="tabular-nums">
                    {formatPrice(p.basePrice)}
                  </DataTableCell>
                  <DataTableCell className="text-xs">
                    {p.compareAtPrice && p.compareAtPrice > p.basePrice ? (
                      <div className="space-y-0.5">
                        <p className="font-medium text-emerald-700">
                          {Math.round((1 - p.basePrice / p.compareAtPrice) * 100)}% OFF
                        </p>
                        <p className="text-neutral-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-neutral-400">Sin oferta</span>
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    <StockBadge available={p.stock} />
                  </DataTableCell>
                  <DataTableCell>
                    <PublishedBadge published={p.isPublished} />
                  </DataTableCell>
                  <DataTableCell>
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline"
                    >
                      Editar
                    </Link>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </table>
      </DataTable>
    </>
  );
}
