import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getNavigationTree } from "@/modules/navigation/navigation.service";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navCategories = await getNavigationTree();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader navCategories={navCategories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
