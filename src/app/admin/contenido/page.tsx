import Link from "next/link";
import Image from "next/image";
import { listAdminBanners } from "@/server/repositories/admin/banners.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";

export default async function AdminContentPage() {
  const banners = await listAdminBanners();

  return (
    <div>
      <AdminPageHeader
        title="Contenido"
        description="Banners del home y piezas editoriales"
        action={
          <Link href="/admin/contenido/banners/nuevo">
            <Button size="sm">Nuevo banner</Button>
          </Link>
        }
      />

      <h2 className="text-label mb-4 mt-8">Banners home</h2>
      {banners.length === 0 ? (
        <p className="rounded-sm border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center text-sm text-neutral-500">
          Aún no hay banners.{" "}
          <Link
            href="/admin/contenido/banners/nuevo"
            className="text-brand-green underline"
          >
            Crea el primero
          </Link>
        </p>
      ) : (
      <DataTable>
        <table className="w-full">
          <DataTableHeader>
            <DataTableHead className="w-[100px]">Vista</DataTableHead>
            <DataTableHead>Título</DataTableHead>
            <DataTableHead>Orden</DataTableHead>
            <DataTableHead>Estado</DataTableHead>
          </DataTableHeader>
          <DataTableBody>
              {banners.map((b) => (
                <DataTableRow key={b.id}>
                  <DataTableCell>
                    <Link
                      href={`/admin/contenido/banners/${b.id}`}
                      className="relative block aspect-[21/9] w-[88px] overflow-hidden border border-neutral-200 bg-neutral-100"
                    >
                      <Image
                        src={b.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="88px"
                      />
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <Link
                      href={`/admin/contenido/banners/${b.id}`}
                      className="font-medium hover:underline"
                    >
                      {b.title}
                    </Link>
                    {b.subtitle && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                        {b.subtitle}
                      </p>
                    )}
                  </DataTableCell>
                  <DataTableCell>{b.sortOrder}</DataTableCell>
                  <DataTableCell>
                    <span
                      className={
                        b.isActive
                          ? "text-label-sm text-brand-green"
                          : "text-label-sm text-neutral-400"
                      }
                    >
                      {b.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </DataTableCell>
                </DataTableRow>
              ))}
          </DataTableBody>
        </table>
      </DataTable>
      )}
    </div>
  );
}
