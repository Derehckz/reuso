import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLayoutGate } from "@/components/admin/admin-layout-gate";
import {
  ADMIN_SIGN_IN_PATH,
  isAdminSignInPath,
  isStaffRole,
} from "@/lib/constants/auth-routes";

export const metadata = {
  title: { default: "Admin", template: "%s · reuso admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (
    pathname &&
    !isAdminSignInPath(pathname) &&
    session?.user &&
    !isStaffRole(session.user.role)
  ) {
    redirect(`${ADMIN_SIGN_IN_PATH}?error=staff_only`);
  }

  return (
    <AdminLayoutGate
      userEmail={session?.user?.email}
      userRole={session?.user?.role}
    >
      {children}
    </AdminLayoutGate>
  );
}
