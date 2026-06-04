import { redirect } from "next/navigation";
import { catalogCategoryHref } from "@/lib/constants/category-subcategories";

export default function NinoPage() {
  redirect(catalogCategoryHref("nino", "NINO"));
}
