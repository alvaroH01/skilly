import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import IncidentResolutionActions from "@/components/admin/IncidentResolutionActions";

export default async function AdminIncidenciasPage() {
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
     2. OBTENER PROYECTOS CON INCIDENCIAS
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
      status,
      created_at
    `)
    .ilike("description", "%[INCIDENCIA REPORTADA%")
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error consultando incidencias:", projectsError.message);
  }

  const incidentProjects = projectsData ?? [];

  // Obtenemos nombres de clientes
  const clientIds = [
    ...new Set(incidentProjects.map((p) => p.client_id).filter(Boolean)),
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
                Gestión de Incidencias, Cancelaciones y Reembolsos
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
                Mediación & Resolución de Conflictos
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252a3b]">
                Bandeja de Incidencias y Reembolsos
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a98]">
                Supervisa y resuelve conflictos en servicios: inasistencias, cancelaciones
                anticipadas y solicitudes de reembolso administradas por el equipo de mediación de Skilly según Términos y Condiciones.
              </p>
            </div>
          </div>
        </section>

        {/* CONTADOR */}
        <section className="mt-7">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#fed7d7] bg-[#fffaf9] px-5 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffebee] font-bold text-[#c53030]">
              {incidentProjects.length}
            </div>
            <div>
              <p className="text-xs text-[#9b2c2c]">Casos registrados</p>
              <p className="text-sm font-semibold text-[#742a2a]">
                Servicios con reporte de inasistencia, suspensión o solicitud de devolución
              </p>
            </div>
          </div>
        </section>

        {/* LISTA DE CASOS */}
        <section className="mt-6">
          {incidentProjects.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd9e9] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1edff] text-2xl text-[#6f4cf6]">
                ✓
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#363b4d]">
                No hay incidencias pendientes
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a8f9c]">
                Actualmente todos los servicios operan con normalidad sin reportes de cancelaciones o reembolsos.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {incidentProjects.map((p) => {
                const clientName = clientMap.get(p.client_id) || "Organización";
                const isResolved = p.description.includes("[RESOLUCIÓN SKILLY:");
                const incidentDetails = p.description.split("[INCIDENCIA REPORTADA")[1] || "";

                return (
                  <article
                    key={p.id}
                    className={`overflow-hidden rounded-[26px] border bg-white p-6 shadow-sm sm:p-7 ${
                      isResolved ? "border-[#dcf3e7]" : "border-[#fbd5d5]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5e4e4] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isResolved
                                ? "bg-[#e8f8ef] text-[#2d8f5d]"
                                : "bg-[#ffebee] text-[#c53030]"
                            }`}
                          >
                            {isResolved ? "✓ Caso Resuelto por Skilly" : "⚠️ En Mediación Activa"}
                          </span>

                          <span className="rounded-full bg-[#f3f1f7] px-3 py-1 text-xs font-semibold text-[#666b7c]">
                            Estado: {p.status}
                          </span>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-[#23283c]">
                          {p.title}
                        </h2>
                        <p className="text-xs text-[#7e8494]">
                          Organización: <strong className="text-[#34394b]">{clientName}</strong>
                        </p>
                      </div>

                      <div className="text-right text-xs text-[#878c9b]">
                        <span className="rounded-lg bg-[#faf9fd] px-3 py-1.5 border border-[#efecf6]">
                          Modalidad: {p.modality}
                        </span>
                      </div>
                    </div>

                    {/* DETALLE INCIDENCIA */}
                    <div className="mt-5 rounded-2xl bg-[#fffaf9] border border-[#fde8e8] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#9b2c2c]">
                        Detalle del reporte y seguimiento:
                      </p>
                      <div className="mt-2 whitespace-pre-line text-xs leading-6 text-[#4a5062]">
                        [INCIDENCIA REPORTADA{incidentDetails}
                      </div>
                    </div>

                    {/* ACCIONES DE RESOLUCIÓN SKILLY */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebf5] pt-4">
                      <p className="text-xs text-[#7d8294]">
                        Dictamen y mediación según Términos & Condiciones de Skilly:
                      </p>

                      <IncidentResolutionActions
                        projectId={p.id}
                        projectTitle={p.title}
                        currentDescription={p.description}
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
