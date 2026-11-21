"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";
import { errorMessage } from "@/utils/services";

type Props = {
  serviceId: string;
  validationStatus: string;
  currentPrice: number;
};

const inputClass =
  "w-full rounded-xl border border-[#e2e1e9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9b8af8] focus:ring-4 focus:ring-[#6f4cf6]/10";

/**
 * Acciones de revisión de un servicio del catálogo por el administrador.
 *
 * Llama a la función review_service con la acción «en_revision», «cambios» o «aprobar», y con observaciones y un precio sugerido opcional. La función valida que quien llama sea administrador y notifica al Profesional.
 *
 * @param props.serviceId Servicio que se revisa.
 * @param props.validationStatus Estado de validación actual; define qué botones se muestran.
 * @param props.currentPrice Precio vigente del servicio, usado como referencia para la sugerencia.
 *
 * @returns Formulario de observaciones, precio sugerido y botones de acción.
 */
export default function ServiceReviewActions({ serviceId, validationStatus, currentPrice }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [suggested, setSuggested] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function review(action: "en_revision" | "cambios" | "aprobar") {
    try {
      setBusy(true);
      setError("");
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("review_service", {
        p_service_id: serviceId,
        p_action: action,
        p_notes: notes.trim() || null,
        p_suggested_price: suggested ? Number(suggested) : null,
      });
      if (rpcError) throw rpcError;
      setNotes("");
      setSuggested("");
      router.refresh();
    } catch (err: unknown) {
      setError(errorMessage(err, "No se pudo registrar la revisión."));
    } finally {
      setBusy(false);
    }
  }

  // Solo se revisa lo que está pendiente o en revisión.
  if (validationStatus !== "pendiente" && validationStatus !== "en_revision") {
    return (
      <p className="text-xs text-[#8a8fa0]">
        {validationStatus === "propuesta_final"
          ? "Esperando que el profesional acepte la propuesta final."
          : validationStatus === "cambios_solicitados"
            ? "Esperando que el profesional ajuste y reenvíe el servicio."
            : "Sin acciones pendientes."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[90px]`}
        placeholder="Observaciones para el profesional (alcance, presentación comercial, tarifa de mercado...)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className={`${inputClass} sm:max-w-[230px]`}
          inputMode="numeric"
          placeholder={`Tarifa sugerida (actual ${currentPrice.toLocaleString("es-CL")})`}
          value={suggested}
          onChange={(e) => setSuggested(e.target.value.replace(/\D/g, ""))}
        />
        <div className="flex flex-wrap gap-2">
          {validationStatus === "pendiente" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => review("en_revision")}
              className="rounded-xl border border-[#e1e2e8] px-4 py-2.5 text-xs font-semibold text-[#626776] hover:bg-[#f8f8fb] disabled:opacity-60"
            >
              Tomar para revisión
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => review("cambios")}
            className="rounded-xl bg-[#fff0ec] px-4 py-2.5 text-xs font-semibold text-[#c0442b] hover:bg-[#ffe4dc] disabled:opacity-60"
          >
            Solicitar ajustes
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => review("aprobar")}
            className="rounded-xl bg-[#6f4cf6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#6241e8] disabled:opacity-60"
          >
            Aprobar y enviar propuesta final
          </button>
        </div>
      </div>
      <p className="text-xs text-[#8a8fa0]">
        Al aprobar, el servicio no se publica todavía: el profesional debe aceptar la propuesta final.
      </p>
      {error && <p className="text-xs text-[#c84949]">{error}</p>}
    </div>
  );
}
