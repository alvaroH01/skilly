"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { errorMessage } from "@/utils/services";
type Props = {
  proposalId: string;
};

/**
 * Acción del administrador para emitir la orden de pago de una asignación.
 *
 * Pide confirmación y llama a POST /api/payments/create con `{ proposalId }`. La ruta valida sesión (401) y rol admin (403), y devuelve el enlace /pago/[token], que se muestra una sola vez porque en la base solo queda el hash SHA-256.
 *
 * @param props.proposalId Identificador de la asignación (proposals.id) que se va a cobrar.
 *
 * @returns Botón, cuadro de confirmación y enlace de pago generado.
 */
export default function CreatePaymentOrderButton({
  proposalId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  /* =====================================================
     CREAR ORDEN + GENERAR ENLACE SEGURO
  ===================================================== */

  async function createPaymentOrder() {
    try {
      setLoading(true);
      setError("");
      setCopied(false);

      const response = await fetch("/api/payments/create", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          proposalId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No pudimos generar la orden de pago."
        );
      }

      if (!data?.paymentUrl) {
        throw new Error(
          "La orden fue creada, pero no recibimos el enlace de pago."
        );
      }

      setPaymentUrl(data.paymentUrl);

      /*
       * No se llama a router.refresh() aquí: al existir ya la orden, la página
       * oculta este botón (condición !order) y la ventana con el enlace
       * desaparecería a los pocos segundos. La recarga se hace en closeModal().
       */
    } catch (err: unknown) {
      console.error(
        "Error generando orden de pago:",
        err
      );

      setError(
        errorMessage(err, "No pudimos generar la orden de pago.")
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     COPIAR ENLACE
  ===================================================== */

  async function copyPaymentUrl() {
    try {
      await navigator.clipboard.writeText(paymentUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(
        "No se pudo copiar el enlace:",
        err
      );

      setError(
        "No pudimos copiar el enlace automáticamente."
      );
    }
  }

  /* =====================================================
     CERRAR MODAL
  ===================================================== */

  function closeModal() {
    if (loading) return;

    setConfirming(false);
    setPaymentUrl("");
    setError("");
    setCopied(false);

    router.refresh();
  }

  return (
    <>
      {/* ==================================================
          BOTÓN PRINCIPAL
      ================================================== */}

      <button
        type="button"
        onClick={() => {
          setError("");
          setPaymentUrl("");
          setCopied(false);
          setConfirming(true);
        }}
        className="shrink-0 rounded-2xl bg-[#6f4cf6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6040df]"
      >
        Generar orden de pago
      </button>

      {/* ==================================================
          MODAL
      ================================================== */}

      {confirming && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/40 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!loading) {
              closeModal();
            }
          }}
        >
          <div
            className="w-full max-w-[480px] rounded-[28px] bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.25)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* ==================================================
                ANTES DE GENERAR
            ================================================== */}

            {!paymentUrl && (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl font-semibold text-[#6848ef]">
                  $
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#20263a]">
                  Generar orden de pago
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777c89]">
                  Skilly creará una orden utilizando el
                  monto definido en la propuesta seleccionada
                  y generará un enlace seguro para el contratador.
                </p>

                <div className="mt-4 rounded-2xl bg-[#f7f4ff] px-4 py-3">
                  <p className="text-xs leading-5 text-[#756a9c]">
                    El enlace tendrá una vigencia de 24 horas.
                    Generarlo todavía no significa que el
                    contratador haya realizado el pago.
                  </p>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c95151]">
                    {error}
                  </p>
                )}

                <div className="mt-7 flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={closeModal}
                    className="flex-1 rounded-2xl border border-[#e1e2e8] px-4 py-3 text-sm font-semibold text-[#666b79] transition hover:bg-[#f8f8fa] disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={createPaymentOrder}
                    className="flex-1 rounded-2xl bg-[#6f4cf6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6040df] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Generando..."
                      : "Sí, generar"}
                  </button>
                </div>
              </>
            )}

            {/* ==================================================
                ENLACE GENERADO
            ================================================== */}

            {paymentUrl && (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f8f0] text-2xl font-semibold text-[#319268]">
                  ✓
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#20263a]">
                  Enlace generado
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777c89]">
                  La orden de pago fue creada correctamente.
                  Durante esta etapa de prueba puedes abrir
                  o copiar el enlace.
                </p>

                {/* URL */}

                <div className="mt-5 rounded-2xl border border-[#e5e2ec] bg-[#f8f8fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#999daa]">
                    Enlace de pago
                  </p>

                  <p className="mt-2 break-all text-xs leading-5 text-[#5f6473]">
                    {paymentUrl}
                  </p>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c95151]">
                    {error}
                  </p>
                )}

                {/* ACCIONES */}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={copyPaymentUrl}
                    className="rounded-2xl border border-[#dedbe8] px-4 py-3 text-sm font-semibold text-[#626777] transition hover:bg-[#f8f8fb]"
                  >
                    {copied
                      ? "✓ Copiado"
                      : "Copiar enlace"}
                  </button>

                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-[#6f4cf6] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#6040df]"
                  >
                    Abrir enlace
                  </a>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[#777c89] transition hover:bg-[#f8f8fa]"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}