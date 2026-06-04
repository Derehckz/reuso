"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportOrdersCsv } from "@/server/actions/admin/export.actions";

export function ExportOrdersButton({
  status,
  defaultFrom,
  defaultTo,
}: {
  status?: string;
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(defaultFrom ?? "");
  const [to, setTo] = useState(defaultTo ?? "");

  async function handleExport() {
    setLoading(true);
    try {
      const csv = await exportOrdersCsv({
        status,
        from: from || undefined,
        to: to || undefined,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ordenes-reuso-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-xs text-neutral-500">
        Desde
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mt-1 block border border-neutral-200 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs text-neutral-500">
        Hasta
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 block border border-neutral-200 px-2 py-1.5 text-sm"
        />
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        isLoading={loading}
      >
        <Download className="mr-2 h-3.5 w-3.5" />
        Exportar CSV
      </Button>
    </div>
  );
}
