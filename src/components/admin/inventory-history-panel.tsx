"use client";

import { useState } from "react";
import { getInventoryAdjustments } from "@/server/actions/admin/inventory.actions";

type Adjustment = {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: Date;
};

export function InventoryHistoryPanel({ variantId }: { variantId: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Adjustment[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (rows) {
      setOpen((v) => !v);
      return;
    }
    setLoading(true);
    const data = await getInventoryAdjustments(variantId);
    setRows(data);
    setOpen(true);
    setLoading(false);
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={load}
        className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-brand-orange"
      >
        {loading ? "..." : open ? "Ocultar historial" : "Ver historial"}
      </button>
      {open && rows && (
        <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto border border-neutral-100 bg-neutral-50 p-2 text-[11px]">
          {rows.length === 0 ? (
            <li className="text-neutral-500">Sin movimientos</li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="flex justify-between gap-2">
                <span>
                  {row.type}{" "}
                  <span className={row.quantity >= 0 ? "text-emerald-700" : "text-red-600"}>
                    {row.quantity >= 0 ? "+" : ""}
                    {row.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-neutral-400">
                  {new Date(row.createdAt).toLocaleDateString("es-CL")}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
