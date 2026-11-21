"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEMO_CARDS,
  formatCardNumber,
  formatExpiry,
  type CardKind,
} from "@/utils/payments/demoCards";

type Receipt = {
  authorizationCode: string;
  paidAt: string;
  amount: number;
  card?: { brand: string; kind: CardKind; last4: string; installments: number };
};

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
  const [kind, setKind] = useState<CardKind>("credito");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  function fillDemoCard(number: string, cardKind: CardKind, cardCvv?: string) {
    setKind(cardKind);
    setCardNumber(formatCardNumber(number));
    setExpiry(cardKind === "credito" ? "12/30" : "");
    setCvv(cardCvv ?? "");
    setError("");
  }

  async function handleSimulatePayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          installments,
          card: { number: cardNumber, expiry, cvv, kind },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al procesar el pago.");
      }

      setReceipt({
        authorizationCode: data.authorizationCode || "892341",
        paidAt: data.paidAt || new Date().toISOString(),
        amount: data.amount || amount,
        card: data.card,
      });
      // Por seguridad, los datos de la tarjeta se borran del navegador al terminar.
      setCardNumber("");
      setExpiry("");
      setCvv("");

      // El comprobante se muestra desde el estado local. No se llama a router.refresh():
      // la orden ya está pagada y la página dejaría de encontrarla (enlace inválido).
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo completar el pago.");
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
          <span>Webpay Plus (demostración)</span>
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

                  <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                    <span className="text-[#8c91a0]">Tarjeta:</span>
                    <span className="font-medium text-[#303548]">
                      {receipt.card
                        ? `${receipt.card.brand} •••• ${receipt.card.last4}`
                        : "Tarjeta de demostración"}
                    </span>
                  </div>

                  {receipt.card?.kind === "credito" && (
                    <div className="flex justify-between border-b border-[#ece8f5] py-2.5">
                      <span className="text-[#8c91a0]">Cuotas:</span>
                      <span className="font-medium text-[#303548]">
                        {receipt.card.installments === 1
                          ? "Sin cuotas"
                          : `${receipt.card.installments} cuotas sin interés`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2.5">
                    <span className="text-[#8c91a0]">Medio de pago:</span>
                    <span className="font-medium text-[#303548]">Webpay Plus (demostración)</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/dashboard/cliente"
                    className="flex w-full items-center justify-center rounded-2xl bg-[#6f4cf6] py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5e3be0]"
                  >
                    Ir a mi Dashboard de Contratador
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
                        Webpay Plus (Demostración)
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

                {/* AVISO DE DEMOSTRACIÓN */}
                <div className="mt-4 rounded-2xl border border-[#f3e1b3] bg-[#fff8e6] p-3.5 text-[11px] leading-5 text-[#8a6a1f]">
                  <p className="font-bold">Entorno de demostración</p>
                  <p>
                    Solo se aceptan tarjetas de prueba. No ingreses tu tarjeta real: no se realiza ningún cobro.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCards((v) => !v)}
                    className="mt-1 font-semibold underline"
                  >
                    {showCards ? "Ocultar tarjetas de prueba" : "Ver tarjetas de prueba"}
                  </button>

                  {showCards && (
                    <ul className="mt-2 space-y-1.5">
                      {DEMO_CARDS.map((c) => (
                        <li key={c.number} className="flex items-center justify-between gap-2">
                          <span>
                            <span className="font-semibold">{c.label}</span>
                            <span className="ml-1 font-mono">{formatCardNumber(c.number)}</span>
                            {c.cvv ? <span> · CVV {c.cvv}</span> : null}
                          </span>
                          <button
                            type="button"
                            onClick={() => fillDemoCard(c.number, c.kind, c.cvv)}
                            className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-[#6848ef] shadow-sm"
                          >
                            Usar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* TIPO DE TARJETA */}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-[#32374a]">Tipo de tarjeta</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["credito", "debito"] as CardKind[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={`rounded-2xl border p-3 text-left text-xs transition ${
                          kind === k
                            ? "border-[#8e7bf5] bg-[#f8f6ff]"
                            : "border-[#e7e5ee] bg-white hover:bg-[#fafafc]"
                        }`}
                      >
                        <span className="block font-bold text-[#292e40]">
                          {k === "credito" ? "Crédito" : "Débito (Redcompra)"}
                        </span>
                        <span className="text-[11px] text-[#797e8e]">
                          {k === "credito" ? "Visa, Mastercard, Amex" : "Cuenta corriente o vista"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DATOS DE LA TARJETA */}
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-semibold text-[#32374a]">
                    Número de tarjeta
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="4051 8856 0044 6623"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-[#e0e1e8] px-3 py-2.5 font-mono text-sm text-[#292e40] outline-none focus:border-[#8e7bf5]"
                    />
                  </label>

                  {kind === "credito" && (
                    <div className="grid grid-cols-3 gap-3">
                      <label className="block text-xs font-semibold text-[#32374a]">
                        Vencimiento
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="MM/AA"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-[#e0e1e8] px-3 py-2.5 font-mono text-sm text-[#292e40] outline-none focus:border-[#8e7bf5]"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-[#32374a]">
                        CVV
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={4}
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                          className="mt-1 w-full rounded-xl border border-[#e0e1e8] px-3 py-2.5 font-mono text-sm text-[#292e40] outline-none focus:border-[#8e7bf5]"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-[#32374a]">
                        Cuotas
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-[#e0e1e8] bg-white px-2 py-2.5 text-sm text-[#292e40] outline-none focus:border-[#8e7bf5]"
                        >
                          <option value={1}>Sin cuotas</option>
                          <option value={3}>3 sin interés</option>
                          <option value={6}>6 sin interés</option>
                        </select>
                      </label>
                    </div>
                  )}
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
                    disabled={loading || cardNumber.replace(/\D/g, "").length < 13}
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
