import { unstable_cache } from "next/cache";
import { categoryRepository } from "@/server/repositories/category.repository";
import { CACHE_TAGS } from "@/shared/cache/tags";

/**
 * Fuente única del árbol de navegación: BD enriquecida con fallback a constantes.
 */
export async function getNavigationTree() {
  return unstable_cache(
    () => categoryRepository.getNavCategories(),
    ["navigation-tree"],
    {
      tags: [CACHE_TAGS.navigation],
      revalidate: 300,
    },
  )();
}

export function revalidateNavigation() {
  // Llamar desde admin vía revalidateTag en actions
  return CACHE_TAGS.navigation;
}
