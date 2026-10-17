import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function formatMoney(value: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function ProyectosProfesionalPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "profesional" ||
    !profile.onboarding_completed
  ) {
    redirect("/dashboard");
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
      skills,
      status,
      created_at
    `)
    .eq("status", "activo")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error cargando proyectos:",
      error.message
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1450px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#eeeeF4] px-6 py-7 sm:flex-row sm:items-center sm:px-9">

          <div>
            <p className="text-sm font-semibold text-[#7458e8]">
              Oportunidades
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">
              Explorar proyectos
            </h1>

            <p className="mt-2 text-sm text-[#7c8190]">
              Encuentra proyectos que coincidan con tus
              habilidades y experiencia.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/profesional"
              className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
            >
              ← Dashboard
            </Link>

            <Link
              href="/dashboard/profesional/propuestas"
              className="rounded-xl bg-[#6f4cf6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6241e8]"
            >
              Mis propuestas
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-9">

          {/* BUSCADOR VISUAL */}
          <section className="rounded-[26px] border border-[#e8e6f4] bg-gradient-to-r from-[#f8f6ff] to-[#fbfaff] p-5">

            <div className="grid gap-3 lg:grid-cols-[1fr_230px_180px]">

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#979baa]">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Buscar por proyecto, habilidad o categoría..."
                  className="w-full rounded-2xl border border-[#e2e1e9] bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#9b8af8] focus:ring-4 focus:ring-[#6f4cf6]/10"
                />
              </div>

              <select className="rounded-2xl border border-[#e2e1e9] bg-white px-4 py-3.5 text-sm text-[#626776] outline-none">
                <option>Todas las categorías</option>
                <option>Diseño</option>
                <option>Tecnología</option>
                <option>Marketing</option>
                <option>Finanzas</option>
                <option>Personas / RRHH</option>
                <option>Legal</option>
                <option>Administración</option>
                <option>Ventas</option>
                <option>Operaciones</option>
              </select>

              <select className="rounded-2xl border border-[#e2e1e9] bg-white px-4 py-3.5 text-sm text-[#626776] outline-none">
                <option>Modalidad</option>
                <option>Remoto</option>
                <option>Presencial</option>
                <option>Híbrido</option>
              </select>

            </div>
          </section>

          {/* CANTIDAD */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#242a3e]">
                Proyectos disponibles
              </h2>

              <p className="mt-1 text-sm text-[#8a8e9c]">
                {projects?.length ?? 0} oportunidades
                encontradas
              </p>
            </div>
          </div>

          {/* SIN PROYECTOS */}
          {!projects || projects.length === 0 ? (
            <section className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#dad7e5] bg-[#fbfbfd] px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-3xl">
                ▣
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#272d42]">
                No hay proyectos disponibles
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#858a99]">
                Cuando los clientes publiquen nuevos proyectos,
                podrás encontrarlos aquí.
              </p>

            </section>
          ) : (
            <section className="mt-6 grid gap-5 xl:grid-cols-2">

              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group rounded-[26px] border border-[#e8e8ef] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#d5ceff] hover:shadow-[0_16px_40px_rgba(90,70,150,0.08)]"
                >

                  {/* SUPERIOR */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0ecff] text-xl text-[#6848ef]">
                        ▣
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-wide text-[#795de6]">
                          {project.category}
                        </p>

                        <h2 className="mt-1 text-lg font-semibold leading-6 text-[#252b40]">
                          {project.title}
                        </h2>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7e7ed] text-lg text-[#8d91a0] transition hover:bg-[#f8f7fc]"
                    >
                      ♡
                    </button>

                  </div>

                  {/* DESCRIPCIÓN */}
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#747988]">
                    {project.description}
                  </p>

                  {/* SKILLS */}
                  {project.skills &&
                    project.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">

                        {project.skills
                          .slice(0, 4)
                          .map((skill: string) => (
                            <span
                              key={skill}
                              className="rounded-full bg-[#f4f2fb] px-3 py-1.5 text-xs font-medium text-[#625b76]"
                            >
                              {skill}
                            </span>
                          ))}

                        {project.skills.length > 4 && (
                          <span className="rounded-full bg-[#f4f2fb] px-3 py-1.5 text-xs font-medium text-[#8b8796]">
                            +{project.skills.length - 4}
                          </span>
                        )}

                      </div>
                    )}

                  {/* INFO */}
                  <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[#fafafd] p-4">

                    <div>
                      <p className="text-xs text-[#999daa]">
                        Presupuesto
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#353b4f]">
                        {project.budget_min ||
                        project.budget_max ? (
                          <>
                            {formatMoney(
                              project.budget_min
                            )}

                            {project.budget_min &&
                              project.budget_max &&
                              " - "}

                            {formatMoney(
                              project.budget_max
                            )}
                          </>
                        ) : (
                          "A convenir"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#999daa]">
                        Modalidad
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize text-[#353b4f]">
                        {project.modality}
                      </p>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="mt-5 flex items-center justify-between">

                    <p className="text-xs text-[#969aa7]">
                      Publicado{" "}
                      {formatDate(project.created_at)}
                    </p>

                    <Link
                      href={`/dashboard/profesional/proyectos/${project.id}`}
                      className="rounded-xl bg-[#6f4cf6] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#6040df]"
                    >
                      Ver proyecto →
                    </Link>

                  </div>

                </article>
              ))}

            </section>
          )}

        </div>
      </div>
    </main>
  );
}