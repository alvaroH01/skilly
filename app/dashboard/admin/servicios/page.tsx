import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ServiceReviewActions from "@/components/admin/ServiceReviewActions";
import { ServiceRow, VALIDATION_LABEL, formatMoney } from "@/utils/services";

export default async function AdminServiciosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, professional_id, title, description, category, modality, price, duration_days, skills, status, validation_status, suggested_price, validation_notes, created_at"
    )
    .neq("validation_status", "no_enviado")
    .order("created_at", { ascending: false });

  if (error) console.error("Error cargando servicios:", error.message);

  const services = (data ?? []) as ServiceRow[];

  const ids = [...new Set(services.map((s) => s.professional_id))];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: people } = await supabase.from("profiles").select("id, full_name").in("id", ids);
    (people ?? []).forEach((p) => names.set(p.id, p.full_name ?? "Profesional"));
  }

  const order = ["pendiente", "en_revision", "propuesta_final", "cambios_solicitados", "validado"];
  services.sort((a, b) => order.indexOf(a.validation_status) - order.indexOf(b.validation_status));

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">
        <header className="flex flex-col justify-between gap-5 border-b border-[#eeeef4] px-6 py-7 sm:flex-row sm:items-center sm:px-9">
          <div>
            <p className="text-sm font-semibold text-[#7458e8]">Back-office</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#20263a]">Revisión de servicios</h1>
            <p className="mt-2 text-sm text-[#7c8190]">
              Curaduría comercial: revisa alcance, presentación y tarifa antes de publicar en el catálogo.
            </p>
          </div>
          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
          >
            ← Panel admin
          </Link>
        </header>

        <div className="space-y-5 p-6 sm:p-9">
          {services.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#dcd7e8] px-6 py-14 text-center text-sm text-[#858a99]">
              No hay servicios enviados a revisión.
            </p>
          ) : (
            services.map((service) => {
              const label = VALIDATION_LABEL[service.validation_status];
              return (
                <article key={service.id} className="rounded-[24px] border border-[#e8e5ed] p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label.tone}`}>
                          {label.text}
                        </span>
                        <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-semibold text-[#6848ef]">
                          {service.category}
                        </span>
                        <span className="rounded-full bg-[#f5f4f7] px-3 py-1 text-xs capitalize text-[#7b808d]">
                          {service.modality}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-[#252b40]">{service.title}</h2>
                      <p className="mt-1 text-xs text-[#8a8fa0]">
                        Profesional: {names.get(service.professional_id) ?? "—"}
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#767b89]">
                        {service.description}
                      </p>
                      {service.validation_notes && (
                        <p className="mt-3 rounded-xl bg-[#f8f6ff] px-4 py-3 text-xs leading-5 text-[#4d4478]">
                          <span className="font-semibold">Última observación enviada:</span> {service.validation_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-[#969aaa]">Tarifa propuesta</p>
                      <p className="mt-1 text-lg font-semibold text-[#252b40]">{formatMoney(service.price)}</p>
                      {service.suggested_price && (
                        <p className="mt-1 text-xs text-[#6848ef]">
                          Sugerida: {formatMoney(service.suggested_price)}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[#969aaa]">{service.duration_days} día(s)</p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#f0eef6] pt-5">
                    <ServiceReviewActions
                      serviceId={service.id}
                      validationStatus={service.validation_status}
                      currentPrice={service.price}
                    />
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
