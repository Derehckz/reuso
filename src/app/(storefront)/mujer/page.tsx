import { redirect } from "next/navigation";
import { catalogCategoryHref } from "@/lib/constants/category-subcategories";

export default function MujerPage() {
  redirect(catalogCategoryHref("mujer", "MUJER"));
}
