"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/product";

const CONDITION_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  EXCELENTE: "Excelente",
  MUY_BUENO: "Muy bueno",
  BUENO: "Bueno",
};

type ProductDescriptionSectionProps = {
  product: Pick<
    ProductDetail,
    | "description"
    | "shortDescription"
    | "brand"
    | "condition"
    | "gender"
    | "category"
    | "subcategory"
  >;
};

function parseBulletLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /^[-•*]\s/.test(line))
    .map((line) => line.replace(/^[-•*]\s*/, ""));
}

export function ProductDescriptionSection({
  product,
}: ProductDescriptionSectionProps) {
  const [open, setOpen] = useState(true);

  const bullets = product.description
    ? parseBulletLines(product.description)
    : [];
  const narrative = product.description
    ?.split(/\n+/)
    .map((l) => l.trim())
    .filter((line) => line && !/^[-•*]\s/.test(line))
    .join("\n\n");

  const specs = [
    product.brand && { label: "Marca", value: product.brand },
    {
      label: "Categoría",
      value: `${product.category.name} / ${product.subcategory?.name ?? ""}`,
    },
    {
      label: "Estado",
      value: CONDITION_LABELS[product.condition] ?? product.condition,
    },
    { label: "Género", value: product.gender },
  ].filter(Boolean) as { label: string; value: string }[];

  if (!product.description && !product.shortDescription) return null;

  return (
    <section className="border-t border-neutral-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <h2 className="text-label text-foreground">
          Descripción del producto
        </h2>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-neutral-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="pb-10">
          {product.shortDescription && (
            <p className="mb-6 text-sm leading-relaxed text-neutral-700">
              {product.shortDescription}
            </p>
          )}

          {specs.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-sm border border-neutral-200">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <th className="w-1/3 bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                        {row.label}
                      </th>
                      <td className="px-4 py-3 text-neutral-800">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {bullets.length > 0 && (
            <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-neutral-700">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {narrative && (
            <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
              {narrative.split(/\n\n+/).map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          )}

          {!bullets.length && product.description && !narrative && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {product.description}
            </p>
          )}

          <p className="mt-8 text-xs text-neutral-500">
            Moda reutilizada curada · Pieza única con historia
          </p>
        </div>
      )}
    </section>
  );
}
