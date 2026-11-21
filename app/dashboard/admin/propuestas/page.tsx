import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CreatePaymentOrderButton from "@/components/admin/CreatePaymentOrderButton";

function money(value: number | null) {
  if (!value) return "Monto no definido";

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
  }).format(new Date(value));
}

export default async function AdminProposalsPage() {
  const supabase = await createClient();

  /* =====================================================
     1. VALIDAR USUARIO
  ===================================================== */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /* =====================================================
     2. VALIDAR ADMIN
  ===================================================== */

  const { data: profile, error: profileError } = await supabase
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

  /* =====================================================
     3. OBTENER PROPUESTAS
  ===================================================== */

  const {
    data: proposalsData,
    error: proposalsError,
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
      projects (
        id,
        title,
        client_id
      )
    `)
    .in("status", [
      "pendiente",
      "seleccionada",
      "pendiente_pago",
    ])
    .order("created_at", {
      ascending: false,
    });

  if (proposalsError) {
    console.error(
      "Error cargando propuestas:",
      proposalsError.message
    );
  }

  const proposals = proposalsData ?? [];

  /* =====================================================
     4. OBTENER NOMBRES DE CLIENTES Y PROFESIONALES
  ===================================================== */

  const professionalIds = [
    ...new Set(
      proposals
        .map((proposal: any) => proposal.professional_id)
        .filter(Boolean)
    ),
  ];

  const clientIds = [
    ...new Set(
      proposals
        .map((proposal: any) => {
          const project = Array.isArray(proposal.projects)
            ? proposal.projects[0]
            : proposal.projects;

          return project?.client_id;
        })
        .filter(Boolean)
    ),
  ];

  const profileIds = [
    ...new Set([
      ...professionalIds,
      ...clientIds,
    ]),
  ];

  let names = new Map<string, string>();

  if (profileIds.length > 0) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", profileIds);

    names = new Map(
      (people ?? []).map((person: any) => [
        person.id,
        person.full_name || "Usuario Skilly",
      ])
    );
  }

  /* =====================================================
     5. ÓRDENES YA GENERADAS
  ===================================================== */

  const proposalIds = proposals.map(
    (proposal: any) => proposal.id
  );

  let paymentOrders = new Map<string, any>();

  if (proposalIds.length > 0) {
    const { data: orders } = await supabase
      .from("payment_orders")
      .select(`
        id,
        proposal_id,
        amount,
        status,
        created_at
      `)
      .in("proposal_id", proposalIds);

    paymentOrders = new Map(
      (orders ?? []).map((order: any) => [
        order.proposal_id,
        order,
      ])
    );
  }

  /* =====================================================
     UI
  ===================================================== */

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
                Curaduría y Gestión de Propuestas
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

      {/* CONTENIDO */}

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* TITULO */}

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b73ea]">
            Curaduría y Acompañamiento
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252a3b]">
            Propuestas y Valoración de Talento
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a98]">
            Revisa las propuestas de los profesionales, optimiza la presentación comercial,
            sugiere tarifas de mercado y administra las órdenes de pago de las propuestas seleccionadas.
          </p>
        </section>

        {/* CONTADOR */}

        <section className="mt-7">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#e8e4f4] bg-white px-5 py-3 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] font-bold text-[#6848ef]">
              {proposals.length}
            </div>

            <div>
              <p className="text-xs text-[#999daa]">
                En catálogo / gestión
              </p>

              <p className="text-sm font-semibold text-[#454a5c]">
                Propuestas disponibles para revisión
              </p>
            </div>
          </div>
        </section>

        {/* PROPUESTAS */}

        <section className="mt-6">
          {proposals.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd9e9] bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1edff] text-2xl text-[#6f4cf6]">
                ✓
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#363b4d]">
                Todo está al día
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a8f9c]">
                Actualmente no existen propuestas pendientes que requieran gestión o curaduría.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {proposals.map((proposal: any) => {
                const project = Array.isArray(
                  proposal.projects
                )
                  ? proposal.projects[0]
                  : proposal.projects;

                const order = paymentOrders.get(
                  proposal.id
                );

                const professionalName =
                  names.get(proposal.professional_id) ||
                  "Profesional";

                const clientName =
                  names.get(project?.client_id) ||
                  "Contratador";

                const hasCuration = proposal.message?.includes("RETROALIMENTACIÓN DE SKILLY LATAM");

                return (
                  <article
                    key={proposal.id}
                    className="overflow-hidden rounded-[28px] border border-[#e7e4ef] bg-white shadow-[0_12px_40px_rgba(60,50,100,0.05)]"
                  >
                    {/* PARTE SUPERIOR */}

                    <div className="flex flex-col gap-5 border-b border-[#efedf4] p-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">
                          {proposal.status === "seleccionada" ? (
                            <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                              Propuesta Seleccionada
                            </span>
                          ) : proposal.status === "pendiente_pago" ? (
                            <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b97717]">
                              Pendiente de pago
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#f4f3f8] px-3 py-1 text-xs font-semibold text-[#6a6f7e]">
                              Propuesta Enviada
                            </span>
                          )}

                          <span className="text-xs text-[#9a9eaa]">
                            {formatDate(
                              proposal.created_at
                            )}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-semibold text-[#292e40]">
                          {project?.title ||
                            "Proyecto"}
                        </h2>

                        <p className="mt-2 text-sm text-[#858a98]">
                          Contratador:{" "}
                          <span className="font-semibold text-[#555a6b]">
                            {clientName}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-[#858a98]">
                          Profesional:{" "}
                          <span className="font-semibold text-[#555a6b]">
                            {professionalName}
                          </span>
                        </p>
                      </div>

                      {/* MONTO */}

                      <div className="shrink-0 rounded-[20px] bg-[#f8f7fc] px-5 py-4 lg:min-w-[190px]">

                        <p className="text-xs font-medium text-[#999daa]">
                          Monto propuesto
                        </p>

                        <p className="mt-1 text-xl font-semibold text-[#34394b]">
                          {money(
                            proposal.proposed_amount
                          )}
                        </p>

                        <p className="mt-2 text-xs text-[#999daa]">
                          {proposal.estimated_days
                            ? `${proposal.estimated_days} días estimados`
                            : "Plazo a convenir"}
                        </p>
                      </div>
                    </div>

                    {/* MENSAJE PROPUESTA */}

                    <div className="p-6 sm:p-7">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9a9eaa]">
                        Detalle de la propuesta
                      </p>

                      <div className="mt-3 max-w-4xl whitespace-pre-line rounded-2xl bg-[#faf9fd] p-5 text-sm leading-6 text-[#575c6c]">
                        {proposal.message}
                      </div>

                      {/* ACCIONES DE CURADURÍA Y PAGO */}
                      <div className="mt-6 flex flex-col gap-4 rounded-[22px] border border-[#eee9f8] bg-[#fdfcff] p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#796e98]">
                            Acciones de pago
                          </p>
                          <p className="mt-1 text-xs text-[#8f94a2]">
                            Genera la orden de pago de la contratación y comparte el enlace seguro con el contratador.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                          {proposal.status === "seleccionada" && !order && (
                            <CreatePaymentOrderButton
                              proposalId={proposal.id}
                            />
                          )}

                          {order && (
                            <span className="rounded-xl border border-[#dedbe8] bg-white px-4 py-2.5 text-xs font-semibold text-[#545969]">
                              Orden: {money(order.amount)} ({order.status})
                            </span>
                          )}
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
