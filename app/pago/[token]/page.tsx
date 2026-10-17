import Image from "next/image";
import Link from "next/link";
import { createHash } from "crypto";
import { createClient } from "@/utils/supabase/server";
import PaymentCheckoutButton from "@/components/payment/PaymentCheckoutButton";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

function money(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatExpiration(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PaymentPage({
  params,
}: PageProps) {
  const { token } = await params;

  const supabase = await createClient();

  /* =====================================================
     1. VALIDAR TOKEN
  ===================================================== */

  if (!token || token.length < 20) {
    return <InvalidPaymentLink />;
  }

  /* =====================================================
     2. CALCULAR SHA-256
     
     El token real nunca se busca directamente en DB.
  ===================================================== */

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  /* =====================================================
     3. BUSCAR ORDEN
  ===================================================== */

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_payment_order_by_token",
    {
      p_token_hash: tokenHash,
    }
  );

  if (error) {
    console.error(
      "Error consultando orden de pago:",
      error
    );

    return <InvalidPaymentLink />;
  }

  const payment =
    Array.isArray(data) && data.length > 0
      ? data[0]
      : null;

  if (!payment) {
    return <InvalidPaymentLink />;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f6f4fb] px-5 py-10 sm:py-16">

      <div className="mx-auto max-w-[620px]">

        {/* LOGO */}

        <div className="mb-8 text-center">

          <Link
            href="/"
            className="inline-flex items-center justify-center"
          >
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly LATAM"
              width={180}
              height={70}
              priority
              className="h-auto w-[160px] object-contain"
            />
          </Link>

          <p className="mt-2 text-sm text-[#8d919d]">
            Pago seguro
          </p>

        </div>

        {/* CARD */}

        <section className="overflow-hidden rounded-[30px] border border-[#e7e3ef] bg-white shadow-[0_25px_70px_rgba(62,45,100,0.10)]">

          {/* HEADER */}

          <div className="border-b border-[#efedf4] px-7 py-7 sm:px-9">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl font-semibold text-[#6848ef]">
              $
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#252a3b] sm:text-3xl">
              Orden de pago
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#818694]">
              Revisa la información antes de continuar
              con el pago de tu proyecto.
            </p>

          </div>

          {/* DATOS */}

          <div className="px-7 py-7 sm:px-9">

            <div className="rounded-[22px] bg-[#f8f7fc] p-5 sm:p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9b9eaa]">
                Proyecto
              </p>

              <p className="mt-2 text-lg font-semibold text-[#34394b]">
                {payment.project_title}
              </p>

              <div className="my-5 h-px bg-[#e8e6ed]" />

              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9b9eaa]">
                Total a pagar
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#6848ef]">
                {money(payment.amount)}
              </p>

            </div>

            {/* SEGURIDAD */}

            <div className="mt-5 rounded-2xl border border-[#e6e0ff] bg-[#f8f5ff] px-5 py-4">

              <p className="text-sm font-semibold text-[#58449d]">
                Pago gestionado por Skilly
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7a7198]">
                Al continuar serás dirigido al proceso
                de pago. Skilly no almacena los datos de
                tu tarjeta.
              </p>

            </div>

            {/* VENCIMIENTO */}

            <p className="mt-5 text-center text-xs leading-5 text-[#999da9]">
              Este enlace estará disponible hasta el{" "}
              <span className="font-semibold text-[#727684]">
                {formatExpiration(
                  payment.expires_at
                )}
              </span>
              .
            </p>

            {/* BOTÓN Y FORMULARIO DE CHECKOUT */}
            <PaymentCheckoutButton
              token={token}
              amount={payment.amount}
              projectTitle={payment.project_title}
            />

          </div>

        </section>

        <p className="mt-6 text-center text-xs leading-5 text-[#9a9da7]">
          Si no reconoces esta orden, no continúes con
          el proceso.
        </p>

      </div>

    </main>
  );
}

/* =====================================================
   ENLACE INVÁLIDO / EXPIRADO
===================================================== */

function InvalidPaymentLink() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4fb] p-5">

      <div className="w-full max-w-[500px] rounded-[30px] border border-[#e7e3ef] bg-white p-8 text-center shadow-[0_25px_70px_rgba(62,45,100,0.08)]">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1ef] text-2xl font-semibold text-[#d7685b]">
          !
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-[#292e40]">
          Enlace no disponible
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#818694]">
          Este enlace de pago no existe, ha expirado o
          la orden ya no está disponible para realizar
          el pago.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-2xl bg-[#6f4cf6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6040df]"
        >
          Volver a Skilly
        </Link>

      </div>

    </main>
  );
}
