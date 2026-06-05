import { CATALOG_CATEGORY_HERO } from "@/lib/media/catalog-category-hero";
import { saveUploadedImage } from "@/lib/upload-storage";

/** Banner panorámico del catálogo (/productos?categoria=…), no el tile del home. */
export async function saveCategoryHeroImage(
  file: File,
  prefix: string,
): Promise<string> {
  return saveUploadedImage(file, {
    folder: "categories",
    prefix,
    maxWidth: CATALOG_CATEGORY_HERO.width,
    maxHeight: CATALOG_CATEGORY_HERO.height,
    fit: "cover",
    quality: 86,
  });
}
