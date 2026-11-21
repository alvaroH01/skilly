import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ReportIncidentModal from "@/components/incidents/ReportIncidentModal";

function money(value: number | null) {
  if (value === null || value === undefined) {
    return "A convenir";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusStyles(status: string) {
  switch (status) {
    case "aceptada":
      return "bg-[#e7f8ef] text-[#378e62]";

    case "rechazada":
      return "bg-[#fff0f0] text-[#b45757]";

    case "retirada":
      return "bg-[#f0f1f5] text-[#767b89]";

    default:
      return "bg-[#fff4da] text-[#a77428]";
  }
}

export default async function MisPropuestasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "profesional") {
    redirect("/dashboard");
  }

  const { data: proposals, error } =
    await supabase
      .from("proposals")
      .select(`
        id,
        message,
        proposed_amount,
        estimated_days,
        status,
        created_at,
        project:projects (
          id,
          title,
          category,
          modality,
          status
        )
      `)
      .eq("professional_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Error cargando propuestas:",
      error.message
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1350px] rounded-[30px] border border-[#e9e9f1] bg-white p-6 shadow-[0_30px_90px_rgba(80,70,130,0.08)] sm:p-9">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-semibold text-[#7458e8]">
              Contrataciones
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">
              Mis contrataciones
            </h1>

            <p className="mt-2 text-sm text-[#7c8190]">
              Revisa los servicios que te contrataron, el estado de su pago y gestiona incidencias.
            </p>
          </div>

          <div className="flex gap-3">

            <Link
              href="/dashboard/profesional"
              className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776]"
            >
              ← Dashboard
            </Link>

            <Link
              href="/dashboard/profesional/servicios"
              className="rounded-xl bg-[#6f4cf6] px-5 py-3 text-sm font-semibold text-white"
            >
              Mis servicios
            </Link>

          </div>

        </header>

        {/* VACÍO */}
        {!proposals || proposals.length === 0 ? (
          <section className="mt-10 flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#ddd9ea] bg-[#fbfbfd] px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-3xl">
              ▤
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#272d42]">
              Aún no tienes contrataciones
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#858a99]">
              Cuando una organización contrate alguno de tus
              servicios, aparecerá aquí.
            </p>

            <Link
              href="/dashboard/profesional/servicios"
              className="mt-6 rounded-2xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white"
            >
              Ver mis servicios
            </Link>

          </section>
        ) : (
          <section className="mt-9 space-y-4">

            {proposals.map((proposal) => {
              const project = Array.isArray(
                proposal.project
              )
                ? proposal.project[0]
                : proposal.project;

              const hasCuration = proposal.message?.includes("RETROALIMENTACIÓN DE SKILLY LATAM");

              // Separamos el mensaje base del profesional de la nota de Skilly para presentarlo limpio
              const displayMessage = proposal.message?.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")[0].trim();

              return (
                <article
                  key={proposal.id}
                  className="rounded-[24px] border border-[#e8e8ef] bg-white p-6 transition hover:border-[#d7d1f5] hover:shadow-[0_12px_35px_rgba(90,70,150,0.05)]"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                    {/* ICONO */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0ecff] text-xl text-[#6848ef]">
                      ▤
                    </div>

                    {/* CONTENIDO */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-lg font-semibold text-[#252b40]">
                          {project?.title ||
                            "Proyecto"}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles(
                            proposal.status
                          )}`}
                        >
                          {proposal.status}
                        </span>

                        {hasCuration && (
                          <span className="rounded-full bg-[#f0ecff] px-3 py-1 text-xs font-bold text-[#6848ef]">
                            ✦ Retroalimentación de Skilly
                          </span>
                        )}

                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#858a99]">

                        {project?.category && (
                          <span className="rounded-full bg-[#f5f4f9] px-3 py-1">
                            {project.category}
                          </span>
                        )}

                        {project?.modality && (
                          <span className="rounded-full bg-[#f5f4f9] px-3 py-1 capitalize">
                            {project.modality}
                          </span>
                        )}

                      </div>

                      <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-[#737887]">
                        {displayMessage}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-8">

                        <div>
                          <p className="text-xs text-[#999daa]">
                            Tarifa actual
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#30364a]">
                            {money(
                              proposal.proposed_amount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#999daa]">
                            Tiempo estimado
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#30364a]">
                            {proposal.estimated_days
                              ? `${proposal.estimated_days} días`
                              : "A convenir"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* ACCIONES */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">

                      {project?.id && (
                        <>
                          <ReportIncidentModal
                            projectId={project.id}
                            projectTitle={project.title}
                            userRole="profesional"
                          />
                        </>
                      )}

                    </div>

                  </div>

                </article>
              );
            })}

          </section>
        )}

      </div>
    </main>
  );
}
