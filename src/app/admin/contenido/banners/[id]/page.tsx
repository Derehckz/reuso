import { notFound } from "next/navigation";
import { getAdminBannerById } from "@/server/repositories/admin/banners.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BannerForm } from "@/components/admin/banner-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBannerPage({ params }: PageProps) {
  const { id } = await params;
  const banner = await getAdminBannerById(id);
  if (!banner) notFound();

  return (
    <div>
      <AdminPageHeader title={banner.title} backHref="/admin/contenido" />
      <BannerForm banner={banner} />
    </div>
  );
}
