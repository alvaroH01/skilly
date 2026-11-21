import Image from "next/image";

import Link from "next/link";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";



/* =====================================================

   TIPOS

===================================================== */



type AdminDashboardStats = {

  total_users: number;

  organizations: number;

  professionals: number;



  total_projects: number;

  draft_projects: number;

  active_projects: number;

  paused_projects: number;

  selected_projects: number;

  pending_payment_projects: number;

  running_projects: number;

  closed_projects: number;

  projects_pending_validation: number;
  projects_waiting_meeting: number;
  projects_meeting_scheduled: number;
  projects_in_review: number;
  projects_changes_requested: number;
  projects_validated: number;


  total_proposals: number;

  pending_proposals: number;

  selected_proposals: number;

  pending_payment_proposals: number;

  confirmed_proposals: number;



  total_payment_orders: number;

  pending_payment_orders: number;

  paid_payment_orders: number;

  cancelled_payment_orders: number;

};



type RecentActivity = {

  activity_type: string;

  title: string;

  description: string;

  created_at: string;

};



/* =====================================================

   ICONOS

===================================================== */



function DashboardIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      className="h-5 w-5"

      aria-hidden="true"

    >

      <rect

        x="3"

        y="3"

        width="7"

        height="7"

        rx="2"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <rect

        x="14"

        y="3"

        width="7"

        height="7"

        rx="2"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <rect

        x="3"

        y="14"

        width="7"

        height="7"

        rx="2"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <rect

        x="14"

        y="14"

        width="7"

        height="7"

        rx="2"

        stroke="currentColor"

        strokeWidth="1.8"

      />

    </svg>

  );

}



function ProposalIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      className="h-5 w-5"

      aria-hidden="true"

    >

      <path

        d="M7 3.5H17C18.1 3.5 19 4.4 19 5.5V18.5C19 19.6 18.1 20.5 17 20.5H7C5.9 20.5 5 19.6 5 18.5V5.5C5 4.4 5.9 3.5 7 3.5Z"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <path

        d="M8.5 8H15.5M8.5 12H15.5M8.5 16H13"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

      />

    </svg>

  );

}



function PaymentIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      className="h-5 w-5"

      aria-hidden="true"

    >

      <rect

        x="3"

        y="5"

        width="18"

        height="14"

        rx="3"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <path

        d="M3 9H21"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <path

        d="M7 15H11"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

      />

    </svg>

  );

}



function ProjectIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      className="h-5 w-5"

      aria-hidden="true"

    >

      <path

        d="M4 7.5C4 6.4 4.9 5.5 6 5.5H10L12 7.5H18C19.1 7.5 20 8.4 20 9.5V17.5C20 18.6 19.1 19.5 18 19.5H6C4.9 19.5 4 18.6 4 17.5V7.5Z"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function UsersIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      className="h-5 w-5"

      aria-hidden="true"

    >

      <circle

        cx="9"

        cy="8"

        r="3"

        stroke="currentColor"

        strokeWidth="1.8"

      />



      <path

        d="M3.5 19C3.8 15.7 5.7 14 9 14C12.3 14 14.2 15.7 14.5 19"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

      />



      <path

        d="M15 5.5C17.3 5.5 19 7.1 19 9.2C19 11.2 17.5 12.7 15.5 12.9"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

      />



      <path

        d="M17 14.5C19.3 15.1 20.5 16.6 20.7 19"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

      />

    </svg>

  );

}



/* =====================================================

   HELPERS

===================================================== */



function formatMoney(value: number | null) {

  if (value === null || value === undefined) {

    return "Monto no definido";

  }



  return new Intl.NumberFormat("es-CL", {

    style: "currency",

    currency: "CLP",

    maximumFractionDigits: 0,

  }).format(value);

}



function getPercentage(value: number, total: number) {

  if (total <= 0) {

    return 0;

  }



  return Math.round((value / total) * 100);

}



/* =====================================================

   DASHBOARD ADMIN

===================================================== */



export default async function AdminDashboardPage() {

  const supabase = await createClient();



  /* ===================================================

     1. VALIDAR USUARIO

  =================================================== */



  const {

    data: { user },

    error: userError,

  } = await supabase.auth.getUser();



  if (userError || !user) {

    redirect("/login");

  }



  /* ===================================================

     2. VALIDAR ADMIN

  =================================================== */



  const {

    data: profile,

    error: profileError,

  } = await supabase

    .from("profiles")

    .select("full_name, role")

    .eq("id", user.id)

    .single();



  if (

    profileError ||

    !profile ||

    profile.role !== "admin"

  ) {

    redirect("/dashboard");

  }



  /* ===================================================

     3. ESTADÍSTICAS SEGURAS

  =================================================== */



  const {

    data: statsData,

    error: statsError,

  } = await supabase.rpc(

    "get_admin_dashboard_stats"

  );



  if (statsError) {

    console.error(

      "Error cargando estadísticas del dashboard:",

      statsError.message

    );

  }



  /* ===================================================

     4. ACTIVIDAD RECIENTE

  =================================================== */



  const {

    data: recentActivityData,

    error: recentActivityError,

  } = await supabase.rpc(

    "get_admin_recent_activity",

    {

      p_limit: 8,

    }

  );



  if (recentActivityError) {

    console.error(

      "Error cargando actividad reciente:",

      recentActivityError.message

    );

  }



  const recentActivity: RecentActivity[] =

    recentActivityData ?? [];



  /* ===================================================

     5. NORMALIZAR ESTADÍSTICAS

  =================================================== */



  const { count: servicesPendingReview } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .in("validation_status", ["pendiente", "en_revision"]);

  const stats: AdminDashboardStats = {

    total_users: Number(

      statsData?.total_users ?? 0

    ),



    organizations: Number(

      statsData?.organizations ?? 0

    ),



    professionals: Number(

      statsData?.professionals ?? 0

    ),



    total_projects: Number(

      statsData?.total_projects ?? 0

    ),



    draft_projects: Number(

      statsData?.draft_projects ?? 0

    ),



    active_projects: Number(

      statsData?.active_projects ?? 0

    ),



    paused_projects: Number(

      statsData?.paused_projects ?? 0

    ),



    selected_projects: Number(

      statsData?.selected_projects ?? 0

    ),



    pending_payment_projects: Number(

      statsData?.pending_payment_projects ?? 0

    ),



    running_projects: Number(

      statsData?.running_projects ?? 0

    ),



    closed_projects: Number(

      statsData?.closed_projects ?? 0

    ),

    projects_pending_validation: Number(
      statsData?.projects_pending_validation ?? 0
    ),

    projects_waiting_meeting: Number(
      statsData?.projects_waiting_meeting ?? 0
    ),

    projects_meeting_scheduled: Number(
      statsData?.projects_meeting_scheduled ?? 0
    ),

    projects_in_review: Number(
      statsData?.projects_in_review ?? 0
    ),

    projects_changes_requested: Number(
      statsData?.projects_changes_requested ?? 0
    ),

    projects_validated: Number(
      statsData?.projects_validated ?? 0
    ),



    total_proposals: Number(

      statsData?.total_proposals ?? 0

    ),



    pending_proposals: Number(

      statsData?.pending_proposals ?? 0

    ),



    selected_proposals: Number(

      statsData?.selected_proposals ?? 0

    ),



    pending_payment_proposals: Number(

      statsData?.pending_payment_proposals ?? 0

    ),



    confirmed_proposals: Number(

      statsData?.confirmed_proposals ?? 0

    ),



    total_payment_orders: Number(

      statsData?.total_payment_orders ?? 0

    ),



    pending_payment_orders: Number(

      statsData?.pending_payment_orders ?? 0

    ),



    paid_payment_orders: Number(

      statsData?.paid_payment_orders ?? 0

    ),



    cancelled_payment_orders: Number(

      statsData?.cancelled_payment_orders ?? 0

    ),

  };



  /* ===================================================

     6. PROPUESTAS SELECCIONADAS RECIENTES

  =================================================== */



  const {

    data: selectedProposalRows,

    error: proposalsError,

  } = await supabase

    .from("proposals")

    .select(`

      id,

      project_id,

      professional_id,

      proposed_amount,

      estimated_days,

      status,

      created_at,

      projects (

        id,

        title,

        client_id

      )

    `)

    .eq("status", "seleccionada")

    .order("created_at", {

      ascending: false,

    })

    .limit(5);



  if (proposalsError) {

    console.error(

      "Error cargando propuestas para admin:",

      proposalsError.message

    );

  }



  const proposals =

    selectedProposalRows ?? [];



  const adminName =

    profile.full_name?.trim() ||

    "Administrador Skilly";



  /* ===================================================

     7. DATOS PARA GRÁFICOS

  =================================================== */



  const projectStatusData = [

    {

      label: "Activos",

      value: stats.active_projects,

      color: "#6f4cf6",

    },

    {

      label: "Propuesta seleccionada",

      value: stats.selected_projects,

      color: "#8d79e9",

    },

    {

      label: "Pendiente de pago",

      value: stats.pending_payment_projects,

      color: "#e2a23b",

    },

    {

      label: "En ejecución",

      value: stats.running_projects,

      color: "#43a887",

    },

    {

      label: "Cerrados",

      value: stats.closed_projects,

      color: "#8298b8",

    },

  ];



  const maxProjectStatus =

    Math.max(

      ...projectStatusData.map(

        (item) => item.value

      ),

      1

    );



  const totalMainUsers =

    stats.organizations +

    stats.professionals;



  const professionalPercentage =

    getPercentage(

      stats.professionals,

      totalMainUsers

    );



  const organizationPercentage =

    getPercentage(

      stats.organizations,

      totalMainUsers

    );



  /* ===================================================

     UI

  =================================================== */



  return (

    <main className="min-h-screen bg-[#f6f7fb]">



      <div className="flex min-h-screen">



        {/* =================================================

            SIDEBAR

        ================================================= */}



        <aside className="hidden w-[250px] shrink-0 border-r border-[#ebe9f2] bg-white lg:flex lg:flex-col">



          {/* LOGO */}



          <div className="border-b border-[#efedf4] px-6 py-6">



            <Link

              href="/"

              className="inline-flex items-center"

            >

              <Image

                src="/logo-skilly-clean.png"

                alt="Skilly LATAM"

                width={155}

                height={58}

                priority

                className="h-auto w-[145px] object-contain"

              />

            </Link>



            <p className="mt-1 text-xs font-medium text-[#9a9daa]">

              Administración

            </p>



          </div>



          {/* NAVEGACIÓN */}



          <nav className="flex-1 space-y-2 px-4 py-6">



            <Link

              href="/dashboard/admin"

              className="flex items-center gap-3 rounded-2xl bg-[#f0ecff] px-4 py-3 text-sm font-semibold text-[#6848ef]"

            >

              <DashboardIcon />

              Dashboard

            </Link>



            <Link

              href="/dashboard/admin/propuestas"

              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"

            >

              <ProposalIcon />

              Propuestas

            </Link>



            <Link

              href="/dashboard/admin/pagos"

              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"

            >

              <PaymentIcon />

              Pagos

            </Link>

            <Link
              href="/dashboard/admin/validaciones"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"
            >
              <ProjectIcon />
              Validaciones
            </Link>

            <Link
              href="/dashboard/admin/servicios"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"
            >
              <ProjectIcon />
              Servicios
            </Link>

            <Link
              href="/dashboard/admin/incidencias"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"
            >
              <ProjectIcon />
              Incidencias
            </Link>

            <Link
              href="/dashboard/admin/evaluaciones"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f7482] transition hover:bg-[#f7f6fb] hover:text-[#6848ef]"
            >
              <ProposalIcon />
              Evaluaciones
            </Link>



          </nav>



          {/* ADMIN */}



          <div className="border-t border-[#efedf4] p-5">



            <div className="rounded-2xl bg-[#faf9fd] p-4">



              <div className="flex items-center gap-3">



                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee9ff] text-sm font-bold uppercase text-[#6848ef]">

                  {adminName.charAt(0)}

                </div>



                <div className="min-w-0">



                  <p className="truncate text-sm font-semibold text-[#34394b]">

                    {adminName}

                  </p>



                  <p className="mt-0.5 text-xs text-[#999daa]">

                    Administrador Skilly

                  </p>



                </div>



              </div>



              <AdminLogoutButton />



            </div>



          </div>



        </aside>



        {/* =================================================

            CONTENIDO

        ================================================= */}



        <div className="min-w-0 flex-1">



          {/* HEADER */}



          <header className="border-b border-[#ebe9f2] bg-white px-5 py-5 sm:px-8 lg:px-10">



            <div className="mx-auto flex max-w-[1400px] items-center justify-between">



              <div>



                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8d79e9]">

                  Panel Skilly

                </p>



                <h1 className="mt-1 text-xl font-semibold text-[#262b3d]">

                  Dashboard

                </h1>



              </div>



              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee9ff] text-sm font-bold uppercase text-[#6848ef]">

                {adminName.charAt(0)}

              </div>



            </div>



          </header>



          {/* =================================================

              BODY

          ================================================= */}



          <div className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">



            {/* BIENVENIDA */}



            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#6f4cf6] to-[#8b6cf7] px-7 py-8 text-white shadow-[0_20px_50px_rgba(111,76,246,0.18)] sm:px-9">



              <div className="relative z-10">



                <p className="text-sm font-medium text-white/75">

                  Administración de la plataforma

                </p>



                <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">

                  Hola, {adminName}

                </h2>



                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">

                  Supervisa la actividad de Skilly,

                  gestiona proyectos, propuestas y

                  órdenes de pago desde un solo lugar.

                </p>



              </div>



              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10" />



              <div className="absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/5" />



            </section>



            {/* =================================================

                MÉTRICAS PRINCIPALES

            ================================================= */}



            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



              {/* USUARIOS */}



              <article className="rounded-[24px] border border-[#e9e6f2] bg-white p-5 shadow-[0_10px_35px_rgba(60,50,100,0.05)]">



                <div className="flex items-center justify-between">



                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6848ef]">

                    <UsersIcon />

                  </div>



                  <span className="rounded-full bg-[#f5f2ff] px-3 py-1 text-xs font-semibold text-[#6848ef]">

                    Usuarios

                  </span>



                </div>



                <p className="mt-5 text-3xl font-semibold text-[#252a3b]">

                  {stats.total_users}

                </p>



                <p className="mt-1 text-sm text-[#858a98]">

                  Usuarios registrados

                </p>



              </article>



              {/* PROYECTOS */}



              <article className="rounded-[24px] border border-[#e9e6f2] bg-white p-5 shadow-[0_10px_35px_rgba(60,50,100,0.05)]">



                <div className="flex items-center justify-between">



                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf5ff] text-[#4a91d6]">

                    <ProjectIcon />

                  </div>



                  <span className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs font-semibold text-[#4a91d6]">

                    Proyectos

                  </span>



                </div>



                <p className="mt-5 text-3xl font-semibold text-[#252a3b]">

                  {stats.total_projects}

                </p>



                <p className="mt-1 text-sm text-[#858a98]">

                  Contrataciones registradas

                </p>



              </article>



              {/* PROPUESTAS */}



              <article className="rounded-[24px] border border-[#e9e6f2] bg-white p-5 shadow-[0_10px_35px_rgba(60,50,100,0.05)]">



                <div className="flex items-center justify-between">



                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3edff] text-[#8b5ce8]">

                    <ProposalIcon />

                  </div>



                  <span className="rounded-full bg-[#f7f2ff] px-3 py-1 text-xs font-semibold text-[#8b5ce8]">

                    Propuestas

                  </span>



                </div>



                <p className="mt-5 text-3xl font-semibold text-[#252a3b]">

                  {stats.total_proposals}

                </p>



                <p className="mt-1 text-sm text-[#858a98]">

                  Propuestas enviadas

                </p>



              </article>



              {/* PAGOS */}



              <article className="rounded-[24px] border border-[#e9e6f2] bg-white p-5 shadow-[0_10px_35px_rgba(60,50,100,0.05)]">



                <div className="flex items-center justify-between">



                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3df] text-[#d48a20]">

                    <PaymentIcon />

                  </div>



                  <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-semibold text-[#c98928]">

                    Pagos

                  </span>



                </div>



                <p className="mt-5 text-3xl font-semibold text-[#252a3b]">

                  {stats.total_payment_orders}

                </p>



                <p className="mt-1 text-sm text-[#858a98]">

                  Órdenes generadas

                </p>



              </article>



            </section>



            {/* =================================================

                GRÁFICOS

            ================================================= */}



            <section className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">



              {/* ESTADO DE PROYECTOS */}



              <article className="rounded-[28px] border border-[#e9e6f2] bg-white p-6 shadow-[0_10px_40px_rgba(60,50,100,0.05)] sm:p-7">



                <div>



                  <h2 className="text-lg font-semibold text-[#292e40]">

                    Estado de las contrataciones

                  </h2>



                  <p className="mt-1 text-sm text-[#8b8f9c]">

                    Distribución actual de las contrataciones

                    dentro del flujo de Skilly.

                  </p>



                </div>



                <div className="mt-7 space-y-5">



                  {projectStatusData.map((item) => {

                    const width =

                      item.value === 0

                        ? 0

                        : Math.max(

                            6,

                            (item.value /

                              maxProjectStatus) *

                              100

                          );



                    return (

                      <div key={item.label}>



                        <div className="mb-2 flex items-center justify-between gap-4">



                          <div className="flex items-center gap-2">



                            <span

                              className="h-2.5 w-2.5 rounded-full"

                              style={{

                                backgroundColor:

                                  item.color,

                              }}

                            />



                            <p className="text-sm font-medium text-[#555b6b]">

                              {item.label}

                            </p>



                          </div>



                          <p className="text-sm font-semibold text-[#34394b]">

                            {item.value}

                          </p>



                        </div>



                        <div className="h-3 overflow-hidden rounded-full bg-[#f0eef5]">



                          <div

                            className="h-full rounded-full transition-all"

                            style={{

                              width: `${width}%`,

                              backgroundColor:

                                item.color,

                            }}

                          />



                        </div>



                      </div>

                    );

                  })}



                </div>



                <div className="mt-7 flex items-center justify-between rounded-2xl bg-[#faf9fd] px-5 py-4">



                  <span className="text-sm text-[#858a98]">

                    Total de contrataciones

                  </span>



                  <span className="text-lg font-semibold text-[#34394b]">

                    {stats.total_projects}

                  </span>



                </div>



              </article>



              {/* USUARIOS */}



              <article className="rounded-[28px] border border-[#e9e6f2] bg-white p-6 shadow-[0_10px_40px_rgba(60,50,100,0.05)] sm:p-7">



                <h2 className="text-lg font-semibold text-[#292e40]">

                  Usuarios de Skilly

                </h2>



                <p className="mt-1 text-sm text-[#8b8f9c]">

                  Distribución entre organizaciones y

                  profesionales.

                </p>



                <div className="mt-8 flex justify-center">



                  <div

                    className="relative flex h-44 w-44 items-center justify-center rounded-full"

                    style={{

                      background:

                        totalMainUsers > 0

                          ? `conic-gradient(

                              #6f4cf6 0% ${professionalPercentage}%,

                              #d1c7ff ${professionalPercentage}% 100%

                            )`

                          : "#efedf5",

                    }}

                  >



                    <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white shadow-sm">



                      <span className="text-3xl font-semibold text-[#292e40]">

                        {totalMainUsers}

                      </span>



                      <span className="mt-1 text-xs text-[#9296a3]">

                        usuarios

                      </span>



                    </div>



                  </div>



                </div>



                <div className="mt-8 space-y-3">



                  <div className="flex items-center justify-between rounded-2xl bg-[#faf9fd] px-4 py-3">



                    <div className="flex items-center gap-3">



                      <span className="h-3 w-3 rounded-full bg-[#6f4cf6]" />



                      <span className="text-sm text-[#666b79]">

                        Profesionales

                      </span>



                    </div>



                    <div className="text-right">



                      <span className="text-sm font-semibold text-[#34394b]">

                        {stats.professionals}

                      </span>



                      <span className="ml-2 text-xs text-[#999daa]">

                        {professionalPercentage}%

                      </span>



                    </div>



                  </div>



                  <div className="flex items-center justify-between rounded-2xl bg-[#faf9fd] px-4 py-3">



                    <div className="flex items-center gap-3">



                      <span className="h-3 w-3 rounded-full bg-[#d1c7ff]" />



                      <span className="text-sm text-[#666b79]">

                        Organizaciones

                      </span>



                    </div>



                    <div className="text-right">



                      <span className="text-sm font-semibold text-[#34394b]">

                        {stats.organizations}

                      </span>



                      <span className="ml-2 text-xs text-[#999daa]">

                        {organizationPercentage}%

                      </span>



                    </div>



                  </div>



                </div>



              </article>



            </section>



            {/* =================================================

                REQUIEREN ATENCIÓN

            ================================================= */}



            <section className="mt-7">



              <div>



                <h2 className="text-lg font-semibold text-[#292e40]">

                  Requieren atención

                </h2>



                <p className="mt-1 text-sm text-[#8b8f9c]">

                  Procesos que necesitan gestión por parte

                  del equipo de Skilly.

                </p>



              </div>



              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">



                {/* PROPUESTAS */}



                <Link

                  href="/dashboard/admin/propuestas"

                  className="rounded-[22px] border border-[#e9e6f2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d8d0ff] hover:shadow-[0_12px_30px_rgba(70,55,130,0.07)]"

                >



                  <div className="flex items-center justify-between gap-3">



                    <div>



                      <p className="text-sm font-medium text-[#666b79]">

                        Propuestas seleccionadas

                      </p>



                      <p className="mt-1 text-xs text-[#999daa]">

                        Pendientes de gestión

                      </p>



                    </div>



                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6848ef]">

                      <ProposalIcon />

                    </div>



                  </div>



                  <div className="mt-5 flex items-end justify-between">



                    <p className="text-3xl font-semibold text-[#6848ef]">

                      {stats.selected_proposals}

                    </p>



                    <span className="text-xs font-semibold text-[#8d79e9]">

                      Revisar →

                    </span>



                  </div>



                </Link>



                {/* PAGOS */}



                <Link

                  href="/dashboard/admin/pagos"

                  className="rounded-[22px] border border-[#e9e6f2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#ead6ad] hover:shadow-[0_12px_30px_rgba(70,55,130,0.07)]"

                >



                  <div className="flex items-center justify-between gap-3">



                    <div>



                      <p className="text-sm font-medium text-[#666b79]">

                        Pagos pendientes

                      </p>



                      <p className="mt-1 text-xs text-[#999daa]">

                        Órdenes sin completar

                      </p>



                    </div>



                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff3df] text-[#d48a20]">

                      <PaymentIcon />

                    </div>



                  </div>



                  <div className="mt-5 flex items-end justify-between">



                    <p className="text-3xl font-semibold text-[#d48a20]">

                      {stats.pending_payment_orders}

                    </p>



                    <span className="text-xs font-semibold text-[#c98928]">

                      Revisar →

                    </span>



                  </div>



                </Link>

                {/* SERVICIOS POR REVISAR */}

                <Link
                  href="/dashboard/admin/servicios"
                  className="rounded-[22px] border border-[#e9e6f2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d8d0ff] hover:shadow-[0_12px_30px_rgba(70,55,130,0.07)]"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-sm font-medium text-[#666b79]">
                        Servicios por revisar
                      </p>

                      <p className="mt-1 text-xs text-[#999daa]">
                        Requieren revisión de Skilly
                      </p>

                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#5d68cf]">
                      <ProjectIcon />
                    </div>

                  </div>

                  <div className="mt-5 flex items-end justify-between">

                    <p className="text-3xl font-semibold text-[#5d68cf]">
                      {servicesPendingReview ?? 0}
                    </p>

                    <span className="text-xs font-semibold text-[#6c72cc]">
                      Revisar →
                    </span>

                  </div>

                </Link>

                {/* SERVICIOS */}



                <div className="rounded-[22px] border border-dashed border-[#dedbe9] bg-[#faf9fd] p-5">



                  <div className="flex items-center justify-between gap-3">



                    <div>



                      <p className="text-sm font-medium text-[#777b88]">

                        Servicios por revisar

                      </p>



                      <p className="mt-1 text-xs text-[#a4a6af]">

                        Pendientes de aprobación

                      </p>



                    </div>



                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef1f5] text-[#8e94a3]">

                      <ProjectIcon />

                    </div>



                  </div>



                  <div className="mt-5 flex items-end justify-between">



                    <p className="text-3xl font-semibold text-[#b0b2bc]">

                      —

                    </p>



                    <span className="rounded-full bg-[#efedf4] px-3 py-1 text-[11px] font-semibold text-[#999daa]">

                      Próximamente

                    </span>



                  </div>



                </div>



              </div>



            </section>



            {/* =================================================

                ACTIVIDAD RECIENTE

            ================================================= */}



            <section className="mt-7 rounded-[28px] border border-[#e9e6f2] bg-white p-6 shadow-[0_10px_40px_rgba(60,50,100,0.05)] sm:p-7">



              <div>



                <h2 className="text-lg font-semibold text-[#292e40]">

                  Actividad reciente

                </h2>



                <p className="mt-1 text-sm text-[#8b8f9c]">

                  Últimos movimientos registrados dentro de Skilly.

                </p>



              </div>



              <div className="mt-6">



                {recentActivity.length === 0 ? (



                  <div className="rounded-[22px] border border-dashed border-[#dedbe9] bg-[#faf9fd] px-5 py-10 text-center">



                    <p className="font-medium text-[#555b6d]">

                      Aún no hay actividad reciente.

                    </p>



                    <p className="mt-2 text-sm text-[#9498a5]">

                      Los nuevos usuarios, proyectos, propuestas

                      y órdenes de pago aparecerán aquí.

                    </p>



                  </div>



                ) : (



                  <div className="space-y-3">



                    {recentActivity.map(

                      (

                        activity,

                        index

                      ) => {



                        let iconBackground =

                          "#eeeaff";



                        let iconColor =

                          "#6848ef";



                        if (

                          activity.activity_type ===

                          "project_created"

                        ) {

                          iconBackground =

                            "#eaf5ff";



                          iconColor =

                            "#4a91d6";

                        }



                        if (

                          activity.activity_type ===

                          "proposal_created"

                        ) {

                          iconBackground =

                            "#f3edff";



                          iconColor =

                            "#8b5ce8";

                        }



                        if (

                          activity.activity_type ===

                          "payment_created"

                        ) {

                          iconBackground =

                            "#fff3df";



                          iconColor =

                            "#d48a20";

                        }



                        if (

                          activity.activity_type ===

                          "user_registered"

                        ) {

                          iconBackground =

                            "#eaf8f1";



                          iconColor =

                            "#36a87e";

                        }



                        const createdAt =

                          activity.created_at

                            ? new Date(

                                activity.created_at

                              )

                            : null;



                        const formattedDate =

                          createdAt

                            ? new Intl.DateTimeFormat(

                                "es-CL",

                                {

                                  day: "2-digit",

                                  month: "short",

                                  hour: "2-digit",

                                  minute: "2-digit",

                                }

                              ).format(

                                createdAt

                              )

                            : "";



                        return (

                          <article

                            key={`${activity.activity_type}-${activity.created_at}-${index}`}

                            className="flex flex-col gap-4 rounded-[22px] border border-[#ece9f3] px-5 py-4 transition hover:border-[#d9d1ff] sm:flex-row sm:items-center sm:justify-between"

                          >



                            <div className="flex min-w-0 items-center gap-4">



                              <div

                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"

                                style={{

                                  backgroundColor:

                                    iconBackground,

                                  color:

                                    iconColor,

                                }}

                              >



                                {activity.activity_type ===

                                "user_registered" ? (

                                  <UsersIcon />

                                ) : activity.activity_type ===

                                  "project_created" ? (

                                  <ProjectIcon />

                                ) : activity.activity_type ===

                                  "proposal_created" ? (

                                  <ProposalIcon />

                                ) : (

                                  <PaymentIcon />

                                )}



                              </div>



                              <div className="min-w-0">



                                <p className="font-semibold text-[#34394b]">

                                  {activity.title}

                                </p>



                                <p className="mt-1 truncate text-sm text-[#858a98]">

                                  {

                                    activity.description

                                  }

                                </p>



                              </div>



                            </div>



                            <div className="shrink-0">



                              <span className="text-xs font-medium text-[#a0a3ad]">

                                {

                                  formattedDate

                                }

                              </span>



                            </div>



                          </article>

                        );

                      }

                    )}



                  </div>



                )}



              </div>



            </section>



            {/* =================================================

                PROPUESTAS RECIENTES

            ================================================= */}



            <section className="mt-7 rounded-[28px] border border-[#e9e6f2] bg-white p-6 shadow-[0_10px_40px_rgba(60,50,100,0.05)] sm:p-7">



              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">



                <div>



                  <h2 className="text-lg font-semibold text-[#292e40]">

                    Propuestas recientes

                  </h2>



                  <p className="mt-1 text-sm text-[#8b8f9c]">

                    Propuestas seleccionadas por

                    organizaciones y pendientes de gestión.

                  </p>



                </div>



                <Link

                  href="/dashboard/admin/propuestas"

                  className="text-sm font-semibold text-[#6848ef] hover:text-[#5837d8]"

                >

                  Ver todas →

                </Link>



              </div>



              <div className="mt-6">



                {proposals.length === 0 ? (



                  <div className="rounded-[22px] border border-dashed border-[#dedbe9] bg-[#faf9fd] px-5 py-10 text-center">



                    <p className="font-medium text-[#555b6d]">

                      No hay propuestas pendientes de gestión.

                    </p>



                    <p className="mt-2 text-sm text-[#9498a5]">

                      Cuando una organización seleccione una propuesta,

                      aparecerá aquí.

                    </p>



                  </div>



                ) : (



                  <div className="space-y-3">



                    {proposals.map(

                      (proposal) => {



                        const project =

                          Array.isArray(

                            proposal.projects

                          )

                            ? proposal.projects[0]

                            : proposal.projects;



                        return (

                          <article

                            key={

                              proposal.id

                            }

                            className="flex flex-col gap-4 rounded-[22px] border border-[#ece9f3] p-5 transition hover:border-[#d9d1ff] sm:flex-row sm:items-center sm:justify-between"

                          >



                            <div className="min-w-0">



                              <div className="flex flex-wrap items-center gap-2">



                                <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-xs font-semibold text-[#6848ef]">

                                  Seleccionada

                                </span>



                                {proposal.estimated_days && (



                                  <span className="text-xs text-[#969aa7]">

                                    {

                                      proposal.estimated_days

                                    }{" "}

                                    días estimados

                                  </span>



                                )}



                              </div>



                              <h3 className="mt-3 truncate font-semibold text-[#303547]">

                                {

                                  project?.title ??

                                  "Proyecto"

                                }

                              </h3>



                              <p className="mt-1 text-sm text-[#858a98]">

                                Monto de propuesta:{" "}



                                <span className="font-semibold text-[#555b6b]">

                                  {formatMoney(

                                    proposal.proposed_amount

                                  )}

                                </span>



                              </p>



                            </div>



                            <Link

                              href={`/dashboard/admin/propuestas/${proposal.id}`}

                              className="shrink-0 rounded-2xl bg-[#6f4cf6] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#6040df]"

                            >

                              Revisar propuesta

                            </Link>



                          </article>

                        );

                      }

                    )}



                  </div>



                )}



              </div>



            </section>



          </div>



        </div>



      </div>



    </main>

  );

}