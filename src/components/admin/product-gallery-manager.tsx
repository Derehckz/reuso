"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { deleteProductImage } from "@/server/actions/admin/products.actions";

type GalleryImage = { id: string; url: string };

export function ProductGalleryManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: GalleryImage[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  function syncHiddenOrder(next: GalleryImage[]) {
    const input = document.querySelector<HTMLInputElement>(
      'input[name="imageOrder"]',
    );
    if (input) {
      input.value = JSON.stringify(next.map((img) => img.id));
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    syncHiddenOrder(next);
  }

  async function remove(imageId: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    setBusy(imageId);
    const result = await deleteProductImage(imageId, productId);
    setBusy(null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    const next = images.filter((img) => img.id !== imageId);
    setImages(next);
    syncHiddenOrder(next);
    toast.success("Imagen eliminada");
    router.refresh();
  }

  if (images.length === 0) {
    return (
      <>
        <input type="hidden" name="imageOrder" value="[]" />
        <p className="mt-2 rounded-sm border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-xs text-neutral-500">
          Sin imágenes en uso. Sube fotos en el bloque de abajo.
        </p>
      </>
    );
  }

  return (
    <>
      <input
        type="hidden"
        name="imageOrder"
        value={JSON.stringify(images.map((img) => img.id))}
      />
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        En uso · {images.length} foto{images.length === 1 ? "" : "s"}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative overflow-hidden border border-neutral-200 bg-neutral-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={`Imagen ${index + 1}`}
              className="aspect-square w-full object-cover"
            />
            <span className="absolute left-2 top-2 rounded-sm bg-white/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800 shadow-sm">
              En uso
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1 text-[10px] text-white">
              <span>{index === 0 ? "Principal" : `Foto ${index + 1}`}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0 || busy !== null}
                  onClick={() => move(index, -1)}
                  className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover antes"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1 || busy !== null}
                  onClick={() => move(index, 1)}
                  className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover después"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={busy === img.id}
                  onClick={() => remove(img.id)}
                  className="rounded p-0.5 hover:bg-red-500/80 disabled:opacity-30"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Reordena con las flechas. La primera imagen es la principal.
      </p>
    </>
  );
}
