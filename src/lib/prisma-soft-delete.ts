/**
 * Filtros estándar para excluir registros con soft delete.
 * Usar en todos los queries públicos de catálogo y cuenta.
 */
export const notDeleted = { deletedAt: null } as const;

export const publishedProduct = {
  isPublished: true,
  deletedAt: null,
} as const;

export const activeCategory = {
  isActive: true,
  deletedAt: null,
} as const;

export const activeSubcategory = {
  isActive: true,
  deletedAt: null,
} as const;

export const approvedReview = {
  status: "APPROVED" as const,
  deletedAt: null,
};

/** Stock disponible = on hand − reservado */
export function availableStock(inventory: {
  quantityOnHand: number;
  quantityReserved: number;
} | null): number {
  if (!inventory) return 0;
  return Math.max(0, inventory.quantityOnHand - inventory.quantityReserved);
}
