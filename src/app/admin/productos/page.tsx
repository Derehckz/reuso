import { Suspense } from "react";
import Link from "next/link";
import { parseListParams, getStringParam } from "@/lib/admin/query";
import { listAdminProducts } from "@/server/repositories/admin/products.repository";
import { listCategoriesForSelect } from "@/server/repositories/admin/categories.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ListToolbar, AdminSearch, AdminFilterSelect } from "@/components/admin/list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { ProductsListClient } from "@/components/admin/products-list-client";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseListParams(sp);
  const status = getStringParam(sp, "status") as
    | "published"
    | "draft"
    | "all"
    | undefined;
  const categoryId = getStringParam(sp, "categoryId");
  const stock = getStringParam(sp, "stock") as
    | "in_stock"
    | "out_of_stock"
    | "low_stock"
    | undefined;
  const offer = getStringParam(sp, "offer") as "on_sale" | "no_sale" | undefined;

  const [{ items, total }, categories] = await Promise.all([
    listAdminProducts(params, {
      status: status === "published" || status === "draft" ? status : undefined,
      categoryId,
      stock: stock || undefined,
      offer: offer || undefined,
    }),
    listCategoriesForSelect(),
  ]);

  const filterParams = {
    q: params.q,
    status: status && status !== "all" ? status : undefined,
    categoryId,
    stock,
    offer,
  };

  return (
    <div>
      <AdminPageHeader
        title="Productos"
        description={`${total} productos`}
        action={
          <Link href="/admin/productos/nuevo">
            <Button size="sm">Nuevo producto</Button>
          </Link>
        }
      />

      <ListToolbar>
        <Suspense fallback={<div className="h-10 flex-1 max-w-xs animate-pulse bg-neutral-200" />}>
          <AdminSearch defaultValue={params.q} placeholder="Buscar nombre, SKU, marca..." />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="status"
            label="Estado"
            defaultValue={status ?? ""}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "published", label: "Publicados" },
              { value: "draft", label: "Borradores" },
            ]}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="categoryId"
            label="Categoría"
            defaultValue={categoryId ?? ""}
            options={[
              { value: "", label: "Todas las categorías" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="stock"
            label="Stock"
            defaultValue={stock ?? ""}
            options={[
              { value: "", label: "Todo el stock" },
              { value: "in_stock", label: "Con stock" },
              { value: "out_of_stock", label: "Sin stock" },
              { value: "low_stock", label: "Stock bajo" },
            ]}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilterSelect
            name="offer"
            label="Oferta"
            defaultValue={offer ?? ""}
            options={[
              { value: "", label: "Todas las ofertas" },
              { value: "on_sale", label: "En oferta" },
              { value: "no_sale", label: "Sin oferta" },
            ]}
          />
        </Suspense>
      </ListToolbar>

      <ProductsListClient items={items} />

      <AdminPagination
        basePath="/admin/productos"
        page={params.page}
        perPage={params.perPage}
        total={total}
        params={filterParams}
      />
    </div>
  );
}
