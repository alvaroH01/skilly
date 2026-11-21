import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ValidateProfessionalButton from "@/components/admin/ValidateProfessionalButton";

/** Datos del perfil profesional que muestra la bandeja de validaciones. */
type ProfessionalDetail = {
  user_id: string;
  professional_title: string | null;
  skills: string[] | null;
  work_mode: string | null;
  region: string | null;
  commune: string | null;
  phone: string | null;
  linkedin_url: string | null;
};

export default async function AdminValidacionesPage() {
  const supabase = await createClient();

  /* =====================================================
     1. VALIDAR USUARIO Y ROL ADMIN
  ===================================================== */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  /* =====================================================
     2. OBTENER PROFESIONALES Y SUS PERFILES
  ===================================================== */
  const { data: professionals, error: profError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      onboarding_completed,
      created_at
    `)
    .eq("role", "profesional")
    .order("created_at", { ascending: false });

  if (profError) {
    console.error("Error consultando profesionales:", profError.message);
  }

  const profList = professionals ?? [];

  // Obtenemos datos detallados de perfiles profesionales
  const userIds = profList.map((p) => p.id);
  let profDetailsMap = new Map<string, ProfessionalDetail>();

  if (userIds.length > 0) {
    const { data: details } = await supabase
      .from("professional_profiles")
      .select(`
        user_id,
        professional_title,
        skills,
        work_mode,
        region,
        commune,
        phone,
        linkedin_url
      `)
      .in("user_id", userIds);

    profDetailsMap = new Map((details ?? []).map((d) => [d.user_id, d]));
  }

  const validatedCount = profList.filter((p) => p.onboarding_completed).length;
  const pendingCount = profList.length - validatedCount;

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      {/* HEADER CON LOGO ARRIBA A LA IZQUIERDA */}
      <header className="border-b border-[#ebe9f2] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/admin" className="flex items-center">
              <Image
                src="/logo-skilly-clean.png"
                alt="Skilly LATAM"
                width={160}
                height={60}
                priority
                className="h-auto w-[145px] object-contain"
              />
            </Link>

            <div className="hidden h-7 w-px bg-[#e8e6ee] sm:block" />

            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a86ec]">
                Administración
              </p>
              <p className="text-sm font-semibold text-[#34394b]">
                Validación Técnica & Entrevistas
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-[#e3e1e9] px-4 py-2 text-sm font-semibold text-[#676c7b] transition hover:bg-[#f7f7fa]"
          >
            ← Volver al panel
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b73ea]">
                Filtro de Calidad & Confianza
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252a3b]">
                Herramienta de Agendamiento y Validación Técnica
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a98]">
                Coordina y revisa las entrevistas técnicas con los profesionales en los días designados
                por Skilly (Martes y Jueves) para autorizar su ingreso formal al catálogo de servicios.
              </p>
            </div>
          </div>
        </section>

        {/* MÉTRICAS Y DÍAS DESIGNADOS */}
        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[#e9e6f2] bg-white p-5 shadow-sm">
            <span className="text-xs text-[#828797]">Total Profesionales</span>
            <p className="mt-2 text-3xl font-bold text-[#202538]">{profList.length}</p>
            <p className="mt-1 text-xs text-[#9a9faa]">Registrados en la plataforma</p>
          </div>

          <div className="rounded-[22px] border border-[#c6f6d5] bg-[#f0fff4] p-5 shadow-sm">
            <span className="text-xs text-[#22543d]">Validados Técnicamente</span>
            <p className="mt-2 text-3xl font-bold text-[#2d8f5d]">{validatedCount}</p>
            <p className="mt-1 text-xs text-[#38a169]">Listos para postular a proyectos</p>
          </div>

          <div className="rounded-[22px] border border-[#feebc8] bg-[#fffaf0] p-5 shadow-sm">
            <span className="text-xs text-[#7b341e]">Pendientes de Entrevista</span>
            <p className="mt-2 text-3xl font-bold text-[#dd6b20]">{pendingCount}</p>
            <p className="mt-1 text-xs text-[#c05621]">Por coordinar sesión de validación</p>
          </div>
        </section>

        {/* BANNER INFORMATIVO DÍAS DESIGNADOS */}
        <div className="mt-6 rounded-[22px] border border-[#e6e0fc] bg-gradient-to-r from-[#fbfaff] to-[#f5f2ff] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6f4cf6] text-white">
              📅
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#262c3e]">
                Política de Validación Técnica Skilly
              </h3>
              <p className="mt-1 text-xs leading-6 text-[#696f81]">
                Las entrevistas técnicas se realizan los <strong>Martes y Jueves</strong> en bloques de 45 minutos (10:00 a 17:15 hrs) vía Google Meet. Durante la reunión se valida experiencia laboral, portafolio de entregables y alineación con los estándares éticos de Skilly.
              </p>
            </div>
          </div>
        </div>

        {/* LISTA DE PROFESIONALES */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#252b3d]">
            Candidatos y Profesionales
          </h2>

          {profList.length === 0 ? (
            <div className="mt-4 rounded-[26px] border border-dashed border-[#ddd9e9] bg-white p-12 text-center">
              <p className="text-sm text-[#7e8392]">No hay profesionales registrados aún.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {profList.map((prof) => {
                const details = profDetailsMap.get(prof.id);
                const title = details?.professional_title || "Profesional independiente";
                const location = [details?.commune, details?.region].filter(Boolean).join(", ") || "Chile";
                const isValidated = Boolean(prof.onboarding_completed);

                return (
                  <article
                    key={prof.id}
                    className="flex flex-col justify-between gap-5 rounded-[24px] border border-[#e8e6f1] bg-white p-6 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0ecff] text-base font-bold text-[#6f4cf6]">
                        {prof.full_name?.charAt(0).toUpperCase() || "P"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#222739]">
                            {prof.full_name || "Profesional"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isValidated
                                ? "bg-[#e8f8ef] text-[#2d8f5d]"
                                : "bg-[#fff4da] text-[#a77428]"
                            }`}
                          >
                            {isValidated ? "✓ Validado" : "⏳ Pendiente validación"}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-[#6f4cf6]">{title}</p>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#7b808f]">
                          <span>📍 {location}</span>
                          {details?.phone && <span>📞 {details.phone}</span>}
                          {details?.work_mode && <span className="capitalize">💼 {details.work_mode}</span>}
                        </div>

                        {details?.skills && details.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {details.skills.slice(0, 4).map((skill: string) => (
                              <span
                                key={skill}
                                className="rounded-full bg-[#f4f2fb] px-2.5 py-0.5 text-[11px] text-[#635c75]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <ValidateProfessionalButton
                        professionalId={prof.id}
                        professionalName={prof.full_name || "Profesional"}
                        isCurrentlyValidated={isValidated}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
