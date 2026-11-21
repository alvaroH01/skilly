import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ServiceActions from "@/components/professional/ServiceActions";
import {
  ServiceRow,
  VALIDATION_LABEL,
  formatMoney,
} from "@/utils/services";

export default async function MisServiciosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    !["profesional", "ambos"].includes(profile.role) ||
    !profile.onboarding_completed
  ) {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, professional_id, title, description, category, modality, price, duration_days, skills, status, validation_status, suggested_price, validation_notes, created_at"
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Error cargando servicios:", error.message);

  const services = (data ?? []) as ServiceRow[];

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">
        <header className="flex flex-col justify-between gap-5 border-b border-[#eeeef4] px-6 py-7 sm:flex-row sm:items-center sm:px-9">
          <div>
            <p className="text-sm font-semibold text-[#7458e8]">Catálogo</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">Mis servicios</h1>
            <p className="mt-2 text-sm text-[#7c8190]">
              Publica los servicios que ofreces. Skilly los revisa y puede sugerirte ajustes antes de
              mostrarlos a las organizaciones.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/profesional"
              className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
            >
              ← Dashboard
            </Link>
            <Link
              href="/dashboard/profesional/servicios/nuevo"
              className="rounded-xl bg-[#6f4cf6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6241e8]"
            >
              + Nuevo servicio
            </Link>
          </div>
        </header>

        <div className="space-y-5 p-6 sm:p-9">
          {services.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-[#dcd7e8] px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-[#272d42]">Aún no tienes servicios</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#858a99]">
                Crea tu primer servicio y envíalo a revisión. Cuando Skilly lo apruebe y tú aceptes la
                propuesta final, quedará visible en el catálogo.
              </p>
            </div>
          ) : (
            services.map((service) => {
              const label = VALIDATION_LABEL[service.validation_status];
              const paused = service.validation_status === "validado" && service.status === "pausado";
              return (
                <article
                  key={service.id}
                  className="rounded-[24px] border border-[#e8e5ed] p-6 shadow-[0_10px_30px_rgba(65,50,95,0.04)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label.tone}`}>
                          {paused ? "Publicación pausada" : label.text}
                        </span>
                        <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                          {service.category}
                        </span>
                        <span className="rounded-full bg-[#f5f4f7] px-3 py-1 text-xs capitalize text-[#7b808d]">
                          {service.modality}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-[#252b40]">{service.title}</h2>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[#767b89]">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-[#969aaa]">Tarifa</p>
                      <p className="mt-1 text-lg font-semibold text-[#252b40]">{formatMoney(service.price)}</p>
                      <p className="mt-1 text-xs text-[#969aaa]">{service.duration_days} día(s)</p>
                    </div>
                  </div>

                  {(service.validation_status === "cambios_solicitados" ||
                    service.validation_status === "propuesta_final") && (
                    <div className="mt-5 rounded-2xl border border-[#e4defc] bg-[#f8f6ff] p-4 text-sm leading-6 text-[#4d4478]">
                      <p className="font-semibold">Observaciones de Skilly</p>
                      <p className="mt-1 whitespace-pre-line">
                        {service.validation_notes || "Skilly no dejó observaciones adicionales."}
                      </p>
                      {service.suggested_price && (
                        <p className="mt-2">
                          Tarifa sugerida:{" "}
                          <span className="font-semibold">{formatMoney(service.suggested_price)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5">
                    <ServiceActions service={service} />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
