import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettingsForm } from "@/components/account/account-settings-form";

export const metadata: Metadata = {
  title: "Configuración de cuenta",
  robots: { index: false },
};

export default async function CuentaConfiguracionPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true, email: true, image: true, phone: true, passwordHash: true },
  });

  if (!user) return null;

  return (
    <div>
      <h2 className="text-label text-foreground">Configuración</h2>
      <p className="text-body-muted mt-1 text-sm">
        Actualiza tu perfil y seguridad.
      </p>
      <div className="mt-8">
        <AccountSettingsForm
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
            hasPassword: Boolean(user.passwordHash),
          }}
        />
      </div>
    </div>
  );
}
