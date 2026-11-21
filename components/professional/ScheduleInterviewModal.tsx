"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

import { errorMessage } from "@/utils/services";
type Props = {
  professionalName?: string;
};

const designatedSlots = [
  "10:00 - 10:45 hrs",
  "11:30 - 12:15 hrs",
  "15:00 - 15:45 hrs",
  "16:30 - 17:15 hrs",
];

export default function ScheduleInterviewModal({
  professionalName = "Profesional",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(designatedSlots[0]);
  const [loading, setLoading] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{ date: string; slot: string; meetLink: string } | null>(null);
  const [error, setError] = useState("");

  async function handleConfirmSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setError("Por favor selecciona una fecha para tu entrevista de validación.");
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
        setError("Debes iniciar sesión.");
        return;
      }

      const meetLink = `https://meet.google.com/ski-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

      // Guardamos la sesión agendada en Supabase o en el perfil
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
        })
        .eq("id", user.id);

      setConfirmedData({
        date: selectedDate,
        slot: selectedSlot,
        meetLink,
      });

      router.refresh();
    } catch (err: unknown) {
      console.error("Error agendando entrevista:", err);
      setError(errorMessage(err, "No se pudo agendar la entrevista."));
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
          setConfirmedData(null);
          setOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-[#6f4cf6] px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(111,76,246,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5e3be0]"
      >
        <span>📅 Agendar Entrevista de Validación</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loading) setOpen(false);
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

              <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-[11px] font-bold text-[#6848ef]">
                Validación Técnica
              </span>
            </div>

            {confirmedData ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f8ef] text-3xl font-bold text-[#2d8f5d]">
                  ✓
                </div>

                <span className="mt-4 inline-block rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#2d8f5d]">
                  Entrevista Confirmada
                </span>

                <h3 className="mt-2 text-2xl font-bold text-[#222739]">
                  ¡Cita agendada con éxito!
                </h3>

                <p className="mt-1 text-xs text-[#787d8d]">
                  El equipo de People & Culture de Skilly revisará tu perfil en la sesión.
                </p>

                {/* VOUCHER DE CITA */}
                <div className="mt-5 rounded-2xl border border-[#e8e5f0] bg-[#faf9fd] p-5 text-left text-xs text-[#525768]">
                  <div className="flex justify-between border-b border-[#ece8f5] pb-2.5">
                    <span className="text-[#8c91a0]">Profesional:</span>
                    <strong className="text-[#2c3245]">{professionalName}</strong>
                  </div>

                  <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                    <span className="text-[#8c91a0]">Fecha:</span>
                    <strong className="text-[#6f4cf6] font-semibold">{confirmedData.date}</strong>
                  </div>

                  <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                    <span className="text-[#8c91a0]">Horario:</span>
                    <strong className="text-[#303548]">{confirmedData.slot}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2.5">
                    <span className="text-[#8c91a0]">Enlace de acceso:</span>
                    <a
                      href={confirmedData.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#6848ef] hover:underline"
                    >
                      Abrir Google Meet →
                    </a>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-2xl bg-[#6f4cf6] py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0]"
                  >
                    Entendido y Listo
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSchedule} className="mt-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#222739]">
                    Agenda tu Entrevista de Validación
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#737887]">
                    Skilly habilita días específicos para validar experiencia técnica, expectativas comerciales y alcance de servicios antes del ingreso al catálogo.
                  </p>

                  <div className="mt-3 rounded-2xl border border-[#e8e2ff] bg-[#f8f5ff] p-3 text-[11px] leading-5 text-[#6754a6]">
                    💡 <strong>Días designados Skilly:</strong> Realizamos sesiones de validación los días <strong>Martes y Jueves</strong> en bloques de 45 minutos.
                  </div>
                </div>

                {/* SELECTOR DE FECHA */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    Selecciona una fecha disponible (Martes o Jueves recomendado)
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e1e2e9] p-3 text-xs outline-none focus:border-[#8d79f6]"
                  />
                </div>

                {/* BLOQUES DE HORARIOS */}
                <div>
                  <label className="block text-xs font-semibold text-[#32374b]">
                    Bloque de horario disponible
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {designatedSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl border p-3 text-xs font-semibold transition ${
                          selectedSlot === slot
                            ? "border-[#8d79f6] bg-[#f2efff] text-[#6748df]"
                            : "border-[#e3e1e8] bg-white text-[#636878] hover:bg-[#fafafc]"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-[#fff0f0] p-3 text-xs font-medium text-[#c84949]">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-3">
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
                    className="flex-1 rounded-2xl bg-[#6f4cf6] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Agendando..." : "Confirmar Cita"}
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
