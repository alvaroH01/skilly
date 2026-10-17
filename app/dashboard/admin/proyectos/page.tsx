import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProjectValidationActions from "@/components/admin/ProjectValidationActions";

function formatMoney(value: number | null) {
  if (!value) return null;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminProyectosPage() {
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
     2. OBTENER TODOS LOS PROYECTOS
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
      budget_min,
      budget_max,
      deadline,
      skills,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error obteniendo proyectos en admin:", projectsError.message);
  }

  const projects = projectsData ?? [];

  /* =====================================================
     3. OBTENER INFORMACIÓN DE LOS CLIENTES
  ===================================================== */
  const clientIds = [
    ...new Set(projects.map((p) => p.client_id).filter(Boolean)),
  ];

  let clientMap = new Map<string, { name: string; email?: string }>();

  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", clientIds);

    clientMap = new Map(
      (clients ?? []).map((c) => [
        c.id,
        {
          name: c.full_name || "Cliente Skilly",
          email: c.email || undefined,
        },
      ])
    );
  }

  /* =====================================================
     4. CONTADORES DE ESTADO
  ===================================================== */
  const pendingCount = projects.filter(
    (p) => p.status === "pendiente_validacion" || p.status === "en_revision"
  ).length;
  const activeCount = projects.filter((p) => p.status === "activo").length;
  const pausedCount = projects.filter((p) => p.status === "pausado").length;

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      {/* HEADER CON LOGO ARRIBA A LA IZQUIERDA */}
      <header className="border-b border-[#ebe9f2] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/admin"
              className="flex items-center"
            >
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
                Validación de Proyectos
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
                Control de Calidad y Curaduría
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252a3b]">
                Proyectos para Validación
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a98]">
                Revisa los proyectos creados por las organizaciones antes de que sean
                publicados en el catálogo general. Valida el alcance, categoría y tarifas.
              </p>
            </div>
          </div>
        </section>

        {/* CONTADORES RÁPIDOS */}
        <section className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e8e5f2] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#8f93a2]">Total proyectos</p>
            <p className="mt-2 text-2xl font-bold text-[#202538]">{projects.length}</p>
          </div>

          <div className="rounded-2xl border border-[#ffe0b2] bg-[#fffaf2] p-5 shadow-sm">
            <p className="text-xs font-medium text-[#c47d17]">Por validar</p>
            <p className="mt-2 text-2xl font-bold text-[#c47d17]">{pendingCount}</p>
          </div>

          <div className="rounded-2xl border border-[#c8f0dc] bg-[#f2fcf7] p-5 shadow-sm">
            <p className="text-xs font-medium text-[#2d8f5d]">Activos / Publicados</p>
            <p className="mt-2 text-2xl font-bold text-[#2d8f5d]">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-[#e8e5f2] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#8f93a2]">Pausados / Otros</p>
            <p className="mt-2 text-2xl font-bold text-[#555a6d]">{pausedCount}</p>
          </div>
        </section>

        {/* LISTA DE PROYECTOS */}
        <section className="mt-8">
          {projects.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd9e9] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1edff] text-2xl text-[#6f4cf6]">
                ✓
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#363b4d]">
                No hay proyectos registrados
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a8f9c]">
                Aún no se han enviado proyectos desde cuentas de clientes.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {projects.map((project) => {
                const client = clientMap.get(project.client_id) || {
                  name: "Organización Skilly",
                };

                const isPending =
                  project.status === "pendiente_validacion" ||
                  project.status === "en_revision";

                return (
                  <article
                    key={project.id}
                    className={`overflow-hidden rounded-[26px] border bg-white p-6 shadow-sm transition sm:p-7 ${
                      isPending
                        ? "border-[#ebd7a0] bg-[#fffdf8] shadow-[0_10px_35px_rgba(240,180,60,0.06)]"
                        : "border-[#e8e5f0]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* BADGES */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isPending && (
                            <span className="rounded-full bg-[#fff0d4] px-3 py-1 text-xs font-bold text-[#b87010]">
                              ⏳ Requiere Validación
                            </span>
                          )}

                          {project.status === "activo" && (
                            <span className="rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#2d8f5d]">
                              ✓ Activo / Publicado
                            </span>
                          )}

                          {project.status === "pausado" && (
                            <span className="rounded-full bg-[#f3f1f7] px-3 py-1 text-xs font-semibold text-[#767b8d]">
                              ⏸ Pausado
                            </span>
                          )}

                          {project.status === "rechazado" && (
                            <span className="rounded-full bg-[#ffebee] px-3 py-1 text-xs font-semibold text-[#c62828]">
                              ✕ Rechazado
                            </span>
                          )}

                          <span className="rounded-full bg-[#f0ecff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                            {project.category}
                          </span>

                          <span className="rounded-full bg-[#f5f4f8] px-3 py-1 text-xs capitalize text-[#686d7e]">
                            {project.modality}
                          </span>

                          <span className="text-xs text-[#9a9eaa]">
                            Creado: {formatDate(project.created_at)}
                          </span>
                        </div>

                        {/* TITULO */}
                        <h2 className="mt-3 text-xl font-bold text-[#23283c]">
                          {project.title}
                        </h2>

                        {/* DATOS CLIENTE */}
                        <p className="mt-2 text-xs font-medium text-[#7a8091]">
                          Publicado por:{" "}
                          <span className="font-semibold text-[#303548]">
                            {client.name}
                          </span>
                          {client.email && ` (${client.email})`}
                        </p>

                        {/* DESCRIPCION */}
                        <div className="mt-4 rounded-2xl bg-[#faf9fd] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#9398a8]">
                            Descripción del proyecto:
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#515767]">
                            {project.description}
                          </p>
                        </div>

                        {/* HABILIDADES */}
                        {project.skills && project.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-[#8c91a2]">
                              Habilidades requeridas:
                            </span>
                            {project.skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="rounded-full border border-[#e5e1ef] bg-white px-2.5 py-1 text-xs text-[#5e6375]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* PRESUPUESTO & ACCIONES */}
                      <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-[#ede9f5] bg-[#fcfbfe] p-5 lg:w-[280px]">
                        <div>
                          <p className="text-xs font-medium text-[#9296a6]">
                            Presupuesto estimado
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#2c3245]">
                            {formatMoney(project.budget_min)}
                            {project.budget_min && project.budget_max && " - "}
                            {formatMoney(project.budget_max)}
                            {!project.budget_min && !project.budget_max && "A convenir"}
                          </p>
                          {project.deadline && (
                            <p className="mt-2 text-xs text-[#8a8f9f]">
                              Límite: {project.deadline}
                            </p>
                          )}
                        </div>

                        <div className="h-px bg-[#ebe7f2]" />

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#797e90]">
                            Acciones de Validación
                          </p>
                          <ProjectValidationActions
                            projectId={project.id}
                            currentStatus={project.status}
                            projectTitle={project.title}
                          />
                        </div>
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
