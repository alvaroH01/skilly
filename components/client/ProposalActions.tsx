"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type ProposalActionsProps = {
  proposalId: string;
  projectId: string;
  professionalName: string;
  projectTitle: string;
  amount: number | null;
  estimatedDays: number | null;
};

function money(value: number | null) {
  if (!value) return "A convenir";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProposalActions({
  proposalId,
  projectId,
  professionalName,
  projectTitle,
  amount,
  estimatedDays,
}: ProposalActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [modal, setModal] = useState<
    "select" | "reject" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ======================================================
     SELECCIONAR PROPUESTA
  ====================================================== */

  async function selectProposal() {
    try {
      setLoading(true);
      setError("");

      /*
       * La función RPC se encarga de:
       *
       * 1. Verificar que el usuario sea dueño del proyecto.
       * 2. Verificar que la propuesta siga pendiente.
       * 3. Verificar que el proyecto siga activo.
       * 4. Cambiar propuesta → seleccionada.
       * 5. Cambiar proyecto → propuesta_seleccionada.
       *
       * NO rechaza todavía las otras propuestas.
       */

      const { error: selectError } = await supabase.rpc(
        "select_proposal",
        {
          p_proposal_id: proposalId,
        }
      );

      if (selectError) {
        throw selectError;
      }

      /*
       * Cerramos modal y mostramos confirmación.
       */

      setModal(null);
      setSuccess(true);

      /*
       * Actualizamos los datos del Server Component.
       */

      router.refresh();
    } catch (err: any) {
      console.error(
        "Error seleccionando propuesta:",
        err
      );

      setError(
        err?.message ||
          "No pudimos seleccionar la propuesta."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
     RECHAZAR PROPUESTA
  ====================================================== */

  async function rejectProposal() {
    try {
      setLoading(true);
      setError("");

      const { error: rejectError } =
        await supabase
          .from("proposals")
          .update({
            status: "rechazada",
          })
          .eq("id", proposalId)
          .eq("status", "pendiente");

      if (rejectError) {
        throw rejectError;
      }

      setModal(null);
      router.refresh();
    } catch (err: any) {
      console.error(
        "Error rechazando propuesta:",
        err
      );

      setError(
        err?.message ||
          "No pudimos rechazar la propuesta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ==================================================
          MENSAJE DE ÉXITO
      ================================================== */}

      {success && (
        <div className="w-full max-w-[390px] rounded-2xl border border-[#dceee5] bg-[#f0faf5] px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff3e9] text-sm font-bold text-[#319268]">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-[#276e51]">
                Propuesta seleccionada
              </p>

              <p className="mt-1 text-xs leading-5 text-[#638073]">
                Skilly gestionará ahora el proceso de pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          BOTONES
      ================================================== */}

      {!success && (
        <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
          <button
            type="button"
            onClick={() => {
              setError("");
              setModal("select");
            }}
            className="rounded-xl bg-[#6f4cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6040df]"
          >
            Seleccionar propuesta
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setModal("reject");
            }}
            className="rounded-xl border border-[#e0e1e8] px-5 py-2.5 text-sm font-semibold text-[#676c7b] transition hover:bg-[#f7f7fa]"
          >
            Rechazar
          </button>
        </div>
      )}

      {/* ==================================================
          MODAL SELECCIONAR
      ================================================== */}

      {modal === "select" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171b2d]/40 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!loading) {
              setModal(null);
            }
          }}
        >
          <div
            className="w-full max-w-[480px] rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* ICONO */}

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl text-[#6f4cf6]">
              ✓
            </div>

            {/* TITULO */}

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#20263a]">
              ¿Seleccionar esta propuesta?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7a7f8d]">
              Estás seleccionando la propuesta de{" "}
              <span className="font-semibold text-[#34394b]">
                {professionalName}
              </span>{" "}
              para tu proyecto.
            </p>

            {/* ==================================================
                RESUMEN
            ================================================== */}

            <div className="mt-6 rounded-[20px] bg-[#f8f8fc] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9a9eaa]">
                Proyecto
              </p>

              <p className="mt-1 font-semibold text-[#30364a]">
                {projectTitle}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#999da9]">
                    Monto
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#30364a]">
                    {money(amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#999da9]">
                    Plazo
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#30364a]">
                    {estimatedDays
                      ? `${estimatedDays} días`
                      : "A convenir"}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                INFORMACIÓN DEL PROCESO
            ================================================== */}

            <div className="mt-5 rounded-2xl border border-[#e8e2ff] bg-[#f7f4ff] px-4 py-4">
              <p className="text-sm font-semibold text-[#5d46b8]">
                ¿Qué ocurrirá después?
              </p>

              <p className="mt-1.5 text-xs leading-5 text-[#756a9c]">
                Skilly recibirá tu selección y gestionará el
                proceso de pago. El proyecto será confirmado
                con el profesional una vez que el pago haya
                sido procesado correctamente.
              </p>
            </div>

            {/* ==================================================
                AVISO
            ================================================== */}

            <div className="mt-4 rounded-2xl bg-[#fff8e8] px-4 py-3">
              <p className="text-xs leading-5 text-[#98743a]">
                Seleccionar esta propuesta todavía no confirma
                la contratación. Las demás propuestas se
                mantendrán disponibles hasta que el pago sea
                confirmado.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <p className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c95151]">
                {error}
              </p>
            )}

            {/* ==================================================
                ACCIONES
            ================================================== */}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setModal(null)
                }
                className="flex-1 rounded-2xl border border-[#e1e2e8] px-5 py-3.5 text-sm font-semibold text-[#666b79] transition hover:bg-[#f8f8fa] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={selectProposal}
                className="flex-1 rounded-2xl bg-[#6f4cf6] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6040df] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Seleccionando..."
                  : "Confirmar selección"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL RECHAZAR
      ================================================== */}

      {modal === "reject" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171b2d]/40 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!loading) {
              setModal(null);
            }
          }}
        >
          <div
            className="w-full max-w-[450px] rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0ed] text-2xl text-[#d96c56]">
              ×
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#20263a]">
              ¿Rechazar esta propuesta?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#777c89]">
              La propuesta de{" "}
              <span className="font-semibold text-[#34394b]">
                {professionalName}
              </span>{" "}
              será marcada como rechazada.
            </p>

            <p className="mt-3 text-sm leading-6 text-[#777c89]">
              Tu proyecto seguirá activo y podrás revisar
              otras propuestas.
            </p>

            {error && (
              <p className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c95151]">
                {error}
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setModal(null)
                }
                className="flex-1 rounded-2xl border border-[#e1e2e8] px-5 py-3.5 text-sm font-semibold text-[#666b79] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={rejectProposal}
                className="flex-1 rounded-2xl bg-[#df6b5d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#cf5e51] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Rechazando..."
                  : "Sí, rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}