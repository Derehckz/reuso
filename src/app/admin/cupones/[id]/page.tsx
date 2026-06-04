import { notFound } from "next/navigation";
import { getAdminCouponById } from "@/server/repositories/admin/coupons.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCouponPage({ params }: PageProps) {
  const { id } = await params;
  const coupon = await getAdminCouponById(id);
  if (!coupon) notFound();

  return (
    <div>
      <AdminPageHeader title={coupon.code} backHref="/admin/cupones" />
      <CouponForm coupon={coupon} />
    </div>
  );
}
