import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ServiceForm from "@/components/professional/ServiceForm";

export default async function NuevoServicioPage() {
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

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[860px] rounded-[30px] border border-[#e9e9f1] bg-white p-6 shadow-[0_30px_90px_rgba(80,70,130,0.08)] sm:p-9">
        <Link href="/dashboard/profesional/servicios" className="text-sm font-semibold text-[#6848ef]">
          ← Mis servicios
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#20263a]">Nuevo servicio</h1>
        <p className="mt-2 mb-8 text-sm leading-6 text-[#7c8190]">
          Describe lo que ofreces. Después podrás enviarlo a revisión: Skilly valida el alcance, la
          presentación y la tarifa antes de publicarlo.
        </p>
        <ServiceForm />
      </div>
    </main>
  );
}
