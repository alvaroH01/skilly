"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

import { errorMessage } from "@/utils/services";
type Props = {
  projectId: string;
  projectTitle: string;
};

export default function PrivateEvaluationModal({
  projectId,
  projectTitle,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [deadlinesRating, setDeadlinesRating] = useState("conforme");
  const [qualityRating, setQualityRating] = useState("conforme");
  const [communicationRating, setCommunicationRating] = useState("fluida");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  async function handleSubmitEvaluation(e: React.FormEvent) {
    e.preventDefault();
    if (!strengths.trim() && !improvements.trim()) {
      setError("Por favor comparte tus comentarios para apoyar la mejora continua del profesional.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Debes iniciar sesión para enviar tu evaluación.");
        return;
      }

      // La evaluación se guarda como un documento JSONB en la tabla private_evaluations
      // mediante la función submit_private_evaluation (solo la lee el administrador).
      const { error: rpcError } = await supabase.rpc("submit_private_evaluation", {
        p_project_id: projectId,
        p_payload: {
          plazos: deadlinesRating,
          calidad: qualityRating,
          comunicacion: communicationRating,
          fortalezas: strengths.trim(),
          mejoras: improvements.trim(),
        },
      });

      if (rpcError) throw rpcError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);

      router.refresh();
    } catch (err: unknown) {
      console.error("Error enviando evaluación privada:", err);
      setError(errorMessage(err, "No se pudo registrar la evaluación."));
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
          setOpen(true);
        }}
        className="rounded-xl border border-[#dcd6f7] bg-[#f9f8ff] px-4 py-2.5 text-xs font-semibold text-[#6848ef] transition hover:bg-[#f0ecff]"
      >
        ✦ Evaluación Privada
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loading && !success) setOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CABECERA CON LOGO ARRIBA A LA IZQUIERDA */}
            <div className="flex items-center justify-between border-b border-[#efedf5] pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-skilly-clean.png"
                  alt="Skilly LATAM"
                  width={140}
                  height={50}
                  priority
                  className="h-auto w-[125px] object-contain"
                />
              </div>

              <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-[11px] font-bold text-[#6848ef]">
                Confidencial
              </span>
            </div>

            {success ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f8ef] text-3xl font-bold text-[#2d8f5d]">
                  ✓
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#23283a]">
                  ¡Gracias por tu evaluación!
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#757a8a]">
                  Tu retroalimentación ha sido enviada de forma privada al equipo de People & Culture de Skilly para apoyar el acompañamiento y desarrollo continuo del profesional.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEvaluation} className="mt-5 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#222739]">
                    Evaluación Privada de Desempeño
                  </h3>
                  <p className="mt-1 text-xs text-[#7e8394]">
                    Proyecto: <strong className="text-[#33384a]">{projectTitle}</strong>
                  </p>

                  <div className="mt-3 rounded-2xl border border-[#ece7fb] bg-[#f8f6ff] p-3 text-[11px] leading-5 text-[#6c6194]">
                    🔒 <strong>Política de Skilly LATAM:</strong> No utilizamos estrellas ni rankings públicos. Tu evaluación es 100% privada para el equipo de Skilly con el fin de guiar y potenciar el talento profesional.
                  </div>
                </div>

                {/* 1. PLAZOS */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    1. Cumplimiento de plazos y compromisos
                  </label>
                  <select
                    value={deadlinesRating}
                    onChange={(e) => setDeadlinesRating(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e1e2e9] bg-white p-3 text-xs outline-none focus:border-[#8d79f6]"
                  >
                    <option value="excelente">Excelente (entregó a tiempo o antes de lo previsto)</option>
                    <option value="conforme">Conforme (acorde a los acuerdos establecidos)</option>
                    <option value="retrasos_justificados">Presentó retrasos pero con justificación y aviso oportuno</option>
                    <option value="retrasos_no_avisados">Presentó retrasos significativos sin comunicación previa</option>
                  </select>
                </div>

                {/* 2. CALIDAD TÉCNICA */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    2. Calidad técnica y rigor de los entregables
                  </label>
                  <select
                    value={qualityRating}
                    onChange={(e) => setQualityRating(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e1e2e9] bg-white p-3 text-xs outline-none focus:border-[#8d79f6]"
                  >
                    <option value="supero_expectativas">Superó las expectativas del requerimiento</option>
                    <option value="conforme">Cumplió cabalmente con lo solicitado</option>
                    <option value="requirio_ajustes">Requirió múltiples rondas de corrección</option>
                    <option value="insuficiente">No alcanzó el nivel técnico esperado</option>
                  </select>
                </div>

                {/* 3. COMUNICACIÓN */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    3. Comunicación y proactividad
                  </label>
                  <select
                    value={communicationRating}
                    onChange={(e) => setCommunicationRating(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e1e2e9] bg-white p-3 text-xs outline-none focus:border-[#8d79f6]"
                  >
                    <option value="fluida">Fluida, proactiva y orientada a soluciones</option>
                    <option value="adecuada">Adecuada y respetuosa</option>
                    <option value="falto_comunicacion">Faltó mayor claridad y respuesta oportuna</option>
                  </select>
                </div>

                {/* 4. FORTALEZAS */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    4. Principales fortalezas observadas
                  </label>
                  <textarea
                    rows={3}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Ej: Gran dominio en metodologías ágiles, excelente disposición a colaborar y resolución ágil..."
                    className="mt-1.5 w-full resize-none rounded-2xl border border-[#e1e2e9] p-3 text-xs leading-5 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
                  />
                </div>

                {/* 5. ÁREAS DE MEJORA */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    5. Oportunidades de mejora o recomendaciones para el profesional
                  </label>
                  <textarea
                    rows={3}
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ej: Recomendamos detallar de forma más visible los avances semanales..."
                    className="mt-1.5 w-full resize-none rounded-2xl border border-[#e1e2e9] p-3 text-xs leading-5 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-[#fff0f0] p-3 text-xs font-medium text-[#c84949]">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-2xl border border-[#e0e1e8] py-3 text-xs font-semibold text-[#666b7a] transition hover:bg-[#f8f8fb] disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[#6f4cf6] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Enviando..." : "Enviar evaluación privada"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
