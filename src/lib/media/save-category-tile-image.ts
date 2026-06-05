import {
  HOME_CATEGORY_TILE_SPECS,
  homeTileSpecForSlug,
  type HomeCategoryTileSpecKey,
} from "@/lib/media/home-category-image";
import { saveUploadedImage } from "@/lib/upload-storage";

/**
 * Imagen principal de categoría (grid home + nav).
 * No recorta a banner 1920×420 — conserva proporción según el tipo de tile.
 */
export async function saveCategoryTileImage(
  file: File,
  prefix: string,
  slug?: string,
  specKey?: HomeCategoryTileSpecKey,
): Promise<string> {
  const key = specKey ?? (slug ? homeTileSpecForSlug(slug) : "top");
  const spec = HOME_CATEGORY_TILE_SPECS[key];

  return saveUploadedImage(file, {
    folder: "categories",
    prefix,
    maxWidth: spec.width,
    maxHeight: spec.height,
    // inside: no fuerza recorte panorámico; el grid usa object-cover suave
    fit: "inside",
    quality: 88,
  });
}
