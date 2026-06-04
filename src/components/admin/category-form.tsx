"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { CATALOG_CATEGORY_HERO } from "@/lib/media/catalog-category-hero";
import {
  updateCategory,
  createCategory,
  createSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from "@/server/actions/admin/categories.actions";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30";

type CategoryFormProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    gender: string | null;
    sortOrder: number;
    isActive: boolean;
    subcategories: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
      sortOrder: number;
      isActive: boolean;
      _count: { products: number };
    }[];
  };
};

function SubcategoryRow({
  sub,
  categoryId,
  onUpdated,
}: {
  sub: CategoryFormProps["category"]["subcategories"][number];
  categoryId: string;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateSubcategory(sub.id, new FormData(e.currentTarget));
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Subcategoría actualizada");
      setEditing(false);
      onUpdated();
    }
  }

  if (editing) {
    return (
      <li className="rounded-sm border border-neutral-100 bg-neutral-50/50 py-4 px-3">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input type="hidden" name="categoryId" value={categoryId} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-label-sm text-neutral-500">Nombre</label>
              <input name="name" required defaultValue={sub.name} className={inputClass} />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500">Slug</label>
              <input name="slug" defaultValue={sub.slug} className={inputClass} />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500">Orden</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={sub.sortOrder}
                className={inputClass}
              />
            </div>
          </div>
          <AdminImageUpload
            name="image"
            label="Imagen de subcategoría"
            currentUrl={sub.image}
            aspect="categoryHero"
            hint={`Cabecera del catálogo. Recomendado ${CATALOG_CATEGORY_HERO.label} (se recorta automáticamente).`}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={sub.isActive}
              className="accent-brand-orange"
            />
            Activa
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={loading}>
              Guardar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 py-3 text-sm">
      <div className="flex min-w-0 items-center gap-3">
        {sub.image ? (
          <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
            <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-white">
              En uso
            </span>
          </span>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 text-[10px] text-neutral-400">
            Sin img
          </span>
        )}
        <span className="min-w-0">
          <span className="font-medium">{sub.name}</span>{" "}
          <span className="text-neutral-400">({sub._count.products} productos)</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="text-xs text-brand-orange hover:underline"
          onClick={() => setEditing(true)}
        >
          Editar
        </button>
        <SubcategoryDeleteButton subId={sub.id} onDeleted={onUpdated} />
      </div>
    </li>
  );
}

function SubcategoryDeleteButton({
  subId,
  onDeleted,
}: {
  subId: string;
  onDeleted: () => void;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-xs text-red-600 hover:underline"
      onClick={async () => {
        if (!confirm("¿Eliminar subcategoría?")) return;
        const r = await deleteSubcategory(subId);
        if (!r.success) toast.error(r.message);
        else {
          toast.success("Subcategoría eliminada");
          onDeleted();
          router.refresh();
        }
      }}
    >
      Eliminar
    </button>
  );
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateCategory(category.id, new FormData(e.currentTarget));
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Categoría actualizada");
      router.refresh();
    }
  }

  async function handleAddSub(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("categoryId", category.id);
    const result = await createSubcategory(fd);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Subcategoría creada");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <form
        onSubmit={handleUpdate}
        className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-label">Categoría</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label-sm text-neutral-500">Nombre</label>
            <input name="name" required defaultValue={category.name} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Slug</label>
            <input name="slug" defaultValue={category.slug} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Orden</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={category.sortOrder}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Género</label>
            <select name="gender" defaultValue={category.gender ?? ""} className={inputClass}>
              <option value="">—</option>
              <option value="MUJER">Mujer</option>
              <option value="HOMBRE">Hombre</option>
              <option value="NINO">Niño</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
              className="accent-brand-orange"
            />
            Activa
          </label>
          <div className="sm:col-span-2">
            <AdminImageUpload
              name="image"
              label="Imagen de categoría"
              currentUrl={category.image}
              aspect="categoryHero"
              hint={`Cabecera del catálogo (${CATALOG_CATEGORY_HERO.label}). Cualquier tamaño se ajusta al subir.`}
            />
          </div>
        </div>
        <Button type="submit" className="mt-6" isLoading={loading}>
          Guardar categoría
        </Button>
      </form>

      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-label">Subcategorías</h2>
        <ul className="mt-4 divide-y divide-neutral-100">
          {category.subcategories.map((sub) => (
            <SubcategoryRow
              key={sub.id}
              sub={sub}
              categoryId={category.id}
              onUpdated={() => router.refresh()}
            />
          ))}
        </ul>

        <form onSubmit={handleAddSub} className="mt-6 space-y-4 border-t border-neutral-100 pt-6">
          <p className="text-label-sm text-neutral-500">Nueva subcategoría</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-label-sm text-neutral-500">Nombre *</label>
              <input
                name="name"
                required
                placeholder="Ej: Poleras"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminImageUpload
                name="image"
                label="Imagen"
                aspect="categoryHero"
                hint={`Opcional. ${CATALOG_CATEGORY_HERO.label} recomendado.`}
              />
            </div>
          </div>
          <Button type="submit" size="sm">
            Agregar subcategoría
          </Button>
        </form>
      </div>
    </div>
  );
}

export function NewCategoryForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createCategory(new FormData(e.currentTarget));
    setLoading(false);
    if (result && "success" in result && !result.success) {
      toast.error(result.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg rounded-sm border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-label">Nueva categoría</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-label-sm text-neutral-500">Nombre *</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Slug</label>
          <input name="slug" className={inputClass} placeholder="auto desde nombre" />
        </div>
        <div>
          <label className="text-label-sm text-neutral-500">Descripción corta</label>
          <textarea name="shortDescription" rows={2} className={inputClass} maxLength={500} />
        </div>
        <AdminImageUpload
          name="image"
          label="Imagen principal"
          aspect="square"
          hint="Miniatura / navegación"
        />
        <AdminImageUpload
          name="bannerImage"
          label="Banner portada (opcional)"
          aspect="categoryHero"
          hint={`${CATALOG_CATEGORY_HERO.label} — hero del catálogo`}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked className="accent-brand-orange" />
          Activa
        </label>
      </div>
      <Button type="submit" className="mt-6" isLoading={loading}>
        Crear categoría
      </Button>
    </form>
  );
}
