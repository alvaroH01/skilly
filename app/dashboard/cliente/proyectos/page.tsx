import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PrivateEvaluationModal from "@/components/client/PrivateEvaluationModal";
import ReportIncidentModal from "@/components/incidents/ReportIncidentModal";

function money(value: number | null) {
  if (!value) return null;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function MisProyectosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      description,
      category,
      modality,
      budget_min,
      budget_max,
      deadline,
      status,
      created_at
    `)
    .eq("client_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1350px] rounded-[30px] border border-[#e9e9f1] bg-white p-6 shadow-[0_30px_90px_rgba(80,70,130,0.08)] sm:p-9">

        {/* HEADER CON LOGO ARRIBA A LA IZQUIERDA */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#efedf5] pb-6 sm:flex-row sm:items-center">

          <div className="flex items-center gap-6">
            <Link href="/dashboard/cliente" className="flex items-center">
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

            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#20263a]">
                Mis proyectos
              </h1>
              <p className="text-xs text-[#7c8190]">
                Gestiona tus proyectos, reporta incidencias o entrega evaluación privada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cliente"
              className="rounded-xl border border-[#e1e2e8] px-4 py-2.5 text-xs font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
            >
              ← Dashboard
            </Link>

            <Link
              href="/dashboard/cliente/proyectos/nuevo"
              className="rounded-xl bg-[#6f4cf6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0]"
            >
              + Publicar proyecto
            </Link>
          </div>

        </header>

        {!projects || projects.length === 0 ? (
          <section className="mt-10 flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#dcd9e8] bg-[#fbfbfd] px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-3xl">
              ▣
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#272d42]">
              Todavía no tienes proyectos
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#858a99]">
              Publica tu primera necesidad y comenzará el proceso de revisión por parte de Skilly para ser publicado.
            </p>

            <Link
              href="/dashboard/cliente/proyectos/nuevo"
              className="mt-6 rounded-2xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white"
            >
              Publicar mi primer proyecto
            </Link>

          </section>
        ) : (
          <section className="mt-9 space-y-4">

            {projects.map((project) => {
              const isPending =
                project.status === "borrador";

              return (
                <article
                  key={project.id}
                  className="rounded-[24px] border border-[#e8e8ef] bg-white p-6 transition hover:border-[#d5ceff] hover:shadow-[0_12px_35px_rgba(90,70,150,0.06)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#f0ecff] text-xl">
                      ▣
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-[#252b40]">
                          {project.title}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            project.status === "activo"
                              ? "bg-[#e9f8f1] text-[#3b9668]"
                              : isPending
                              ? "bg-[#fff4db] text-[#ad7629]"
                              : project.status === "en_ejecucion"
                              ? "bg-[#eef2ff] text-[#4f46e5]"
                              : project.status === "pausado"
                              ? "bg-[#f5f4f8] text-[#747988]"
                              : project.status === "rechazado"
                              ? "bg-[#ffebee] text-[#c62828]"
                              : "bg-[#f0f1f5] text-[#747988]"
                          }`}
                        >
                          {isPending
                            ? "⏳ En revisión por Skilly"
                            : project.status === "activo"
                            ? "✓ Publicado / Activo"
                            : project.status === "en_ejecucion"
                            ? "▶ En Ejecución"
                            : project.status}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7c8190]">
                        {project.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#777c8c]">

                        <span className="rounded-full bg-[#f5f4f9] px-3 py-1.5">
                          {project.category}
                        </span>

                        <span className="rounded-full bg-[#f5f4f9] px-3 py-1.5 capitalize">
                          {project.modality}
                        </span>

                        {(project.budget_min ||
                          project.budget_max) && (
                          <span className="rounded-full bg-[#f5f4f9] px-3 py-1.5">
                            {money(project.budget_min)}
                            {project.budget_min &&
                              project.budget_max &&
                              " - "}
                            {money(project.budget_max)}
                          </span>
                        )}

                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">

                      <ReportIncidentModal
                        projectId={project.id}
                        projectTitle={project.title}
                        userRole="cliente"
                      />

                      <PrivateEvaluationModal
                        projectId={project.id}
                        projectTitle={project.title}
                      />

                      <Link
                        href={`/dashboard/cliente/propuestas?project=${project.id}`}
                        className="rounded-xl border border-[#d9d2ff] px-4 py-2.5 text-xs font-semibold text-[#6848ef] transition hover:bg-[#f7f5ff]"
                      >
                        Ver propuestas
                      </Link>

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
