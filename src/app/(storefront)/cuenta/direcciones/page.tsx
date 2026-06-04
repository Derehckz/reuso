import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressesManager } from "@/components/account/addresses-form";

export const metadata: Metadata = {
  title: "Mis direcciones",
  robots: { index: false },
};

export default async function DireccionesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user!.id, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h2 className="text-label text-foreground">Direcciones</h2>
      <p className="text-body-muted mt-1 text-sm">
        Guarda direcciones para un checkout más rápido.
      </p>
      <div className="mt-8">
        <AddressesManager addresses={addresses} />
      </div>
    </div>
  );
}
