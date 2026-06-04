"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setLowStockThreshold } from "@/server/actions/admin/inventory.actions";

export function InventoryThresholdInput({
  variantId,
  threshold,
}: {
  variantId: string;
  threshold: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(threshold));
  const [loading, setLoading] = useState(false);

  async function save() {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n) || n < 1) {
      toast.error("Umbral inválido (mínimo 1)");
      return;
    }
    setLoading(true);
    const result = await setLowStockThreshold(variantId, n);
    setLoading(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Umbral actualizado");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-neutral-500">Umbral:</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-14 border border-neutral-200 px-1.5 py-1 tabular-nums"
      />
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="font-bold uppercase tracking-wider text-brand-orange hover:underline disabled:opacity-50"
      >
        OK
      </button>
    </div>
  );
}
