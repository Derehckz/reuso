import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Redirige rutas antiguas al gestor unificado. */
export default async function LegacyCategoryEditPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/categorias?type=category&id=${id}`);
}
