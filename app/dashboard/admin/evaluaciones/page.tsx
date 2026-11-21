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
     2. OBTENER EVALUACIONES PRIVADAS (documentos JSONB)
     RLS: solo el administrador puede leer private_evaluations.
  ===================================================== */
  const { data: evaluationsData, error: evaluationsError } = await supabase
    .from("private_evaluations")
    .select("id, project_id, evaluator_id, professional_id, payload, created_at")
    .order("created_at", { ascending: false });

  if (evaluationsError) {
    console.error("Error consultando evaluaciones privadas:", evaluationsError.message);
  }

  const evaluations = evaluationsData ?? [];

  const projectIds = [...new Set(evaluations.map((e) => e.project_id))];
  const personIds = [
    ...new Set(
      evaluations
        .flatMap((e) => [e.evaluator_id, e.professional_id])
        .filter(Boolean) as string[]
    ),
  ];

  const projectMap = new Map<string, { title: string; category: string }>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, category")
      .in("id", projectIds);
    (projects ?? []).forEach((p) =>
      projectMap.set(p.id, { title: p.title, category: p.category })
    );
  }

  const nameMap = new Map<string, string>();
  if (personIds.length > 0) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", personIds);
    (people ?? []).forEach((p) => nameMap.set(p.id, p.full_name || "Usuario Skilly"));
  }

  const LABELS: Record<string, string> = {
    excelente: "Excelente (a tiempo o antes de lo previsto)",
    conforme: "Conforme (acorde a lo acordado)",
    retrasos_justificados: "Retrasos con justificación y aviso oportuno",
    retrasos_no_avisados: "Retrasos significativos sin comunicación previa",
    supero_expectativas: "Superó las expectativas",
    requirio_ajustes: "Requirió múltiples rondas de corrección",
    insuficiente: "No alcanzó el nivel técnico esperado",
    fluida: "Fluida, proactiva y orientada a soluciones",
    adecuada: "Adecuada y respetuosa",
    falto_comunicacion: "Faltó claridad y respuesta oportuna",
  };
  const label = (v: unknown) => (typeof v === "string" ? LABELS[v] ?? v : "—");

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
              {evaluations.length}
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
          {evaluations.length === 0 ? (
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
              {evaluations.map((ev) => {
                const project = projectMap.get(ev.project_id);
                const clientName = nameMap.get(ev.evaluator_id) || "Contratador";
                const professionalName = ev.professional_id
                  ? nameMap.get(ev.professional_id) || "Profesional"
                  : "—";
                const doc = (ev.payload ?? {}) as Record<string, unknown>;

                return (
                  <article
                    key={ev.id}
                    className="overflow-hidden rounded-[26px] border border-[#e8e5f0] bg-white p-6 shadow-sm sm:p-7"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efedf5] pb-4">
                      <div>
                        <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-xs font-bold text-[#6848ef]">
                          🔒 Confidencial Skilly
                        </span>
                        <h2 className="mt-2 text-xl font-bold text-[#23283c]">
                          {project?.title ?? "Contratación"}
                        </h2>
                        <p className="text-xs text-[#7e8494]">
                          Contratador: <strong className="text-[#34394b]">{clientName}</strong>
                          {" · "}
                          Profesional: <strong className="text-[#34394b]">{professionalName}</strong>
                        </p>
                      </div>

                      {project?.category && (
                        <span className="rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#2d8f5d]">
                          Categoría: {project.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#f8f7fc] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8174a8]">
                        Retroalimentación del Contratador a Skilly:
                      </p>

                      {typeof doc.texto_legado === "string" ? (
                        <div className="mt-3 whitespace-pre-line text-xs leading-6 text-[#4a5062]">
                          {doc.texto_legado}
                        </div>
                      ) : (
                        <dl className="mt-3 space-y-2 text-xs leading-6 text-[#4a5062]">
                          <div><dt className="inline font-semibold">Plazos: </dt><dd className="inline">{label(doc.plazos)}</dd></div>
                          <div><dt className="inline font-semibold">Calidad técnica: </dt><dd className="inline">{label(doc.calidad)}</dd></div>
                          <div><dt className="inline font-semibold">Comunicación: </dt><dd className="inline">{label(doc.comunicacion)}</dd></div>
                          <div><dt className="inline font-semibold">Fortalezas: </dt><dd className="inline whitespace-pre-line">{String(doc.fortalezas || "—")}</dd></div>
                          <div><dt className="inline font-semibold">Oportunidades de mejora: </dt><dd className="inline whitespace-pre-line">{String(doc.mejoras || "—")}</dd></div>
                        </dl>
                      )}
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
