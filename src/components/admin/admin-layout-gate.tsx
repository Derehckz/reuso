"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import type { UserRole } from "@/generated/prisma/client";
import { isAdminSignInPath } from "@/lib/constants/auth-routes";

type AdminLayoutGateProps = {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: UserRole;
};

export function AdminLayoutGate({
  children,
  userEmail,
  userRole,
}: AdminLayoutGateProps) {
  const pathname = usePathname();

  if (isAdminSignInPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole}>
      {children}
    </AdminShell>
  );
}
