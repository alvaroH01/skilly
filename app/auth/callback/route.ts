import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error(
      "Error intercambiando código por sesión:",
      exchangeError.message
    );

    return NextResponse.redirect(
      new URL("/login?error=auth", requestUrl.origin)
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/login?error=user", requestUrl.origin)
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Error obteniendo perfil:",
      profileError.message
    );

    return NextResponse.redirect(
      new URL("/login?error=profile", requestUrl.origin)
    );
  }

  if (!profile.onboarding_completed || !profile.role) {
    return NextResponse.redirect(
      new URL("/onboarding", requestUrl.origin)
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", requestUrl.origin)
  );
}