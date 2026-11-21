"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";
import {
  SERVICE_CATEGORIES,
  ServiceRow,
  errorMessage,
} from "@/utils/services";

type Props = {
  /** Si viene un servicio, el formulario edita; si no, crea uno nuevo. */
  service?: ServiceRow;
};

const inputClass =
  "w-full rounded-2xl border border-[#e2e1e9] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#9b8af8] focus:ring-4 focus:ring-[#6f4cf6]/10";

export default function ServiceForm({ service }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [modality, setModality] = useState<string>(service?.modality ?? "remoto");
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [duration, setDuration] = useState(service ? String(service.duration_days) : "1");
  const [skills, setSkills] = useState((service?.skills ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editingPublished =
    !!service && ["pendiente", "en_revision", "propuesta_final", "validado"].includes(service.validation_status);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (title.trim().length < 5) return setError("El título debe tener al menos 5 caracteres.");
    if (description.trim().length < 20) return setError("Describe el servicio con al menos 20 caracteres (alcance y entregables).");
    if (!category) return setError("Selecciona una categoría.");
    const priceNumber = Number(price);
    const durationNumber = Number(duration);
    if (!Number.isInteger(priceNumber) || priceNumber <= 0) return setError("Ingresa una tarifa válida en pesos chilenos.");
    if (!Number.isInteger(durationNumber) || durationNumber <= 0) return setError("Ingresa la duración en días (mínimo 1).");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      modality,
      price: priceNumber,
      duration_days: durationNumber,
      skills: skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12),
    };

    try {
      setSaving(true);
      const supabase = createClient();

      if (service) {
        const { data, error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", service.id)
          .select("id");
        if (updateError) throw updateError;
        // Una actualización bloqueada por RLS no da error: devuelve 0 filas.
        if (!data || data.length === 0) throw new Error("No se pudo guardar el servicio.");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
        const { error: insertError } = await supabase
          .from("services")
          .insert({ ...payload, professional_id: user.id });
        if (insertError) throw insertError;
      }

      router.push("/dashboard/profesional/servicios");
      router.refresh();
    } catch (err: unknown) {
      setError(errorMessage(err, "No se pudo guardar el servicio."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {editingPublished && (
        <div className="rounded-2xl border border-[#f3d9a4] bg-[#fff8e8] p-4 text-sm leading-6 text-[#8a5b00]">
          Este servicio ya fue enviado a Skilly. Si guardas cambios, volverá a estado borrador y
          deberás enviarlo nuevamente a revisión antes de que se publique.
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-[#30364a]">Nombre del servicio</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Diagnóstico de clima laboral para pymes"
          maxLength={120}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#30364a]">Descripción, alcance y entregables</label>
        <textarea
          className={`${inputClass} min-h-[150px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Qué incluye el servicio, cómo se desarrolla y qué recibe la organización al terminar."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#30364a]">Categoría</label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Selecciona una categoría</option>
            {SERVICE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#30364a]">Modalidad</label>
          <select className={inputClass} value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="remoto">Remoto</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#30364a]">Tarifa del servicio (CLP)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="450000"
          />
          <p className="mt-2 text-xs text-[#8a8fa0]">
            Skilly revisa la tarifa y puede sugerirte un ajuste antes de publicar.
          </p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#30364a]">Duración (días)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#30364a]">Habilidades (separadas por coma)</label>
        <input
          className={inputClass}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Encuestas, Facilitación, Informes"
        />
      </div>

      {error && <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c84949]">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#6f4cf6] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6241e8] disabled:opacity-60"
        >
          {saving ? "Guardando..." : service ? "Guardar cambios" : "Crear servicio"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/profesional/servicios")}
          className="rounded-xl border border-[#e1e2e8] px-6 py-3.5 text-sm font-semibold text-[#626776] transition hover:bg-[#f8f8fb]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
