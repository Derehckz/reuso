import { Suspense } from "react";
import Link from "next/link";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import { listAdminUsers } from "@/server/repositories/admin/users.repository";
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
import { RoleBadge } from "@/components/admin/status-badge";
import type { UserRole } from "@/generated/prisma/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp);
  const role = getStringParam(sp, "role") as UserRole | undefined;
  const blocked = getStringParam(sp, "blocked") as "1" | "0" | undefined;

  const { items, total } = await listAdminUsers(params, { role, blocked });

  return (
    <div>
      <AdminPageHeader title="Usuarios" description={`${total} usuarios`} />

      <ListToolbar>
        <Suspense fallback={null}>
          <AdminSearch defaultValue={params.q} placeholder="Email o nombre..." />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="role"
            label="Rol"
            defaultValue={role ?? ""}
            options={[
              { value: "", label: "Todos los roles" },
              { value: "CUSTOMER", label: "Clientes" },
              { value: "STAFF", label: "Staff" },
              { value: "ADMIN", label: "Admin" },
            ]}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="blocked"
            label="Bloqueo"
            defaultValue={blocked ?? ""}
            options={[
              { value: "", label: "Todos" },
              { value: "1", label: "Bloqueados" },
              { value: "0", label: "No bloqueados" },
            ]}
          />
        </Suspense>
      </ListToolbar>

      <DataTable>
        <table className="w-full min-w-[700px]">
          <DataTableHeader>
            <DataTableHead>Usuario</DataTableHead>
            <DataTableHead>Rol</DataTableHead>
            <DataTableHead>Estado</DataTableHead>
            <DataTableHead>Pedidos</DataTableHead>
            <DataTableHead>Registro</DataTableHead>
            <DataTableHead />
          </DataTableHeader>
          <DataTableBody>
            {items.length === 0 ? (
              <DataTableEmpty message="No hay usuarios" />
            ) : (
              items.map((user) => (
                <DataTableRow key={user.id}>
                  <DataTableCell>
                    <p className="font-medium">{user.name ?? "—"}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </DataTableCell>
                  <DataTableCell>
                    <RoleBadge role={user.role} />
                  </DataTableCell>
                  <DataTableCell className="text-xs">
                    {user.isBlocked ? (
                      <span className="text-red-600">Bloqueado</span>
                    ) : (
                      <span className="text-neutral-500">OK</span>
                    )}
                  </DataTableCell>
                  <DataTableCell>{user._count.orders}</DataTableCell>
                  <DataTableCell className="text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString("es-CL")}
                  </DataTableCell>
                  <DataTableCell>
                    <Link
                      href={`/admin/usuarios/${user.id}`}
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
        <AdminPagination
          basePath="/admin/usuarios"
          page={params.page}
          perPage={params.perPage}
          total={total}
          params={{ q: params.q, role, blocked }}
        />
      </DataTable>
    </div>
  );
}
