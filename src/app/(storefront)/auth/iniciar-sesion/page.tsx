import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const [session, sp] = await Promise.all([auth(), searchParams]);
  const callbackParam = sp.callbackUrl;
  const callbackRaw =
    typeof callbackParam === "string" ? callbackParam : "/cuenta";
  const callbackUrl = callbackRaw.startsWith("/") ? callbackRaw : "/cuenta";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs uppercase tracking-widest">
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
