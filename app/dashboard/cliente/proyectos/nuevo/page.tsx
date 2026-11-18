"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";

const categories = [
  "Diseño",
  "Tecnología",
  "Marketing",
  "Finanzas",
  "Personas / RRHH",
  "Legal",
  "Administración",
  "Ventas",
  "Operaciones",
  "Otro",
];

export default function NuevoProyectoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [modality, setModality] = useState("remoto");

  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const [deadline, setDeadline] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addSkill = () => {
    const cleanSkill = skillInput.trim();

    if (!cleanSkill) return;

    if (
      skills.some(
        (skill) =>
          skill.toLowerCase() === cleanSkill.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Ingresa un título para el proyecto.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        "Describe lo que necesitas para tu proyecto."
      );
      return;
    }

    if (!category) {
      setErrorMessage("Selecciona una categoría.");
      return;
    }

    if (
      budgetMin &&
      budgetMax &&
      Number(budgetMin) > Number(budgetMax)
    ) {
      setErrorMessage(
        "El presupuesto mínimo no puede superar al máximo."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // El proyecto nace como borrador (la base lo exige) y se envía a validación
      // con la función segura submit_project_for_validation.
      const { data: created, error } = await supabase
        .from("projects")
        .insert({
          client_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          modality,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          deadline: deadline || null,
          skills,
          status: "borrador",
          validation_status: "no_enviado",
        })
        .select("id")
        .single();

      if (!error && created?.id) {
        const { error: submitError } = await supabase.rpc(
          "submit_project_for_validation",
          { p_project_id: created.id }
        );

        if (submitError) {
          console.error("Error enviando a validación:", submitError);
          setErrorMessage(
            `El proyecto se guardó como borrador, pero no pudo enviarse a validación: ${submitError.message}`
          );
          setLoading(false);
          return;
        }
      }

      if (error) {
        console.error("Error insertando proyecto:", error);
        setErrorMessage(
          `Error al guardar: ${error.message} (${error.details || error.hint || ""})`
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard/cliente/proyectos");
      router.refresh();
    } catch (err: any) {
      console.error("Error inesperado:", err);
      setErrorMessage(`Error inesperado: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px] rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">

        <header className="flex items-center justify-between border-b border-[#eeeeF4] px-6 py-6 sm:px-9">
          <div>
            <p className="text-sm font-semibold text-[#7458e8]">
              Proyectos
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-[#1d2439]">
              Publicar nuevo proyecto
            </h1>
          </div>

          <Link
            href="/dashboard/cliente"
            className="rounded-xl border border-[#e0e1e8] px-4 py-2.5 text-sm font-semibold text-[#606575] transition hover:bg-[#f8f8fb]"
          >
            ← Volver
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_320px]"
        >
          <section className="space-y-7">

            {/* TITULO */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Título del proyecto
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Diseño de identidad visual para startup"
                className="mt-2 w-full rounded-2xl border border-[#e1e2e9] px-5 py-4 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-[#30364a]">
                  Descripción
                </label>

                <span className="text-xs text-[#9b9eaa]">
                  {description.length}/2000
                </span>
              </div>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, 2000)
                  )
                }
                rows={8}
                placeholder="Describe el proyecto, qué necesitas, objetivos y cualquier información que pueda ayudar al profesional..."
                className="mt-2 w-full resize-none rounded-2xl border border-[#e1e2e9] px-5 py-4 leading-7 outline-none transition focus:border-[#8d79f6] focus:ring-4 focus:ring-[#6f4cf6]/10"
              />
            </div>

            {/* CATEGORIA */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Categoría
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#e1e2e9] bg-white px-5 py-4 outline-none focus:border-[#8d79f6]"
              >
                <option value="">
                  Selecciona una categoría
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* MODALIDAD */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Modalidad
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ["remoto", "Remoto"],
                  ["presencial", "Presencial"],
                  ["hibrido", "Híbrido"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setModality(value)
                    }
                    className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                      modality === value
                        ? "border-[#8d79f6] bg-[#f2efff] text-[#6748df]"
                        : "border-[#e1e2e9] text-[#666b79] hover:bg-[#fafafd]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* PRESUPUESTO */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Presupuesto estimado
              </label>

              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs text-[#9094a1]">
                    Mínimo
                  </p>

                  <div className="flex items-center rounded-2xl border border-[#e1e2e9] px-4">
                    <span className="text-[#858997]">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={budgetMin}
                      onChange={(e) =>
                        setBudgetMin(e.target.value)
                      }
                      placeholder="100000"
                      className="w-full px-3 py-4 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-[#9094a1]">
                    Máximo
                  </p>

                  <div className="flex items-center rounded-2xl border border-[#e1e2e9] px-4">
                    <span className="text-[#858997]">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={budgetMax}
                      onChange={(e) =>
                        setBudgetMax(e.target.value)
                      }
                      placeholder="300000"
                      className="w-full px-3 py-4 outline-none"
                    />
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs text-[#999da9]">
                Valores referenciales en pesos chilenos.
              </p>
            </div>

            {/* FECHA */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Fecha límite
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#e1e2e9] px-5 py-4 outline-none focus:border-[#8d79f6]"
              />
            </div>

            {/* HABILIDADES */}
            <div>
              <label className="text-sm font-semibold text-[#30364a]">
                Habilidades deseadas
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Ej: Figma"
                  className="min-w-0 flex-1 rounded-2xl border border-[#e1e2e9] px-5 py-4 outline-none focus:border-[#8d79f6]"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-2xl bg-[#f0ecff] px-5 text-sm font-semibold text-[#6848ef]"
                >
                  Agregar
                </button>
              </div>

              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() =>
                        removeSkill(skill)
                      }
                      className="rounded-full bg-[#f3f1fc] px-3 py-1.5 text-xs font-medium text-[#635c7a]"
                    >
                      {skill} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-[#ffd9d9] bg-[#fff6f6] px-5 py-4 text-sm font-medium text-[#b34545]">
                {errorMessage}
              </div>
            )}

          </section>

          {/* RESUMEN */}
          <aside>
            <div className="sticky top-8 rounded-[24px] border border-[#e8e7ef] bg-[#fafafe] p-6">

              <p className="text-sm font-semibold text-[#252b40]">
                Proceso de validación
              </p>

              <div className="mt-5 space-y-4 text-sm leading-6 text-[#777c8c]">

                <p>
                  ✓ Tu proyecto pasará por un filtro de revisión con el equipo de Skilly.
                </p>

                <p>
                  ✓ Aseguramos que el alcance y presupuesto sean justos y claros.
                </p>

                <p>
                  ✓ Una vez validado por el administrador, se publicará en el catálogo general.
                </p>

              </div>

              <div className="my-6 h-px bg-[#e5e5ec]" />

              <p className="text-xs leading-5 text-[#999da9]">
                Al enviar el proyecto, será revisado por el equipo de Skilly antes de ser visible para los profesionales.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#6f4cf6] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(111,76,246,0.22)] transition hover:bg-[#6241e8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Enviando a revisión..."
                  : "Enviar proyecto a validación"}
              </button>

            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
