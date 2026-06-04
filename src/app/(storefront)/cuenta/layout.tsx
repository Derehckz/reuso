import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminAccessDeniedBanner } from "@/components/account/admin-access-denied-banner";
import { AccountShell } from "@/components/account/account-shell";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/iniciar-sesion?callbackUrl=/cuenta");
  }

  return (
    <AccountShell userName={session.user.name}>
      <Suspense fallback={null}>
        <AdminAccessDeniedBanner />
      </Suspense>
      {children}
    </AccountShell>
  );
}
