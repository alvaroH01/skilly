import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

/* ======================================================
   FUNCIONES
====================================================== */

function relativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  const hours = Math.floor(
    difference / 3600000
  );

  const days = Math.floor(
    difference / 86400000
  );

  if (minutes < 1) {
    return "Ahora";
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`;
  }

  if (hours < 24) {
    return `Hace ${hours} ${
      hours === 1 ? "hora" : "horas"
    }`;
  }

  if (days < 7) {
    return `Hace ${days} ${
      days === 1 ? "día" : "días"
    }`;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function notificationIcon(type: string) {
  switch (type) {
    case "proposal_accepted":
      return "✓";

    case "proposal_rejected":
      return "×";

    case "new_message":
      return "✉";

    case "new_proposal":
      return "📨";

    default:
      return "🔔";
  }
}

function notificationIconStyles(
  type: string
) {
  switch (type) {
    case "proposal_accepted":
      return "bg-[#e9f8f1] text-[#3f9a6c]";

    case "proposal_rejected":
      return "bg-[#fff0f0] text-[#bd5c5c]";

    case "new_message":
      return "bg-[#eef4ff] text-[#4f73c8]";

    default:
      return "bg-[#eeeaff] text-[#6848ef]";
  }
}

/* ======================================================
   PÁGINA
====================================================== */

export default async function ProfessionalNotificationsPage() {
  const supabase = await createClient();

  /* ====================================================
     USUARIO
  ==================================================== */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* ====================================================
     PERFIL / PROTECCIÓN
  ==================================================== */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "role, onboarding_completed"
    )
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
     NOTIFICACIONES
  ==================================================== */

  const {
    data: notifications,
    error: notificationsError,
  } = await supabase
    .from("notifications")
    .select(`
      id,
      type,
      title,
      message,
      link,
      read_at,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (notificationsError) {
    console.error(
      "Error cargando notificaciones:",
      notificationsError.message
    );
  }

  const allNotifications =
    notifications ?? [];

  const unreadCount =
    allNotifications.filter(
      (notification) =>
        !notification.read_at
    ).length;

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1150px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">

        {/* ==================================================
            HEADER
        =================================================== */}

        <header className="flex flex-col justify-between gap-5 border-b border-[#eeeef4] px-6 py-7 sm:flex-row sm:items-center sm:px-9">

          <div>

            <p className="text-sm font-semibold text-[#7458e8]">
              Tu cuenta
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">
              Notificaciones
            </h1>

            <p className="mt-2 text-sm text-[#7c8190]">
              Revisa novedades relacionadas con tus propuestas,
              proyectos y conversaciones.
            </p>

          </div>

          <div className="flex items-center gap-3">

            {unreadCount > 0 && (
              <div className="rounded-full bg-[#f0ecff] px-4 py-2 text-xs font-semibold text-[#6848ef]">
                {unreadCount}{" "}
                {unreadCount === 1
                  ? "sin leer"
                  : "sin leer"}
              </div>
            )}

            <Link
              href="/dashboard/profesional"
              className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
            >
              ← Dashboard
            </Link>

          </div>

        </header>

        {/* ==================================================
            CONTENIDO
        =================================================== */}

        <div className="p-6 sm:p-9">

          {/* ==================================================
              SIN NOTIFICACIONES
          =================================================== */}

          {allNotifications.length === 0 ? (
            <section className="flex min-h-[430px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#ddd9ea] bg-[#fbfbfd] px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-3xl">
                🔔
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#272d42]">
                Aún no tienes notificaciones
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#858a99]">
                Aquí aparecerán las novedades sobre tus
                servicios, contrataciones y otras actividades
                importantes dentro de Skilly.
              </p>

              <Link
                href="/dashboard/profesional/servicios"
                className="mt-6 rounded-2xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(111,76,246,0.18)] transition hover:bg-[#6241e8]"
              >
                Gestionar mis servicios →
              </Link>

            </section>
          ) : (

            /* ==================================================
                LISTA DE NOTIFICACIONES
            =================================================== */

            <section className="space-y-3">

              {allNotifications.map(
                (notification) => {

                  const notificationHref =
                    notification.link ||
                    "/dashboard/profesional";

                  return (
                    <Link
                      key={notification.id}
                      href={notificationHref}
                      className={`group flex gap-4 rounded-[22px] border p-5 transition ${
                        notification.read_at
                          ? "border-[#ececf1] bg-white hover:border-[#ddd8f6] hover:bg-[#fbfaff]"
                          : "border-[#dcd5ff] bg-[#faf9ff] hover:border-[#cfc5ff]"
                      }`}
                    >

                      {/* ICONO */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${notificationIconStyles(
                          notification.type
                        )}`}
                      >
                        {notificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* INFORMACIÓN */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="font-semibold text-[#292f43]">
                              {notification.title}
                            </p>

                            {notification.message && (
                              <p className="mt-1.5 text-sm leading-6 text-[#747988]">
                                {notification.message}
                              </p>
                            )}

                          </div>

                          {!notification.read_at && (
                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#6f4cf6]" />
                          )}

                        </div>

                        <div className="mt-3 flex items-center gap-3">

                          <p className="text-xs text-[#9a9eaa]">
                            {relativeTime(
                              notification.created_at
                            )}
                          </p>

                          {!notification.read_at && (
                            <>
                              <span className="text-[#d2d3da]">
                                •
                              </span>

                              <span className="text-xs font-semibold text-[#6f4cf6]">
                                Nueva
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                      {/* FLECHA */}
                      <span className="self-center text-xl text-[#aaaeb9] transition group-hover:translate-x-1 group-hover:text-[#6f4cf6]">
                        ›
                      </span>

                    </Link>
                  );
                }
              )}

            </section>
          )}

        </div>

      </div>

    </main>
  );
}