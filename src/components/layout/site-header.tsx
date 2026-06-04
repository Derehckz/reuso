"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./announcement-bar";
import { MainNav } from "./main-nav";
import type { NavCategory } from "./category-nav-menu";

type SiteHeaderProps = {
  navCategories: NavCategory[];
};

export function SiteHeader({ navCategories }: SiteHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && <AnnouncementBar />}
      <Suspense
        fallback={
          <div className="h-16 border-b border-neutral-200 bg-white md:h-20" />
        }
      >
        <MainNav overlay={isHome} navCategories={navCategories} />
      </Suspense>
    </>
  );
}
