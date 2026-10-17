"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import { createClient } from "@/utils/supabase/clients";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("Ingresa tu correo electrónico.");
      return;
    }

    if (!password) {
      setErrorMessage("Ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error("Error iniciando sesión:", error.message);

      if (error.message === "Invalid login credentials") {
        setErrorMessage(
          "El correo o la contraseña no son correctos."
        );
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setErrorMessage(
          "Debes confirmar tu correo antes de iniciar sesión."
        );
      } else {
        setErrorMessage(
          "No pudimos iniciar sesión. Inténtalo nuevamente."
        );
      }

      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage(
        "No pudimos obtener los datos de tu cuenta."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto min-h-[calc(100vh-48px)] max-w-[1500px] overflow-hidden rounded-[36px] border border-[#ececf6] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly LATAM"
              width={210}
              height={82}
              priority
              className="h-auto w-[170px] object-contain sm:w-[190px]"
            />
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#e8e7f1] bg-white px-5 py-2.5 text-sm font-medium text-[#53586d] transition hover:bg-[#fafaff]"
          >
            ← Volver al inicio
          </Link>
        </header>

        <div className="grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">

          {/* LADO IZQUIERDO */}
          <section className="relative overflow-hidden px-6 pb-10 sm:px-10 lg:px-14 lg:pb-14">
            <div className="relative h-full overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f2efff] via-[#eef8ff] to-[#fff6ed] p-8 sm:p-10 lg:p-12">

              <div className="relative z-10 max-w-xl">
                <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-[#7467d8] shadow-sm backdrop-blur">
                  Conecta. Contrata. Crece.
                </span>

                <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-[#17213a] sm:text-5xl lg:text-[64px]">
                  Todo tu talento,
                  <span className="block text-[#826ff3]">
                    en un solo lugar.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-[#6c7284] sm:text-lg">
                  Encuentra profesionales, gestiona proyectos y trabaja con
                  seguridad dentro de Skilly.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">

                  <div className="rounded-[24px] bg-white/80 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ece6ff]">
                      🛡️
                    </div>

                    <p className="font-semibold text-[#20273b]">
                      Trabajo seguro
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Gestiona tus proyectos y propuestas desde un solo lugar.
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-white/80 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#def4eb]">
                      ✓
                    </div>

                    <p className="font-semibold text-[#20273b]">
                      Talento especializado
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Descubre profesionales según áreas y habilidades.
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-white/80 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0c8]">
                      💬
                    </div>

                    <p className="font-semibold text-[#20273b]">
                      Todo en Skilly
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Perfiles, propuestas y comunicación en un solo lugar.
                    </p>
                  </div>

                </div>
              </div>

              {/* DECORACIONES */}
              <div className="absolute -right-16 top-12 h-64 w-64 rounded-full bg-[#c9bfff]/45 blur-3xl" />

              <div className="absolute bottom-8 left-20 h-56 w-56 rounded-full bg-[#bcebdd]/50 blur-3xl" />

              <div className="absolute bottom-20 right-8 h-48 w-48 rounded-full bg-[#ffd8e2]/55 blur-3xl" />

              <div className="absolute bottom-10 right-10 hidden w-[330px] rotate-2 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_25px_60px_rgba(85,73,135,0.14)] backdrop-blur xl:block">

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7e2ff] text-xl">
                    👩🏻‍💻
                  </div>

                  <div>
                    <p className="font-semibold text-[#22283b]">
                      Camila R.
                    </p>

                    <p className="text-sm text-[#8a8e9c]">
                      Diseñadora UX/UI
                    </p>
                  </div>

                  <span className="ml-auto rounded-full bg-[#e8f7ef] px-3 py-1 text-xs font-semibold text-[#4e9b70]">
                    Disponible
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f7f6ff] px-4 py-3">
                  <span className="text-sm text-[#717688]">
                    Perfil profesional
                  </span>

                  <span className="font-semibold text-[#806ff0]">
                    UX/UI
                  </span>
                </div>

              </div>
            </div>
          </section>

          {/* LOGIN */}
          <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-md">

              <p className="text-sm font-semibold text-[#8a7cec]">
                Bienvenido de nuevo
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#17213a] sm:text-5xl">
                Inicia sesión
              </h2>

              <p className="mt-4 leading-7 text-[#777d8d]">
                Accede a tu cuenta y continúa conectando con oportunidades en
                Skilly.
              </p>

              <form
                onSubmit={handleLogin}
                className="mt-10 space-y-5"
              >

                {/* CORREO */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#31384b]"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nombre@correo.com"
                    disabled={loading}
                    className="w-full rounded-[18px] border border-[#e3e3ec] bg-[#fcfcff] px-5 py-4 text-[#1d2436] outline-none transition placeholder:text-[#aaaeba] focus:border-[#8b7bf4] focus:ring-4 focus:ring-[#8b7bf4]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* CONTRASEÑA */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#31384b]"
                    >
                      Contraseña
                    </label>

                    <button
                      type="button"
                      className="text-sm font-semibold text-[#826ff3] transition hover:text-[#6f4cf6]"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••••••"
                      disabled={loading}
                      className="w-full rounded-[18px] border border-[#e3e3ec] bg-[#fcfcff] px-5 py-4 pr-14 text-[#1d2436] outline-none transition placeholder:text-[#aaaeba] focus:border-[#8b7bf4] focus:ring-4 focus:ring-[#8b7bf4]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9a9daa] transition hover:text-[#6f57f5]"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* RECORDAR */}
                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#d9d9e4] accent-[#826ff3]"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-[#777c8b]"
                  >
                    Mantener sesión iniciada
                  </label>
                </div>

                {/* ERROR */}
                {errorMessage && (
                  <div className="rounded-[18px] border border-[#ffd6d6] bg-[#fff5f5] px-4 py-3">
                    <p className="text-sm font-medium text-[#ba3c3c]">
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* LOGIN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-[18px] bg-[#826ff3] px-5 py-4 font-semibold text-white shadow-[0_12px_28px_rgba(130,111,243,0.28)] transition hover:-translate-y-0.5 hover:bg-[#7563e8] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>

              </form>

              {/* SEPARADOR */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#ececf2]" />

                <span className="text-sm text-[#a0a3af]">
                  o continúa con
                </span>

                <div className="h-px flex-1 bg-[#ececf2]" />
              </div>

              <GoogleLoginButton />

              <p className="mt-8 text-center text-sm text-[#7c8190]">
                ¿Aún no tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-semibold text-[#826ff3] transition hover:text-[#6f4cf6]"
                >
                  Únete a Skilly
                </Link>
              </p>

              <p className="mt-10 text-center text-xs leading-5 text-[#a1a4af]">
                Al continuar aceptas los términos y condiciones y la política
                de privacidad de Skilly.
              </p>

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}