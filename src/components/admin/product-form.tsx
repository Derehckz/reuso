"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/server/actions/admin/products.actions";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { AdminImageUploadMultiple } from "@/components/admin/admin-image-upload-multiple";
import { ProductGalleryManager } from "@/components/admin/product-gallery-manager";

type SubcategoryOption = {
  id: string;
  slug: string;
  name: string;
  category: {
    id: string;
    name: string;
    slug: string;
    gender: "MUJER" | "HOMBRE" | "NINO" | "UNISEX" | null;
  };
};

type VariantRow = {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  isActive: boolean;
};

type ProductAttribute = {
  key: "color" | "size";
  label: string;
  values: string[];
};

type ProductFormProps = {
  subcategories: SubcategoryOption[];
  globalAttributes?: {
    color: { label: string; values: string[] };
    size: { label: string; values: string[] };
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    subcategoryId: string;
    sku: string | null;
    brand: string | null;
    gender: string;
    condition: string;
    basePrice: number;
    compareAtPrice: number | null;
    isPublished: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
    vintageYear: number | null;
    internalCode: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    images: { id: string; url: string; sortOrder: number }[];
    tags?: { tag: { slug: string } }[];
    variants: {
      id: string;
      size: string;
      color: string;
      colorHex: string | null;
      isActive: boolean;
      sku: string | null;
      price: number | null;
      inventory: { quantityOnHand: number; lowStockThreshold: number } | null;
    }[];
  };
};

const inputClass =
  "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

export function ProductForm({
  subcategories,
  product,
  globalAttributes,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? "",
          sku: v.sku ?? "",
          price: v.price != null ? String(v.price) : "",
          stock: String(v.inventory?.quantityOnHand ?? 0),
          lowStockThreshold: String(v.inventory?.lowStockThreshold ?? 1),
          isActive: v.isActive,
        }))
      : [
          {
            size: "M",
            color: "Único",
            colorHex: "",
            sku: "",
            price: "",
            stock: "1",
            lowStockThreshold: "1",
            isActive: true,
          },
        ],
  );
  const [loading, setLoading] = useState(false);
  const [basePriceDraft, setBasePriceDraft] = useState(
    product?.basePrice != null ? String(product.basePrice) : "",
  );
  const [compareAtPriceDraft, setCompareAtPriceDraft] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
  );
  const [discountPercentDraft, setDiscountPercentDraft] = useState(() => {
    if (!product?.compareAtPrice || product.compareAtPrice <= product.basePrice) return "";
    return String(
      Math.round((1 - product.basePrice / product.compareAtPrice) * 100),
    );
  });

  const pricingPreview = useMemo(() => {
    const base = Number(basePriceDraft);
    const compareAt = Number(compareAtPriceDraft);
    const hasOffer =
      Number.isFinite(compareAt) &&
      compareAt > 0 &&
      Number.isFinite(base) &&
      base > 0 &&
      compareAt > base;
    return {
      base: Number.isFinite(base) ? base : null,
      compareAt: Number.isFinite(compareAt) ? compareAt : null,
      discount: hasOffer ? Math.round((1 - base / compareAt) * 100) : null,
      hasOffer,
    };
  }, [basePriceDraft, compareAtPriceDraft]);

  const [attributes, setAttributes] = useState<ProductAttribute[]>(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    for (const v of product?.variants ?? []) {
      if (v.color) colors.add(v.color);
      if (v.size) sizes.add(v.size);
    }
    const globalColors = globalAttributes?.color.values ?? ["Negro"];
    const globalSizes = globalAttributes?.size.values ?? ["M"];
    return [
      {
        key: "color",
        label: globalAttributes?.color.label ?? "Color",
        values: colors.size > 0 ? [...new Set([...globalColors, ...colors])] : globalColors,
      },
      {
        key: "size",
        label: globalAttributes?.size.label ?? "Talla",
        values:
          sizes.size > 0
            ? sortSizes([...new Set([...globalSizes, ...sizes])])
            : sortSizes(globalSizes),
      },
    ];
  });
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStockDelta, setBulkStockDelta] = useState("");
  const [bulkLowStock, setBulkLowStock] = useState("");
  const [variantFilter, setVariantFilter] = useState<
    "all" | "active" | "inactive" | "lowStock" | "outOfStock"
  >("all");
  const [selectedVariantKeys, setSelectedVariantKeys] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(
    () => {
      const fromPrimary = product?.subcategoryId ? [product.subcategoryId] : [];
      const fromTags =
        product?.tags
          ?.map((t) => t.tag.slug)
          .filter((slug) => slug.startsWith("sys-subcat-"))
          .map((slug) => slug.replace("sys-subcat-", "")) ?? [];
      return new Set([...fromPrimary, ...fromTags]);
    },
  );
  const [primarySubcategoryId, setPrimarySubcategoryId] = useState(
    product?.subcategoryId ?? "",
  );
  const [selectedGenders, setSelectedGenders] = useState<
    Set<"MUJER" | "HOMBRE" | "NINO">
  >(() => {
    const set = new Set<"MUJER" | "HOMBRE" | "NINO">();
    if (!product?.gender || product.gender === "UNISEX") {
      set.add("MUJER");
      set.add("HOMBRE");
      return set;
    }
    if (product.gender === "MUJER" || product.gender === "HOMBRE" || product.gender === "NINO") {
      set.add(product.gender);
    }
    return set;
  });

  function sizeRank(size: string): number {
    const normalized = size.trim().toUpperCase();
    const sizeOrder = [
      "XXXS",
      "XXS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
      "4XL",
      "5XL",
    ];
    const idx = sizeOrder.indexOf(normalized);
    if (idx >= 0) return idx;
    const numeric = Number(normalized.replace(",", "."));
    return Number.isFinite(numeric) ? 100 + numeric : 1000;
  }

  function sortSizes(values: string[]): string[] {
    return [...values].sort((a, b) => {
      const rankDiff = sizeRank(a) - sizeRank(b);
      if (rankDiff !== 0) return rankDiff;
      return a.localeCompare(b, "es");
    });
  }

  const categoryGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        gender: "MUJER" | "HOMBRE" | "NINO" | "UNISEX" | null;
        children: SubcategoryOption[];
      }
    >();
    for (const s of subcategories) {
      const existing = grouped.get(s.category.id);
      if (existing) existing.children.push(s);
      else {
        grouped.set(s.category.id, {
          id: s.category.id,
          name: s.category.name,
          slug: s.category.slug,
          gender: s.category.gender,
          children: [s],
        });
      }
    }
    return [...grouped.values()];
  }, [subcategories]);

  const resolvedGender = useMemo<"MUJER" | "HOMBRE" | "NINO" | "UNISEX">(() => {
    if (selectedGenders.size === 1) {
      return [...selectedGenders][0];
    }
    if (
      selectedGenders.has("MUJER") &&
      selectedGenders.has("HOMBRE") &&
      !selectedGenders.has("NINO")
    ) {
      return "UNISEX";
    }
    return "UNISEX";
  }, [selectedGenders]);

  function getVariantKey(v: VariantRow, index: number): string {
    return v.id ?? `${v.color}::${v.size}::${index}`;
  }

  function isLowStock(v: VariantRow): boolean {
    const stock = Number(v.stock) || 0;
    const threshold = Math.max(1, Number(v.lowStockThreshold) || 1);
    return stock > 0 && stock <= threshold;
  }

  function matchesFilter(v: VariantRow): boolean {
    const stock = Number(v.stock) || 0;
    switch (variantFilter) {
      case "active":
        return v.isActive;
      case "inactive":
        return !v.isActive;
      case "lowStock":
        return isLowStock(v);
      case "outOfStock":
        return stock <= 0;
      default:
        return true;
    }
  }

  function applyToTargetVariants(
    updater: (v: VariantRow) => VariantRow,
    successMessage: string,
  ) {
    setVariants((prev) => {
      const hasSelection = selectedVariantKeys.size > 0;
      return prev.map((v, i) => {
        if (!hasSelection) return updater(v);
        const key = getVariantKey(v, i);
        return selectedVariantKeys.has(key) ? updater(v) : v;
      });
    });
    if (successMessage) toast.success(successMessage);
  }

  function syncFromBase(nextBaseRaw: string) {
    setBasePriceDraft(nextBaseRaw);
    const base = Number(nextBaseRaw);
    const discount = Number(discountPercentDraft);
    if (
      Number.isFinite(base) &&
      base > 0 &&
      Number.isFinite(discount) &&
      discount > 0 &&
      discount < 100
    ) {
      const compareAt = Math.round(base / (1 - discount / 100));
      setCompareAtPriceDraft(String(compareAt));
      return;
    }

    const compareAt = Number(compareAtPriceDraft);
    if (Number.isFinite(base) && base > 0 && Number.isFinite(compareAt) && compareAt > base) {
      setDiscountPercentDraft(String(Math.round((1 - base / compareAt) * 100)));
    } else {
      setDiscountPercentDraft("");
    }
  }

  function syncFromCompareAt(nextCompareAtRaw: string) {
    setCompareAtPriceDraft(nextCompareAtRaw);
    const base = Number(basePriceDraft);
    const compareAt = Number(nextCompareAtRaw);
    if (Number.isFinite(base) && base > 0 && Number.isFinite(compareAt) && compareAt > base) {
      setDiscountPercentDraft(String(Math.round((1 - base / compareAt) * 100)));
    } else {
      setDiscountPercentDraft("");
    }
  }

  function syncFromDiscount(nextDiscountRaw: string) {
    setDiscountPercentDraft(nextDiscountRaw);
    const base = Number(basePriceDraft);
    const discount = Number(nextDiscountRaw);
    if (
      Number.isFinite(base) &&
      base > 0 &&
      Number.isFinite(discount) &&
      discount > 0 &&
      discount < 100
    ) {
      const compareAt = Math.round(base / (1 - discount / 100));
      setCompareAtPriceDraft(String(compareAt));
      return;
    }
    setCompareAtPriceDraft("");
  }

  function updateAttributeLabel(key: "color" | "size", value: string) {
    setAttributes((prev) =>
      prev.map((attr) => (attr.key === key ? { ...attr, label: value } : attr)),
    );
  }

  function parseValues(raw: string): string[] {
    return [
      ...new Set(
        raw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ];
  }

  function updateAttributeValues(key: "color" | "size", raw: string) {
    const values = parseValues(raw);
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.key === key
          ? {
              ...attr,
              values: key === "size" ? sortSizes(values) : values,
            }
          : attr,
      ),
    );
  }

  function generateVariantsFromAttributes() {
    const colors =
      attributes.find((a) => a.key === "color")?.values.filter(Boolean) ?? [];
    const sizes = sortSizes(
      attributes.find((a) => a.key === "size")?.values.filter(Boolean) ?? [],
    );
    if (colors.length === 0 || sizes.length === 0) {
      toast.error("Define al menos un valor para ambos atributos");
      return;
    }

    const existingByKey = new Map(
      variants.map((v) => [`${v.color}||${v.size}`, v] as const),
    );
    const next: VariantRow[] = [];

    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color}||${size}`;
        const old = existingByKey.get(key as `${string}||${string}`);
        next.push({
          id: old?.id,
          size,
          color,
          colorHex: old?.colorHex ?? "",
          sku: old?.sku ?? "",
          price: old?.price ?? "",
          stock: old?.stock ?? "0",
          lowStockThreshold: old?.lowStockThreshold ?? "1",
          isActive: old?.isActive ?? true,
        });
      }
    }

    setVariants(next);
    setSelectedVariantKeys(new Set());
    toast.success(`Se generaron ${next.length} combinaciones`);
  }

  function applyBulkPrice() {
    const value = bulkPrice.trim();
    if (!value) {
      toast.error("Ingresa un precio para aplicar");
      return;
    }
    applyToTargetVariants(
      (v) => ({ ...v, price: value }),
      selectedVariantKeys.size > 0
        ? "Precio aplicado a variantes seleccionadas"
        : "Precio aplicado a todas las variantes",
    );
  }

  function applyBulkStockDelta() {
    const delta = Number(bulkStockDelta);
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error("Ingresa un ajuste válido de stock");
      return;
    }
    applyToTargetVariants(
      (v) => {
        const current = Number(v.stock) || 0;
        return { ...v, stock: String(Math.max(0, current + delta)) };
      },
      selectedVariantKeys.size > 0
        ? "Stock ajustado en variantes seleccionadas"
        : "Stock ajustado en todas las variantes",
    );
  }

  function applyBulkLowStock() {
    const threshold = Number(bulkLowStock);
    if (!Number.isFinite(threshold) || threshold < 1) {
      toast.error("El stock bajo debe ser mayor o igual a 1");
      return;
    }
    applyToTargetVariants(
      (v) => ({ ...v, lowStockThreshold: String(Math.floor(threshold)) }),
      selectedVariantKeys.size > 0
        ? "Umbral aplicado a variantes seleccionadas"
        : "Umbral aplicado a todas las variantes",
    );
  }

  function setAllVariantsActive(isActive: boolean) {
    applyToTargetVariants((v) => ({ ...v, isActive }), "");
    if (selectedVariantKeys.size > 0) {
      toast.success(
        isActive
          ? "Variantes seleccionadas activadas"
          : "Variantes seleccionadas inactivadas",
      );
      return;
    }
    toast.success(
      isActive
        ? "Todas las variantes quedaron activas"
        : "Todas las variantes quedaron inactivas",
    );
  }

  const variantRows = variants.map((v, index) => ({
    v,
    index,
    key: getVariantKey(v, index),
  }));
  const filteredVariantRows = variantRows.filter(({ v }) => matchesFilter(v));
  const selectedCount = selectedVariantKeys.size;
  const matrixSizes = sortSizes([
    ...new Set(variants.map((v) => v.size.trim()).filter(Boolean)),
  ]);
  const matrixColors = [
    ...new Set(variants.map((v) => v.color.trim()).filter(Boolean)),
  ];

  function toggleSubcategory(subcategoryId: string, checked: boolean) {
    setSelectedSubcategoryIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(subcategoryId);
      else next.delete(subcategoryId);
      if (checked && !primarySubcategoryId) {
        setPrimarySubcategoryId(subcategoryId);
      }
      if (!checked && primarySubcategoryId === subcategoryId) {
        setPrimarySubcategoryId(next.values().next().value ?? "");
      }
      return next;
    });
  }

  function setPrimaryIfSelected(subcategoryId: string) {
    if (!selectedSubcategoryIds.has(subcategoryId)) return;
    setPrimarySubcategoryId(subcategoryId);
  }

  function toggleGender(gender: "MUJER" | "HOMBRE" | "NINO", checked: boolean) {
    setSelectedGenders((prev) => {
      const next = new Set(prev);
      if (checked) next.add(gender);
      else next.delete(gender);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!primarySubcategoryId) {
      toast.error("Selecciona una subcategoría principal");
      return;
    }
    if (selectedGenders.size === 0) {
      toast.error("Selecciona al menos un público objetivo");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("subcategoryId", primarySubcategoryId);
    formData.set("gender", resolvedGender);
    formData.set(
      "categorySelections",
      JSON.stringify([...selectedSubcategoryIds]),
    );
    formData.set(
      "variants",
      JSON.stringify(
        variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          sku: v.sku || undefined,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock) || 0,
          lowStockThreshold: Number(v.lowStockThreshold) || 1,
          isActive: v.isActive,
        })),
      ),
    );
    const result = isEdit
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);

    setLoading(false);

    if (!isEdit) return;
    if (result && "success" in result && !result.success) {
      toast.error(result.message);
    } else {
      toast.success("Producto actualizado");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!product || !confirm("¿Eliminar este producto?")) return;
    setLoading(true);
    await deleteProduct(product.id);
    toast.success("Producto eliminado");
    router.push("/admin/productos");
  }

  const [activeTab, setActiveTab] = useState<"general" | "seo" | "variants">(
    "general",
  );

  const tabClass = (tab: typeof activeTab) =>
    cn(
      "px-4 py-2 text-xs font-bold uppercase tracking-wider",
      activeTab === tab
        ? "border-b-2 border-brand-orange text-foreground"
        : "text-neutral-500 hover:text-foreground",
    );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <nav className="flex gap-1 border-b border-neutral-200">
        <button type="button" className={tabClass("general")} onClick={() => setActiveTab("general")}>
          General
        </button>
        <button type="button" className={tabClass("variants")} onClick={() => setActiveTab("variants")}>
          Variantes
        </button>
        <button type="button" className={tabClass("seo")} onClick={() => setActiveTab("seo")}>
          SEO
        </button>
      </nav>

      <section
        className={cn(
          "rounded-sm border border-neutral-200 bg-white p-6 shadow-sm",
          activeTab !== "general" && "hidden",
        )}
      >
        <h2 className="text-label text-foreground">Información general</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="text-label-sm text-neutral-500">Nombre *</label>
            <input
              name="name"
              required
              defaultValue={product?.name}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Slug</label>
            <input name="slug" defaultValue={product?.slug} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">SKU</label>
            <input name="sku" defaultValue={product?.sku ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Código interno</label>
            <input
              name="internalCode"
              defaultValue={product?.internalCode ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Año vintage</label>
            <input
              name="vintageYear"
              type="number"
              min={1950}
              max={2030}
              defaultValue={product?.vintageYear ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-4 rounded border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-label-sm text-neutral-700">
                Categorías (padre/hijo con checkboxes)
              </p>
              <p className="text-xs text-neutral-500">
                Principal:{" "}
                <strong>
                  {subcategories.find((s) => s.id === primarySubcategoryId)?.name ??
                    "Sin seleccionar"}
                </strong>
              </p>
            </div>
            <input type="hidden" name="subcategoryId" value={primarySubcategoryId} />
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {categoryGroups.map((group) => (
                <div key={group.id} className="rounded border border-neutral-200 bg-white p-3">
                  <p className="text-sm font-medium text-foreground">{group.name}</p>
                  <div className="mt-2 space-y-2">
                    {group.children.map((sub) => {
                      const checked = selectedSubcategoryIds.has(sub.id);
                      const isPrimary = primarySubcategoryId === sub.id;
                      return (
                        <label key={sub.id} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm text-neutral-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => toggleSubcategory(sub.id, e.target.checked)}
                              className="accent-brand-orange"
                            />
                            {sub.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPrimaryIfSelected(sub.id)}
                            disabled={!checked}
                            className={cn(
                              "rounded border px-2 py-0.5 text-[11px]",
                              isPrimary
                                ? "border-brand-orange bg-brand-orange text-white"
                                : "border-neutral-300 text-neutral-600",
                              !checked && "cursor-not-allowed opacity-40",
                            )}
                          >
                            Principal
                          </button>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Marca</label>
            <input name="brand" defaultValue={product?.brand ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2 xl:col-span-4 rounded border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-label-sm text-neutral-700">Pricing sincronizado</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-label-sm text-neutral-500">Precio venta *</label>
                <input
                  name="basePrice"
                  type="number"
                  required
                  min={0}
                  value={basePriceDraft}
                  onChange={(e) => syncFromBase(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-label-sm text-neutral-500">Precio comparación</label>
                <input
                  name="compareAtPrice"
                  type="number"
                  min={0}
                  value={compareAtPriceDraft}
                  onChange={(e) => syncFromCompareAt(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-label-sm text-neutral-500">% descuento</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={discountPercentDraft}
                  onChange={(e) => syncFromDiscount(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded border border-neutral-200 bg-white p-3 text-xs text-neutral-600">
                Precio final:{" "}
                <strong className="text-neutral-900">
                  {pricingPreview.base != null
                    ? `$${pricingPreview.base.toLocaleString("es-CL")}`
                    : "-"}
                </strong>
              </div>
              <div className="rounded border border-neutral-200 bg-white p-3 text-xs text-neutral-600">
                Precio referencia:{" "}
                <strong className="text-neutral-900">
                  {pricingPreview.compareAt != null
                    ? `$${pricingPreview.compareAt.toLocaleString("es-CL")}`
                    : "-"}
                </strong>
              </div>
              <div
                className={cn(
                  "rounded border bg-white p-3 text-xs",
                  pricingPreview.hasOffer
                    ? "border-emerald-300 text-emerald-700"
                    : "border-neutral-200 text-neutral-600",
                )}
              >
                Estado:{" "}
                <strong>
                  {pricingPreview.hasOffer && pricingPreview.discount != null
                    ? `${pricingPreview.discount}% OFF`
                    : "Sin oferta"}
                </strong>
              </div>
            </div>
          </div>
          <div className="rounded border border-neutral-200 bg-neutral-50 p-3">
            <label className="text-label-sm text-neutral-500">Público objetivo</label>
            <input type="hidden" name="gender" value={resolvedGender} />
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: "MUJER", label: "Mujer" },
                { value: "HOMBRE", label: "Hombre" },
                { value: "NINO", label: "Niño" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-xs",
                    selectedGenders.has(option.value as "MUJER" | "HOMBRE" | "NINO")
                      ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                      : "border-neutral-300 text-neutral-600",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedGenders.has(
                      option.value as "MUJER" | "HOMBRE" | "NINO",
                    )}
                    onChange={(e) =>
                      toggleGender(
                        option.value as "MUJER" | "HOMBRE" | "NINO",
                        e.target.checked,
                      )
                    }
                    className="accent-brand-orange"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Valor guardado en BD: <strong>{resolvedGender}</strong>
            </p>
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Condición</label>
            <select
              name="condition"
              defaultValue={product?.condition ?? "EXCELENTE"}
              className={inputClass}
            >
              <option value="EXCELENTE">Excelente</option>
              <option value="MUY_BUENO">Muy bueno</option>
              <option value="BUENO">Bueno</option>
            </select>
          </div>
          <div className="sm:col-span-2 xl:col-span-4 space-y-4">
            {product ? (
              <ProductGalleryManager
                productId={product.id}
                initialImages={product.images.map((img) => ({
                  id: img.id,
                  url: img.url,
                }))}
              />
            ) : null}
            <AdminImageUploadMultiple
              name="images"
              label={product ? "Agregar imágenes" : "Imágenes del producto"}
              required={!product}
              existingCount={product?.images.length ?? 0}
              hint="Máx. 8 MB por archivo. En edición, las nuevas se suman a las que ya están en uso."
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="text-label-sm text-neutral-500">Descripción corta</label>
            <input
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="text-label-sm text-neutral-500">Descripción</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
              className={cn(inputClass, "resize-none")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={product?.isPublished}
              className="accent-brand-orange"
            />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured}
              className="accent-brand-orange"
            />
            Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isNewArrival"
              defaultChecked={product?.isNewArrival}
              className="accent-brand-orange"
            />
            Novedad
          </label>
        </div>
      </section>

      <section
        className={cn(
          "rounded-sm border border-neutral-200 bg-white p-6 shadow-sm",
          activeTab !== "seo" && "hidden",
        )}
      >
        <h2 className="text-label text-foreground">SEO</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="text-label-sm text-neutral-500">Meta title</label>
            <input
              name="metaTitle"
              defaultValue={product?.metaTitle ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-label-sm text-neutral-500">Meta description</label>
            <textarea
              name="metaDescription"
              rows={2}
              defaultValue={product?.metaDescription ?? ""}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </div>
      </section>

      <section
        className={cn(
          "rounded-sm border border-neutral-200 bg-white p-6 shadow-sm",
          activeTab !== "variants" && "hidden",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-label text-foreground">Variantes y stock</h2>
          <button
            type="button"
            onClick={() =>
              setVariants((v) => [
                ...v,
                {
                  size: "",
                  color: "",
                  colorHex: "",
                  sku: "",
                  price: "",
                  stock: "0",
                  lowStockThreshold: "1",
                  isActive: true,
                },
              ])
            }
            className="flex items-center gap-1 text-xs text-brand-orange hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar variante
          </button>
        </div>
        <div className="mt-4 rounded border border-neutral-200 bg-white p-4">
          <p className="text-label-sm text-neutral-700">Atributos del producto</p>
          <p className="mt-1 text-xs text-neutral-500">
            Define tus atributos como en Woo/Presta. Por ahora el sistema usa dos ejes:
            atributo 1 (color) y atributo 2 (talla).
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {attributes.map((attr) => (
              <div key={attr.key} className="rounded border border-neutral-200 bg-neutral-50 p-3">
                <label className="text-label-sm text-neutral-500">Nombre atributo</label>
                <input
                  value={attr.label}
                  onChange={(e) => updateAttributeLabel(attr.key, e.target.value)}
                  className={inputClass}
                />
                <label className="mt-3 block text-label-sm text-neutral-500">
                  Valores (separados por coma)
                </label>
                <textarea
                  rows={2}
                  value={attr.values.join(", ")}
                  onChange={(e) => updateAttributeValues(attr.key, e.target.value)}
                  className={cn(inputClass, "resize-none")}
                  placeholder="Ej: Negro, Blanco, Rojo"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAttributes([
                  {
                    key: "color",
                    label: globalAttributes?.color.label ?? "Color",
                    values: globalAttributes?.color.values ?? ["Negro"],
                  },
                  {
                    key: "size",
                    label: globalAttributes?.size.label ?? "Talla",
                    values: sortSizes(globalAttributes?.size.values ?? ["M"]),
                  },
                ]);
                toast.success("Atributos globales cargados");
              }}
            >
              Usar atributos globales
            </Button>
            <Button type="button" variant="outline" onClick={generateVariantsFromAttributes}>
              Generar combinaciones
            </Button>
            <span className="text-xs text-neutral-500">
              Total combinaciones: {variants.length}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-label-sm text-neutral-700">Acciones masivas</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-4">
            <div>
              <label className="text-label-sm text-neutral-500">Precio variantes</label>
              <input
                type="number"
                min={0}
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className={inputClass}
                placeholder="Ej: 19990"
              />
              <Button type="button" variant="outline" className="mt-2 w-full" onClick={applyBulkPrice}>
                Aplicar precio
              </Button>
            </div>
            <div>
              <label className="text-label-sm text-neutral-500">Ajuste stock (+/-)</label>
              <input
                type="number"
                value={bulkStockDelta}
                onChange={(e) => setBulkStockDelta(e.target.value)}
                className={inputClass}
                placeholder="Ej: +5 o -2"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={applyBulkStockDelta}
              >
                Ajustar stock
              </Button>
            </div>
            <div>
              <label className="text-label-sm text-neutral-500">Stock bajo</label>
              <input
                type="number"
                min={1}
                value={bulkLowStock}
                onChange={(e) => setBulkLowStock(e.target.value)}
                className={inputClass}
                placeholder="Ej: 2"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={applyBulkLowStock}
              >
                Aplicar umbral
              </Button>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAllVariantsActive(true)}>
                Activar todas
              </Button>
              <Button type="button" variant="outline" onClick={() => setAllVariantsActive(false)}>
                Inactivar todas
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded border border-neutral-200 bg-white p-3">
            <select
              value={variantFilter}
              onChange={(e) =>
                setVariantFilter(
                  e.target.value as
                    | "all"
                    | "active"
                    | "inactive"
                    | "lowStock"
                    | "outOfStock",
                )
              }
              className={cn(inputClass, "mt-0 w-auto min-w-[180px]")}
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="lowStock">Stock bajo</option>
              <option value="outOfStock">Sin stock</option>
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSelectedVariantKeys(
                  new Set(filteredVariantRows.map((row) => row.key)),
                )
              }
            >
              Seleccionar filtradas
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedVariantKeys(new Set())}
            >
              Limpiar selección
            </Button>
            <span className="text-xs text-neutral-500">
              Seleccionadas: {selectedCount}
            </span>
            <span className="text-xs text-neutral-500">
              Mostrando: {filteredVariantRows.length}/{variants.length}
            </span>
          </div>
          <div className="hidden grid-cols-[36px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_120px_40px] gap-2 px-1 text-[11px] uppercase tracking-wide text-neutral-500 sm:grid">
            <span />
            <span>{attributes.find((a) => a.key === "size")?.label || "Talla"}</span>
            <span>{attributes.find((a) => a.key === "color")?.label || "Color"}</span>
            <span>SKU</span>
            <span>HEX</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Stock bajo</span>
            <span>Estado</span>
            <span />
          </div>
          {filteredVariantRows.map(({ v, index: i, key }) => (
            <div
              key={key}
              className={cn(
                "grid gap-2 rounded border border-neutral-100 bg-neutral-50 p-3 sm:grid-cols-10",
                selectedVariantKeys.has(key) && "border-brand-orange/70",
              )}
            >
              <label className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedVariantKeys.has(key)}
                  onChange={(e) => {
                    setSelectedVariantKeys((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(key);
                      else next.delete(key);
                      return next;
                    });
                  }}
                  className="accent-brand-orange"
                />
              </label>
              <input
                placeholder="Talla"
                value={v.size}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], size: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
                required
              />
              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], color: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
                required
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], sku: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
              />
              <input
                placeholder="#HEX"
                value={v.colorHex}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], colorHex: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
              />
              <input
                placeholder="Precio"
                type="number"
                value={v.price}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], price: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
              />
              <input
                placeholder="Stock"
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], stock: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
                required
              />
              <input
                placeholder="Stock bajo"
                type="number"
                min={1}
                value={v.lowStockThreshold}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], lowStockThreshold: e.target.value };
                  setVariants(next);
                }}
                className={inputClass}
                required
              />
              <label className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={v.isActive}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], isActive: e.target.checked };
                    setVariants(next);
                  }}
                  className="accent-brand-orange"
                />
                {v.isActive ? "Activa" : "Inactiva"}
              </label>
              <button
                type="button"
                onClick={() => {
                  setVariants(variants.filter((_, j) => j !== i));
                  setSelectedVariantKeys(new Set());
                }}
                className="flex items-center justify-center text-red-500 hover:text-red-700"
                disabled={variants.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {filteredVariantRows.length === 0 && (
            <p className="rounded border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
              No hay variantes para el filtro seleccionado.
            </p>
          )}
        </div>

        <div className="mt-4 rounded border border-neutral-200 bg-white p-4">
          <p className="text-label-sm text-neutral-700">
            Matriz visual de combinaciones (Color x Talla)
          </p>
          <div className="mt-3 overflow-auto">
            <table className="min-w-[560px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
                    Color \ Talla
                  </th>
                  {matrixSizes.map((size) => (
                    <th
                      key={size}
                      className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left"
                    >
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixColors.map((color) => (
                  <tr key={color}>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">
                      {color}
                    </td>
                    {matrixSizes.map((size) => {
                      const combo = variants.find(
                        (variant) => variant.color === color && variant.size === size,
                      );
                      const stock = combo ? Number(combo.stock) || 0 : null;
                      return (
                        <td key={`${color}-${size}`} className="border border-neutral-200 px-3 py-2">
                          {!combo ? (
                            <span className="text-neutral-400">-</span>
                          ) : (
                            <span
                              className={cn(
                                "inline-flex rounded px-2 py-1",
                                combo.isActive
                                  ? stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : isLowStock(combo)
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-500",
                              )}
                            >
                              {combo.isActive ? stock : "Inactiva"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        {isEdit && (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
