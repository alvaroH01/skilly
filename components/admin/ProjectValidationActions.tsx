"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  projectId: string;
  currentStatus: string;
  validationStatus?: string;
  projectTitle: string;
};

export default function ProjectValidationActions({
  projectId,
  currentStatus,
  validationStatus = "no_enviado",
  projectTitle,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus);
  const [validation, setValidation] = useState(validationStatus);

  type Action = "validar" | "cambios" | "pausar" | "reactivar";

  async function runAction(action: Action) {
    try {
      setLoading(true);
      setMessage(null);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Debes iniciar sesión.");
      }

      // Los cambios usan los estados reales de la base de datos.
      // Las políticas RLS y el trigger guard_project_status solo permiten
      // validar o publicar a cuentas con rol admin.
      let changes: Record<string, unknown>;

      if (action === "validar") {
        changes = {
          status: "activo",
          validation_status: "validado",
          validated_by: user.id,
          validated_at: new Date().toISOString(),
        };
      } else if (action === "cambios") {
        changes = { status: "borrador", validation_status: "cambios_solicitados" };
      } else if (action === "pausar") {
        changes = { status: "pausado" };
      } else {
        changes = { status: "activo" };
      }

      // .select() permite detectar si RLS dejó la actualización en 0 filas
      const { data, error } = await supabase
        .from("projects")
        .update(changes)
        .eq("id", projectId)
        .select("status, validation_status");

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error(
          "No se pudo actualizar: la cuenta no tiene permisos de administrador."
        );
      }

      setStatus(data[0].status);
      setValidation(data[0].validation_status);

      if (action === "validar") {
        setMessage("✓ Proyecto validado y publicado exitosamente en el catálogo.");
      } else if (action === "cambios") {
        setMessage("Se solicitaron cambios al cliente.");
      } else if (action === "pausar") {
        setMessage("Proyecto pausado.");
      } else {
        setMessage("✓ Proyecto reactivado.");
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
        {status === "borrador" && validation !== "no_enviado" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runAction("validar")}
            className="flex items-center gap-2 rounded-xl bg-[#6f4cf6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "✓ Validar y Publicar"}
          </button>
        )}

        {status === "borrador" &&
          ["pendiente", "reunion_agendada", "en_revision"].includes(validation) && (
            <button
              type="button"
              disabled={loading}
              onClick={() => runAction("cambios")}
              className="rounded-xl border border-[#f0d5d5] bg-[#fffbfb] px-4 py-2.5 text-xs font-semibold text-[#b84a4a] transition hover:bg-[#fff2f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Solicitar cambios
            </button>
          )}

        {status === "borrador" && validation === "no_enviado" && (
          <span className="text-xs text-[#8f94a2]">
            Borrador: el cliente aún no lo envía a validación.
          </span>
        )}

        {status === "activo" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runAction("pausar")}
            className="rounded-xl border border-[#ded9e8] bg-white px-4 py-2.5 text-xs font-semibold text-[#666b7a] transition hover:bg-[#f8f8fc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pausar proyecto
          </button>
        )}

        {status === "pausado" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runAction("reactivar")}
            className="rounded-xl border border-[#ded9e8] bg-white px-4 py-2.5 text-xs font-semibold text-[#666b7a] transition hover:bg-[#f8f8fc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reactivar proyecto
          </button>
        )}
      </div>
    </div>
  );
}
