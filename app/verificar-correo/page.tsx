"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";

function VerificarCorreoContent() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const maskedEmail = useMemo(() => {
    if (!email || !email.includes("@")) {
      return email;
    }

    const [name, domain] = email.split("@");

    if (!name) {
      return email;
    }

    const visibleStart = name.slice(0, Math.min(2, name.length));
    const hiddenLength = Math.max(name.length - visibleStart.length, 3);

    return `${visibleStart}${"*".repeat(hiddenLength)}@${domain}`;
  }, [email]);

  const handleResendEmail = async () => {
    if (!email || loading || seconds > 0) return;

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/email-confirmed`,
        },
      });

      if (error) {
        console.error("Error reenviando correo:", error);

        setErrorMessage(
          "No pudimos reenviar el correo en este momento. Inténtalo nuevamente."
        );

        return;
      }

      setMessage(
        "Te enviamos un nuevo correo de verificación."
      );

      setSeconds(60);
    } catch (error) {
      console.error("Error inesperado:", error);

      setErrorMessage(
        "Ocurrió un error inesperado al reenviar el correo."
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
              width={180}
              height={70}
              priority
              className="h-auto w-[150px] object-contain sm:w-[170px]"
            />
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#e4e6ef] bg-white px-5 py-2.5 text-sm font-medium text-[#53586d] transition hover:bg-[#fafaff]"
          >
            Ir a iniciar sesión
          </Link>
        </header>

        <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden border-t border-[#eeeef4] bg-gradient-to-br from-[#f8f5ff] via-[#f7fbff] to-[#fffaf4] px-6 py-16">
          {/* DECORACIONES */}
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#c9bfff]/35 blur-3xl" />
          <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-[#a9ddff]/35 blur-3xl" />
          <div className="absolute bottom-10 left-[40%] h-52 w-52 rounded-full bg-[#ffd7bd]/30 blur-3xl" />

          <div className="relative z-10 w-full max-w-[620px]">
            <div className="rounded-[32px] border border-white/80 bg-white/95 p-7 text-center shadow-[0_30px_80px_rgba(80,70,130,0.12)] backdrop-blur sm:p-10">
              {/* ICONO */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#eeeaff] text-4xl">
                ✉️
              </div>

              <span className="mt-7 inline-flex rounded-full bg-[#f2efff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6e49f6]">
                Verificación de correo
              </span>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#17213a] sm:text-4xl">
                Revisa tu correo
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#73798a] sm:text-base">
                Te enviamos un correo de confirmación para verificar que esta
                dirección te pertenece.
              </p>

              {email && (
                <div className="mx-auto mt-6 max-w-md rounded-[18px] border border-[#e8e7f2] bg-[#faf9ff] px-5 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#9a9eac]">
                    Correo enviado a
                  </p>

                  <p className="mt-2 break-all font-semibold text-[#30364a]">
                    {maskedEmail}
                  </p>
                </div>
              )}

              {/* PASOS */}
              <div className="mt-8 space-y-3 text-left">
                <div className="flex items-start gap-4 rounded-[18px] border border-[#ececf3] bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-sm font-bold text-[#6e49f6]">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#30364a]">
                      Abre tu bandeja de entrada
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#858a9a]">
                      Busca el correo de confirmación enviado por Skilly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[18px] border border-[#ececf3] bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9f8f0] text-sm font-bold text-[#29986a]">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#30364a]">
                      Confirma tu dirección
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#858a9a]">
                      Presiona el enlace de confirmación que aparece dentro del
                      correo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[18px] border border-[#ececf3] bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff3dc] text-sm font-bold text-[#c68b25]">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#30364a]">
                      Continúa en Skilly
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#858a9a]">
                      Después de verificar tu correo podrás continuar con la
                      configuración de tu cuenta.
                    </p>
                  </div>
                </div>
              </div>

              {/* MENSAJES */}
              {message && (
                <div className="mt-6 rounded-[16px] border border-[#cdebdc] bg-[#f1fbf6] px-4 py-3 text-sm text-[#348260]">
                  {message}
                </div>
              )}

              {errorMessage && (
                <div className="mt-6 rounded-[16px] border border-[#ffd2d2] bg-[#fff5f5] px-4 py-3 text-sm text-[#c84b4b]">
                  {errorMessage}
                </div>
              )}

              {/* REENVIAR */}
              <div className="mt-8 border-t border-[#eeeeF4] pt-7">
                <p className="text-sm text-[#858a9a]">
                  ¿No recibiste el correo?
                </p>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={!email || loading || seconds > 0}
                  className="mt-3 inline-flex items-center justify-center rounded-[14px] border border-[#dcd8f4] bg-white px-5 py-3 text-sm font-semibold text-[#6e49f6] transition hover:bg-[#f7f5ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Reenviando..."
                    : seconds > 0
                      ? `Podrás reenviar en ${seconds}s`
                      : "Reenviar correo"}
                </button>

                <p className="mt-5 text-xs leading-5 text-[#9a9eac]">
                  Si no aparece en unos minutos, revisa también las carpetas de
                  spam, correo no deseado o promociones.
                </p>
              </div>

              {/* CAMBIAR CORREO */}
              <div className="mt-6">
                <Link
                  href="/registro"
                  className="text-sm font-semibold text-[#626879] transition hover:text-[#6e49f6]"
                >
                  ← Cambiar correo o volver al registro
                </Link>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#969aaa]">
              <span>🔒</span>
              <span>
                Tu cuenta no estará completamente habilitada hasta verificar el
                correo.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerificarCorreoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f8fc]" />}>
      <VerificarCorreoContent />
    </Suspense>
  );
}
