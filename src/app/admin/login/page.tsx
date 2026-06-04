import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Acceso admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-xs uppercase tracking-widest text-white/60">
          Cargando...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
