import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminUserById } from "@/server/repositories/admin/users.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UserEditForm } from "@/components/admin/user-form";
import {
  UserOrdersPanel,
  UserAddressesPanel,
} from "@/components/admin/user-detail-panels";
import { roleHasPermission } from "@/shared/auth/permissions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [user, session] = await Promise.all([
    getAdminUserById(id),
    auth(),
  ]);

  if (!user) notFound();

  const canBlock =
    !!session?.user?.role &&
    roleHasPermission(session.user.role, "customers:block");

  return (
    <div>
      <AdminPageHeader
        title={user.name ?? user.email}
        description={`${user._count.orders} pedidos · ${user.isBlocked ? "Bloqueado" : "Activo"}`}
        backHref="/admin/usuarios"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <UserEditForm
          user={user}
          canEditRole={session?.user?.role === "ADMIN"}
          canBlock={canBlock}
        />

        <div className="space-y-6">
          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-4">Pedidos recientes</h2>
            <UserOrdersPanel orders={user.orders} />
          </section>
          <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-label mb-4">Direcciones</h2>
            <UserAddressesPanel addresses={user.addresses} />
          </section>
        </div>
      </div>
    </div>
  );
}
