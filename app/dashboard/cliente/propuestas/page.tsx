import Link from "next/link";
import PayNowButton from "@/components/client/PayNowButton";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

/* ======================================================
   FORMATEAR DINERO
====================================================== */

function money(value: number | null) {
  if (!value) return "A convenir";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ======================================================
   ESTILO DE ESTADO
====================================================== */

function statusStyle(status: string) {
  switch (status) {
    case "confirmada":
      return "bg-[#e8f7ef] text-[#27855f]";
    case "pendiente_pago":
      return "bg-[#efe9ff] text-[#6543dc]";
    case "rechazada":
      return "bg-[#fff0ed] text-[#c96351]";
    case "retirada":
      return "bg-[#f1f1f4] text-[#747986]";
    default:
      return "bg-[#fff5dd] text-[#a9762d]";
  }
}

/* ======================================================
   TEXTO DE ESTADO
====================================================== */
function statusLabel(status: string) {
  switch (status) {
    case "seleccionada":
      return "Esperando orden de pago";
    case "pendiente_pago":
      return "Pago pendiente";
    case "confirmada":
      return "Pagado · en ejecución";
    case "rechazada":
      return "Rechazada";
    case "retirada":
      return "Retirada";
    default:
      return "En proceso";
  }
}

/* ======================================================
   PAGE
====================================================== */

export default async function PropuestasClientePage() {
  const supabase = await createClient();

  /* ====================================================
     USUARIO
  ==================================================== */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ====================================================
     PROYECTOS DEL CLIENTE
  ==================================================== */

  const {
    data: projects,
    error: projectsError,
  } = await supabase
    .from("projects")
    .select("id")
    .eq("client_id", user.id);

  if (projectsError) {
    console.error(
      "Error cargando proyectos:",
      projectsError
    );
  }

  const projectIds =
    projects?.map(
      (project) => project.id
    ) ?? [];

  /* ====================================================
     PROPUESTAS
  ==================================================== */

  let proposals: any[] = [];

  if (projectIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("proposals")
      .select(`
        id,
        project_id,
        professional_id,
        message,
        proposed_amount,
        estimated_days,
        status,
        created_at,

        project:projects (
          id,
          title,
          status
        ),

        professional:profiles!proposals_professional_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .in(
        "project_id",
        projectIds
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(
        "Error cargando propuestas:",
        error
      );
    }

    proposals =
      data ?? [];
  }

  /* ====================================================
     ÓRDENES DE PAGO (para el botón "Pagar ahora")
  ==================================================== */

  const orderByProposal = new Map<
    string,
    { id: string; status: string; amount: number }
  >();

  if (proposals.length > 0) {
    const { data: orders } = await supabase
      .from("payment_orders")
      .select("id, proposal_id, status, amount")
      .in(
        "proposal_id",
        proposals.map((proposal) => proposal.id)
      );

    (orders ?? []).forEach((order) =>
      orderByProposal.set(order.proposal_id, order)
    );
  }

  /* ======================================================
     INTERFAZ
  ====================================================== */

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1350px] rounded-[30px] border border-[#e9e9f1] bg-white p-6 shadow-[0_30px_90px_rgba(80,70,130,0.08)] sm:p-9">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-semibold text-[#7458e8]">
              Contrataciones
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#20263a]">
              Estado de mis contrataciones
            </h1>

            <p className="mt-2 text-sm text-[#7c8190]">
              Revisa los servicios que contrataste y el estado
              de su pago.
            </p>

          </div>

          <Link
            href="/dashboard/cliente"
            className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
          >
            ← Dashboard
          </Link>

        </header>

        {/* ==================================================
            SIN PROPUESTAS
        ================================================== */}

        {proposals.length === 0 ? (
          <section className="mt-10 flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#ddd9ea] bg-[#fbfbfd] text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-3xl">
              ▤
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#272d42]">
              Aún no tienes contrataciones
            </h2>

            <p className="mt-2 max-w-md px-5 text-sm leading-6 text-[#858a99]">
              Cuando contrates un servicio del catálogo,
              aparecerá aquí con el estado de su pago.
            </p>

            <Link
              href="/buscar"
              className="mt-6 rounded-xl border border-[#d8d1ff] px-5 py-3 text-sm font-semibold text-[#6848ef] transition hover:bg-[#f7f5ff]"
            >
              Explorar servicios
            </Link>

          </section>
        ) : (

          /* ==================================================
              LISTADO
          ================================================== */

          <section className="mt-9 space-y-4">

            {proposals.map(
              (proposal) => {

                const name =
                  proposal.professional
                    ?.full_name ||
                  "Profesional Skilly";

                const initial =
                  name
                    .charAt(0)
                    .toUpperCase();

                const isAccepted = [
                  "seleccionada",
                  "pendiente_pago",
                  "confirmada",
                ].includes(proposal.status);

                const order = orderByProposal.get(proposal.id);
                const canPay =
                  !!order &&
                  ["pendiente", "enviado"].includes(order.status);

                return (
                  <article
                    key={proposal.id}
                    className={`rounded-[24px] border p-6 transition ${
                      isAccepted
                        ? "border-[#bfe7d2] bg-[#fbfffd]"
                        : "border-[#e8e8ef] bg-white"
                    }`}
                  >

                    <div className="flex flex-col gap-5 lg:flex-row">

                      {/* ======================================
                          AVATAR
                      ====================================== */}

                      <div
                        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-full font-semibold text-white ${
                          isAccepted
                            ? "bg-[#42a879]"
                            : "bg-[#6f4cf6]"
                        }`}
                      >
                        {initial}
                      </div>

                      {/* ======================================
                          INFORMACIÓN
                      ====================================== */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-start justify-between gap-3">

                          <div>

                            <h2 className="font-semibold text-[#252b40]">
                              {name}
                            </h2>

                            <p className="mt-1 text-sm text-[#888d9a]">
                              Proyecto:{" "}
                              <span className="font-medium text-[#5b6070]">
                                {
                                  proposal
                                    .project
                                    ?.title
                                }
                              </span>
                            </p>

                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
                              proposal.status
                            )}`}
                          >
                            {statusLabel(
                              proposal.status
                            )}
                          </span>

                        </div>

                        {/* MENSAJE */}

                        <p className="mt-5 text-sm leading-7 text-[#6f7483]">
                          {proposal.message}
                        </p>

                        {/* DATOS */}

                        <div className="mt-5 flex flex-wrap gap-8">

                          <div>

                            <p className="text-xs text-[#969aa7]">
                              Propuesta
                            </p>

                            <p className="mt-1 font-semibold text-[#282e42]">
                              {money(
                                proposal
                                  .proposed_amount
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-[#969aa7]">
                              Tiempo estimado
                            </p>

                            <p className="mt-1 font-semibold text-[#282e42]">
                              {proposal
                                .estimated_days
                                ? `${proposal.estimated_days} días`
                                : "A convenir"}
                            </p>

                          </div>

                        </div>

                        {/* ======================================
                            MENSAJE ACEPTADA
                        ====================================== */}

                        {isAccepted && (
                          <div className="mt-5 rounded-2xl border border-[#ccebd9] bg-[#edf9f2] px-4 py-3">

                            <p className="text-sm font-semibold text-[#287b59]">
                              ✓ Servicio contratado
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#5d806f]">
                              Skilly gestiona la orden de pago
                              y te avisará cuando esté
                              lista para pagar.
                            </p>

                          </div>
                        )}

                      </div>

                      {/* ======================================
                          ACCIONES
                      ====================================== */}

                      <div className="flex shrink-0 flex-col gap-2">

                        {/* PAGO: el contratador obtiene su propio enlace */}
                        {canPay && order && (
                          <PayNowButton
                            orderId={order.id}
                            amount={order.amount}
                          />
                        )}

                        {/* ESTADO FINAL */}

                        {(
                          <div
                            className={`rounded-xl px-5 py-2.5 text-center text-sm font-semibold ${
                              isAccepted
                                ? "bg-[#e8f7ef] text-[#27855f]"
                                : "bg-[#f4f4f7] text-[#7c818e]"
                            }`}
                          >
                            {statusLabel(
                              proposal.status
                            )}
                          </div>
                        )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </div>

    </main>
  );
}