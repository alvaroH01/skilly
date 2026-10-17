"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  projectId: string;
  currentStatus: string;
  projectTitle: string;
};

export default function ProjectValidationActions({
  projectId,
  currentStatus,
  projectTitle,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus);

  async function updateProjectStatus(newStatus: "activo" | "pausado" | "rechazado") {
    try {
      setLoading(true);
      setMessage(null);

      const supabase = createClient();

      const { error } = await supabase
        .from("projects")
        .update({
          status: newStatus,
        })
        .eq("id", projectId);

      if (error) {
        throw new Error(error.message);
      }

      setStatus(newStatus);
      if (newStatus === "activo") {
        setMessage("✓ Proyecto validado y publicado exitosamente en el catálogo.");
      } else if (newStatus === "pausado") {
        setMessage("Proyecto pausado.");
      } else {
        setMessage("Proyecto rechazado.");
      }

      router.refresh();
    } catch (err: any) {
      console.error("Error actualizando estado del proyecto:", err);
      setMessage(`Error: ${err?.message || "No se pudo actualizar el estado"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {message && (
        <div
          className={`rounded-xl px-4 py-2.5 text-xs font-medium ${
            message.startsWith("✓")
              ? "bg-[#eaf8f1] text-[#2c8a5a]"
              : message.startsWith("Error")
              ? "bg-[#fff0f0] text-[#c94545]"
              : "bg-[#f5f4f8] text-[#696e7e]"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {status !== "activo" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateProjectStatus("activo")}
            className="flex items-center gap-2 rounded-xl bg-[#6f4cf6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "✓ Validar y Publicar"}
          </button>
        )}

        {status === "activo" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateProjectStatus("pausado")}
            className="rounded-xl border border-[#ded9e8] bg-white px-4 py-2.5 text-xs font-semibold text-[#666b7a] transition hover:bg-[#f8f8fc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pausar proyecto
          </button>
        )}

        {status === "pendiente_validacion" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateProjectStatus("rechazado")}
            className="rounded-xl border border-[#f0d5d5] bg-[#fffbfb] px-4 py-2.5 text-xs font-semibold text-[#b84a4a] transition hover:bg-[#fff2f2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Rechazar
          </button>
        )}
      </div>
    </div>
  );
}
