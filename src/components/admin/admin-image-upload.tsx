"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AspectRatio = "banner" | "bannerMobile" | "categoryHero" | "square" | "avatar";

const aspectClass: Record<AspectRatio, string> = {
  banner: "aspect-[21/9]",
  bannerMobile: "aspect-[4/5] max-w-[220px]",
  /** Vista previa proporcional al hero del catálogo (1920×420). */
  categoryHero: "aspect-[46/10] max-h-[160px] w-full",
  square: "aspect-square max-w-[240px]",
  avatar: "aspect-square h-28 w-28 rounded-full mx-auto",
};

type AdminImageUploadProps = {
  name: string;
  label: string;
  hint?: string;
  currentUrl?: string | null;
  required?: boolean;
  aspect?: AspectRatio;
  className?: string;
};

function ImageStatusBadge({
  variant,
}: {
  variant: "in-use" | "new-pending";
}) {
  return (
    <span
      className={cn(
        "absolute left-3 top-3 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
        variant === "in-use"
          ? "bg-white/95 text-neutral-800"
          : "bg-brand-green text-white",
      )}
    >
      {variant === "in-use" ? "En uso" : "Nueva"}
    </span>
  );
}

export function AdminImageUpload({
  name,
  label,
  hint,
  currentUrl,
  required = false,
  aspect = "banner",
  className,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokeObjectUrl();
  }, [revokeObjectUrl]);

  useEffect(() => {
    if (!pickedName) {
      setPreview(currentUrl ?? null);
    }
  }, [currentUrl, pickedName]);

  const applyFile = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      revokeObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreview(url);
      setPickedName(file.name);
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) {
        inputRef.current.files = dt.files;
      }
    },
    [revokeObjectUrl],
  );

  function clearSelection() {
    revokeObjectUrl();
    setPreview(currentUrl ?? null);
    setPickedName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const hasExisting = Boolean(currentUrl);
  const needsFile = required && !hasExisting;
  const showingInUse = Boolean(currentUrl && preview === currentUrl && !pickedName);
  const showingNew = Boolean(pickedName);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-label-sm text-neutral-500">
          {label}
          {needsFile && <span className="text-brand-orange"> *</span>}
        </span>
        {pickedName && (
          <span className="truncate text-[10px] uppercase tracking-wider text-brand-green">
            {pickedName}
          </span>
        )}
      </div>

      <div
        className={cn(
          "mt-2 overflow-hidden border-2 border-dashed transition-colors",
          aspect === "avatar" ? "rounded-full" : "rounded-sm",
          dragOver
            ? "border-brand-green bg-brand-green/5"
            : "border-neutral-200 bg-neutral-50/80 hover:border-neutral-300",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          applyFile(e.dataTransfer.files[0]);
        }}
      >
        {preview ? (
          <div className={cn("relative w-full", aspectClass[aspect])}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className={cn(
                "h-full w-full object-cover",
                aspect === "avatar" && "rounded-full",
              )}
            />
            {showingInUse && <ImageStatusBadge variant="in-use" />}
            {showingNew && <ImageStatusBadge variant="new-pending" />}
            <div
              className={cn(
                "absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3",
                aspect === "avatar" && "rounded-full",
              )}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-sm bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm hover:bg-neutral-100"
              >
                Reemplazar
              </button>
              {pickedName && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-sm bg-white/90 p-1.5 text-neutral-700 shadow-sm hover:bg-white"
                  aria-label="Volver a la imagen en uso"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center",
              aspectClass[aspect],
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              {dragOver ? (
                <Upload className="h-5 w-5 text-brand-green" />
              ) : (
                <ImageIcon className="h-5 w-5 text-neutral-400" />
              )}
            </span>
            <span>
              <span className="text-sm font-medium text-neutral-800">
                Arrastra una imagen o haz clic para elegir
              </span>
              <span className="mt-1 block text-xs text-neutral-500">
                WebP optimizado · máx. 8 MB
              </span>
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif,image/*"
        className="sr-only"
        required={needsFile}
        onChange={(e) => applyFile(e.target.files?.[0])}
      />

      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{hint}</p>
      )}
    </div>
  );
}
