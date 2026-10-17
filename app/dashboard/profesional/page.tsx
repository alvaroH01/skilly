import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AccountMenu from "@/components/dashboard/AccountMenu";
import ScheduleInterviewModal from "@/components/professional/ScheduleInterviewModal";

/* ======================================================
   TIPOS
====================================================== */

type ProfessionalDashboardPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

/* ======================================================
   FUNCIONES
====================================================== */

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

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Hace unos segundos";
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`;
  }

  if (hours < 24) {
    return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  if (days < 7) {
    return `Hace ${days} ${days === 1 ? "día" : "días"}`;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function proposalStatusLabel(status: string) {
  switch (status) {
    case "aceptada":
      return "Tu propuesta fue aceptada";
    case "rechazada":
      return "Tu propuesta fue rechazada";
    case "retirada":
      return "Retiraste una propuesta";
    default:
      return "Enviaste una propuesta";
  }
}

/* ======================================================
   ICONOS
====================================================== */

type IconProps = {
  className?: string;
};

function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 16L20.5 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 20V14H15V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 20C5.8 15.9 8 14 12 14C16 14 18.2 15.9 18.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FolderIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.5 7.5C3.5 6.7 4.2 6 5 6H9L11 8H19C19.8 8 20.5 8.7 20.5 9.5V18C20.5 18.8 19.8 19.5 19 19.5H5C4.2 19.5 3.5 18.8 3.5 18V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 4L10.5 13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 4L14 20L10.5 13.5L4 10L20 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.5 10C6.5 6.9 8.8 4.5 12 4.5C15.2 4.5 17.5 6.9 17.5 10V14.5L19 17H5L6.5 14.5V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19C10.5 19.7 11.1 20 12 20C12.9 20 13.5 19.7 14 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 20S4.5 15.6 4.5 9.6C4.5 7.2 6.3 5.5 8.6 5.5C10 5.5 11.2 6.2 12 7.3C12.8 6.2 14 5.5 15.4 5.5C17.7 5.5 19.5 7.2 19.5 9.6C19.5 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5V5.3M12 18.7V20.5M20.5 12H18.7M5.3 12H3.5M18 6L16.7 7.3M7.3 16.7L6 18M18 18L16.7 16.7M7.3 7.3L6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.5 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 7V5.5C8 4.7 8.7 4 9.5 4H14.5C15.3 4 16 4.7 16 5.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/* ======================================================
   DASHBOARD PROFESIONAL
====================================================== */

export default async function ProfessionalDashboardPage({
  searchParams,
}: ProfessionalDashboardPageProps) {
  const params = await searchParams;

  const searchTerm = params.q?.trim() ?? "";
  const safeSearch = searchTerm.replace(/[,%()]/g, " ").trim();

  const supabase = await createClient();

  /* ====================================================
     USUARIO AUTENTICADO
  ==================================================== */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* ====================================================
     PERFIL GENERAL
  ==================================================== */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      role,
      onboarding_completed
    `)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/onboarding");
  }

  if (
    profile.role !== "profesional" ||
    !profile.onboarding_completed
  ) {
    redirect("/dashboard");
  }

  /* ====================================================
     PERFIL PROFESIONAL
  ==================================================== */

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select(`
      phone,
      region,
      commune,
      professional_title,
      bio,
      areas,
      skills,
      service_types,
      work_mode,
      availability,
      linkedin_url,
      portfolio_url,
      github_url
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  /* ====================================================
     DATOS DEL USUARIO
  ==================================================== */

  const displayName =
    profile.full_name?.trim() ||
    "Profesional Skilly";

  const firstName =
    displayName.split(/\s+/)[0] ||
    "Profesional";

  const initial =
    displayName.charAt(0).toUpperCase() ||
    "P";

  const professionalTitle =
    professionalProfile?.professional_title?.trim() ||
    "Profesional";

  /* ====================================================
     COMPLETITUD DEL PERFIL
  ==================================================== */

  const profileChecks = [
    Boolean(profile.full_name?.trim()),
    Boolean(professionalProfile?.professional_title?.trim()),
    Boolean(professionalProfile?.bio?.trim()),
    Boolean(professionalProfile?.phone?.trim()),
    Boolean(professionalProfile?.region?.trim()),
    Boolean(professionalProfile?.commune?.trim()),
    Array.isArray(professionalProfile?.areas) &&
      professionalProfile.areas.length > 0,
    Array.isArray(professionalProfile?.skills) &&
      professionalProfile.skills.length > 0,
    Boolean(professionalProfile?.work_mode),
    Boolean(
      professionalProfile?.linkedin_url?.trim() ||
        professionalProfile?.portfolio_url?.trim() ||
        professionalProfile?.github_url?.trim()
    ),
  ];

  const completedChecks =
    profileChecks.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedChecks / profileChecks.length) * 100
  );

  let profileSuggestion =
    "Tu perfil está bien encaminado.";

  if (!professionalProfile?.professional_title?.trim()) {
    profileSuggestion =
      "Agrega tu título profesional.";
  } else if (!professionalProfile?.bio?.trim()) {
    profileSuggestion =
      "Agrega una descripción profesional.";
  } else if (
    !Array.isArray(professionalProfile?.skills) ||
    professionalProfile.skills.length === 0
  ) {
    profileSuggestion =
      "Agrega tus principales habilidades.";
  } else if (
    !professionalProfile?.linkedin_url?.trim() &&
    !professionalProfile?.portfolio_url?.trim() &&
    !professionalProfile?.github_url?.trim()
  ) {
    profileSuggestion =
      "Agrega un enlace profesional o portafolio.";
  } else if (profileCompletion === 100) {
    profileSuggestion =
      "Tu perfil está completo.";
  }

  /* ====================================================
     NOTIFICACIONES NO LEÍDAS
  ==================================================== */

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

  /* ====================================================
     PROPUESTAS DEL PROFESIONAL
  ==================================================== */

  const {
    data: proposals,
    error: proposalsError,
  } = await supabase
    .from("proposals")
    .select(`
      id,
      status,
      created_at,
      proposed_amount,
      estimated_days,
      project:projects (
        id,
        title
      )
    `)
    .eq("professional_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (proposalsError) {
    console.error(
      "Error cargando propuestas:",
      proposalsError.message
    );
  }

  const allProposals =
    proposals ?? [];

  const pendingProposals =
    allProposals.filter(
      (proposal) =>
        proposal.status === "pendiente"
    ).length;

  const acceptedProposals =
    allProposals.filter(
      (proposal) =>
        proposal.status === "aceptada"
    ).length;

  /* ====================================================
     PROYECTOS DISPONIBLES
  ==================================================== */

  let projectsQuery = supabase
    .from("projects")
    .select(`
      id,
      title,
      description,
      category,
      modality,
      budget_min,
      budget_max,
      skills,
      created_at
    `)
    .eq("status", "activo");

  if (safeSearch) {
    projectsQuery = projectsQuery.or(
      `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,category.ilike.%${safeSearch}%`
    );
  }

  const {
    data: availableProjects,
    error: projectsError,
  } = await projectsQuery.order(
    "created_at",
    {
      ascending: false,
    }
  );

  if (projectsError) {
    console.error(
      "Error cargando proyectos:",
      projectsError.message
    );
  }

  const projects =
    availableProjects ?? [];

  /* ====================================================
     DATOS PARA LA VISTA
  ==================================================== */

  const stats = [
    {
      value: String(allProposals.length),
      label: "Propuestas enviadas",
      href: "/dashboard/profesional/propuestas",
      tone: "purple",
      icon: <SendIcon className="h-6 w-6" />,
    },
    {
      value: String(pendingProposals),
      label: "Pendientes",
      href: "/dashboard/profesional/propuestas",
      tone: "orange",
      icon: <ClockIcon className="h-6 w-6" />,
    },
    {
      value: String(acceptedProposals),
      label: "Aceptadas",
      href: "/dashboard/profesional/propuestas",
      tone: "green",
      icon: <CheckIcon className="h-6 w-6" />,
    },
    {
      value: String(projects.length),
      label: "Proyectos disponibles",
      href: "/dashboard/profesional/proyectos",
      tone: "purple",
      icon: <BriefcaseIcon className="h-6 w-6" />,
    },
  ];

  const recommendedProjects =
    projects.slice(0, 3);

  const recentProposals =
    allProposals.slice(0, 4);

  /* ====================================================
     INTERFAZ
  ==================================================== */

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1660px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">

        {/* ==================================================
            SIDEBAR
        =================================================== */}

        <aside className="hidden w-[240px] shrink-0 border-r border-[#eeeef4] bg-white lg:flex lg:flex-col">

          {/* LOGO */}
          <div className="flex min-h-[92px] items-center px-6">
            <Link
              href="/dashboard/profesional"
              className="inline-flex"
            >
              <Image
                src="/logo-skilly-clean.png"
                alt="Skilly LATAM"
                width={190}
                height={82}
                priority
                className="h-auto w-[155px] object-contain"
              />
            </Link>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="flex-1 px-4 pt-2">
            <div className="space-y-1.5">

              <Link
                href="/dashboard/profesional"
                className="flex items-center gap-3 rounded-2xl bg-[#f0ecff] px-4 py-3 text-sm font-semibold text-[#6848ef]"
              >
                <HomeIcon />
                Inicio
              </Link>

              <Link
                href="/dashboard/profesional/perfil"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <UserIcon />
                Mi perfil
              </Link>

              <Link
                href="/dashboard/profesional/servicios"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <GridIcon />
                Mis servicios
              </Link>

              <Link
                href="/dashboard/profesional/proyectos"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <FolderIcon />
                Proyectos
              </Link>

              <Link
                href="/dashboard/profesional/propuestas"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <div className="flex items-center gap-3">
                  <SendIcon />
                  Propuestas
                </div>

                {pendingProposals > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6f4cf6] px-1.5 text-xs font-semibold text-white">
                    {pendingProposals}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/profesional/notificaciones"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <div className="flex items-center gap-3">
                  <BellIcon />
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

              <Link
                href="/dashboard/profesional/favoritos"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <HeartIcon />
                Mis favoritos
              </Link>

              <Link
                href="/dashboard/profesional/configuracion"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#5e6476] transition hover:bg-[#f8f8fc] hover:text-[#6848ef]"
              >
                <SettingsIcon />
                Configuración
              </Link>

            </div>
          </nav>

          {/* TARJETA LATERAL */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f7f3ff] via-[#faf8ff] to-[#f1efff] p-5">
              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#6f4cf6] shadow-sm">
                  <BriefcaseIcon />
                </div>

                <p className="mt-4 text-sm font-semibold leading-5 text-[#252b40]">
                  Tu talento mueve el mundo
                </p>

                <p className="mt-2 text-xs leading-5 text-[#858a99]">
                  Más proyectos.
                  <br />
                  Más oportunidades.
                </p>
              </div>

              <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full border border-[#d9d0ff]" />
            </div>
          </div>

        </aside>

        {/* ==================================================
            CONTENIDO
        =================================================== */}

        <section className="min-w-0 flex-1">

          {/* ==================================================
              TOPBAR
          =================================================== */}

          <header className="flex min-h-[78px] items-center justify-between gap-5 border-b border-[#eeeef4] px-5 sm:px-7">

            {/* BUSCADOR */}
            <form
              action="/dashboard/profesional"
              method="GET"
              className="relative w-full max-w-[600px]"
            >
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8f94a4]">
                <SearchIcon className="h-[18px] w-[18px]" />
              </span>

              <input
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="Buscar proyectos o habilidades..."
                className="w-full rounded-2xl border border-[#e0e1ea] bg-[#fbfbfd] py-3 pl-11 pr-4 text-sm text-[#30364a] outline-none transition placeholder:text-[#a0a4b0] focus:border-[#aa9aff] focus:bg-white focus:ring-4 focus:ring-[#6f4cf6]/10"
              />
            </form>

            <div className="flex shrink-0 items-center gap-2">

              <Link
                href="/dashboard/profesional/notificaciones"
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e4e5ed] bg-white text-[#30364a] transition hover:border-[#d8d1ff] hover:bg-[#f8f7fc] hover:text-[#6848ef]"
                aria-label="Notificaciones"
              >
                <BellIcon className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#ee5f66] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </Link>

              <AccountMenu
                displayName={displayName}
                subtitle={professionalTitle}
                initial={initial}
                role="profesional"
                unreadNotifications={unreadCount}
              />

            </div>

          </header>

          {/* ==================================================
              CUERPO
          =================================================== */}

          <div className="p-5 sm:p-7">

            {/* ==================================================
                HERO COMPACTO
            =================================================== */}

            <section className="relative min-h-[220px] overflow-hidden rounded-[28px] border border-[#ebe8ff] bg-gradient-to-r from-[#f7f4ff] via-[#fbfaff] to-[#fff8ee] px-7 py-7 sm:px-9">

              <div className="relative z-20 max-w-[650px]">

                <p className="text-3xl font-semibold tracking-[-0.03em] text-[#171d34] sm:text-[38px]">
                  Hola, {firstName} 👋
                </p>

                <p className="mt-1.5 text-lg font-semibold text-[#282f47]">
                  Tu talento abre nuevas oportunidades.
                </p>

                <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#73798a]">
                  Explora proyectos que se ajustan a tu experiencia y conecta con
                  organizaciones que necesitan tus habilidades.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/profesional/proyectos"
                    className="inline-flex items-center rounded-2xl bg-[#6f4cf6] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(111,76,246,0.24)] transition hover:-translate-y-0.5 hover:bg-[#6241e8]"
                  >
                    Explorar proyectos →
                  </Link>

                  <ScheduleInterviewModal professionalName={displayName} />
                </div>

              </div>

              {/* ILUSTRACIÓN */}
              <div className="absolute bottom-0 right-7 top-0 hidden w-[410px] items-center justify-center xl:flex">

                <div className="absolute h-44 w-72 rounded-full bg-[#ded7ff]/50 blur-2xl" />

                <div className="relative flex h-[165px] w-[190px] items-center justify-center rounded-[36px] bg-[#e9e4ff] shadow-[0_20px_50px_rgba(112,82,210,0.10)]">
                  <span className="text-[72px]">
                    👨🏻‍💻
                  </span>

                  <div className="absolute -left-5 top-2 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#7657f5] text-xl font-semibold text-white shadow-lg">
                    {"</>"}
                  </div>
                </div>

                <div className="absolute right-0 top-[42px] space-y-2">
                  {[
                    "Desarrollar",
                    "Construir",
                    "Crear impacto",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white bg-white/90 px-3 py-2 text-xs font-medium text-[#4e5362] shadow-[0_8px_24px_rgba(80,70,130,0.08)] backdrop-blur"
                    >
                      {item}
                    </div>
                  ))}
                </div>

              </div>

              <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#cfc4ff]/35 blur-3xl" />

            </section>

            {/* ==================================================
                ESTADÍSTICAS
            =================================================== */}

            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              {stats.map((item) => {
                const toneClasses =
                  item.tone === "orange"
                    ? "bg-[#fff2df] text-[#e18a2a]"
                    : item.tone === "green"
                    ? "bg-[#e8f8ef] text-[#239368]"
                    : "bg-[#f1eeff] text-[#6848ef]";

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-[22px] border border-[#e9e9f1] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#d8d1ff] hover:shadow-[0_12px_30px_rgba(90,70,150,0.06)]"
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses}`}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[22px] font-semibold leading-none text-[#1d2439]">
                          {item.value}
                        </p>

                        <p className="mt-2 truncate text-xs text-[#858a99]">
                          {item.label}
                        </p>
                      </div>

                      <span className="text-lg text-[#a5a9b5] transition group-hover:translate-x-0.5 group-hover:text-[#6f4cf6]">
                        ›
                      </span>

                    </div>
                  </Link>
                );
              })}

            </section>

            {/* ==================================================
                OPORTUNIDADES
            =================================================== */}

            <section className="mt-5 rounded-[24px] border border-[#e9e9f1] bg-white p-5">

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-semibold text-[#20273b]">
                    {searchTerm
                      ? `Resultados para “${searchTerm}”`
                      : "Oportunidades para ti"}
                  </h2>

                  <p className="mt-1 text-xs text-[#9195a3]">
                    {searchTerm
                      ? "Proyectos activos que coinciden con tu búsqueda."
                      : "Últimos proyectos publicados que podrían interesarte."}
                  </p>
                </div>

                <Link
                  href="/dashboard/profesional/proyectos"
                  className="text-sm font-semibold text-[#6f4cf6] transition hover:text-[#5d3fe0]"
                >
                  Ver todos los proyectos →
                </Link>

              </div>

              {recommendedProjects.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[#dcd9e8] bg-[#fbfbfd] px-6 py-12 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6f4cf6]">
                    <BriefcaseIcon className="h-6 w-6" />
                  </div>

                  <p className="mt-4 font-semibold text-[#292f43]">
                    {searchTerm
                      ? "No encontramos proyectos con esa búsqueda"
                      : "No hay proyectos disponibles"}
                  </p>

                  <p className="mt-2 text-sm text-[#858a99]">
                    {searchTerm
                      ? "Prueba con otra palabra o habilidad."
                      : "Cuando un cliente publique una nueva oportunidad aparecerá aquí."}
                  </p>

                  {searchTerm && (
                    <Link
                      href="/dashboard/profesional"
                      className="mt-4 inline-flex text-sm font-semibold text-[#6f4cf6]"
                    >
                      Limpiar búsqueda
                    </Link>
                  )}

                </div>
              ) : (
                <div className="divide-y divide-[#eeeeF4]">

                  {recommendedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex flex-col gap-4 py-4 first:pt-1 last:pb-1 lg:flex-row lg:items-center"
                    >

                      <div className="flex min-w-0 flex-1 items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-[#6f4cf6]">
                          <BriefcaseIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold text-[#252b40]">
                            {project.title}
                          </p>

                          {project.description && (
                            <p className="mt-1 line-clamp-1 max-w-[520px] text-xs text-[#8b8f9d]">
                              {project.description}
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:w-[360px]">

                        <span className="rounded-full bg-[#f2eeff] px-3 py-1.5 text-xs font-medium text-[#6f4cf6]">
                          {project.category}
                        </span>

                        <span className="rounded-full bg-[#f5f5f8] px-3 py-1.5 text-xs capitalize text-[#777c8b]">
                          {project.modality}
                        </span>

                        {(project.budget_min ||
                          project.budget_max) && (
                          <span className="rounded-full bg-[#eaf8f0] px-3 py-1.5 text-xs font-medium text-[#288762]">

                            {project.budget_min &&
                              formatMoney(
                                project.budget_min
                              )}

                            {project.budget_min &&
                              project.budget_max &&
                              " - "}

                            {project.budget_max &&
                              formatMoney(
                                project.budget_max
                              )}

                          </span>
                        )}

                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-4 lg:w-[230px] lg:justify-end">

                        <p className="text-xs text-[#969aaa]">
                          {formatRelativeDate(
                            project.created_at
                          )}
                        </p>

                        <Link
                          href={`/dashboard/profesional/proyectos/${project.id}`}
                          className="rounded-xl border border-[#d8d1ff] px-4 py-2.5 text-xs font-semibold text-[#6f4cf6] transition hover:bg-[#f8f6ff]"
                        >
                          Ver proyecto
                        </Link>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* ==================================================
                PARTE INFERIOR
            =================================================== */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">

              {/* ACTIVIDAD RECIENTE */}
              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="font-semibold text-[#20273b]">
                      Actividad reciente
                    </h2>

                    <p className="mt-1 text-xs text-[#9195a3]">
                      Tus movimientos más recientes en Skilly.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/profesional/propuestas"
                    className="text-xs font-semibold text-[#6f4cf6]"
                  >
                    Ver propuestas →
                  </Link>

                </div>

                {recentProposals.length === 0 ? (
                  <div className="flex min-h-[190px] flex-col items-center justify-center text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1eeff] text-[#6f4cf6]">
                      <SendIcon className="h-5 w-5" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#292f43]">
                      Sin actividad todavía
                    </p>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-[#8b8f9d]">
                      Cuando envíes propuestas, aparecerán aquí.
                    </p>

                  </div>
                ) : (
                  <div className="mt-5 divide-y divide-[#eeeeF4]">

                    {recentProposals.map((proposal) => {
                      const project =
                        Array.isArray(proposal.project)
                          ? proposal.project[0]
                          : proposal.project;

                      const accepted =
                        proposal.status === "aceptada";

                      const rejected =
                        proposal.status === "rechazada";

                      return (
                        <div
                          key={proposal.id}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              accepted
                                ? "bg-[#e8f8ef] text-[#239368]"
                                : rejected
                                ? "bg-[#fff0ed] text-[#d66855]"
                                : "bg-[#f1eeff] text-[#6f4cf6]"
                            }`}
                          >
                            {accepted ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : rejected ? (
                              <span className="text-lg leading-none">
                                ×
                              </span>
                            ) : (
                              <SendIcon className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm text-[#5e6473]">
                              {proposalStatusLabel(
                                proposal.status
                              )}{" "}
                              <span className="font-semibold text-[#292f43]">
                                {project?.title
                                  ? `en ${project.title}`
                                  : ""}
                              </span>
                            </p>

                          </div>

                          <p className="shrink-0 text-xs text-[#a0a3ae]">
                            {formatRelativeDate(
                              proposal.created_at
                            )}
                          </p>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

              {/* PERFIL */}
              <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 sm:p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="font-semibold text-[#20273b]">
                      Tu perfil
                    </h2>

                    <p className="mt-1 text-xs text-[#9195a3]">
                      Completa tu perfil para destacar mejor.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/profesional/perfil"
                    className="text-xs font-semibold text-[#6f4cf6]"
                  >
                    Editar →
                  </Link>

                </div>

                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">

                  <div
                    className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#6f4cf6 ${profileCompletion}%, #eeeaff 0)`,
                    }}
                  >
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white">
                      <span className="text-lg font-semibold text-[#252b40]">
                        {profileCompletion}%
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold text-[#2b3146]">
                      Perfil completado
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#858a99]">
                      Un perfil más completo ayuda a presentar mejor tu experiencia.
                    </p>

                    <Link
                      href="/dashboard/profesional/perfil"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#6f4cf6] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#6241e8]"
                    >
                      Completar perfil →
                    </Link>

                  </div>

                </div>

                <div className="mt-5 rounded-2xl bg-[#faf9ff] p-4">

                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a9eaa]">
                    Siguiente paso
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#3a4053]">
                    {profileSuggestion}
                  </p>

                </div>

              </div>

            </section>

          </div>

        </section>

      </div>
    </main>
  );
}
