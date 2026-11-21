"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";
import { ServiceRow, errorMessage, formatMoney } from "@/utils/services";

type Props = { service: ServiceRow };

const primary =
  "rounded-xl bg-[#6f4cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6241e8] disabled:opacity-60";
const secondary =
  "rounded-xl border border-[#e1e2e8] px-4 py-2 text-xs font-semibold text-[#626776] transition hover:bg-[#f8f8fb] disabled:opacity-60";

export default function ServiceActions({ service }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => PromiseLike<{ error: unknown; data?: unknown }>) {
    try {
      setBusy(true);
      setError("");
      const { error: actionError, data } = await action();
      if (actionError) throw actionError;
      // Un UPDATE/DELETE bloqueado por RLS no da error: devuelve 0 filas.
      if (Array.isArray(data) && data.length === 0) throw new Error("La acción no fue permitida.");
      router.refresh();
    } catch (err: unknown) {
      setError(errorMessage(err, "No se pudo completar la acción."));
    } finally {
      setBusy(false);
    }
  }

  const supabase = createClient();
  const v = service.validation_status;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {(v === "no_enviado" || v === "cambios_solicitados") && (
          <>
            <Link href={`/dashboard/profesional/servicios/${service.id}`} className={secondary}>
              Editar
            </Link>
            <button
              type="button"
              disabled={busy}
              className={primary}
              onClick={() =>
                run(() => supabase.rpc("submit_service_for_validation", { p_service_id: service.id }))
              }
            >
              {v === "cambios_solicitados" ? "Reenviar a Skilly" : "Enviar a revisión"}
            </button>
          </>
        )}

        {v === "propuesta_final" && (
          <button
            type="button"
            disabled={busy}
            className={primary}
            onClick={() =>
              run(() => supabase.rpc("accept_service_proposal", { p_service_id: service.id }))
            }
          >
            Aceptar y publicar
            {service.suggested_price ? ` (${formatMoney(service.suggested_price)})` : ""}
          </button>
        )}

        {v === "validado" && service.status === "activo" && (
          <button
            type="button"
            disabled={busy}
            className={secondary}
            onClick={() =>
              run(() => supabase.from("services").update({ status: "pausado" }).eq("id", service.id).select("id"))
            }
          >
            Pausar publicación
          </button>
        )}

        {v === "validado" && service.status === "pausado" && (
          <button
            type="button"
            disabled={busy}
            className={primary}
            onClick={() =>
              run(() => supabase.from("services").update({ status: "activo" }).eq("id", service.id).select("id"))
            }
          >
            Reactivar publicación
          </button>
        )}

        {(v === "validado" || v === "propuesta_final" || v === "pendiente" || v === "en_revision") && (
          <Link href={`/dashboard/profesional/servicios/${service.id}`} className={secondary}>
            Editar
          </Link>
        )}

        {v === "no_enviado" && service.status === "borrador" && (
          <button
            type="button"
            disabled={busy}
            className={secondary}
            onClick={() => {
              if (window.confirm("¿Eliminar este borrador? Esta acción no se puede deshacer.")) {
                void run(() => supabase.from("services").delete().eq("id", service.id).select("id"));
              }
            }}
          >
            Eliminar
          </button>
        )}
      </div>

      {error && <p className="text-xs text-[#c84949]">{error}</p>}
    </div>
  );
}
