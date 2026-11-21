"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

/**
 * Botón de cierre de sesión del panel de administración.
 *
 * Llama a supabase.auth.signOut() y refresca la ruta para que las páginas de servidor vuelvan a validar la sesión.
 *
 * @returns Botón con estado de carga y mensaje de error.
 */
export default function AdminLogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      // Volver a la página principal
      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(
        "Error cerrando sesión:",
        err
      );

      setError(
        "No pudimos cerrar la sesión. Inténtalo nuevamente."
      );

      setLoading(false);
    }
  }

  return (
    <div className="mt-3">

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5e1ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#6f7482] transition hover:border-[#d8d0ff] hover:bg-[#f4f1ff] hover:text-[#6848ef] disabled:cursor-not-allowed disabled:opacity-50"
      >

        {/* ICONO CERRAR SESIÓN */}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M10 5H6.5C5.12 5 4 6.12 4 7.5V16.5C4 17.88 5.12 19 6.5 19H10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M14 8L18 12L14 16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M9 12H18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {loading
          ? "Cerrando sesión..."
          : "Cerrar sesión"}

      </button>

      {/* ERROR */}

      {error && (
        <p className="mt-2 text-center text-xs leading-5 text-[#c95151]">
          {error}
        </p>
      )}

    </div>
  );
}