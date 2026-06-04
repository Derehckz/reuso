import { AdminPageHeader } from "@/components/admin/page-header";
import { GlobalProductAttributesForm } from "@/components/admin/global-product-attributes-form";
import { getGlobalProductAttributes } from "@/server/repositories/admin/settings.repository";

export default async function AdminGlobalAttributesPage() {
  const values = await getGlobalProductAttributes();

  return (
    <div>
      <AdminPageHeader
        title="Atributos globales"
        description="Gestiona atributos reutilizables del catálogo"
      />
      <GlobalProductAttributesForm values={values} />
    </div>
  );
}
