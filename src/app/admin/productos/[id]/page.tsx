import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getSubcategoriesForSelect,
} from "@/server/repositories/admin/products.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductDuplicateButton } from "@/components/admin/product-duplicate-button";
import Link from "next/link";
import { getGlobalProductAttributes } from "@/server/repositories/admin/settings.repository";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, subcategories, globalAttributes] = await Promise.all([
    getAdminProductById(id),
    getSubcategoriesForSelect(),
    getGlobalProductAttributes(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.name}
        description={product.slug}
        backHref="/admin/productos"
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-foreground"
            >
              Ver en tienda
            </Link>
            <ProductDuplicateButton productId={product.id} />
          </div>
        }
      />
      <ProductForm
        subcategories={subcategories}
        product={product}
        globalAttributes={globalAttributes}
      />
    </div>
  );
}
