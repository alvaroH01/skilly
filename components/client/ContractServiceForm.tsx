"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/clients";
import { errorMessage } from "@/utils/services";

type Props = { serviceId: string };

function todayLocal(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function ContractServiceForm({ serviceId }: Props) {
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!startDate) return setError("Selecciona la fecha de inicio del servicio.");

    try {
      setLoading(true);
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("contratar_servicio", {
        p_service_id: serviceId,
        p_start_date: startDate,
        p_notes: notes.trim() || null,
      });
      if (rpcError) throw rpcError;
      setDone(true);
    } catch (err: unknown) {
      setError(errorMessage(err, "No se pudo registrar la contratación."));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#cdeedd] bg-[#e7f8ef] p-5 text-sm leading-6 text-[#2d6a49]">
        <p className="font-semibold">Contratación registrada</p>
        <p className="mt-1">
          Skilly generará la orden de pago y te avisará en tus notificaciones. Cuando pagues, el
          servicio quedará en ejecución en la fecha acordada.
        </p>
        <Link
          href="/dashboard/cliente/propuestas"
          className="mt-4 inline-block rounded-xl bg-[#2d875a] px-4 py-2.5 text-xs font-semibold text-white"
        >
          Ver mis contrataciones
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#30364a]">Fecha de inicio</label>
        <input
          type="date"
          min={todayLocal()}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-2xl border border-[#e2e1e9] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9b8af8] focus:ring-4 focus:ring-[#6f4cf6]/10"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[#30364a]">Notas para el profesional (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contexto de tu organización, horarios, lugar de trabajo..."
          className="min-h-[100px] w-full rounded-2xl border border-[#e2e1e9] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9b8af8] focus:ring-4 focus:ring-[#6f4cf6]/10"
        />
      </div>
      {error && <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c84949]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#6543dc] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#5634ca] disabled:opacity-60"
      >
        {loading ? "Registrando..." : "Contratar servicio"}
      </button>
      <p className="text-xs leading-5 text-[#8a8fa0]">
        Al contratar, Skilly emite una orden de pago segura. El pago se realiza a través de la plataforma.
      </p>
    </form>
  );
}
