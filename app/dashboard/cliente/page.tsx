import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import AccountMenu from "@/components/dashboard/AccountMenu";

export default async function DashboardPage() {
  const supabase = await createClient();

  /* =========================
     1. USUARIO AUTENTICADO
  ========================= */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* =========================
     2. PERFIL Y CONTROL DE ROL
  ========================= */
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "cliente" || !profile.onboarding_completed) {
    redirect("/dashboard");
  }

  /* =========================
     3. DATOS DE LA ORGANIZACIÓN
  ========================= */
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("company_name, contact_name, industry")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    clientProfile?.company_name ||
    clientProfile?.contact_name ||
    profile.full_name?.trim() ||
    "Organización";

  const firstName = displayName.split(/\s+/)[0] || "Organización";
  const initial = displayName.charAt(0).toUpperCase() || "O";

  /* =========================
     4. PROYECTOS Y PROPUESTAS REALES
  ========================= */
  const { data: userProjects, error: projectsError } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      category,
      modality,
      budget_min,
      budget_max,
      status,
      created_at,
      proposals (
        id,
        status,
        proposed_amount,
        professional_id
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error cargando proyectos del cliente:", projectsError.message);
  }

  const projectsList = userProjects || [];

  // Conteo de proyectos por estado dentro del flujo de Skilly
  const inReviewCount = projectsList.filter(
    (p) => p.status === "borrador"
  ).length;

  const activeCount = projectsList.filter((p) => p.status === "activo").length;

  const inExecutionCount = projectsList.filter(
    (p) => p.status === "asignado" || p.status === "en_ejecucion"
  ).length;

  // Total de propuestas recibidas a través de todos los proyectos
  const totalProposalsReceived = projectsList.reduce(
    (acc, p) => acc + (p.proposals?.length || 0),
    0
  );

  /* =========================
     5. NOTIFICACIONES REALES
  ========================= */
  const { data: recentNotifications, count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const unreadCount = unreadNotifications ?? 0;

  /* =========================
     6. MÉTRICAS DINÁMICAS (KPIs B2B)
  ========================= */
  const stats = [
    {
      label: "En revisión Skilly",
      value: inReviewCount.toString(),
      helper: "Control de calidad previo",
      icon: "⏳",
    },
    {
      label: "Convocatorias activas",
      value: activeCount.toString(),
      helper: "Publicados en catálogo",
      icon: "▣",
    },
    {
      label: "Propuestas recibidas",
      value: totalProposalsReceived.toString(),
      helper: "Curadas comercialmente",
      icon: "▤",
    },
    {
      label: "En ejecución",
      value: inExecutionCount.toString(),
      helper: "Servicios formalizados",
      icon: "🤝",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">
        
        {/* =========================
            SIDEBAR
        ========================== */}
        <aside className="hidden w-[245px] shrink-0 border-r border-[#eeeef4] bg-white lg:flex lg:flex-col">
          {/* LOGO */}
          <div className="px-7 pb-7 pt-6">
            <Link href="/dashboard/cliente">
              <Image
                src="/logo-skilly-clean.png"
                alt="Skilly"
                width={180}
                height={70}
                priority
                className="h-auto w-[145px] object-contain"
              />
            </Link>
          </div>

          {/* MENU CLIENTE */}
          <nav className="flex-1 px-4">
            <div className="space-y-1.5">
              <Link
                href="/dashboard/cliente"
                className="flex items-center gap-3 rounded-2xl bg-[#f0ecff] px-4 py-3 text-sm font-semibold text-[#6848ef]"
              >
                <span className="text-lg">⌂</span>
                Inicio
              </Link>

              <Link
                href="/dashboard/cliente/perfil"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">🏢</span>
                Perfil empresa
              </Link>

              <Link
                href="/buscar"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">⌕</span>
                Explorar servicios
              </Link>

              <Link
                href="/dashboard/cliente/proyectos"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">▣</span>
                  Mis contrataciones
                </div>
                {projectsList.length > 0 && (
                  <span className="rounded-full bg-[#f1eeff] px-2 py-0.5 text-xs font-semibold text-[#6848ef]">
                    {projectsList.length}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/cliente/propuestas"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">▤</span>
                  Propuestas
                </div>
                {totalProposalsReceived > 0 && (
                  <span className="rounded-full bg-[#f1eeff] px-2 py-0.5 text-xs font-semibold text-[#6848ef]">
                    {totalProposalsReceived}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/cliente/notificaciones"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  Notificaciones
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f4cf6] px-1 text-[11px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/cliente/configuracion"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">⚙</span>
                Configuración
              </Link>
            </div>
          </nav>

          {/* SOPORTE / ACOMPAÑAMIENTO */}
          <div className="p-4">
            <div className="rounded-[22px] bg-gradient-to-br from-[#f7f3ff] to-[#f2f8ff] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                🛡️
              </div>
              <p className="mt-3 text-sm font-semibold text-[#272d42]">
                People & Culture
              </p>
              <p className="mt-1 text-xs leading-5 text-[#858a99]">
                Cada requerimiento es revisado por Skilly para asegurar propuestas ajustadas al mercado.
              </p>
              <Link
                href="/como-funciona"
                className="mt-3 inline-block rounded-xl border border-[#d6ceff] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6848ef] transition hover:bg-[#faf9ff]"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </aside>

        {/* =========================
            CONTENIDO CENTRAL
        ========================== */}
        <section className="min-w-0 flex-1">
          {/* TOPBAR */}
          <header className="flex min-h-[82px] items-center justify-between gap-6 border-b border-[#eeeef4] px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f0ecff] text-[#6848ef] border border-[#dcd7fa]">
                Organización / PyME
              </span>
              {clientProfile?.industry && (
                <span className="hidden sm:inline-block text-xs font-medium text-[#858a99]">
                  Rubro: {clientProfile.industry}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/dashboard/cliente/notificaciones"
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e4e5ed] bg-white transition hover:border-[#d8d1ff] hover:bg-[#f8f7fc]"
                aria-label="Notificaciones"
              >
                <span className="text-[19px]">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#ee5f66] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <AccountMenu
                displayName={displayName}
                subtitle="Contratador"
                initial={initial}
                role="cliente"
                unreadNotifications={unreadCount}
              />
            </div>
          </header>

          {/* CUERPO DEL DASHBOARD */}
          <div className="p-5 sm:p-8">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-[28px] border border-[#ebe8ff] bg-gradient-to-r from-[#f7f4ff] via-[#fbfaff] to-[#f4f1ff] p-7 sm:p-9">
              <div className="relative z-10 max-w-xl">
                <p className="text-3xl font-semibold tracking-tight text-[#171d34] sm:text-4xl">
                  Hola, {firstName} 👋
                </p>
                <p className="mt-2 text-xl font-semibold text-[#282f47]">
                  ¿Qué servicio necesitas contratar hoy?
                </p>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#73798a]">
                  Explora el catálogo de servicios validados por Skilly, elige al profesional que necesitas, agenda la fecha de inicio y contrata.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/buscar"
                    className="inline-flex rounded-2xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(111,76,246,0.24)] transition hover:-translate-y-0.5 hover:bg-[#6241e8]"
                  >
                    Explorar servicios →
                  </Link>
                  <Link
                    href="/dashboard/cliente/propuestas"
                    className="inline-flex rounded-2xl border border-[#d8d1ff] bg-white px-5 py-3.5 text-sm font-semibold text-[#6848ef] transition hover:bg-[#fbfaff]"
                  >
                    Ver mis contrataciones
                  </Link>
                </div>
              </div>

              {/* ILUSTRACIÓN */}
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 xl:block">
                <div className="relative flex h-40 w-52 items-center justify-center rounded-[38px] bg-[#ece7ff]">
                  <div className="text-7xl">💼</div>
                  <div className="absolute -bottom-2 -left-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-3xl shadow-lg">
                    🏢
                  </div>
                  <div className="absolute -bottom-3 -right-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#7555f7] text-3xl text-white shadow-lg">
                    +
                  </div>
                </div>
              </div>

              <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#cfc4ff]/40 blur-3xl" />
            </section>

            {/* ESTADÍSTICAS OPERATIVAS (B2B) */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-[#e9e9f1] bg-white p-5 transition hover:border-[#dcd7fa]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1eeff] text-xl text-[#6848ef]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-[#1d2439]">
                        {item.value}
                      </p>
                      <p className="text-xs font-semibold text-[#252b40]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#9094a2]">
                        {item.helper}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* LISTADO DE PROYECTOS PROPIOS */}
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#20273b]">
                    Proyectos de tu organización
                  </h2>
                  <p className="text-xs text-[#858a99] mt-0.5">
                    Seguimiento del estado de validación, propuestas y ejecución
                  </p>
                </div>

                <Link
                  href="/dashboard/cliente/proyectos"
                  className="text-sm font-semibold text-[#6f4cf6] transition hover:text-[#5d3fe0]"
                >
                  Ver todos ({projectsList.length}) →
                </Link>
              </div>

              {projectsList.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#dcd7fa] bg-[#faf9ff] p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    📝
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#252b40]">
                    Aún no has contratado servicios
                  </h3>
                  <p className="mt-1 text-sm text-[#7f8494] max-w-md mx-auto">
                    Explora el catálogo, elige un servicio validado por Skilly y agenda su inicio.
                  </p>
                  <Link
                    href="/buscar"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6f4cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6241e8]"
                  >
                    Explorar servicios
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectsList.slice(0, 4).map((project) => {
                    const proposalsCount = project.proposals?.length || 0;

                    // Mapeo riguroso de estados curados de Skilly
                    let statusLabel = "En revisión";
                    let badgeColor = "bg-[#fff8ec] text-[#b47a16] border-[#fce3b8]";

                    if (project.status === "borrador") {
                      statusLabel = "⏳ En revisión por Skilly";
                      badgeColor = "bg-[#fff8ec] text-[#b47a16] border-[#fce3b8]";
                    } else if (project.status === "activo") {
                      statusLabel = "🟢 Convocatoria activa";
                      badgeColor = "bg-[#eaf8f1] text-[#2c7a51] border-[#c2ecd7]";
                    } else if (project.status === "asignado" || project.status === "en_ejecucion") {
                      statusLabel = "🔵 En ejecución";
                      badgeColor = "bg-[#edf4ff] text-[#2857a4] border-[#c7ddfc]";
                    } else if (project.status === "pausado") {
                      statusLabel = "⚠️ En mediación / Pausado";
                      badgeColor = "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]";
                    } else if (project.status === "cerrado") {
                      statusLabel = "✓ Finalizado";
                      badgeColor = "bg-[#f1f2f6] text-[#7c8190] border-[#e2e4e9]";
                    }

                    const formattedDate = new Date(project.created_at).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={project.id}
                        className="rounded-[22px] border border-[#e9e9f1] bg-white p-5 transition hover:border-[#d5ceff] hover:shadow-[0_12px_30px_rgba(90,70,150,0.06)]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-xl">
                            💼
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
                                {statusLabel}
                              </span>
                              {project.category && (
                                <span className="rounded-full bg-[#f5f4fa] px-3 py-0.5 text-xs text-[#7f8494]">
                                  {project.category}
                                </span>
                              )}
                              {project.modality && (
                                <span className="rounded-full bg-[#f5f4fa] px-3 py-0.5 text-xs text-[#7f8494] capitalize">
                                  {project.modality}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 font-semibold text-[#252b40] text-base">
                              {project.title}
                            </p>

                            <p className="mt-1 text-xs text-[#858a99]">
                              Presupuesto:{" "}
                              <span className="font-semibold text-[#252b40]">
                                ${Number(project.budget_min || 0).toLocaleString("es-CL")} - $
                                {Number(project.budget_max || 0).toLocaleString("es-CL")} CLP
                              </span>
                              {" • "}Publicado el {formattedDate}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-6 lg:justify-end">
                            <div className="text-center">
                              <p className="text-lg font-bold text-[#252b40]">
                                {proposalsCount}
                              </p>
                              <p className="text-xs text-[#9094a2]">
                                {proposalsCount === 1 ? "Propuesta" : "Propuestas"}
                              </p>
                            </div>

                            {proposalsCount > 0 ? (
                              <Link
                                href="/dashboard/cliente/propuestas"
                                className="rounded-xl bg-[#6f4cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6241e8]"
                              >
                                Revisar propuestas
                              </Link>
                            ) : (
                              <Link
                                href="/dashboard/cliente/proyectos"
                                className="rounded-xl border border-[#dcd7fa] px-4 py-2 text-xs font-semibold text-[#6848ef] transition hover:bg-[#faf9ff]"
                              >
                                Ver proyecto
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* PARTE INFERIOR: ACOMPAÑAMIENTO Y ACTIVIDAD RECIENTE */}
            <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              {/* FILOSOFÍA DE PEOPLE & CULTURE (REEMPLAZA EL RANKING DE ESTRELLAS) */}
              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[#20273b] flex items-center gap-2">
                    <span>✦</span> Acompañamiento y Evaluación Privada
                  </h2>
                  <span className="rounded-full bg-[#f1eeff] px-2.5 py-0.5 text-[11px] font-semibold text-[#6848ef]">
                    Sin estrellas públicas
                  </span>
                </div>

                <div className="mt-4 space-y-3.5 text-sm text-[#5f6577]">
                  <p className="leading-6">
                    En <strong>Skilly LATAM</strong> protegemos las relaciones comerciales justas. Por definición ética, 
                    <span className="font-semibold text-[#252b40]"> no utilizamos rankings públicos ni estrellas</span> para calificar el talento.
                  </p>

                  <div className="rounded-2xl bg-[#faf9ff] border border-[#ede9fe] p-4 space-y-2">
                    <p className="text-xs font-bold text-[#6848ef] uppercase tracking-wider">
                      ¿Cómo funciona tu retroalimentación?
                    </p>
                    <ul className="text-xs space-y-1.5 text-[#5e6476]">
                      <li>• <strong>Evaluación 100% privada:</strong> Al finalizar un proyecto completas una pauta confidencial de desempeño.</li>
                      <li>• <strong>Uso exclusivo de People & Culture:</strong> Skilly utiliza tus comentarios para retroalimentar y capacitar al especialista sin exponerlo.</li>
                      <li>• <strong>Garantía y mediación:</strong> Ante inasistencias o retrasos, puedes reportar una incidencia con opciones de reprogramación o reembolso.</li>
                    </ul>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      href="/dashboard/cliente/proyectos"
                      className="text-xs font-semibold text-[#6f4cf6] hover:underline"
                    >
                      Ir a evaluar proyectos finalizados →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ACTIVIDAD RECIENTE / NOTIFICACIONES REALES */}
              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[#20273b]">
                    Notificaciones y actividad
                  </h2>

                  {unreadCount > 0 && (
                    <Link
                      href="/dashboard/cliente/notificaciones"
                      className="text-xs font-semibold text-[#6f4cf6]"
                    >
                      {unreadCount} {unreadCount === 1 ? "sin leer" : "sin leer"}
                    </Link>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((item) => {
                      const notificationDate = new Date(item.created_at).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div key={item.id} className="flex gap-3 text-left">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1eeff] text-base text-[#6848ef]">
                            🔔
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#292f43]">
                              {item.title || "Actualización de Skilly"}
                            </p>
                            <p className="mt-0.5 text-xs text-[#838898] leading-snug">
                              {item.message}
                            </p>
                            <p className="mt-1 text-[10px] text-[#a0a3ae]">
                              {notificationDate}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-[#858a99]">
                      No tienes notificaciones pendientes en este momento.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}