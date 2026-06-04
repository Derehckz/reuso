import { Suspense } from "react";
import Link from "next/link";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import { listAdminCoupons } from "@/server/repositories/admin/coupons.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ListToolbar, AdminSearch, AdminFilterSelect } from "@/components/admin/list-toolbar";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp);
  const active = getStringParam(sp, "active") as "1" | "0" | undefined;

  const { items, total } = await listAdminCoupons(params, { active });

  return (
    <div>
      <AdminPageHeader
        title="Cupones"
        description="Descuentos y promociones"
        action={
          <Link href="/admin/cupones/nuevo">
            <Button size="sm">Nuevo cupón</Button>
          </Link>
        }
      />

      <ListToolbar>
        <Suspense fallback={null}>
          <AdminSearch
            defaultValue={params.q}
            placeholder="Buscar código..."
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="active"
            label="Estado"
            defaultValue={active ?? ""}
            options={[
              { value: "", label: "Todos" },
              { value: "1", label: "Activos" },
              { value: "0", label: "Inactivos" },
            ]}
          />
        </Suspense>
      </ListToolbar>

      <DataTable>
        <table className="w-full min-w-[600px]">
          <DataTableHeader>
            <DataTableHead>Código</DataTableHead>
            <DataTableHead>Tipo</DataTableHead>
            <DataTableHead>Valor</DataTableHead>
            <DataTableHead>Usos</DataTableHead>
            <DataTableHead>Estado</DataTableHead>
          </DataTableHeader>
          <DataTableBody>
            {items.map((c) => (
              <DataTableRow key={c.id}>
                <DataTableCell>
                  <Link href={`/admin/cupones/${c.id}`} className="font-medium hover:underline">
                    {c.code}
                  </Link>
                </DataTableCell>
                <DataTableCell>{c.type === "PERCENTAGE" ? "%" : "CLP"}</DataTableCell>
                <DataTableCell className="tabular-nums">{c.value}</DataTableCell>
                <DataTableCell className="tabular-nums">
                  {c.usedCount}
                  {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                </DataTableCell>
                <DataTableCell>{c.isActive ? "Activo" : "Inactivo"}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </table>
      </DataTable>

      <AdminPagination
        basePath="/admin/cupones"
        total={total}
        page={params.page}
        perPage={params.perPage}
        params={{ q: params.q, active }}
      />
    </div>
  );
}
