import { redirect } from "next/navigation";
import { catalogCategoryHref } from "@/lib/constants/category-subcategories";

export default function HombrePage() {
  redirect(catalogCategoryHref("hombre", "HOMBRE"));
}
