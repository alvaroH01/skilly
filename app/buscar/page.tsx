import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import { formatMoney } from "@/utils/services";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    modalidad?: string;
  }>;
};

type CatalogItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  price: number;
  duration_days: number;
  skills: string[] | null;
  professional_name: string | null;
  professional_title: string | null;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const search = params.q?.trim().replace(/[,()%]/g, " ") || "";
  const modality = ["remoto", "presencial", "hibrido"].includes(params.modalidad ?? "")
    ? (params.modalidad as string)
    : "";

  const supabase = await createClient();

  /* Catálogo público: solo servicios validados por Skilly y aceptados por el profesional */
  let query = supabase
    .from("service_catalog")
    .select(
      "id, title, description, category, modality, price, duration_days, skills, professional_name, professional_title"
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }
  if (modality) {
    query = query.eq("modality", modality);
  }

  const { data, error } = await query;
  if (error) console.error("Error buscando servicios:", error.message);
  const results = (data ?? []) as CatalogItem[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#fffaf3]">
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

      <section className="mx-auto max-w-[1250px] px-6 py-12 lg:px-12">
        <Link href="/" className="text-sm font-semibold text-[#6848ef]">
          ← Volver al inicio
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-[#6848ef]">Catálogo de servicios</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20263a] sm:text-4xl">
            Servicios profesionales validados
          </h1>
          <p className="mt-3 max-w-2xl text-[#73798a]">
            Cada servicio fue revisado por Skilly antes de publicarse. Elige uno, agenda la fecha de
            inicio y contrátalo.
          </p>
          {search && (
            <p className="mt-3 text-[#73798a]">
              Resultados para <span className="font-semibold text-[#30364a]">“{search}”</span>
            </p>
          )}
        </div>

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
          <select
            name="modalidad"
            defaultValue={modality}
            className="min-h-[52px] rounded-2xl border border-[#e4e1e8] bg-white px-4 text-sm outline-none transition focus:border-[#aa9aff] md:w-[200px]"
          >
            <option value="">Cualquier modalidad</option>
            <option value="remoto">Remoto</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
          </select>
          <button
            type="submit"
            className="min-h-[52px] rounded-2xl bg-[#6543dc] px-7 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
          >
            Buscar
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-[#858a99]">
            {results.length} {results.length === 1 ? "servicio encontrado" : "servicios encontrados"}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-dashed border-[#dcd7e8] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
              🔍
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[#272d42]">No encontramos servicios</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#858a99]">
              Prueba con otra palabra o categoría. Los servicios aparecen aquí cuando Skilly los valida.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {results.map((service) => (
              <article
                key={service.id}
                className="rounded-[26px] border border-[#e8e5ed] bg-white p-6 shadow-[0_10px_30px_rgba(65,50,95,0.04)] transition hover:border-[#d5ceff] hover:shadow-[0_16px_40px_rgba(65,50,95,0.08)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
                    💼
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                        {service.category}
                      </span>
                      <span className="rounded-full bg-[#f5f4f7] px-3 py-1 text-xs capitalize text-[#7b808d]">
                        {service.modality}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-[#252b40]">{service.title}</h2>
                    <p className="mt-1 text-sm text-[#7b808d]">
                      {service.professional_name ?? "Profesional Skilly"}
                      {service.professional_title ? ` · ${service.professional_title}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[#767b89]">
                      {service.description}
                    </p>

                    {service.skills && service.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {service.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-[#e8e5ef] px-3 py-1 text-xs text-[#727786]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-[210px] flex-col gap-3 lg:items-end">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-[#969aaa]">Tarifa</p>
                      <p className="mt-1 font-semibold text-[#252b40]">{formatMoney(service.price)}</p>
                      <p className="mt-1 text-xs text-[#969aaa]">{service.duration_days} día(s) de duración</p>
                    </div>
                    <Link
                      href={`/servicios/${service.id}`}
                      className="flex min-h-[46px] items-center justify-center rounded-xl bg-[#6543dc] px-5 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
                    >
                      Ver servicio
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
