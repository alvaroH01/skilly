import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  /* =====================================================
     1. OBTENER USUARIO AUTENTICADO
  ===================================================== */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Si no está autenticado
  if (userError || !user) {
    redirect("/login");
  }

  /* =====================================================
     2. OBTENER PERFIL
  ===================================================== */

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  // Si no existe perfil
  if (profileError || !profile) {
    redirect("/onboarding");
  }

  /* =====================================================
     3. ADMINISTRADOR SKILLY
     
     El administrador no necesita completar
     onboarding de cliente o profesional.
  ===================================================== */

  if (profile.role === "admin") {
    redirect("/dashboard/admin");
  }

  /* =====================================================
     4. VALIDAR ONBOARDING
  ===================================================== */

  if (!profile.onboarding_completed || !profile.role) {
    redirect("/onboarding");
  }

  /* =====================================================
     5. CLIENTE
  ===================================================== */

  if (profile.role === "cliente") {
    redirect("/dashboard/cliente");
  }

  /* =====================================================
     6. PROFESIONAL
  ===================================================== */

  if (profile.role === "profesional") {
    redirect("/dashboard/profesional");
  }

  /* =====================================================
     7. OTROS CASOS
  ===================================================== */

  // Por seguridad, cualquier rol no reconocido
  // vuelve al onboarding.
  redirect("/onboarding");
}