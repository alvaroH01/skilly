import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ProfessionalSettingsForm from "@/components/professional/ProfessionalSettingsForm";

/* ======================================================
   ICONOS
====================================================== */

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M12 3.5V5.3M12 18.7V20.5M20.5 12H18.7M5.3 12H3.5M18 6L16.7 7.3M7.3 16.7L6 18M18 18L16.7 16.7M7.3 7.3L6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ======================================================
   PAGE
====================================================== */

export default async function ProfessionalSettingsPage() {
  const supabase = await createClient();

  /* ====================================================
     USUARIO AUTENTICADO
  ==================================================== */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* ====================================================
     PERFIL GENERAL
  ==================================================== */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      role,
      onboarding_completed
    `)
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "profesional" ||
    !profile.onboarding_completed
  ) {
    redirect("/dashboard");
  }

  /* ====================================================
     PERFIL PROFESIONAL
  ==================================================== */

  const {
    data: professionalProfile,
    error: professionalError,
  } = await supabase
    .from("professional_profiles")
    .select(`
      work_mode,
      availability,
      weekly_hours
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (professionalError) {
    console.error(
      "Error cargando configuración profesional:",
      professionalError.message
    );
  }

  /* ====================================================
     DATOS DE CUENTA
  ==================================================== */

  const displayName =
    profile.full_name?.trim() ||
    "Profesional Skilly";

  /*
   * Supabase normalmente guarda los proveedores
   * utilizados por el usuario en app_metadata.providers.
   *
   * Ejemplos:
   * ["email"]
   * ["google"]
   * ["email", "google"]
   */
  const providers = Array.isArray(
    user.app_metadata?.providers
  )
    ? user.app_metadata.providers
    : [];

  const primaryProvider =
    user.app_metadata?.provider;

  const hasPasswordProvider =
    providers.includes("email") ||
    primaryProvider === "email";

  const usesGoogle =
    providers.includes("google") ||
    primaryProvider === "google";

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1150px]">

        {/* ==================================================
            VOLVER
        ================================================== */}

        <Link
          href="/dashboard/profesional"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f4cf6] transition hover:text-[#5b3bd5]"
        >
          ← Volver al dashboard
        </Link>

        {/* ==================================================
            CONTENEDOR
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-[30px] border border-[#e8e5f2] bg-white shadow-[0_25px_70px_rgba(80,70,130,0.07)]">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="relative overflow-hidden border-b border-[#eeeef4] bg-gradient-to-r from-[#f7f4ff] via-[#fbfaff] to-[#fff9ef] px-6 py-8 sm:px-9">

            <div className="relative z-10 flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eee9ff] text-[#6f4cf6]">
                <SettingsIcon />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#7458e8]">
                  Mi cuenta
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">
                  Configuración
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a7f8d]">
                  Administra tus preferencias profesionales,
                  seguridad y datos de acceso.
                </p>

              </div>

            </div>

            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d8ceff]/35 blur-3xl" />

          </div>

          {/* ==================================================
              CONTENIDO
          ================================================== */}

          <ProfessionalSettingsForm
            displayName={displayName}
            email={user.email ?? ""}
            initialWorkMode={
              professionalProfile?.work_mode ?? ""
            }
            initialAvailability={
              professionalProfile?.availability ?? ""
            }
            initialWeeklyHours={
              professionalProfile?.weekly_hours ?? ""
            }
            hasPasswordProvider={hasPasswordProvider}
            usesGoogle={usesGoogle}
          />

        </section>

      </div>

    </main>
  );
}