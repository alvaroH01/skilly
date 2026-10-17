"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type Props = {
  professionalId: string;
  professionalName: string;
  isCurrentlyValidated: boolean;
};

export default function ValidateProfessionalButton({
  professionalId,
  professionalName,
  isCurrentlyValidated,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(isCurrentlyValidated);
  const [feedback, setFeedback] = useState("");

  async function handleToggleValidation() {
    try {
      setLoading(true);
      setFeedback("");
      const supabase = createClient();

      const newStatus = !validated;

      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: newStatus,
        })
        .eq("id", professionalId);

      if (error) throw error;

      setValidated(newStatus);
      setFeedback(
        newStatus
          ? `✓ ${professionalName} ha sido validado técnicamente por Skilly.`
          : `Validación revocada para ${professionalName}.`
      );

      setTimeout(() => {
        setFeedback("");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Error actualizando validación:", err);
      setFeedback(err?.message || "No se pudo actualizar la validación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        disabled={loading}
        onClick={handleToggleValidation}
        className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition ${
          validated
            ? "border border-[#c6f6d5] bg-[#f0fff4] text-[#22543d] hover:bg-[#e6fffa]"
            : "bg-[#6f4cf6] text-white hover:bg-[#5e3be0]"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading
          ? "Actualizando..."
          : validated
          ? "✓ Profesional Validado"
          : "Validar Perfil Técnico"}
      </button>

      {feedback && (
        <span className="text-[11px] font-medium text-[#2d8f5d]">
          {feedback}
        </span>
      )}
    </div>
  );
}
