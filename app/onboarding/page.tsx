"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const seleccionarRol = async (
    role: "cliente" | "profesional"
  ) => {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("No se pudo obtener el usuario.");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        onboarding_completed: false,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error guardando rol:", error);
      alert("No se pudo guardar tu selección.");
      setLoading(false);
      return;
    }

    if (role === "cliente") {
      router.push("/onboarding/cliente");
      return;
    }

    router.push("/onboarding/profesional");
  };

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto min-h-[calc(100vh-48px)] max-w-[1500px] overflow-hidden rounded-[36px] border border-[#ececf6] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Image
            src="/logo-skilly-clean.png"
            alt="Skilly"
            width={210}
            height={82}
            priority
            className="h-auto w-[170px] object-contain sm:w-[190px]"
          />

          <span className="rounded-full bg-[#f4f1ff] px-4 py-2 text-sm font-medium text-[#7b68d8]">
            Configura tu experiencia
          </span>
        </header>

        <section className="grid min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">

          {/* LADO IZQUIERDO */}
          <div className="relative flex flex-col justify-center overflow-hidden bg-[#f5f1ff] px-8 py-14 sm:px-12 lg:px-16">

            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#e6ddff]" />
            <div className="absolute bottom-[-80px] right-[-60px] h-72 w-72 rounded-full bg-[#ffd8ec]" />

            <div className="relative z-10 max-w-lg">
              <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7b68d8] shadow-sm">
                Bienvenido a Skilly
              </span>

              <h1 className="mt-7 text-4xl font-bold leading-tight text-[#17213a] sm:text-5xl">
                Tu experiencia empieza contigo.
              </h1>

              <p className="mt-5 max-w-md text-lg leading-8 text-[#6f7484]">
                Cuéntanos cómo quieres usar Skilly para mostrarte oportunidades,
                profesionales y herramientas relevantes para ti.
              </p>

              <div className="mt-10 rounded-[26px] bg-white/80 p-6 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-[#17213a]">
                  Puedes cambiar esto más adelante
                </p>

                <p className="mt-2 text-sm leading-6 text-[#7d8190]">
                  Tu cuenta podrá evolucionar contigo y adaptarse a nuevas
                  necesidades dentro de la plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* LADO DERECHO */}
          <div className="flex items-center px-6 py-14 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-2xl">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a78ed]">
                  Primer paso
                </p>

                <h2 className="mt-3 text-3xl font-bold text-[#17213a] sm:text-4xl">
                  ¿Cómo quieres usar Skilly?
                </h2>

                <p className="mt-3 text-base leading-7 text-[#7c8190]">
                  Elige la opción que mejor represente lo que buscas hoy.
                </p>
              </div>

              <div className="mt-9 grid gap-5">

                {/* CLIENTE */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => seleccionarRol("cliente")}
                  className="group rounded-[28px] border border-[#e8e5f4] bg-white p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#cabff9] hover:shadow-[0_20px_50px_rgba(119,98,210,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eee9ff] text-2xl">
                      💼
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#17213a]">
                        Necesito contratar talento
                      </h3>

                      <p className="mt-2 leading-6 text-[#777c8b]">
                        Encuentra profesionales y servicios especializados para
                        impulsar proyectos, equipos y necesidades de tu negocio.
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#806cf0]">
                        Explorar como cliente

                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* PROFESIONAL */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => seleccionarRol("profesional")}
                  className="group rounded-[28px] border border-[#e8e5f4] bg-white p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#cabff9] hover:shadow-[0_20px_50px_rgba(119,98,210,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f7] text-2xl">
                      ✨
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#17213a]">
                        Quiero ofrecer mis servicios
                      </h3>

                      <p className="mt-2 leading-6 text-[#777c8b]">
                        Crea tu perfil profesional, presenta tu experiencia y
                        conecta con empresas que necesitan tu talento.
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#806cf0]">
                        Crear perfil profesional

                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

              </div>

              {loading && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#dcd5ff] border-t-[#6f4cf6]" />

                  <p className="text-sm text-[#8a8e9d]">
                    Guardando tu selección...
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}