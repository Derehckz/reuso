"use client";

import { absoluteUrl } from "@/lib/utils";

type CategorySeoPreviewProps = {
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
};

export function CategorySeoPreview({
  name,
  slug,
  metaTitle,
  metaDescription,
}: CategorySeoPreviewProps) {
  const title = metaTitle.trim() || name;
  const description =
    metaDescription.trim() ||
    "Explora esta colección en reuso — moda reutilizada premium.";
  const url = absoluteUrl(`/productos?categoria=${slug || "..."}`);

  return (
    <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Vista previa Google
      </p>
      <p className="mt-3 truncate text-sm text-[#1a0dab]">{title}</p>
      <p className="truncate text-xs text-[#006621]">{url}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600">
        {description}
      </p>
    </div>
  );
}
