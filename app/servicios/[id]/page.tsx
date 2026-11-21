import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ContractServiceForm from "@/components/client/ContractServiceForm";
import { formatMoney } from "@/utils/services";

type Props = { params: Promise<{ id: string }> };

export default async function ServicioDetallePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("service_catalog")
    .select(
      "id, title, description, category, modality, price, duration_days, skills, professional_id, professional_name, professional_title, professional_bio"
    )
    .eq("id", id)
    .maybeSingle();

  if (!service) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const canHire = role === "cliente" || role === "ambos";
  const isOwner = user?.id === service.professional_id;

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
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-xl bg-[#6543dc] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
          >
            {user ? "Ir a mi cuenta" : "Iniciar sesión"}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1150px] px-6 py-12 lg:px-12">
        <Link href="/buscar" className="text-sm font-semibold text-[#6848ef]">
          ← Volver al catálogo
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <article className="rounded-[28px] border border-[#e8e5ed] bg-white p-8 shadow-[0_10px_30px_rgba(65,50,95,0.04)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                {service.category}
              </span>
              <span className="rounded-full bg-[#f5f4f7] px-3 py-1 text-xs capitalize text-[#7b808d]">
                {service.modality}
              </span>
              <span className="rounded-full bg-[#e7f8ef] px-3 py-1 text-xs font-semibold text-[#2d875a]">
                Validado por Skilly
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#20263a]">{service.title}</h1>

            <p className="mt-6 whitespace-pre-line text-[15px] leading-7 text-[#555b6e]">{service.description}</p>

            {service.skills && service.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {service.skills.map((skill: string) => (
                  <span key={skill} className="rounded-full border border-[#e8e5ef] px-3 py-1 text-xs text-[#727786]">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-2xl bg-[#faf8ff] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8fa0]">Profesional</p>
              <p className="mt-2 text-lg font-semibold text-[#252b40]">
                {service.professional_name ?? "Profesional Skilly"}
              </p>
              {service.professional_title && <p className="text-sm text-[#7b808d]">{service.professional_title}</p>}
              {service.professional_bio && (
                <p className="mt-3 text-sm leading-6 text-[#666c7e]">{service.professional_bio}</p>
              )}
            </div>
          </article>

          <aside className="h-fit rounded-[28px] border border-[#e8e5ed] bg-white p-7 shadow-[0_10px_30px_rgba(65,50,95,0.04)]">
            <p className="text-xs text-[#969aaa]">Tarifa del servicio</p>
            <p className="mt-1 text-3xl font-semibold text-[#20263a]">{formatMoney(service.price)}</p>
            <p className="mt-1 text-sm text-[#7b808d]">{service.duration_days} día(s) de duración</p>

            <div className="mt-6 border-t border-[#f0eef6] pt-6">
              {!user ? (
                <div className="space-y-3 text-sm text-[#666c7e]">
                  <p>Inicia sesión con tu cuenta de contratador para agendar y contratar este servicio.</p>
                  <Link
                    href="/login"
                    className="flex min-h-[48px] items-center justify-center rounded-xl bg-[#6543dc] px-5 text-sm font-semibold text-white"
                  >
                    Iniciar sesión
                  </Link>
                  <Link href="/registro" className="block text-center text-xs font-semibold text-[#6848ef]">
                    Crear una cuenta
                  </Link>
                </div>
              ) : isOwner ? (
                <p className="text-sm text-[#666c7e]">Este es uno de tus servicios publicados.</p>
              ) : canHire ? (
                <ContractServiceForm serviceId={service.id} />
              ) : (
                <p className="text-sm leading-6 text-[#666c7e]">
                  Solo las cuentas de contratador pueden contratar servicios. Tu cuenta tiene rol{" "}
                  <span className="font-semibold">{role ?? "sin rol"}</span>.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
