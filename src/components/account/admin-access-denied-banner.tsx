"use client";

import { useSearchParams } from "next/navigation";

export function AdminAccessDeniedBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "no_admin_access") {
    return null;
  }

  return (
    <p
      className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
    >
      Tu cuenta es de cliente. El panel de administración tiene un acceso
      separado para el equipo interno.
    </p>
  );
}
