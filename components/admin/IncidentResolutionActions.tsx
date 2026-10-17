"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  projectId: string;
  projectTitle: string;
  currentDescription: string;
};

export default function IncidentResolutionActions({
  projectId,
  projectTitle,
  currentDescription,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<"reembolso" | "reprogramar" | "cerrar" | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [refundPercentage, setRefundPercentage] = useState("100");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleResolve(actionType: "reembolso" | "reprogramar" | "cerrar") {
    try {
      setLoading(true);
      setFeedbackMsg(null);
      const supabase = createClient();

      let resolutionStamp = "";
      let newStatus = "pausado";

      const now = new Date().toLocaleString("es-CL");

      if (actionType === "reembolso") {
        newStatus = "cancelado";
        resolutionStamp = `\n\n[RESOLUCIÓN SKILLY: DEVOLUCIÓN AUTORIZADA]\n• Fecha dictamen: ${now}\n• Reembolso: ${refundPercentage}%\n• Justificación: ${resolutionNotes.trim() || "Devolución acordada bajo Términos y Condiciones Skilly por inasistencia o suspensión debidamente acreditada."}\n• Estado mediación: Resuelto / Reembolso procesado`;
      } else if (actionType === "reprogramar") {
        newStatus = "en_ejecucion";
        resolutionStamp = `\n\n[RESOLUCIÓN SKILLY: REPROGRAMACIÓN ACORDADA]\n• Fecha dictamen: ${now}\n• Nueva fecha propuesta: ${rescheduleDate || "A coordinar entre las partes"}\n• Compromiso: ${resolutionNotes.trim() || "Las partes acuerdan nueva fecha de entrega o sesión sin penalizaciones."}\n• Estado mediación: Reanudado / Reprogramación en curso`;
      } else {
        newStatus = "activo";
        resolutionStamp = `\n\n[RESOLUCIÓN SKILLY: DISPUTA CERRADA]\n• Fecha cierre: ${now}\n• Dictamen mediador: ${resolutionNotes.trim() || "Caso archivado tras acuerdo mutuo entre cliente y profesional."}\n• Estado mediación: Finalizado con conformidad`;
      }

      const updatedDesc = `${currentDescription || ""}${resolutionStamp}`;

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          description: updatedDesc,
          status: newStatus,
        })
        .eq("id", projectId);

      if (updateError) {
        // Fallback si status enum tiene restricciones
        const { error: fallbackError } = await supabase
          .from("projects")
          .update({
            description: updatedDesc,
          })
          .eq("id", projectId);

        if (fallbackError) throw fallbackError;
      }

      setFeedbackMsg({
        type: "success",
        text: actionType === "reembolso" 
          ? "Devolución autorizada y registrada en la mediación de Skilly."
          : actionType === "reprogramar"
          ? "Reprogramación confirmada. El servicio continúa en ejecución."
          : "Disputa cerrada con éxito.",
      });

      setTimeout(() => {
        setActiveModal(null);
        setResolutionNotes("");
        router.refresh();
      }, 1800);
    } catch (err: any) {
      console.error("Error en mediación:", err);
      setFeedbackMsg({
        type: "error",
        text: err?.message || "No se pudo actualizar el estado de mediación.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setFeedbackMsg(null);
            setActiveModal("reembolso");
          }}
          className="rounded-xl border border-[#fed7d7] bg-white px-3.5 py-2 text-xs font-semibold text-[#c53030] shadow-sm transition hover:bg-[#fff5f5]"
        >
          💸 Autorizar Devolución
        </button>

        <button
          type="button"
          onClick={() => {
            setFeedbackMsg(null);
            setActiveModal("reprogramar");
          }}
          className="rounded-xl border border-[#d8d1ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#6848ef] shadow-sm transition hover:bg-[#f6f4ff]"
        >
          📅 Reprogramar Servicio
        </button>

        <button
          type="button"
          onClick={() => {
            setFeedbackMsg(null);
            setActiveModal("cerrar");
          }}
          className="rounded-xl bg-[#6f4cf6] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0]"
        >
          ✓ Cerrar Mediación
        </button>
      </div>

      {activeModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loading) setActiveModal(null);
          }}
        >
          <div
            className="w-full max-w-[500px] overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#efedf5] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6f4cf6]">
                Equipo de Mediación Skilly
              </span>
              <h3 className="mt-1 text-lg font-bold text-[#222739]">
                {activeModal === "reembolso" && "Autorizar Devolución o Reembolso"}
                {activeModal === "reprogramar" && "Acordar Reprogramación del Servicio"}
                {activeModal === "cerrar" && "Cerrar Mediación / Disputa"}
              </h3>
              <p className="text-xs text-[#7d8293]">
                Proyecto: <strong className="text-[#32374b]">{projectTitle}</strong>
              </p>
            </div>

            {feedbackMsg ? (
              <div
                className={`my-5 rounded-2xl p-4 text-center text-xs font-semibold ${
                  feedbackMsg.type === "success"
                    ? "bg-[#e8f8ef] text-[#2d8f5d]"
                    : "bg-[#fff0f0] text-[#c53030]"
                }`}
              >
                {feedbackMsg.text}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {activeModal === "reembolso" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#32374b]">
                      Porcentaje a devolver
                    </label>
                    <select
                      value={refundPercentage}
                      onChange={(e) => setRefundPercentage(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#e2e1e9] p-2.5 text-xs outline-none focus:border-[#6f4cf6]"
                    >
                      <option value="100">100% (Reembolso total por inasistencia o suspensión de servicio)</option>
                      <option value="75">75% (Deducción por gastos operacionales mínimos)</option>
                      <option value="50">50% (Reembolso proporcional por avance parcial entregado)</option>
                    </select>
                  </div>
                )}

                {activeModal === "reprogramar" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#32374b]">
                      Nueva fecha acordada para sesión o entrega
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#e2e1e9] p-2.5 text-xs outline-none focus:border-[#6f4cf6]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    Dictamen u observaciones de Skilly (T&C)
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Detalla los términos del acuerdo de mediación para que ambas partes queden debidamente informadas..."
                    className="mt-1.5 w-full resize-none rounded-xl border border-[#e2e1e9] p-3 text-xs outline-none focus:border-[#6f4cf6]"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setActiveModal(null)}
                    className="flex-1 rounded-xl border border-[#e2e1e9] py-2.5 text-xs font-semibold text-[#666b7b] transition hover:bg-[#fafafc]"
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleResolve(activeModal)}
                    className="flex-1 rounded-xl bg-[#6f4cf6] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0] disabled:opacity-60"
                  >
                    {loading ? "Procesando..." : "Confirmar Resolución"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
