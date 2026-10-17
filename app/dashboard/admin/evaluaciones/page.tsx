import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AdminEvaluacionesPage() {
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
     2. OBTENER PROYECTOS CON EVALUACIONES PRIVADAS
  ===================================================== */
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select(`
      id,
      client_id,
      title,
      description,
      category,
      modality,
      status,
      created_at
    `)
    .ilike("description", "%[EVALUACIÓN PRIVADA SKILLY]%")
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error consultando evaluaciones privadas:", projectsError.message);
  }

  const evaluatedProjects = projectsData ?? [];

  // Obtenemos los clientes
  const clientIds = [
    ...new Set(evaluatedProjects.map((p) => p.client_id).filter(Boolean)),
  ];

  let clientMap = new Map<string, string>();
  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", clientIds);

    clientMap = new Map(
      (clients ?? []).map((c) => [c.id, c.full_name || "Cliente Skilly"])
    );
  }

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
                Evaluaciones Privadas de Desempeño
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
                Acompañamiento y Calidad
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252a3b]">
                Evaluaciones Privadas Recibidas
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a98]">
                Retroalimentación cualitativa entregada de forma confidencial por las
                organizaciones a Skilly. Sin estrellas ni rankings públicos, orientada
                al acompañamiento y fortalecimiento de competencias.
              </p>
            </div>
          </div>
        </section>

        {/* CONTADOR */}
        <section className="mt-7">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#e8e4f4] bg-white px-5 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] font-bold text-[#6848ef]">
              {evaluatedProjects.length}
            </div>
            <div>
              <p className="text-xs text-[#999daa]">Evaluaciones confidenciales</p>
              <p className="text-sm font-semibold text-[#454a5c]">
                Registradas para seguimiento de People & Culture
              </p>
            </div>
          </div>
        </section>

        {/* LISTADO DE EVALUACIONES */}
        <section className="mt-6">
          {evaluatedProjects.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd9e9] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1edff] text-2xl text-[#6f4cf6]">
                ✓
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#363b4d]">
                Aún no hay evaluaciones privadas
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a8f9c]">
                Cuando los clientes completen proyectos y envíen su retroalimentación confidencial, aparecerán listadas aquí para el equipo de Skilly.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {evaluatedProjects.map((p) => {
                const clientName = clientMap.get(p.client_id) || "Organización";
                const evaluationContent = p.description.split("━━━━━━━━━━━━━━━━━━━━")[0].trim();

                return (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-[26px] border border-[#e8e5f0] bg-white p-6 shadow-sm sm:p-7"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efedf5] pb-4">
                      <div>
                        <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-xs font-bold text-[#6848ef]">
                          🔒 Confidencial Skilly
                        </span>
                        <h2 className="mt-2 text-xl font-bold text-[#23283c]">
                          {p.title}
                        </h2>
                        <p className="text-xs text-[#7e8494]">
                          Cliente: <strong className="text-[#34394b]">{clientName}</strong>
                        </p>
                      </div>

                      <span className="rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#2d8f5d]">
                        Categoría: {p.category}
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#f8f7fc] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8174a8]">
                        Retroalimentación del Cliente a Skilly:
                      </p>
                      <div className="mt-3 whitespace-pre-line text-xs leading-6 text-[#4a5062]">
                        {evaluationContent}
                      </div>
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
