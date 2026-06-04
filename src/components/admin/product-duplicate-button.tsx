"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { duplicateProduct } from "@/server/actions/admin/products.actions";

export function ProductDuplicateButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    const result = await duplicateProduct(productId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success("Producto duplicado como borrador");
    router.push(`/admin/productos/${result.productId}`);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      isLoading={loading}
      onClick={handleDuplicate}
    >
      Duplicar
    </Button>
  );
}
