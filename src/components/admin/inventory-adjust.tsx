"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setInventoryStock } from "@/server/actions/admin/inventory.actions";

export function InventoryStockInput({
  variantId,
  currentStock,
}: {
  variantId: string;
  currentStock: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(currentStock));
  const [loading, setLoading] = useState(false);

  async function save() {
    const stock = Number.parseInt(value, 10);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Stock inválido");
      return;
    }
    setLoading(true);
    const result = await setInventoryStock(variantId, stock);
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Stock actualizado");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 border border-neutral-200 px-2 py-1.5 text-sm tabular-nums"
      />
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline disabled:opacity-50"
      >
        {loading ? "..." : "Guardar"}
      </button>
    </div>
  );
}
