import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import AccountMenu from "@/components/dashboard/AccountMenu";

/* =========================
   DATOS TEMPORALES DASHBOARD
========================= */

const stats = [
  {
    label: "Proyectos activos",
    value: "2",
    icon: "▣",
  },
  {
    label: "Propuestas recibidas",
    value: "8",
    icon: "▤",
  },
  {
    label: "Profesionales favoritos",
    value: "4",
    icon: "♡",
  },
  {
    label: "Conversaciones",
    value: "3",
    icon: "✉",
  },
];

const projects = [
  {
    title: "Diseño de identidad visual",
    category: "Diseño",
    modality: "Remoto",
    published: "Hace 2 días",
    proposals: "5",
    status: "Activo",
  },
  {
    title: "Desarrollo landing page",
    category: "Tecnología",
    modality: "Remoto",
    published: "Hace 5 días",
    proposals: "3",
    status: "Activo",
  },
  {
    title: "Asesoría estrategia de marketing",
    category: "Marketing",
    modality: "Híbrido",
    published: "Hace 2 semanas",
    proposals: "7",
    status: "Finalizado",
  },
];

const professionals = [
  {
    name: "Camila Rodríguez",
    role: "Diseñadora UX/UI",
    rating: "4.9",
    initials: "CR",
  },
  {
    name: "Felipe Morales",
    role: "Desarrollador Full Stack",
    rating: "4.8",
    initials: "FM",
  },
  {
    name: "Valentina Soto",
    role: "Especialista en Marketing",
    rating: "4.9",
    initials: "VS",
  },
];

const activity = [
  {
    icon: "▤",
    title: "Nueva propuesta recibida",
    description:
      "Recibiste una propuesta para Diseño de identidad visual.",
    time: "Hace 12 minutos",
  },
  {
    icon: "✉",
    title: "Nuevo mensaje",
    description:
      "Camila Rodríguez te envió un mensaje.",
    time: "Hace 1 hora",
  },
  {
    icon: "♡",
    title: "Profesional guardado",
    description:
      "Agregaste un nuevo profesional a favoritos.",
    time: "Ayer",
  },
];

/* =========================
   DASHBOARD
========================= */

export default async function DashboardPage() {
  const supabase = await createClient();

  /* =========================
     USUARIO AUTENTICADO
  ========================= */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* =========================
     PERFIL
  ========================= */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "full_name, role, onboarding_completed"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/onboarding");
  }

  /* =========================
     PROTEGER DASHBOARD
  ========================= */

  if (
    profile.role !== "cliente" ||
    !profile.onboarding_completed
  ) {
    redirect("/dashboard");
  }

  /* =========================
     DATOS DEL USUARIO
  ========================= */

  const displayName =
    profile.full_name?.trim() ||
    "Usuario Skilly";

  const firstName =
    displayName.split(/\s+/)[0] ||
    "Usuario";

  const initial =
    displayName.charAt(0).toUpperCase() ||
    "U";

  /* =========================
     NOTIFICACIONES NO LEÍDAS
  ========================= */

  const {
    count: unreadNotifications,
    error: notificationsError,
  } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (notificationsError) {
    console.error(
      "Error cargando notificaciones:",
      notificationsError.message
    );
  }

  const unreadCount =
    unreadNotifications ?? 0;

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

          {/* MENU */}
          <nav className="flex-1 px-4">
            <div className="space-y-1.5">

              {/* INICIO */}
              <Link
                href="/dashboard/cliente"
                className="flex items-center gap-3 rounded-2xl bg-[#f0ecff] px-4 py-3 text-sm font-semibold text-[#6848ef]"
              >
                <span className="text-lg">
                  ⌂
                </span>

                Inicio
              </Link>

              {/* PERFIL */}
              <Link
                href="/dashboard/cliente/perfil"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ♙
                </span>

                Mi perfil
              </Link>

              {/* PUBLICAR */}
              <Link
                href="/dashboard/cliente/proyectos/nuevo"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ⊕
                </span>

                Publicar proyecto
              </Link>

              {/* PROYECTOS */}
              <Link
                href="/dashboard/cliente/proyectos"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ▣
                </span>

                Mis proyectos
              </Link>

              {/* PROPUESTAS */}
              <Link
                href="/dashboard/cliente/propuestas"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ▤
                </span>

                Propuestas
              </Link>

              {/* PROFESIONALES */}
              <Link
                href="/dashboard/cliente/profesionales"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ♙
                </span>

                Profesionales
              </Link>

              {/* MENSAJES */}
              <Link
                href="/dashboard/cliente/mensajes"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >

                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    ✉
                  </span>

                  Mensajes
                </div>

                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6f4cf6] px-1.5 text-xs font-semibold text-white">
                  3
                </span>

              </Link>

              {/* NOTIFICACIONES */}
              <Link
                href="/dashboard/cliente/notificaciones"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >

                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    🔔
                  </span>

                  Notificaciones
                </div>

                {unreadCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6f4cf6] px-1.5 text-xs font-semibold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </Link>

              {/* FAVORITOS */}
              <Link
                href="/dashboard/cliente/favoritos"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ♡
                </span>

                Favoritos
              </Link>

              {/* CONFIGURACIÓN */}
              <Link
                href="/dashboard/cliente/configuracion"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc]"
              >
                <span className="text-lg">
                  ⚙
                </span>

                Configuración
              </Link>

            </div>
          </nav>

          {/* =========================
              SOPORTE
          ========================== */}

          <div className="p-4">

            <div className="rounded-[22px] bg-gradient-to-br from-[#f7f3ff] to-[#f2f8ff] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                ?
              </div>

              <p className="mt-4 text-sm font-semibold text-[#272d42]">
                ¿Necesitas ayuda?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#858a99]">
                Estamos aquí para apoyarte.
              </p>

              <button
                type="button"
                className="mt-4 rounded-xl border border-[#d6ceff] bg-white px-4 py-2 text-xs font-semibold text-[#6848ef] transition hover:bg-[#faf9ff]"
              >
                Contactar soporte
              </button>

            </div>

          </div>

        </aside>

        {/* =========================
            CONTENIDO
        ========================== */}

        <section className="min-w-0 flex-1">

          {/* =========================
              TOPBAR
          ========================== */}

          <header className="flex min-h-[82px] items-center justify-between gap-6 border-b border-[#eeeef4] px-5 sm:px-8">

            {/* BUSCADOR */}
            <div className="relative w-full max-w-[520px]">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969aaa]">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar profesionales, habilidades o servicios..."
                className="w-full rounded-2xl border border-[#e0e1ea] bg-[#fbfbfd] py-3 pl-11 pr-4 text-sm text-[#30364a] outline-none transition placeholder:text-[#a0a4b0] focus:border-[#aa9aff] focus:bg-white focus:ring-4 focus:ring-[#6f4cf6]/10"
              />

            </div>

            <div className="flex shrink-0 items-center gap-2">

              {/* =========================
                  CAMPANA NOTIFICACIONES
              ========================== */}

              <Link
                href="/dashboard/cliente/notificaciones"
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e4e5ed] bg-white transition hover:border-[#d8d1ff] hover:bg-[#f8f7fc]"
                aria-label="Notificaciones"
              >

                <span className="text-[19px]">
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#ee5f66] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}

              </Link>

              {/* =========================
                  MENÚ DE CUENTA
              ========================== */}

              <AccountMenu
                displayName={displayName}
                subtitle="Cliente"
                initial={initial}
                role="cliente"
                unreadNotifications={
                  unreadCount
                }
              />

            </div>

          </header>

          {/* =========================
              DASHBOARD
          ========================== */}

          <div className="p-5 sm:p-8">

            {/* =========================
                HERO
            ========================== */}

            <section className="relative overflow-hidden rounded-[28px] border border-[#ebe8ff] bg-gradient-to-r from-[#f7f4ff] via-[#fbfaff] to-[#f4f1ff] p-7 sm:p-9">

              <div className="relative z-10 max-w-xl">

                <p className="text-3xl font-semibold tracking-tight text-[#171d34] sm:text-4xl">
                  Hola, {firstName} 👋
                </p>

                <p className="mt-2 text-xl font-semibold text-[#282f47]">
                  ¿Qué talento necesitas hoy?
                </p>

                <p className="mt-4 max-w-lg leading-7 text-[#73798a]">
                  Publica un proyecto y recibe
                  propuestas de profesionales
                  especializados de distintas áreas.
                </p>

                <Link
                  href="/dashboard/cliente/proyectos/nuevo"
                  className="mt-6 inline-flex rounded-2xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(111,76,246,0.24)] transition hover:-translate-y-0.5 hover:bg-[#6241e8]"
                >
                  Publicar proyecto →
                </Link>

              </div>

              {/* ILUSTRACIÓN */}
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 xl:block">

                <div className="relative flex h-40 w-52 items-center justify-center rounded-[38px] bg-[#ece7ff]">

                  <div className="text-7xl">
                    💼
                  </div>

                  <div className="absolute -bottom-2 -left-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-3xl shadow-lg">
                    👤
                  </div>

                  <div className="absolute -bottom-3 -right-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#7555f7] text-3xl text-white shadow-lg">
                    +
                  </div>

                </div>

              </div>

              <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#cfc4ff]/40 blur-3xl" />

            </section>

            {/* =========================
                ESTADÍSTICAS
            ========================== */}

            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

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

                      <p className="mt-1 text-xs text-[#858a99]">
                        {item.label}
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </section>

            {/* =========================
                PROYECTOS
            ========================== */}

            <section className="mt-8">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-xl font-semibold text-[#20273b]">
                  Proyectos recientes
                </h2>

                <Link
                  href="/dashboard/cliente/proyectos"
                  className="text-sm font-semibold text-[#6f4cf6] transition hover:text-[#5d3fe0]"
                >
                  Ver todos →
                </Link>

              </div>

              <div className="space-y-3">

                {projects.map((project) => (
                  <div
                    key={project.title}
                    className="rounded-[22px] border border-[#e9e9f1] bg-white p-5 transition hover:border-[#d5ceff] hover:shadow-[0_12px_30px_rgba(90,70,150,0.06)]"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-xl">
                        🖥️
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold text-[#252b40]">
                          {project.title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#7f8494]">

                          <span className="rounded-full bg-[#f5f4fa] px-3 py-1">
                            {project.category}
                          </span>

                          <span className="rounded-full bg-[#f5f4fa] px-3 py-1">
                            {project.modality}
                          </span>

                          <span className="px-1 py-1">
                            {project.published}
                          </span>

                        </div>

                      </div>

                      <div className="flex items-center justify-between gap-6 lg:justify-end">

                        <div className="text-center">

                          <p className="font-semibold text-[#252b40]">
                            {project.proposals}
                          </p>

                          <p className="text-xs text-[#9094a2]">
                            Propuestas
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            project.status ===
                            "Activo"
                              ? "bg-[#eaf8f1] text-[#3f9a6c]"
                              : "bg-[#f1f2f6] text-[#7c8190]"
                          }`}
                        >
                          {project.status}
                        </span>

                        <button
                          type="button"
                          className="text-xl text-[#999dab]"
                        >
                          ⋮
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </section>

            {/* =========================
                PARTE INFERIOR
            ========================== */}

            <section className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">

              {/* =========================
                  PROFESIONALES
              ========================== */}

              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">

                <div className="flex items-center justify-between">

                  <h2 className="font-semibold text-[#20273b]">
                    Profesionales recomendados
                  </h2>

                  <Link
                    href="/dashboard/cliente/profesionales"
                    className="text-xs font-semibold text-[#6f4cf6]"
                  >
                    Ver todos →
                  </Link>

                </div>

                <div className="mt-5 space-y-5">

                  {professionals.map(
                    (professional) => (
                      <div
                        key={professional.name}
                        className="flex items-center gap-4"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-xs font-semibold text-[#6f4cf6]">
                          {professional.initials}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-[#252b40]">
                            {professional.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#8b8f9d]">
                            {professional.role}
                          </p>

                        </div>

                        <p className="text-sm font-semibold text-[#444a5c]">
                          ⭐ {professional.rating}
                        </p>

                        <button
                          type="button"
                          className="rounded-xl border border-[#d8d1ff] px-3 py-2 text-xs font-semibold text-[#6f4cf6] transition hover:bg-[#f8f6ff]"
                        >
                          Ver perfil
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* =========================
                  ACTIVIDAD
              ========================== */}

              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">

                <div className="flex items-center justify-between">

                  <h2 className="font-semibold text-[#20273b]">
                    Actividad reciente
                  </h2>

                  {unreadCount > 0 && (
                    <Link
                      href="/dashboard/cliente/notificaciones"
                      className="text-xs font-semibold text-[#6f4cf6]"
                    >
                      {unreadCount}{" "}
                      {unreadCount === 1
                        ? "notificación nueva"
                        : "notificaciones nuevas"}
                    </Link>
                  )}

                </div>

                <div className="mt-5 space-y-5">

                  {activity.map((item) => (
                    <div
                      key={`${item.title}-${item.time}`}
                      className="flex gap-3"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eeff] text-lg">
                        {item.icon}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#292f43]">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-[#838898]">
                          {item.description}
                        </p>

                        <p className="mt-1 text-xs text-[#a0a3ae]">
                          {item.time}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>

              </div>

            </section>

          </div>

        </section>

      </div>
    </main>
  );
}