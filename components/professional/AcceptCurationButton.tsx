"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  proposalId: string;
  suggestedAmount: number;
  currentMessage: string;
};

export default function AcceptCurationButton({
  proposalId,
  suggestedAmount,
  currentMessage,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const note = `\n✓ Tarifa ajustada y acordada con Skilly: $${suggestedAmount.toLocaleString("es-CL")} CLP`;
      const updatedMessage = `${currentMessage}${note}`;

      const { error: updateError } = await supabase
        .from("proposals")
        .update({
          proposed_amount: suggestedAmount,
          message: updatedMessage,
        })
        .eq("id", proposalId);

      if (updateError) {
        throw updateError;
      }

      setAccepted(true);
      router.refresh();
    } catch (err: any) {
      console.error("Error aceptando recomendación de Skilly:", err);
      setError(err?.message || "No se pudo actualizar la tarifa.");
    } finally {
      setLoading(false);
    }
  }

  if (accepted) {
    return (
      <span className="rounded-xl bg-[#e7f8ef] px-3 py-1.5 text-xs font-semibold text-[#2d875a]">
        ✓ Tarifa actualizada a ${suggestedAmount.toLocaleString("es-CL")} CLP
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        disabled={loading}
        onClick={handleAccept}
        className="rounded-xl bg-[#6f4cf6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5f3de0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Actualizando..."
          : `✓ Aceptar sugerencia ($${suggestedAmount.toLocaleString("es-CL")} CLP)`}
      </button>

      {error && <span className="text-xs text-[#c84949]">{error}</span>}
    </div>
  );
}
