"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addOrderNote } from "@/server/actions/admin/order-notes.actions";

type Note = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
};

export function OrderNotesPanel({
  orderId,
  notes,
  customerNote,
}: {
  orderId: string;
  notes: Note[];
  customerNote: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await addOrderNote(orderId, new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) {
      toast.success("Nota agregada");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <section className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-label mb-4">Notas</h2>

      {customerNote && (
        <div className="mb-4 rounded border border-brand-beige/50 bg-brand-beige/20 p-3 text-sm">
          <p className="text-label-sm text-neutral-500">Nota del cliente (checkout)</p>
          <p className="mt-1">{customerNote}</p>
        </div>
      )}

      <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
        {notes.length === 0 ? (
          <li className="text-sm text-neutral-500">Sin notas internas</li>
        ) : (
          notes.map((n) => (
            <li key={n.id} className="rounded border border-neutral-100 p-3 text-sm">
              <p className="text-[10px] text-neutral-400">
                {n.user?.name ?? n.user?.email ?? "Sistema"} ·{" "}
                {new Date(n.createdAt).toLocaleString("es-CL")}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Nota interna para el equipo..."
          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
        />
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" name="isInternal" defaultChecked className="accent-brand-orange" />
          Solo visible en admin
        </label>
        <Button type="submit" size="sm" isLoading={loading}>
          Agregar nota
        </Button>
      </form>
    </section>
  );
}
