"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { CATALOG_CATEGORY_HERO } from "@/lib/media/catalog-category-hero";
import { CategorySeoPreview } from "@/components/admin/categories/category-seo-preview";
import {
  checkCategorySlugAvailable,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  updateCategory,
  updateSubcategory,
} from "@/server/actions/admin/categories.actions";
import type { AdminCategoryDetail } from "@/types/admin-category";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30";

type Tab = "general" | "images" | "seo";

type CategoryDetailPanelProps = {
  detail: AdminCategoryDetail;
  onSaved: () => void;
  onDeleted: () => void;
};

export function CategoryDetailPanel({
  detail,
  onSaved,
  onDeleted,
}: CategoryDetailPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<string | null>(null);

  const [name, setName] = useState(detail.name);
  const [slug, setSlug] = useState(detail.slug);
  const [sortOrder, setSortOrder] = useState(detail.sortOrder);
  const [isActive, setIsActive] = useState(detail.isActive);
  const [description, setDescription] = useState(detail.description ?? "");
  const [shortDescription, setShortDescription] = useState(
    detail.shortDescription ?? "",
  );
  const [metaTitle, setMetaTitle] = useState(detail.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    detail.metaDescription ?? "",
  );
  const [gender, setGender] = useState(detail.gender ?? "");
  const [cascadeInactive, setCascadeInactive] = useState(false);

  useEffect(() => {
    setName(detail.name);
    setSlug(detail.slug);
    setSortOrder(detail.sortOrder);
    setIsActive(detail.isActive);
    setDescription(detail.description ?? "");
    setShortDescription(detail.shortDescription ?? "");
    setMetaTitle(detail.metaTitle ?? "");
    setMetaDescription(detail.metaDescription ?? "");
    setGender(detail.gender ?? "");
    setSlugStatus(null);
    setTab("general");
  }, [detail]);

  const checkSlug = useCallback(
    async (value: string) => {
      if (value.length < 2) {
        setSlugStatus(null);
        return;
      }
      const r = await checkCategorySlugAvailable(value, detail.type, detail.id);
      setSlugStatus(r.available ? "disponible" : r.message ?? "en uso");
    },
    [detail.id, detail.type],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("sortOrder", String(sortOrder));
    if (isActive) fd.set("isActive", "on");
    fd.set("description", description);
    fd.set("shortDescription", shortDescription);
    fd.set("metaTitle", metaTitle);
    fd.set("metaDescription", metaDescription);
    if (detail.type === "category") {
      fd.set("gender", gender);
      if (cascadeInactive) fd.set("cascadeInactive", "on");
      fd.set("categoryId", detail.categoryId);
      const result = await updateCategory(detail.id, fd);
      setLoading(false);
      if (!result.success) toast.error(result.message);
      else {
        toast.success("Guardado");
        onSaved();
        router.refresh();
      }
    } else {
      fd.set("categoryId", detail.categoryId);
      const result = await updateSubcategory(detail.id, fd);
      setLoading(false);
      if (!result.success) toast.error(result.message);
      else {
        toast.success("Guardado");
        onSaved();
        router.refresh();
      }
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta categoría? Solo si está vacía.")) return;
    setLoading(true);
    const result =
      detail.type === "category"
        ? await deleteCategory(detail.id)
        : await deleteSubcategory(detail.id);
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Eliminada");
      onDeleted();
      router.refresh();
    }
  }

  const tabClass = (t: Tab) =>
    cn(
      "border-b-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
      tab === t
        ? "border-brand-green text-brand-green"
        : "border-transparent text-neutral-400 hover:text-neutral-700",
    );

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="border-b border-neutral-200 bg-white px-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">
              {detail.type === "category" ? "Categoría" : "Subcategoría"}
            </p>
            <h2 className="font-editorial text-2xl text-neutral-900">{detail.name}</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {detail.productCount} productos
              {detail.type === "category"
                ? ` · ${detail.subcategoryCount} subcategorías`
                : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={detail.productCount > 0}
            >
              Eliminar
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Guardar
            </Button>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          <button type="button" className={tabClass("general")} onClick={() => setTab("general")}>
            General
          </button>
          <button type="button" className={tabClass("images")} onClick={() => setTab("images")}>
            Imágenes
          </button>
          <button type="button" className={tabClass("seo")} onClick={() => setTab("seo")}>
            SEO
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className={cn("space-y-4", tab !== "general" && "hidden")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-label-sm text-neutral-500">Nombre</label>
              <input
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500">Orden</label>
              <input
                name="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-label-sm text-neutral-500">Slug (URL)</label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  void checkSlug(e.target.value);
                }}
                className={inputClass}
              />
              {slugStatus && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    slugStatus === "disponible" ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {slugStatus}
                </p>
              )}
            </div>
            {detail.type === "category" && (
              <div>
                <label className="text-label-sm text-neutral-500">Género</label>
                <select
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="MUJER">Mujer</option>
                  <option value="HOMBRE">Hombre</option>
                  <option value="NINO">Niño</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-brand-orange"
              />
              Activa en tienda
            </label>
            {detail.type === "category" && !isActive && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={cascadeInactive}
                  onChange={(e) => setCascadeInactive(e.target.checked)}
                  className="accent-brand-orange"
                />
                Desactivar también todas las subcategorías
              </label>
            )}
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Descripción corta</label>
            <textarea
              name="shortDescription"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={inputClass}
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Descripción</label>
            <textarea
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className={cn("space-y-6", tab !== "images" && "hidden")}>
          <AdminImageUpload
            name="image"
            label="Imagen principal"
            currentUrl={detail.image}
            aspect="square"
            hint="Miniatura / navegación. Cuadrada recomendada."
          />
          <AdminImageUpload
            name="bannerImage"
            label="Banner de portada (opcional)"
            currentUrl={detail.bannerImage}
            aspect="categoryHero"
            hint={`Hero del catálogo. ${CATALOG_CATEGORY_HERO.label}. Si no hay banner, se usa la imagen principal.`}
          />
        </div>

        <div className={cn("space-y-4", tab !== "seo" && "hidden")}>
          <CategorySeoPreview
            name={name}
            slug={slug}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
          />
          <div>
            <label className="text-label-sm text-neutral-500">Meta title</label>
            <input
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className={inputClass}
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Meta description</label>
            <textarea
              name="metaDescription"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={inputClass}
              maxLength={320}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export function NewSubcategoryInline({
  categoryId,
  onCreated,
}: {
  categoryId: string;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("categoryId", categoryId);
    fd.set("isActive", "on");
    const result = await createSubcategory(fd);
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Subcategoría creada");
      (e.target as HTMLFormElement).reset();
      onCreated();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-neutral-100 pt-4"
    >
      <p className="text-label-sm text-neutral-500">Nueva subcategoría</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          name="name"
          required
          placeholder="Nombre"
          className="min-w-[140px] flex-1 border border-neutral-200 px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" isLoading={loading}>
          Agregar
        </Button>
      </div>
    </form>
  );
}
