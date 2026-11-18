"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
  amount: number;
  projectTitle: string;
};

export default function PaymentCheckoutButton({
  token,
  amount,
  projectTitle,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("webpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<any>(null);

  async function handleSimulatePayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al procesar el pago.");
      }

      setReceipt({
        authorizationCode: data.authorizationCode || "892341",
        paidAt: data.paidAt || new Date().toISOString(),
        amount: data.amount || amount,
      });

      // El comprobante se muestra desde el estado local. No se llama a router.refresh():
      // la orden ya está pagada y la página dejaría de encontrarla (enlace inválido).
    } catch (err: any) {
      console.error("Error en pago:", err);
      setError(err?.message || "No se pudo completar el pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6f4cf6] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(111,76,246,0.22)] transition hover:-translate-y-0.5 hover:bg-[#6040df]"
        >
          <span>Pagar con Webpay Plus</span>
          <span>→</span>
        </button>

        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[#9a9ea9]">
          <span>🔒 Transacción segura</span>
          <span>•</span>
          <span>Webpay Plus</span>
          <span>•</span>
          <span>Débito / Crédito</span>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#171b2d]/50 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!loading && !receipt) setModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-[500px] overflow-hidden rounded-[30px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ESTADO: RECIBO DE PAGO EXITOSO */}
            {receipt ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f8ef] text-3xl font-bold text-[#2d8f5d]">
                  ✓
                </div>

                <span className="mt-4 inline-block rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#2d8f5d]">
                  Transacción Aprobada
                </span>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#222739]">
                  ¡Pago realizado con éxito!
                </h2>

                <p className="mt-1 text-xs text-[#7e8392]">
                  El proyecto ha sido confirmado y pasa a estado de ejecución.
                </p>

                {/* VOUCHER */}
                <div className="mt-6 rounded-2xl border border-[#e8e5f0] bg-[#faf9fd] p-5 text-left text-xs text-[#525768]">
                  <div className="flex justify-between border-b border-[#ece8f5] pb-2.5">
                    <span className="text-[#8c91a0]">Proyecto:</span>
                    <strong className="text-[#2c3245]">{projectTitle}</strong>
                  </div>

                  <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                    <span className="text-[#8c91a0]">Monto cancelado:</span>
                    <strong className="text-[#6f4cf6] text-sm font-bold">
                      ${Number(receipt.amount).toLocaleString("es-CL")} CLP
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                    <span className="text-[#8c91a0]">Código de autorización:</span>
                    <strong className="font-mono text-[#303548]">{receipt.authorizationCode}</strong>
                  </div>

                  <div className="flex justify-between pt-2.5">
                    <span className="text-[#8c91a0]">Medio de pago:</span>
                    <span className="font-medium text-[#303548]">Webpay Plus (Débito/Crédito)</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/dashboard/cliente"
                    className="flex w-full items-center justify-center rounded-2xl bg-[#6f4cf6] py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0]"
                  >
                    Ir a mi Dashboard de Cliente
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      router.push("/dashboard/cliente");
                    }}
                    className="py-2 text-xs font-medium text-[#7d8291] hover:underline"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : (
              /* ESTADO: FORMULARIO WEBPAY */
              <div>
                <div className="flex items-center justify-between border-b border-[#eeeef4] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-lg font-bold text-[#6848ef]">
                      💳
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8d79e9]">
                        Pasarela Segura Skilly
                      </p>
                      <h2 className="text-lg font-bold text-[#23283a]">
                        Webpay Plus (Sandbox)
                      </h2>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#f4f2ff] px-2.5 py-1 text-[11px] font-semibold text-[#6848ef]">
                    CLP
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-[#faf9fd] p-4 text-xs">
                  <p className="text-[#8d92a0]">Total a cobrar:</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-[#6f4cf6]">
                    ${Number(amount).toLocaleString("es-CL")} CLP
                  </p>
                  <p className="mt-1 text-[11px] text-[#787d8d]">{projectTitle}</p>
                </div>

                {/* OPCIONES DE MEDIO */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-xs font-semibold text-[#32374a]">Selecciona tu tarjeta:</p>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                      selectedMethod === "webpay"
                        ? "border-[#8e7bf5] bg-[#f8f6ff]"
                        : "border-[#e7e5ee] bg-white hover:bg-[#fafafc]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethod === "webpay"}
                        onChange={() => setSelectedMethod("webpay")}
                        className="accent-[#6f4cf6]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#292e40]">Tarjeta de Débito (Redcompra)</p>
                        <p className="text-[11px] text-[#797e8e]">Banco de Chile, Santander, Estado, BCI</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#6848ef]">Webpay</span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                      selectedMethod === "credito"
                        ? "border-[#8e7bf5] bg-[#f8f6ff]"
                        : "border-[#e7e5ee] bg-white hover:bg-[#fafafc]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethod === "credito"}
                        onChange={() => setSelectedMethod("credito")}
                        className="accent-[#6f4cf6]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#292e40]">Tarjeta de Crédito (Visa / Mastercard)</p>
                        <p className="text-[11px] text-[#797e8e]">Hasta 3 o 6 cuotas sin interés</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#6848ef]">3 Cuotas</span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-[#fff0f0] p-3 text-xs text-[#c94545]">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-2xl border border-[#e0e1e8] py-3 text-xs font-semibold text-[#666b7a] transition hover:bg-[#f8f8fb] disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSimulatePayment}
                    className="flex-1 rounded-2xl bg-[#6f4cf6] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3ce0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Autorizando...
                      </span>
                    ) : (
                      `Pagar $${Number(amount).toLocaleString("es-CL")}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
