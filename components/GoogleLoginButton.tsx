"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/clients";

import { errorMessage as getErrorMessage } from "@/utils/services";
export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error iniciando sesión con Google:", error.message);
        setErrorMessage(
          error.message.includes("not enabled") || error.message.includes("provider")
            ? "El proveedor de Google no está configurado en Supabase (requiere Client ID y Client Secret de Google Cloud)."
            : `Error de autenticación: ${error.message}`
        );
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Error inesperado con Google:", err);
      setErrorMessage(getErrorMessage(err, "No se pudo conectar con el servicio de autenticación."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e4e4ef] bg-white px-5 py-3.5 text-sm font-semibold text-[#30364a] transition hover:bg-[#f8f7ff] disabled:opacity-60"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.97-.9 6.63-2.39l-3.24-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.93v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.39 3.13 1.05 4.53l3.34-2.6Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.67 9.67 0 0 0 12 2a10 10 0 0 0-8.95 5.47l3.34 2.6C7.18 7.7 9.39 5.94 12 5.94Z"
          />
        </svg>

        {loading ? "Conectando con Google..." : "Continuar con Google"}
      </button>

      {errorMessage && (
        <div className="rounded-xl border border-[#fed7d7] bg-[#fffaf9] p-3 text-center text-xs leading-5 text-[#c53030]">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
