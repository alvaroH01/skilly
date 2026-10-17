"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function RegistroPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // VALIDACIONES
    if (!cleanName) {
      setErrorMessage("Ingresa tu nombre completo.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Ingresa tu correo electrónico.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Tu contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },

          emailRedirectTo: `${window.location.origin}/auth/email-confirmed`,
        },
      });

      if (error) {
        console.error("Error registrando usuario:", error);

        const message = error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already been registered") ||
          message.includes("user already registered")
        ) {
          setErrorMessage(
            "Ya existe una cuenta asociada a este correo electrónico."
          );
        } else if (message.includes("password")) {
          setErrorMessage(
            "La contraseña no cumple con los requisitos de seguridad."
          );
        } else if (message.includes("email")) {
          setErrorMessage(
            "El correo electrónico ingresado no es válido."
          );
        } else {
          setErrorMessage(
            "No pudimos crear tu cuenta. Revisa los datos e inténtalo nuevamente."
          );
        }

        return;
      }

      if (!data.user) {
        setErrorMessage(
          "No pudimos crear tu cuenta. Inténtalo nuevamente."
        );
        return;
      }

      // Lo enviamos a la pantalla que indica que debe revisar su correo.
      router.push(
        `/verificar-correo?email=${encodeURIComponent(cleanEmail)}`
      );
    } catch (error) {
      console.error("Error inesperado:", error);

      setErrorMessage(
        "Ocurrió un error inesperado. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[32px] border border-[#ececf4] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">
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
            className="rounded-full border border-[#e4e6ef] bg-white px-5 py-2.5 text-sm font-medium text-[#53586d] transition hover:bg-[#fafaff]"
          >
            ← Volver al inicio
          </Link>
        </header>

        <div className="grid min-h-[820px] lg:grid-cols-[0.96fr_1.04fr]">
          {/* LADO IZQUIERDO */}
          <section className="relative overflow-hidden border-t border-[#eeeef4] bg-gradient-to-br from-[#f6f1ff] via-[#f2fbff] to-[#fff8f1] px-7 py-12 sm:px-10 lg:px-14 lg:py-14">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#725ef0] shadow-sm backdrop-blur">
                Conecta. Contrata. Crece.
              </span>

              <h1 className="mt-7 text-4xl font-semibold leading-[1.08] tracking-tight text-[#17213a] sm:text-5xl lg:text-[58px]">
                Todo tu talento,
                <span className="block text-[#6f4cf6]">
                  en un solo lugar.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-[#6f7485] sm:text-lg">
                Únete a Skilly y forma parte de la plataforma que conecta
                talento con oportunidades en toda LATAM.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-[22px] bg-white/85 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ebe7ff] text-xl">
                    🛡️
                  </div>

                  <div>
                    <p className="font-semibold text-[#20273b]">
                      Pago protegido
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Tu dinero se libera al completar el servicio con total
                      seguridad.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[22px] bg-white/85 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#def5eb] text-xl">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-[#20273b]">
                      Perfiles verificados
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Verificamos datos de contacto para construir una
                      comunidad más confiable.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[22px] bg-white/85 p-5 shadow-[0_12px_35px_rgba(86,74,140,0.06)] backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0c8] text-xl">
                    💬
                  </div>

                  <div>
                    <p className="font-semibold text-[#20273b]">
                      Todo en Skilly
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#808596]">
                      Perfiles, propuestas, proyectos, comunicación y pagos en
                      un solo lugar.
                    </p>
                  </div>
                </div>
              </div>

              {/* MINI TARJETA */}
              <div className="mt-8 max-w-[430px] rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(80,70,130,0.12)] backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ece8ff] text-2xl">
                    👨🏻‍💻
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-[#20273b]">
                      Tu perfil Skilly
                    </p>

                    <p className="text-sm text-[#818696]">
                      Profesional o cliente
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-semibold text-[#3d9a6c]">
                      ✓ Contacto verificado
                    </span>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="font-semibold text-[#242b3f]">
                      Seguro
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#858a9a]">
                      Correo
                      <br />
                      + teléfono
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DECORACIONES */}
            <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#c8bfff]/45 blur-3xl" />
            <div className="absolute bottom-24 left-4 h-52 w-52 rounded-full bg-[#a8d4ff]/35 blur-3xl" />
            <div className="absolute bottom-10 right-14 h-48 w-48 rounded-full bg-[#ffd8bd]/45 blur-3xl" />
            <div className="absolute right-0 top-[44%] h-40 w-40 rounded-full bg-[#9ff0cf]/35 blur-3xl" />
          </section>

          {/* LADO DERECHO */}
          <section className="flex items-center justify-center border-t border-[#eeeef4] px-7 py-12 sm:px-10 lg:px-14 lg:py-14">
            <div className="w-full max-w-[570px]">
              <p className="text-sm font-semibold text-[#6f4cf6]">
                Crea tu cuenta
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#17213a] sm:text-5xl">
                Únete a Skilly
              </h2>

              <p className="mt-4 leading-7 text-[#777d8d]">
                Crea tu cuenta. Luego verificaremos tu correo y podrás elegir
                cómo quieres utilizar Skilly.
              </p>

              {/* FORMULARIO */}
              <form
                onSubmit={handleRegister}
                className="mt-8 space-y-5"
              >
                {/* NOMBRE */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#30364a]"
                  >
                    Nombre completo
                  </label>

                  <div className="flex items-center rounded-[16px] border border-[#e1e3ec] bg-white px-4 transition focus-within:border-[#8b75f7] focus-within:ring-4 focus-within:ring-[#6f4cf6]/10">
                    <span className="mr-3 text-lg text-[#989dae]">
                      👤
                    </span>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="Ej: María González"
                      autoComplete="name"
                      required
                      className="w-full bg-transparent py-3.5 text-sm text-[#30364a] outline-none placeholder:text-[#a4a8b5]"
                    />
                  </div>
                </div>

                {/* CORREO */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#30364a]"
                  >
                    Correo electrónico
                  </label>

                  <div className="flex items-center rounded-[16px] border border-[#e1e3ec] bg-white px-4 transition focus-within:border-[#8b75f7] focus-within:ring-4 focus-within:ring-[#6f4cf6]/10">
                    <span className="mr-3 text-lg text-[#989dae]">
                      ✉
                    </span>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      required
                      className="w-full bg-transparent py-3.5 text-sm text-[#30364a] outline-none placeholder:text-[#a4a8b5]"
                    />
                  </div>
                </div>

                {/* CONTRASEÑA */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#30364a]"
                  >
                    Contraseña
                  </label>

                  <div className="flex items-center rounded-[16px] border border-[#e1e3ec] bg-white px-4 transition focus-within:border-[#8b75f7] focus-within:ring-4 focus-within:ring-[#6f4cf6]/10">
                    <span className="mr-3 text-lg text-[#989dae]">
                      🔒
                    </span>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full bg-transparent py-3.5 text-sm text-[#30364a] outline-none placeholder:text-[#a4a8b5]"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#9297a6]">
                    Utiliza al menos 8 caracteres.
                  </p>
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#30364a]"
                  >
                    Confirmar contraseña
                  </label>

                  <div className="flex items-center rounded-[16px] border border-[#e1e3ec] bg-white px-4 transition focus-within:border-[#8b75f7] focus-within:ring-4 focus-within:ring-[#6f4cf6]/10">
                    <span className="mr-3 text-lg text-[#989dae]">
                      🔐
                    </span>

                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full bg-transparent py-3.5 text-sm text-[#30364a] outline-none placeholder:text-[#a4a8b5]"
                    />
                  </div>
                </div>

                {/* ERROR */}
                {errorMessage && (
                  <div className="rounded-[15px] border border-[#ffd2d2] bg-[#fff5f5] px-4 py-3 text-sm leading-6 text-[#c84b4b]">
                    {errorMessage}
                  </div>
                )}

                {/* TÉRMINOS */}
                <p className="text-xs leading-5 text-[#8b8f9d]">
                  Al crear tu cuenta aceptas los{" "}
                  <Link
                    href="/terminos"
                    className="font-semibold text-[#6f4cf6] hover:underline"
                  >
                    Términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacidad"
                    className="font-semibold text-[#6f4cf6] hover:underline"
                  >
                    Política de privacidad
                  </Link>
                  .
                </p>

                {/* CREAR CUENTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-[16px] bg-[#6e49f6] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(110,73,246,0.22)] transition hover:bg-[#5e3ee0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creando tu cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* SEPARADOR */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#ececf2]" />

                <span className="text-xs font-medium text-[#969aaa]">
                  O CONTINÚA CON
                </span>

                <div className="h-px flex-1 bg-[#ececf2]" />
              </div>

              {/* GOOGLE */}
              <GoogleLoginButton />

              {/* LOGIN */}
              <div className="mt-7 text-center">
                <p className="text-sm text-[#848997]">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#6f4cf6] hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>

              {/* SEGURIDAD */}
              <div className="mt-8 rounded-[20px] border border-[#ececf3] bg-[#fafaff] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eeeaff]">
                    🛡️
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#30364a]">
                      Protegemos tu cuenta
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#868b9b]">
                      Antes de comenzar a utilizar Skilly verificaremos tus
                      datos de contacto para aumentar la seguridad de la
                      comunidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}