import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ProposalForm from "@/components/professional/ProposalForm";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function money(value: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value: string | null) {
  if (!value) {
    return "Sin fecha definida";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "profesional") {
    redirect("/dashboard");
  }

  /* PROYECTO */
  const {
    data: project,
    error: projectError,
  } = await supabase
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
    .eq("id", id)
    .eq("status", "activo")
    .single();

  if (projectError || !project) {
    notFound();
  }

  /* REVISAR SI YA ENVIÓ PROPUESTA */
  const { data: existingProposal } =
    await supabase
      .from("proposals")
      .select(`
        id,
        status,
        proposed_amount,
        estimated_days,
        message
      `)
      .eq("project_id", id)
      .eq("professional_id", user.id)
      .maybeSingle();

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1350px]">

        {/* VOLVER */}
        <Link
          href="/dashboard/profesional/proyectos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f4cf6]"
        >
          ← Volver a proyectos
        </Link>

        <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_380px]">

          {/* INFORMACIÓN */}
          <section className="overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_25px_70px_rgba(80,70,130,0.06)]">

            {/* HERO */}
            <div className="relative overflow-hidden border-b border-[#eceaf3] bg-gradient-to-br from-[#f8f5ff] via-[#fbfaff] to-[#f3f0ff] p-7 sm:p-9">

              <div className="relative z-10">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6848ef] shadow-sm">
                    {project.category}
                  </span>

                  <span className="rounded-full bg-[#e9f8f1] px-3 py-1.5 text-xs font-semibold text-[#3f976c]">
                    Proyecto activo
                  </span>

                </div>

                <h1 className="mt-5 max-w-[760px] text-3xl font-semibold tracking-tight text-[#1d2337] sm:text-4xl">
                  {project.title}
                </h1>

                <p className="mt-4 text-sm text-[#888d9b]">
                  Publicado el{" "}
                  {date(project.created_at)}
                </p>

              </div>

              <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#d8ceff]/50 blur-3xl" />

            </div>

            <div className="p-7 sm:p-9">

              {/* INFO GENERAL */}
              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-[#fafafd] p-5">
                  <p className="text-xs text-[#9397a5]">
                    Presupuesto
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#30364a]">
                    {project.budget_min ||
                    project.budget_max ? (
                      <>
                        {money(project.budget_min)}

                        {project.budget_min &&
                          project.budget_max &&
                          " - "}

                        {money(project.budget_max)}
                      </>
                    ) : (
                      "A convenir"
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fafafd] p-5">
                  <p className="text-xs text-[#9397a5]">
                    Modalidad
                  </p>

                  <p className="mt-2 text-sm font-semibold capitalize text-[#30364a]">
                    {project.modality}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fafafd] p-5">
                  <p className="text-xs text-[#9397a5]">
                    Fecha límite
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#30364a]">
                    {date(project.deadline)}
                  </p>
                </div>

              </div>

              {/* DESCRIPCIÓN */}
              <section className="mt-9">

                <h2 className="text-lg font-semibold text-[#252b40]">
                  Sobre el proyecto
                </h2>

                <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-[#6d7281]">
                  {project.description}
                </p>

              </section>

              {/* HABILIDADES */}
              <section className="mt-9">

                <h2 className="text-lg font-semibold text-[#252b40]">
                  Habilidades buscadas
                </h2>

                {project.skills &&
                project.skills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {project.skills.map(
                      (skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#f1eeff] px-4 py-2 text-sm font-medium text-[#6650c8]"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#8b8f9d]">
                    El cliente no especificó habilidades.
                  </p>
                )}

              </section>

              {/* INFORMACIÓN */}
              <section className="mt-9 rounded-[22px] border border-[#eae8f1] bg-[#fafafd] p-6">

                <h2 className="text-sm font-semibold text-[#30364a]">
                  Antes de enviar tu propuesta
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#7b808f]">
                  Explica brevemente cómo abordarías el proyecto,
                  destaca tu experiencia relacionada y entrega una
                  estimación realista de tiempo y valor.
                </p>

              </section>

            </div>

          </section>

          {/* COLUMNA DERECHA */}
          <aside>

            {existingProposal ? (
              <div className="sticky top-8 rounded-[26px] border border-[#dcd6fb] bg-white p-6 shadow-[0_15px_45px_rgba(76,61,120,0.07)]">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f1] text-xl text-[#3d996b]">
                  ✓
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[#252b40]">
                  Ya enviaste una propuesta
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777c8b]">
                  Tu propuesta ya fue enviada al cliente y
                  actualmente se encuentra:
                </p>

                <span className="mt-4 inline-flex rounded-full bg-[#fff4da] px-3 py-1.5 text-xs font-semibold capitalize text-[#a77428]">
                  {existingProposal.status}
                </span>

                <div className="my-5 h-px bg-[#ecebf1]" />

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-[#fafafd] p-3">
                    <p className="text-xs text-[#999daa]">
                      Valor
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#32384c]">
                      {money(
                        existingProposal.proposed_amount
                      ) || "A convenir"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#fafafd] p-3">
                    <p className="text-xs text-[#999daa]">
                      Plazo
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#32384c]">
                      {existingProposal.estimated_days
                        ? `${existingProposal.estimated_days} días`
                        : "A convenir"}
                    </p>
                  </div>

                </div>

                <Link
                  href="/dashboard/profesional/propuestas"
                  className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#d8d1ff] px-4 py-3 text-sm font-semibold text-[#6848ef]"
                >
                  Ver mis propuestas
                </Link>

              </div>
            ) : (
              <div className="sticky top-8">
                <ProposalForm projectId={project.id} />
              </div>
            )}

          </aside>

        </div>
      </div>
    </main>
  );
}