"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { changePassword, updateProfile } from "@/server/actions/account.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none";

type AccountSettingsFormProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
    hasPassword: boolean;
  };
};

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  return (
    <div className="space-y-10">
      <form
        className="rounded-sm border border-neutral-200 bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setProfileLoading(true);
          const result = await updateProfile(new FormData(e.currentTarget));
          setProfileLoading(false);
          if (result.success) {
            toast.success("Perfil actualizado");
            router.refresh();
          } else toast.error(result.message);
        }}
      >
        <h3 className="text-label">Perfil</h3>
        <div className="mt-4 max-w-xs">
          <AdminImageUpload
            name="profileImage"
            label="Foto de perfil"
            currentUrl={user.image}
            aspect="avatar"
            hint="Tu foto actual aparece con «En uso» hasta que elijas otra."
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-label-sm text-neutral-500">Nombre</label>
            <input name="name" defaultValue={user.name ?? ""} required className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Email</label>
            <input value={user.email} disabled className={inputClass + " bg-neutral-50"} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Teléfono</label>
            <input name="phone" defaultValue={user.phone ?? ""} className={inputClass} />
          </div>
        </div>
        <Button type="submit" className="mt-4" isLoading={profileLoading}>
          Guardar perfil
        </Button>
      </form>

      {user.hasPassword && (
        <form
          className="rounded-sm border border-neutral-200 bg-white p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setPasswordLoading(true);
            const result = await changePassword(new FormData(e.currentTarget));
            setPasswordLoading(false);
            if (result.success) {
              toast.success(result.message);
              (e.target as HTMLFormElement).reset();
            } else {
              toast.error(result.message);
            }
          }}
        >
          <h3 className="text-label">Contraseña</h3>
          <div className="mt-4 grid gap-4">
            <input
              name="currentPassword"
              type="password"
              placeholder="Contraseña actual"
              required
              className={inputClass}
            />
            <input
              name="newPassword"
              type="password"
              placeholder="Nueva contraseña (mín. 8)"
              required
              minLength={8}
              className={inputClass}
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirmar nueva contraseña"
              required
              className={inputClass}
            />
          </div>
          <Button type="submit" className="mt-4" variant="outline" isLoading={passwordLoading}>
            Cambiar contraseña
          </Button>
        </form>
      )}
    </div>
  );
}
