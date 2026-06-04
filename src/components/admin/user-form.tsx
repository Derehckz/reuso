"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateUser,
  deactivateUser,
  createCustomerResetLink,
  toggleUserBlocked,
} from "@/server/actions/admin/users.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

export function UserEditForm({
  user,
  canEditRole,
  canBlock,
}: {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    phone: string | null;
    isBlocked: boolean;
  };
  canEditRole: boolean;
  canBlock: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateUser(user.id, new FormData(e.currentTarget));
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Usuario actualizado");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md rounded-sm border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-4">
        <div>
          <label className="text-label-sm text-neutral-500">Email</label>
          <p className="mt-1 text-sm">{user.email}</p>
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Nombre</label>
          <input name="name" defaultValue={user.name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Teléfono</label>
          <input name="phone" defaultValue={user.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Rol</label>
          <select
            name="role"
            defaultValue={user.role}
            disabled={!canEditRole}
            className={inputClass}
          >
            <option value="CUSTOMER">Cliente</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          Guardar
        </Button>
        {canBlock && user.role === "CUSTOMER" && (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const next = !user.isBlocked;
              const msg = next
                ? "¿Bloquear este cliente? No podrá iniciar sesión."
                : "¿Desbloquear este cliente?";
              if (!confirm(msg)) return;
              const r = await toggleUserBlocked(user.id, next);
              if (!r.success) toast.error(r.message);
              else {
                toast.success(next ? "Cliente bloqueado" : "Cliente desbloqueado");
                router.refresh();
              }
            }}
          >
            {user.isBlocked ? "Desbloquear" : "Bloquear"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (!confirm("¿Desactivar usuario?")) return;
            const r = await deactivateUser(user.id);
            if (!r.success) toast.error(r.message);
            else router.push("/admin/usuarios");
          }}
        >
          Desactivar
        </Button>
      </div>

      {user.role === "CUSTOMER" && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const r = await createCustomerResetLink(user.id);
              if (!r.success) {
                toast.error(r.message);
                return;
              }
              setResetUrl(r.resetUrl);
              toast.success(r.message);
            }}
          >
            Generar enlace de restablecimiento
          </Button>

          {resetUrl && (
            <div className="mt-3 rounded-sm border border-brand-orange/30 bg-brand-orange-muted p-3">
              <p className="text-xs text-neutral-600">
                Comparte este enlace con el cliente:
              </p>
              <p className="mt-1 break-all text-xs font-medium text-brand-green">
                {resetUrl}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                onClick={async () => {
                  await navigator.clipboard.writeText(resetUrl);
                  toast.success("Enlace copiado");
                }}
              >
                Copiar enlace
              </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
