"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginRequiredButton() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[46px] items-center justify-center rounded-xl bg-[#6543dc] px-5 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
      >
        Ver oportunidad
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171b2d]/40 p-5 backdrop-blur-sm"
          onClick={() =>
            setOpen(false)
          }
        >

          <div
            className="w-full max-w-[440px] rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_30px_90px_rgba(40,30,70,0.22)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ICONO */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
              🔐
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#20263a]">
              Inicia sesión para continuar
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#777c89]">
              Para revisar el detalle de esta
              oportunidad y participar en
              Skilly necesitas iniciar sesión
              con tu cuenta.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/login"
                className="flex flex-1 items-center justify-center rounded-2xl bg-[#6543dc] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5634ca]"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro"
                className="flex flex-1 items-center justify-center rounded-2xl border border-[#ded9e7] px-5 py-3.5 text-sm font-semibold text-[#444956] transition hover:bg-[#f8f7fb]"
              >
                Crear cuenta
              </Link>

            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="mt-4 w-full text-center text-sm font-medium text-[#8b8f9b] transition hover:text-[#555b68]"
            >
              Seguir explorando
            </button>

          </div>

        </div>
      )}
    </>
  );
}