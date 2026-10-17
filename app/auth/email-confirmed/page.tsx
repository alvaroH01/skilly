"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

export default function EmailConfirmedPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasSession(false);
        setLoading(false);
        return;
      }

      setHasSession(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .single();

      setLoading(false);

      // Damos un pequeño tiempo para que el usuario vea
      // que su correo fue confirmado correctamente.
      setTimeout(() => {
        if (!profile?.role || !profile?.onboarding_completed) {
          router.push("/onboarding");
          return;
        }

        router.push("/dashboard");
      }, 1800);
    };

    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1500px] flex-col overflow-hidden rounded-[36px] border border-[#ececf6] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-[#f0eff7] px-6 py-5 sm:px-10">
          <Link href="/">
            <Image
              src="/logo-skilly.png"
              alt="Skilly"
              width={150}
              height={60}
              className="h-auto w-[120px] sm:w-[135px]"
              priority
            />
          </Link>

          <Link
            href="/login"
            className="text-sm font-semibold text-[#6f57f5] transition hover:text-[#5842dd]"
          >
            Iniciar sesión
          </Link>
        </header>

        {/* CONTENT */}
        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[620px] text-center">

            {loading ? (
              <>
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#f1efff]">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d8d2ff] border-t-[#6f57f5]" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#20263a] sm:text-4xl">
                  Confirmando tu correo
                </h1>

                <p className="mx-auto mt-4 max-w-[480px] text-base leading-7 text-[#72778a]">
                  Estamos verificando tu cuenta de Skilly. Esto tomará solo
                  unos segundos.
                </p>
              </>
            ) : (
              <>
                {/* ICON */}
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#eefff6]">
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="#22a06b"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="inline-flex rounded-full bg-[#f1efff] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6f57f5]">
                  Cuenta verificada
                </span>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#20263a] sm:text-4xl">
                  ¡Correo confirmado!
                </h1>

                {hasSession ? (
                  <>
                    <p className="mx-auto mt-4 max-w-[500px] text-base leading-7 text-[#72778a]">
                      Tu correo fue verificado correctamente. Estamos
                      preparando tu experiencia en Skilly.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-[#777b8d]">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#6f57f5]" />
                      Redirigiendo...
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mx-auto mt-4 max-w-[500px] text-base leading-7 text-[#72778a]">
                      Tu correo fue confirmado correctamente. Ahora puedes
                      iniciar sesión y continuar configurando tu perfil.
                    </p>

                    <Link
                      href="/login"
                      className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-[#6f57f5] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#5e47e7]"
                    >
                      Continuar a iniciar sesión
                    </Link>
                  </>
                )}

                <div className="mx-auto mt-10 max-w-[500px] rounded-[24px] border border-[#eeedf5] bg-[#fafafe] p-5 text-left">
                  <p className="text-sm font-semibold text-[#30364a]">
                    Tu cuenta ya está protegida
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#7a7f91]">
                    La verificación de correo nos ayuda a confirmar que la
                    dirección pertenece realmente a ti.
                  </p>
                </div>
              </>
            )}

          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#f0eff7] px-6 py-5 text-center text-xs text-[#999cac]">
          © {new Date().getFullYear()} Skilly LATAM
        </footer>
      </div>
    </main>
  );
}