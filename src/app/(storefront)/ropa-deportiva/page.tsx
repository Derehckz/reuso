import { redirect } from "next/navigation";
import { catalogCategoryHref } from "@/lib/constants/category-subcategories";

export default function RopaDeportivaPage() {
  redirect(catalogCategoryHref("ropa-deportiva", "UNISEX"));
}
