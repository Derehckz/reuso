"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import {
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/server/actions/admin/banners.actions";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30";

type BannerFormProps = {
  banner?: {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    mobileUrl: string | null;
    link: string | null;
    sortOrder: number;
    isActive: boolean;
  };
};

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const isEdit = Boolean(banner);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    if (isEdit) {
      const result = await updateBanner(banner!.id, fd);
      setLoading(false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Banner actualizado");
      router.refresh();
      return;
    }

    const result = await createBanner(fd);
    setLoading(false);
    if (result && "success" in result && !result.success) {
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-label text-foreground">Texto y enlace</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Lo que verá el cliente sobre el visual del banner.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Título *</label>
            <input
              name="title"
              required
              defaultValue={banner?.title}
              className={inputClass}
              placeholder="Ej: Nueva colección verano"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Subtítulo</label>
            <input
              name="subtitle"
              defaultValue={banner?.subtitle ?? ""}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Enlace al hacer clic</label>
            <input
              name="link"
              defaultValue={banner?.link ?? ""}
              className={inputClass}
              placeholder="/productos o URL completa"
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Orden</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={banner?.sortOrder ?? 0}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={banner?.isActive ?? true}
                className="accent-brand-orange"
              />
              Visible en home
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-label text-foreground">Imágenes</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Sube desde tu equipo; se optimizan automáticamente al guardar.
          </p>
        </div>
        <AdminImageUpload
          name="image"
          label="Banner escritorio"
          currentUrl={banner?.imageUrl}
          required={!isEdit}
          aspect="banner"
          hint="Recomendado: horizontal amplio (hero). La imagen vigente se marca «En uso»."
        />
        <AdminImageUpload
          name="mobileImage"
          label="Banner móvil"
          currentUrl={banner?.mobileUrl}
          aspect="bannerMobile"
          hint="Opcional. Si no hay imagen móvil propia, se usa la de escritorio."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          {isEdit ? "Guardar cambios" : "Crear banner"}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("¿Eliminar este banner?")) return;
              await deleteBanner(banner!.id);
              router.push("/admin/contenido");
            }}
          >
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
