import type { Metadata } from "next";
import { CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Métodos de pago",
  robots: { index: false },
};

const cardClass = "rounded-sm border border-neutral-200 bg-white p-5";

export default async function MetodosPagoPage() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] ?? "cliente";

  return (
    <div>
      <h2 className="text-label text-foreground">Métodos de pago</h2>
      <p className="text-body-muted mt-1 text-sm">
        Hola {userName}, gestiona cómo pagarás tus próximos pedidos.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2">
            <WalletCards className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
            <h3 className="text-label-sm text-foreground">Opciones activas</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>MercadoPago (tarjetas débito/crédito)</li>
            <li>Saldo MercadoPago</li>
            <li>Transferencia / medios habilitados por MercadoPago</li>
          </ul>
        </section>

        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
            <h3 className="text-label-sm text-foreground">Seguridad</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Tus datos de tarjeta no se almacenan en REUSO. El procesamiento y
            tokenización se realizan por MercadoPago.
          </p>
        </section>

        <section className={cardClass + " md:col-span-2"}>
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
            <h3 className="text-label-sm text-foreground">Método preferido</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Próximamente podrás guardar un método predeterminado para acelerar
            el checkout. Hoy la selección se realiza en la pasarela de pago.
          </p>
        </section>
      </div>
    </div>
  );
}
