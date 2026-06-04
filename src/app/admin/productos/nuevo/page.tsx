import { getSubcategoriesForSelect } from "@/server/repositories/admin/products.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getGlobalProductAttributes } from "@/server/repositories/admin/settings.repository";

export default async function NewProductPage() {
  const [subcategories, globalAttributes] = await Promise.all([
    getSubcategoriesForSelect(),
    getGlobalProductAttributes(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Nuevo producto"
        backHref="/admin/productos"
      />
      <ProductForm
        subcategories={subcategories}
        globalAttributes={globalAttributes}
      />
    </div>
  );
}
