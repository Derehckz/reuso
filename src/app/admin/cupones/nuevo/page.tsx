import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";

export default function NewCouponPage() {
  return (
    <div>
      <AdminPageHeader title="Nuevo cupón" backHref="/admin/cupones" />
      <CouponForm />
    </div>
  );
}
