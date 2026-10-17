"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";

type ProposalFormProps = {
  projectId: string;
};

export default function ProposalForm({
  projectId,
}: ProposalFormProps) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [estimatedDays, setEstimatedDays] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (message.trim().length < 30) {
      setErrorMessage(
        "Cuéntale un poco más al cliente sobre tu propuesta."
      );
      return;
    }

    if (amount && Number(amount) < 0) {
      setErrorMessage(
        "El monto de la propuesta no puede ser negativo."
      );
      return;
    }

    if (
      estimatedDays &&
      Number(estimatedDays) <= 0
    ) {
      setErrorMessage(
        "El tiempo estimado debe ser mayor a cero."
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    /* COMPROBAR QUE ES PROFESIONAL */
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "profesional") {
      setErrorMessage(
        "Solo los profesionales pueden enviar propuestas."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("proposals")
      .insert({
        project_id: projectId,
        professional_id: user.id,
        message: message.trim(),
        proposed_amount: amount
          ? Number(amount)
          : null,
        estimated_days: estimatedDays
          ? Number(estimatedDays)
          : null,
        status: "pendiente",
      });

    if (error) {
      console.error(error);

      /*
       * PostgreSQL 23505:
       * viola restricción UNIQUE
       */
      if (error.code === "23505") {
        setErrorMessage(
          "Ya enviaste una propuesta para este proyecto."
        );
      } else {
        setErrorMessage(
          "No pudimos enviar tu propuesta. Inténtalo nuevamente."
        );
      }

      setLoading(false);
      return;
    }

    router.push(
      "/dashboard/profesional/propuestas?sent=true"
    );

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[26px] border border-[#e7e5f0] bg-white p-6 shadow-[0_15px_45px_rgba(76,61,120,0.07)]"
    >

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-lg text-[#6848ef]">
          ✦
        </div>

        <div>
          <h2 className="font-semibold text-[#252b40]">
            Envía tu propuesta
          </h2>

          <p className="mt-0.5 text-xs text-[#9296a4]">
            Preséntate y cuéntale al cliente cómo puedes ayudar.
          </p>
        </div>
      </div>

      {/* MENSAJE */}
      <div className="mt-6">

        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#30364a]">
            Tu propuesta
          </label>

          <span className="text-xs text-[#999dab]">
            {message.length}/1500
          </span>
        </div>

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value.slice(0, 1500)
            )
          }
          rows={8}
          placeholder="Hola, tengo experiencia trabajando en proyectos similares. Puedo ayudarte a..."
          className="mt-2 w-full resize-none rounded-2xl border border-[#e1e2e9] px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
        />

      </div>

      {/* MONTO */}
      <div className="mt-5">

        <label className="text-sm font-semibold text-[#30364a]">
          Valor de tu propuesta
        </label>

        <div className="mt-2 flex items-center rounded-2xl border border-[#e1e2e9] px-4">

          <span className="text-sm text-[#858997]">
            $
          </span>

          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="Ej: 250000"
            className="w-full px-3 py-3.5 text-sm outline-none"
          />

          <span className="text-xs font-medium text-[#999daa]">
            CLP
          </span>

        </div>

      </div>

      {/* TIEMPO */}
      <div className="mt-5">

        <label className="text-sm font-semibold text-[#30364a]">
          Tiempo estimado
        </label>

        <div className="mt-2 flex items-center rounded-2xl border border-[#e1e2e9] px-4">

          <input
            type="number"
            min="1"
            value={estimatedDays}
            onChange={(event) =>
              setEstimatedDays(event.target.value)
            }
            placeholder="Ej: 10"
            className="w-full py-3.5 text-sm outline-none"
          />

          <span className="text-sm text-[#858997]">
            días
          </span>

        </div>

      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-[#ffd8d8] bg-[#fff6f6] px-4 py-3 text-sm text-[#ae4545]">
          {errorMessage}
        </div>
      )}

      {/* BOTÓN */}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#6f4cf6] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(111,76,246,0.22)] transition hover:bg-[#6241e8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Enviando propuesta..."
          : "Enviar propuesta →"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[#999daa]">
        Podrás revisar el estado de esta propuesta
        desde “Mis propuestas”.
      </p>

    </form>
  );
}