import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import LoginRequiredButton from "@/components/public/LoginRequiredButton";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    ubicacion?: string;
  }>;
};

function formatMoney(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const search =
    params.q?.trim() || "";

  const location =
    params.ubicacion?.trim() || "";

  const supabase =
    await createClient();

  /*
   * CONSULTA BASE
   */
  let query = supabase
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
      created_at
    `)
    .eq("status", "activo")
    .order("created_at", {
      ascending: false,
    });

  /*
   * BÚSQUEDA
   */
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  const {
    data: projects,
    error,
  } = await query;

  if (error) {
    console.error(
      "Error buscando proyectos:",
      error.message
    );
  }

  const results =
    projects ?? [];

  /*
   * REVISAMOS SI EXISTE SESIÓN
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#fffaf3]">

      {/* ================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#eee7df] bg-white/80 backdrop-blur-xl">

        <div className="mx-auto flex h-[86px] max-w-[1400px] items-center justify-between px-6 lg:px-12">

          <Link href="/">
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly LATAM"
              width={180}
              height={70}
              priority
              className="h-auto w-[145px]"
            />
          </Link>

          <div className="flex items-center gap-3">

            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#6543dc] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
              >
                Ir a mi cuenta
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-[#dfd9d1] bg-white px-5 py-3 text-sm font-medium text-[#272b38]"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/registro"
                  className="rounded-xl bg-[#6543dc] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
                >
                  Únete a Skilly
                </Link>
              </>
            )}

          </div>

        </div>

      </header>

      {/* ================================================
          CONTENIDO
      ================================================= */}

      <section className="mx-auto max-w-[1250px] px-6 py-12 lg:px-12">

        {/* VOLVER */}
        <Link
          href="/"
          className="text-sm font-semibold text-[#6848ef]"
        >
          ← Volver al inicio
        </Link>

        {/* TÍTULO */}
        <div className="mt-8">

          <p className="text-sm font-semibold text-[#6848ef]">
            Oportunidades disponibles
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20263a] sm:text-4xl">
            Resultados de búsqueda
          </h1>

          {search && (
            <p className="mt-3 text-[#73798a]">
              Resultados para{" "}
              <span className="font-semibold text-[#30364a]">
                “{search}”
              </span>

              {location && (
                <>
                  {" "}en{" "}
                  <span className="font-semibold text-[#30364a]">
                    {location}
                  </span>
                </>
              )}
            </p>
          )}

        </div>

        {/* ================================================
            NUEVA BÚSQUEDA
        ================================================= */}

        <form
          action="/buscar"
          method="GET"
          className="mt-8 flex flex-col gap-3 rounded-[24px] border border-[#e8e3df] bg-white p-4 shadow-[0_12px_35px_rgba(70,55,100,0.06)] md:flex-row"
        >

          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Buscar por servicio, categoría o palabra clave..."
            className="min-h-[52px] flex-1 rounded-2xl border border-[#e4e1e8] px-4 text-sm outline-none transition focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
          />

          <input
            type="text"
            name="ubicacion"
            defaultValue={location}
            placeholder="Ubicación"
            className="min-h-[52px] rounded-2xl border border-[#e4e1e8] px-4 text-sm outline-none transition focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10 md:w-[230px]"
          />

          <button
            type="submit"
            className="min-h-[52px] rounded-2xl bg-[#6543dc] px-7 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
          >
            Buscar
          </button>

        </form>

        {/* ================================================
            CANTIDAD
        ================================================= */}

        <div className="mt-8 flex items-center justify-between">

          <p className="text-sm text-[#858a99]">
            {results.length}{" "}
            {results.length === 1
              ? "oportunidad encontrada"
              : "oportunidades encontradas"}
          </p>

        </div>

        {/* ================================================
            SIN RESULTADOS
        ================================================= */}

        {results.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-dashed border-[#dcd7e8] bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
              🔍
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#272d42]">
              No encontramos resultados
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#858a99]">
              Prueba con otra palabra,
              categoría o servicio.
            </p>

          </div>
        ) : (

          /* ================================================
              RESULTADOS
          ================================================= */

          <div className="mt-6 space-y-4">

            {results.map(
              (project) => (
                <article
                  key={project.id}
                  className="rounded-[26px] border border-[#e8e5ed] bg-white p-6 shadow-[0_10px_30px_rgba(65,50,95,0.04)] transition hover:border-[#d5ceff] hover:shadow-[0_16px_40px_rgba(65,50,95,0.08)]"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                    {/* ICONO */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
                      💼
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                          {project.category}
                        </span>

                        <span className="rounded-full bg-[#f5f4f7] px-3 py-1 text-xs capitalize text-[#7b808d]">
                          {project.modality}
                        </span>

                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-[#252b40]">
                        {project.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[#767b89]">
                        {project.description}
                      </p>

                      {project.skills &&
                        project.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">

                            {project.skills
                              .slice(0, 4)
                              .map(
                                (
                                  skill: string
                                ) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-[#e8e5ef] px-3 py-1 text-xs text-[#727786]"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                          </div>
                        )}

                    </div>

                    {/* DERECHA */}
                    <div className="flex min-w-[210px] flex-col gap-3 lg:items-end">

                      {(project.budget_min ||
                        project.budget_max) && (
                        <div className="text-left lg:text-right">

                          <p className="text-xs text-[#969aaa]">
                            Presupuesto
                          </p>

                          <p className="mt-1 font-semibold text-[#252b40]">

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

                          </p>

                        </div>
                      )}

                      {user ? (
                        <Link
                          href={`/dashboard/profesional/proyectos/${project.id}`}
                          className="flex min-h-[46px] items-center justify-center rounded-xl bg-[#6543dc] px-5 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
                        >
                          Ver oportunidad
                        </Link>
                      ) : (
                        <LoginRequiredButton />
                      )}

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

    </main>
  );
}