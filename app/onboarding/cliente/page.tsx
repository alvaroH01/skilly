"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

type ClientType = "persona" | "organizacion";
type HiringFrequency =
  | "puntual"
  | "algunas_veces"
  | "frecuentemente"
  | "no_se";

const interestOptions = [
  "Marketing",
  "Diseño",
  "Tecnología",
  "Finanzas",
  "Personas/RRHH",
  "Legal",
  "Administración",
  "Ventas",
  "Operaciones",
  "Otro",
];

export default function ClienteOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");

  const [clientType, setClientType] = useState<ClientType | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organizationSize, setOrganizationSize] = useState("");
  const [website, setWebsite] = useState("");

  const [interestAreas, setInterestAreas] = useState<string[]>([]);
  const [hiringFrequency, setHiringFrequency] =
    useState<HiringFrequency | "">("");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }
    };

    loadUser();
  }, [router]);

  const toggleInterest = (interest: string) => {
    setInterestAreas((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleFinish = async () => {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    const { error: clientError } = await supabase
      .from("client_profiles")
      .upsert({
        user_id: user.id,
        phone,
        region,
        commune,
        client_type: clientType,
        organization_name:
          clientType === "organizacion" ? organizationName : null,
        job_title: clientType === "organizacion" ? jobTitle : null,
        organization_size:
          clientType === "organizacion" ? organizationSize : null,
        website: clientType === "organizacion" ? website : null,
        hiring_frequency: hiringFrequency,
        interest_areas: interestAreas,
      });

    if (clientError) {
      console.error(clientError);
      alert("No se pudo guardar tu perfil.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "cliente",
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(profileError);
      alert("No se pudo completar el registro.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/cliente");
    router.refresh();
  };

  const progressWidth =
    step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto min-h-[calc(100vh-48px)] max-w-[1500px] overflow-hidden rounded-[36px] border border-[#ececf6] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">

        <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Image
            src="/logo-skilly-clean.png"
            alt="Skilly"
            width={210}
            height={82}
            priority
            className="h-auto w-[170px] object-contain sm:w-[190px]"
          />

          <span className="rounded-full bg-[#f4f1ff] px-4 py-2 text-sm font-medium text-[#7b68d8]">
            Paso {step} de 3
          </span>
        </header>

        <div className="px-6 sm:px-10 lg:px-14">
          <div className="h-2 overflow-hidden rounded-full bg-[#eeeafc]">
            <div
              className="h-full rounded-full bg-[#7b61ff] transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <section className="mx-auto max-w-4xl px-6 py-12 sm:px-10 lg:px-14">

          {step === 1 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a78ed]">
                Tus datos
              </p>

              <h1 className="mt-3 text-4xl font-bold text-[#17213a]">
                Cuéntanos un poco sobre ti
              </h1>

              <p className="mt-3 text-[#7c8190]">
                Empecemos con algunos datos básicos para personalizar tu experiencia.
              </p>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Nombre completo
                  </label>

                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e6e4ef] px-5 py-4 outline-none transition focus:border-[#9d8df3]"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Teléfono
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e6e4ef] px-5 py-4 outline-none transition focus:border-[#9d8df3]"
                    placeholder="+56 9"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Región
                  </label>

                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e6e4ef] bg-white px-5 py-4 outline-none transition focus:border-[#9d8df3]"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Metropolitana">Metropolitana</option>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Biobío">Biobío</option>
                    <option value="Coquimbo">Coquimbo</option>
                    <option value="Maule">Maule</option>
                    <option value="Araucanía">Araucanía</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Comuna
                  </label>

                  <input
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e6e4ef] px-5 py-4 outline-none transition focus:border-[#9d8df3]"
                    placeholder="Tu comuna"
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-full bg-[#6f4cf6] px-7 py-3.5 font-semibold text-white transition hover:bg-[#5f3ee2]"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a78ed]">
                Cómo contratas
              </p>

              <h1 className="mt-3 text-4xl font-bold text-[#17213a]">
                ¿Cómo utilizarás Skilly?
              </h1>

              <p className="mt-3 text-[#7c8190]">
                Cuéntanos si contratarás como persona o representando a una organización.
              </p>

              <div className="mt-10 grid gap-5 md:grid-cols-2">
                <button
                  onClick={() => setClientType("persona")}
                  className={`rounded-[28px] border p-7 text-left transition ${
                    clientType === "persona"
                      ? "border-[#8b76f0] bg-[#f5f2ff]"
                      : "border-[#e8e5f4] bg-white"
                  }`}
                >
                  <div className="text-3xl">👤</div>

                  <h2 className="mt-5 text-xl font-bold text-[#17213a]">
                    Como persona
                  </h2>

                  <p className="mt-2 text-[#777c8b]">
                    Para proyectos o necesidades personales.
                  </p>
                </button>

                <button
                  onClick={() => setClientType("organizacion")}
                  className={`rounded-[28px] border p-7 text-left transition ${
                    clientType === "organizacion"
                      ? "border-[#8b76f0] bg-[#f5f2ff]"
                      : "border-[#e8e5f4] bg-white"
                  }`}
                >
                  <div className="text-3xl">🏢</div>

                  <h2 className="mt-5 text-xl font-bold text-[#17213a]">
                    Como organización
                  </h2>

                  <p className="mt-2 text-[#777c8b]">
                    Para una empresa, startup u organización.
                  </p>
                </button>
              </div>

              {clientType === "organizacion" && (
                <div className="mt-8 grid gap-6 rounded-[28px] bg-[#faf9ff] p-7 md:grid-cols-2">
                  <input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Nombre de la organización"
                    className="rounded-2xl border border-[#e6e4ef] bg-white px-5 py-4 outline-none"
                  />

                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Tu cargo"
                    className="rounded-2xl border border-[#e6e4ef] bg-white px-5 py-4 outline-none"
                  />

                  <select
                    value={organizationSize}
                    onChange={(e) => setOrganizationSize(e.target.value)}
                    className="rounded-2xl border border-[#e6e4ef] bg-white px-5 py-4 outline-none"
                  >
                    <option value="">Tamaño de la organización</option>
                    <option value="1-10">1 - 10 personas</option>
                    <option value="11-50">11 - 50 personas</option>
                    <option value="51-200">51 - 200 personas</option>
                    <option value="201-500">201 - 500 personas</option>
                    <option value="501+">501+ personas</option>
                  </select>

                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Sitio web (opcional)"
                    className="rounded-2xl border border-[#e6e4ef] bg-white px-5 py-4 outline-none"
                  />
                </div>
              )}

              <div className="mt-10 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-[#ddd9ed] px-7 py-3.5 font-semibold text-[#5f6370]"
                >
                  ← Volver
                </button>

                <button
                  onClick={() => setStep(3)}
                  disabled={!clientType}
                  className="rounded-full bg-[#6f4cf6] px-7 py-3.5 font-semibold text-white transition hover:bg-[#5f3ee2] disabled:opacity-40"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a78ed]">
                Tus intereses
              </p>

              <h1 className="mt-3 text-4xl font-bold text-[#17213a]">
                ¿Qué talento te interesa?
              </h1>

              <p className="mt-3 text-[#7c8190]">
                Puedes seleccionar todas las áreas que quieras.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {interestOptions.map((interest) => {
                  const selected = interestAreas.includes(interest);

                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                        selected
                          ? "border-[#7b61ff] bg-[#eee9ff] text-[#684ddf]"
                          : "border-[#e5e2ef] bg-white text-[#5f6370]"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {interest}
                    </button>
                  );
                })}
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold text-[#17213a]">
                  ¿Con qué frecuencia crees que contratarás?
                </h2>

                <div className="mt-5 grid gap-3">
                  {[
                    ["puntual", "Es una necesidad puntual"],
                    ["algunas_veces", "Algunas veces al año"],
                    ["frecuentemente", "Frecuentemente"],
                    ["no_se", "Todavía no lo sé"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setHiringFrequency(value as HiringFrequency)
                      }
                      className={`rounded-2xl border px-5 py-4 text-left transition ${
                        hiringFrequency === value
                          ? "border-[#8b76f0] bg-[#f5f2ff]"
                          : "border-[#e7e4ef] bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-full border border-[#ddd9ed] px-7 py-3.5 font-semibold text-[#5f6370]"
                >
                  ← Volver
                </button>

                <button
                  onClick={handleFinish}
                  disabled={
                    loading ||
                    interestAreas.length === 0 ||
                    !hiringFrequency
                  }
                  className="rounded-full bg-[#6f4cf6] px-8 py-3.5 font-semibold text-white transition hover:bg-[#5f3ee2] disabled:opacity-40"
                >
                  {loading ? "Guardando..." : "Completar mi perfil →"}
                </button>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}