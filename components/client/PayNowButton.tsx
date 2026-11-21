"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  amount: number;
};

/**
 * Botón «Pagar ahora» del Contratador.
 *
 * Llama a POST /api/payments/link con `{ orderId }` para generar el enlace seguro de 24 horas y redirige a /pago/[token].
 *
 * @param props.orderId Orden de pago (payment_orders.id) pendiente.
 * @param props.amount Monto en CLP que se muestra en el botón; el monto real lo define el servidor.
 *
 * @returns Botón con estado de carga y mensaje de error.
 */
export default function PayNowButton({ orderId, amount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payments/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.paymentUrl) {
        throw new Error(data?.error || "No se pudo preparar el pago.");
      }

      // Se navega a la ruta interna del enlace (/pago/<token>)
      router.push(new URL(data.paymentUrl).pathname);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo preparar el pago.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-[#6543dc] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#5634ca] disabled:opacity-60"
      >
        {loading
          ? "Preparando pago..."
          : `Pagar ahora · $${amount.toLocaleString("es-CL")}`}
      </button>
      {error && <p className="max-w-[220px] text-xs text-[#c84949]">{error}</p>}
    </div>
  );
}
