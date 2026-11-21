import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ServiceForm from "@/components/professional/ServiceForm";
import { ServiceRow } from "@/utils/services";

type Props = { params: Promise<{ id: string }> };

export default async function EditarServicioPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("services")
    .select(
      "id, professional_id, title, description, category, modality, price, duration_days, skills, status, validation_status, suggested_price, validation_notes, created_at"
    )
    .eq("id", id)
    .eq("professional_id", user.id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[860px] rounded-[30px] border border-[#e9e9f1] bg-white p-6 shadow-[0_30px_90px_rgba(80,70,130,0.08)] sm:p-9">
        <Link href="/dashboard/profesional/servicios" className="text-sm font-semibold text-[#6848ef]">
          ← Mis servicios
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#20263a]">Editar servicio</h1>
        <p className="mt-2 mb-8 text-sm leading-6 text-[#7c8190]">
          Ajusta la información y guarda los cambios.
        </p>
        <ServiceForm service={data as ServiceRow} />
      </div>
    </main>
  );
}
