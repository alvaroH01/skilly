"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";

type AccountMenuProps = {
  displayName: string;
  subtitle: string;
  initial: string;
  role: "cliente" | "profesional";
  unreadNotifications?: number;
};

export default function AccountMenu({
  displayName,
  subtitle,
  initial,
  role,
  unreadNotifications = 0,
}: AccountMenuProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const profileHref =
    role === "cliente"
      ? "/dashboard/cliente/perfil"
      : "/dashboard/profesional/perfil";

  const notificationsHref =
    role === "cliente"
      ? "/dashboard/cliente/notificaciones"
      : "/dashboard/profesional/notificaciones";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* BOTÓN DE CUENTA */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`group flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
          open
            ? "bg-[#f5f3fc]"
            : "hover:bg-[#f7f6fc]"
        }`}
      >
        {/* AVATAR */}
        <div className="relative">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f4cf6] text-sm font-semibold text-white shadow-[0_7px_18px_rgba(111,76,246,0.22)]">
            {initial}
          </div>

          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#ee5f66] px-1 text-[10px] font-bold text-white">
              {unreadNotifications > 9
                ? "9+"
                : unreadNotifications}
            </span>
          )}

        </div>

        {/* NOMBRE */}
        <div className="hidden text-left md:block">

          <p className="max-w-[170px] truncate text-sm font-semibold text-[#272d42]">
            {displayName}
          </p>

          <p className="max-w-[170px] truncate text-xs text-[#969aaa]">
            {subtitle}
          </p>

        </div>

        <span
          className={`hidden text-sm text-[#777d8d] transition md:block ${
            open ? "rotate-180" : ""
          }`}
        >
          ⌄
        </span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-[58px] z-50 w-[270px] overflow-hidden rounded-[22px] border border-[#e8e7ef] bg-white p-2 shadow-[0_22px_60px_rgba(53,45,90,0.16)]">

          {/* USUARIO */}
          <div className="border-b border-[#efeff4] px-4 pb-4 pt-3">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6f4cf6] text-sm font-semibold text-white">
                {initial}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[#252b40]">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-[#969aaa]">
                  {subtitle}
                </p>

              </div>

            </div>

          </div>

          {/* OPCIONES */}
          <div className="py-2">

            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#555b6b] transition hover:bg-[#f7f6fc]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f1eeff] text-[#6848ef]">
                ♙
              </span>

              <div>
                <p className="font-semibold">
                  Mi perfil
                </p>

                <p className="mt-0.5 text-[11px] text-[#999daa]">
                  Ver y editar información
                </p>
              </div>
            </Link>

            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#555b6b] transition hover:bg-[#f7f6fc]"
            >

              <div className="flex items-center gap-3">

                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff1eb]">
                  🔔
                </span>

                <div>
                  <p className="font-semibold">
                    Notificaciones
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#999daa]">
                    Revisa tu actividad
                  </p>
                </div>

              </div>

              {unreadNotifications > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6f4cf6] px-1.5 text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}

            </Link>

          </div>

          {/* SALIR */}
          <div className="border-t border-[#efeff4] pt-2">

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#b64f58] transition hover:bg-[#fff5f5] disabled:opacity-60"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0f1]">
                ↪
              </span>

              {loggingOut
                ? "Cerrando sesión..."
                : "Cerrar sesión"}

            </button>

          </div>

        </div>
      )}
    </div>
  );
}