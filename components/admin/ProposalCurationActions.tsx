"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  proposalId: string;
  currentAmount: number | null;
  currentMessage: string;
  professionalName: string;
  projectTitle: string;
};

export default function ProposalCurationActions({
  proposalId,
  currentAmount,
  currentMessage,
  professionalName,
  projectTitle,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState(
    currentAmount ? String(currentAmount) : ""
  );
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSaveCuration() {
    if (!observations.trim()) {
      setError("Por favor ingresa una recomendación u observación para el profesional.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      // Formateamos el bloque oficial de retroalimentación de Skilly
      const curationBlock = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✦ [RETROALIMENTACIÓN DE SKILLY LATAM]\n• Tarifa recomendada por Skilly: $${Number(suggestedAmount || 0).toLocaleString("es-CL")} CLP\n• Observaciones del equipo: ${observations.trim()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Limpiamos mensajes previos de Skilly si ya existía alguno
      const baseMessage = currentMessage.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")[0].trim();
      const updatedMessage = `${baseMessage}${curationBlock}`;

      const { error: updateError } = await supabase
        .from("proposals")
        .update({
          message: updatedMessage,
        })
        .eq("id", proposalId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setModalOpen(false);
      }, 1500);

      router.refresh();
    } catch (err: any) {
      console.error("Error guardando curaduría de Skilly:", err);
      setError(err?.message || "No se pudo guardar la retroalimentación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setSuccess(false);
          setModalOpen(true);
        }}
        className="rounded-xl border border-[#ded8f5] bg-white px-4 py-2.5 text-xs font-semibold text-[#6848ef] transition hover:bg-[#f6f3ff]"
      >
        ✦ Curaduría y sugerir tarifa
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#171b2d]/40 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!loading) setModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-[540px] rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff] text-xl text-[#6848ef]">
              ✦
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#22273b]">
              Curaduría de Propuesta
            </h2>

            <p className="mt-1 text-xs text-[#7d8291]">
              Acompañamiento a <strong className="text-[#32374a]">{professionalName}</strong> en{" "}
              <span className="italic">{projectTitle}</span>
            </p>

            <div className="mt-5 rounded-2xl bg-[#faf9fd] p-4 text-xs text-[#6e7383]">
              <p>
                <strong>Propuesta inicial del profesional:</strong>{" "}
                {currentAmount
                  ? `$${currentAmount.toLocaleString("es-CL")} CLP`
                  : "Monto a convenir"}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#303548]">
                  Tarifa sugerida por Skilly (CLP)
                </label>
                <div className="mt-1.5 flex items-center rounded-2xl border border-[#e1e2e9] px-4">
                  <span className="text-sm text-[#858997]">$</span>
                  <input
                    type="number"
                    value={suggestedAmount}
                    onChange={(e) => setSuggestedAmount(e.target.value)}
                    placeholder="Ej: 350000"
                    className="w-full px-3 py-3 text-sm outline-none"
                  />
                  <span className="text-xs font-medium text-[#999daa]">CLP</span>
                </div>
                <p className="mt-1 text-[11px] text-[#9397a6]">
                  Ajusta el valor al estándar real de mercado si el profesional cobró de menos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#303548]">
                  Observaciones y alcance sugerido
                </label>
                <textarea
                  rows={4}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ej: Te recomendamos elevar la tarifa a $350.000 para reflejar el alcance completo del proyecto y detallar los entregables de la primera semana..."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-[#e1e2e9] p-3 text-xs leading-5 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-[#fff0f0] p-3 text-xs font-medium text-[#c84949]">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl bg-[#e7f8ef] p-3 text-xs font-medium text-[#2d875a]">
                ✓ Retroalimentación enviada al profesional con éxito.
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-2xl border border-[#e1e2e8] py-3 text-xs font-semibold text-[#666b79] transition hover:bg-[#f8f8fa] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveCuration}
                className="flex-1 rounded-2xl bg-[#6f4cf6] py-3 text-xs font-semibold text-white transition hover:bg-[#5f3de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Enviar recomendación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
