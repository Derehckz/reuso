import { AdminPageHeader } from "@/components/admin/page-header";
import { BannerForm } from "@/components/admin/banner-form";

export default function NewBannerPage() {
  return (
    <div>
      <AdminPageHeader title="Nuevo banner" backHref="/admin/contenido" />
      <BannerForm />
    </div>
  );
}
