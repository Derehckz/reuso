import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import { listAdminInventory } from "@/server/repositories/admin/inventory.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ListToolbar, AdminSearch, AdminFilterSelect } from "@/components/admin/list-toolbar";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StockBadge } from "@/components/admin/status-badge";
import { InventoryStockInput } from "@/components/admin/inventory-adjust";
import { InventoryThresholdInput } from "@/components/admin/inventory-threshold-input";
import { InventoryHistoryPanel } from "@/components/admin/inventory-history-panel";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp, { perPage: 25 });
  const lowStockOnly = getStringParam(sp, "lowStock") === "1";

  const { items, total } = await listAdminInventory(params, { lowStockOnly });

  return (
    <div>
      <AdminPageHeader
        title="Inventario"
        description="Gestión de stock por variante"
      />

      <ListToolbar>
        <Suspense fallback={null}>
          <AdminSearch defaultValue={params.q} placeholder="Producto, SKU, talla..." />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="lowStock"
            label="Filtro stock"
            defaultValue={lowStockOnly ? "1" : ""}
            options={[
              { value: "", label: "Todo el inventario" },
              { value: "1", label: "Solo stock bajo" },
            ]}
          />
        </Suspense>
      </ListToolbar>

      <DataTable>
        <table className="w-full min-w-[900px]">
          <DataTableHeader>
            <DataTableHead>Producto</DataTableHead>
            <DataTableHead>Variante</DataTableHead>
            <DataTableHead>Disponible</DataTableHead>
            <DataTableHead>Reservado</DataTableHead>
            <DataTableHead>Umbral / ajuste</DataTableHead>
          </DataTableHeader>
          <DataTableBody>
            {items.length === 0 ? (
              <DataTableEmpty message="Sin resultados" />
            ) : (
              items.map((row) => (
                <DataTableRow key={row.variantId}>
                  <DataTableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-neutral-100">
                        {row.imageUrl && (
                          <>
                            <Image
                              src={row.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                            <ModaCircularBadge
                              size="sm"
                              className="scale-[0.55] origin-top-left"
                            />
                          </>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/admin/productos/${row.productId}`}
                          className="font-medium hover:underline"
                        >
                          {row.productName}
                        </Link>
                        {row.sku && (
                          <p className="text-xs text-neutral-400">{row.sku}</p>
                        )}
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-neutral-600">
                    {row.size} / {row.color}
                  </DataTableCell>
                  <DataTableCell>
                    <StockBadge available={row.available} threshold={row.threshold} />
                  </DataTableCell>
                  <DataTableCell className="tabular-nums text-neutral-500">
                    {row.reserved}
                  </DataTableCell>
                  <DataTableCell>
                    <InventoryThresholdInput
                      variantId={row.variantId}
                      threshold={row.threshold}
                    />
                    <div className="mt-2">
                      <InventoryStockInput
                        variantId={row.variantId}
                        currentStock={row.onHand}
                      />
                    </div>
                    <InventoryHistoryPanel variantId={row.variantId} />
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </table>
        <AdminPagination
          basePath="/admin/inventario"
          page={params.page}
          perPage={params.perPage}
          total={total}
          params={{ q: params.q, lowStock: lowStockOnly ? "1" : undefined }}
        />
      </DataTable>
    </div>
  );
}
