"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StagedFile = { id: string; url: string; name: string };

type AdminImageUploadMultipleProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  existingCount?: number;
};

export function AdminImageUploadMultiple({
  name,
  label,
  hint,
  required = false,
  existingCount = 0,
}: AdminImageUploadMultipleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const revokeAll = useCallback(() => {
    for (const url of urlsRef.current) {
      URL.revokeObjectURL(url);
    }
    urlsRef.current = [];
  }, []);

  useEffect(() => revokeAll, [revokeAll]);

  const syncInputFiles = useCallback((files: File[]) => {
    const dt = new DataTransfer();
    for (const file of files) {
      dt.items.add(file);
    }
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
  }, []);

  const applyFiles = useCallback(
    (fileList: FileList | null | undefined) => {
      if (!fileList?.length) return;
      const valid = [...fileList].filter((f) => f.type.startsWith("image/"));
      if (valid.length === 0) return;

      revokeAll();
      const next: StagedFile[] = valid.map((file) => {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        return {
          id: `${file.name}-${file.size}-${file.lastModified}`,
          url,
          name: file.name,
        };
      });
      setStaged(next);
      syncInputFiles(valid);
    },
    [revokeAll, syncInputFiles],
  );

  function removeStaged(id: string) {
    const remaining = staged.filter((s) => s.id !== id);
    const removed = staged.find((s) => s.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
      urlsRef.current = urlsRef.current.filter((u) => u !== removed.url);
    }
    setStaged(remaining);
    if (remaining.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const dt = new DataTransfer();
    if (inputRef.current?.files) {
      const toRemove = removed?.name;
      for (const file of inputRef.current.files) {
        if (file.name !== toRemove) dt.items.add(file);
      }
    }
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function clearAll() {
    revokeAll();
    setStaged([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  const needsFile = required && existingCount === 0;

  return (
    <div>
      <span className="text-label-sm text-neutral-500">
        {label}
        {needsFile && <span className="text-brand-orange"> *</span>}
      </span>

      {existingCount > 0 && (
        <p className="mt-1 text-xs text-neutral-500">
          {existingCount} imagen{existingCount === 1 ? "" : "es"} en uso arriba. Lo que
          elijas aquí se añadirá al guardar.
        </p>
      )}

      {staged.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {staged.map((file) => (
            <div
              key={file.id}
              className="group relative overflow-hidden border border-neutral-200 bg-neutral-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.name}
                className="aspect-square w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-sm bg-brand-green px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Por subir
              </span>
              <button
                type="button"
                onClick={() => removeStaged(file.id)}
                className="absolute right-2 top-2 rounded-sm bg-white/95 p-1 shadow-sm hover:bg-white"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="truncate px-2 py-1 text-[10px] text-neutral-600">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-sm border-2 border-dashed transition-colors",
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
          applyFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              {dragOver ? (
                <Upload className="h-4 w-4 text-brand-green" />
              ) : (
                <ImageIcon className="h-4 w-4 text-neutral-400" />
              )}
            </span>
            <span className="text-sm font-medium text-neutral-800">
              Arrastra una o varias imágenes
            </span>
          </button>
          {staged.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-neutral-500 underline hover:text-neutral-800"
            >
              Limpiar selección ({staged.length})
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif,image/*"
        multiple
        className="sr-only"
        required={needsFile}
        onChange={(e) => applyFiles(e.target.files)}
      />

      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{hint}</p>
      )}
    </div>
  );
}
