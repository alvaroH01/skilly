"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  projectId: string;
  projectTitle: string;
  userRole?: "cliente" | "profesional";
};

export default function ReportIncidentModal({
  projectId,
  projectTitle,
  userRole = "cliente",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [incidentType, setIncidentType] = useState("inasistencia");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSendReport(e: React.FormEvent) {
    e.preventDefault();
    if (!details.trim()) {
      setError("Por favor describe lo sucedido para que el equipo de mediación pueda intervenir.");
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
        setError("Debes haber iniciado sesión.");
        return;
      }

      const reportBlock = `\n\n[INCIDENCIA REPORTADA POR ${userRole.toUpperCase()}]\n• Tipo: ${incidentType}\n• Fecha reporte: ${new Date().toLocaleString("es-CL")}\n• Detalle: ${details.trim()}\n• Estado mediación: pendiente`;

      // Obtenemos descripción actual y anexamos la incidencia
      const { data: currentProject } = await supabase
        .from("projects")
        .select("description")
        .eq("id", projectId)
        .single();

      const updatedDesc = `${currentProject?.description || ""}${reportBlock}`;

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          description: updatedDesc,
          status: "pausado", // Se pausa el proyecto temporalmente para mediación
        })
        .eq("id", projectId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2500);

      router.refresh();
    } catch (err: any) {
      console.error("Error registrando incidencia:", err);
      setError(err?.message || "No se pudo registrar la incidencia.");
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
        className="rounded-xl border border-[#fed7d7] bg-[#fffaf9] px-3.5 py-2.5 text-xs font-semibold text-[#c53030] transition hover:bg-[#fff2f0]"
      >
        ⚠️ Reportar Incidencia
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loading && !success) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-[540px] overflow-hidden rounded-[30px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
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

              <span className="rounded-full bg-[#ffebee] px-3 py-1 text-[11px] font-bold text-[#c53030]">
                Mediación & Reembolsos
              </span>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f8ef] text-3xl font-bold text-[#2d8f5d]">
                  ✓
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#222739]">
                  Incidencia Registrada
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#757a8a]">
                  Tu caso ha sido escalado al equipo de mediación de Skilly. Revisaremos la situación según los términos del servicio y nos pondremos en contacto contigo y la otra parte dentro de 24 horas hábiles para coordinar la reprogramación o el reembolso correspondiente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="mt-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#222739]">
                    Reportar Problema con el Servicio
                  </h3>
                  <p className="mt-1 text-xs text-[#7e8394]">
                    Proyecto: <strong className="text-[#33384a]">{projectTitle}</strong>
                  </p>

                  <div className="mt-3 rounded-2xl border border-[#fed7d7] bg-[#fffaf9] p-3 text-[11px] leading-5 text-[#9b2c2c]">
                    ⚖️ <strong>Política de Mediación Skilly:</strong> Nuestro equipo interviene ante inasistencias o suspensiones para asegurar el cumplimiento de compromisos o procesar reembolsos cuando corresponda.
                  </div>
                </div>

                {/* TIPO */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    Motivo de la incidencia
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e1e2e9] bg-white p-3 text-xs outline-none focus:border-[#8d79f6]"
                  >
                    <option value="inasistencia">Inasistencia a reunión o sesión coordinada</option>
                    <option value="cancelacion_solicitada">Solicitud de cancelación anticipada del servicio</option>
                    <option value="incumplimiento_entregables">Incumplimiento o retraso de entregables acordados</option>
                    <option value="solicitud_reembolso">Solicitud de mediación económica / reembolso</option>
                    <option value="otro">Otro problema de coordinación</option>
                  </select>
                </div>

                {/* DETALLE */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    Detalles de lo sucedido
                  </label>
                  <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe claramente la fecha, qué ocurrió y qué solución requieres (reprogramación, devolución de pago o mediación)..."
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
                    className="flex-1 rounded-2xl border border-[#e0e1e8] py-3 text-xs font-semibold text-[#666b79] transition hover:bg-[#f8f8fb] disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[#c53030] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#9b2c2c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Enviando reporte..." : "Enviar a Mediación Skilly"}
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
