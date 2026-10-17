"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

const AREAS = [
  "Marketing",
  "Diseño",
  "Tecnología",
  "Finanzas",
  "Personas / RRHH",
  "Legal",
  "Administración",
  "Ventas",
  "Operaciones",
  "Otro",
];

const SERVICE_TYPES = [
  "Proyecto completo",
  "Trabajo por horas",
  "Asesoría / consultoría",
  "Soporte recurrente",
];

export default function ProfesionalOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // PASO 1
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");

  // PASO 2
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // PASO 3
  const [areas, setAreas] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  // PASO 4
  const [workMode, setWorkMode] = useState("");
  const [availability, setAvailability] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data?.full_name) {
        setFullName(data.full_name);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [router]);

  const toggleArea = (area: string) => {
    setAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  };

  const toggleServiceType = (service: string) => {
    setServiceTypes((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();

    if (!trimmedSkill) return;

    const alreadyExists = skills.some(
      (skill) =>
        skill.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (!alreadyExists) {
      setSkills((current) => [...current, trimmedSkill]);
    }

    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((current) =>
      current.filter((skill) => skill !== skillToRemove)
    );
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        alert("Ingresa tu nombre completo.");
        return false;
      }

      if (!phone.trim()) {
        alert("Ingresa tu teléfono.");
        return false;
      }

      if (!region.trim()) {
        alert("Selecciona tu región.");
        return false;
      }

      if (!commune.trim()) {
        alert("Ingresa tu comuna.");
        return false;
      }
    }

    if (step === 2) {
      if (!professionalTitle.trim()) {
        alert("Ingresa tu profesión o especialidad.");
        return false;
      }

      if (!bio.trim()) {
        alert("Cuéntanos brevemente sobre tu experiencia.");
        return false;
      }

      if (!yearsExperience) {
        alert("Selecciona tus años de experiencia.");
        return false;
      }

      if (!experienceLevel) {
        alert("Selecciona tu nivel profesional.");
        return false;
      }
    }

    if (step === 3) {
      if (areas.length === 0) {
        alert("Selecciona al menos un área de trabajo.");
        return false;
      }

      if (skills.length === 0) {
        alert("Agrega al menos una habilidad.");
        return false;
      }

      if (serviceTypes.length === 0) {
        alert("Selecciona al menos un tipo de servicio.");
        return false;
      }
    }

    if (step === 4) {
      if (!workMode) {
        alert("Selecciona tu modalidad de trabajo.");
        return false;
      }

      if (!availability) {
        alert("Selecciona tu disponibilidad.");
        return false;
      }

      if (!weeklyHours) {
        alert("Selecciona tus horas disponibles por semana.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;

    setStep((current) => Math.min(current + 1, 4));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const finishOnboarding = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("No se pudo obtener el usuario.");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: professionalError } = await supabase
      .from("professional_profiles")
      .upsert({
        user_id: user.id,

        phone,
        region,
        commune,

        professional_title: professionalTitle,
        bio,

        years_experience: yearsExperience,
        experience_level: experienceLevel,

        areas,
        skills,
        service_types: serviceTypes,

        work_mode: workMode,
        availability,
        weekly_hours: weeklyHours,

        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        github_url: githubUrl || null,
      });

    if (professionalError) {
      console.error(
        "Error guardando perfil profesional:",
        professionalError
      );

      alert(
        "No se pudo guardar tu perfil profesional. Intenta nuevamente."
      );

      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role: "profesional",
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(
        "Error actualizando perfil principal:",
        profileError
      );

      alert("Tu perfil profesional se guardó, pero ocurrió un error final.");

      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="rounded-3xl border border-[#e7e7ef] bg-white px-8 py-6 text-sm text-[#777d8d] shadow-sm">
          Cargando tu perfil...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[32px] border border-[#ececf4] bg-white shadow-[0_30px_90px_rgba(85,70,140,0.08)]">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-[#eeeeF4] px-6 py-5 sm:px-10 lg:px-14">
          <div className="flex items-center">
            <Image
              src="/logo-skilly.png"
              alt="Skilly LATAM"
              width={210}
              height={82}
              priority
              className="h-auto w-[170px] object-contain sm:w-[190px]"
            />
          </div>

          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="rounded-full border border-[#e4e6ef] bg-white px-5 py-2.5 text-sm font-medium text-[#53586d] transition hover:bg-[#fafaff]"
          >
            ← Cambiar opción
          </button>
        </header>

        <div className="grid min-h-[780px] lg:grid-cols-[0.82fr_1.18fr]">

          {/* LADO IZQUIERDO */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#f6f1ff] via-[#f3fbff] to-[#fff8f1] px-7 py-12 sm:px-10 lg:px-14 lg:py-14">
            <div className="relative z-10 max-w-md">
              <span className="inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#6f4cf6] shadow-sm">
                Perfil profesional
              </span>

              <h1 className="mt-7 text-4xl font-semibold leading-[1.08] tracking-tight text-[#17213a] sm:text-5xl">
                Muéstrale al mundo
                <span className="block text-[#6f4cf6]">
                  lo que sabes hacer.
                </span>
              </h1>

              <p className="mt-6 text-base leading-7 text-[#73798a]">
                Completa tu perfil para que clientes y empresas puedan
                descubrir tu experiencia, tus habilidades y los servicios que
                puedes ofrecer.
              </p>

              {/* PROGRESO LATERAL */}
              <div className="mt-10 space-y-4">
                {[
                  {
                    number: 1,
                    title: "Sobre ti",
                    description: "Tus datos principales",
                  },
                  {
                    number: 2,
                    title: "Perfil profesional",
                    description: "Experiencia y especialidad",
                  },
                  {
                    number: 3,
                    title: "Servicios y habilidades",
                    description: "Lo que puedes ofrecer",
                  },
                  {
                    number: 4,
                    title: "Disponibilidad",
                    description: "Cómo quieres trabajar",
                  },
                ].map((item) => {
                  const active = item.number === step;
                  const completed = item.number < step;

                  return (
                    <div
                      key={item.number}
                      className={`flex items-center gap-4 rounded-[20px] border p-4 transition ${
                        active
                          ? "border-[#d8d0ff] bg-white shadow-[0_12px_30px_rgba(100,82,200,0.08)]"
                          : "border-white/60 bg-white/55"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          active || completed
                            ? "bg-[#6f4cf6] text-white"
                            : "bg-[#ececf4] text-[#9296a4]"
                        }`}
                      >
                        {completed ? "✓" : item.number}
                      </div>

                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            active
                              ? "text-[#20273b]"
                              : "text-[#777d8d]"
                          }`}
                        >
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-[#9397a5]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute -right-16 top-14 h-60 w-60 rounded-full bg-[#c8bfff]/45 blur-3xl" />
            <div className="absolute bottom-20 left-0 h-52 w-52 rounded-full bg-[#a8d4ff]/30 blur-3xl" />
            <div className="absolute bottom-8 right-12 h-44 w-44 rounded-full bg-[#ffd8bd]/45 blur-3xl" />
          </section>

          {/* FORMULARIO */}
          <section className="px-7 py-10 sm:px-10 lg:px-16 lg:py-14">
            <div className="mx-auto w-full max-w-3xl">

              {/* CABECERA PROGRESO */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#6f4cf6]">
                    Paso {step} de 4
                  </p>

                  <p className="text-sm text-[#9296a4]">
                    {step * 25}% completado
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efedf8]">
                  <div
                    className="h-full rounded-full bg-[#6f4cf6] transition-all duration-300"
                    style={{ width: `${step * 25}%` }}
                  />
                </div>
              </div>

              {/* PASO 1 */}
              {step === 1 && (
                <div className="mt-10">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#17213a] sm:text-4xl">
                    Cuéntanos sobre ti
                  </h2>

                  <p className="mt-3 leading-7 text-[#777d8d]">
                    Estos datos nos ayudarán a personalizar tu perfil
                    profesional.
                  </p>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                        Nombre completo
                      </label>

                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej: Diego Martínez"
                        className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                        Teléfono
                      </label>

                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                        Región
                      </label>

                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      >
                        <option value="">Selecciona una región</option>
                        <option value="Arica y Parinacota">
                          Arica y Parinacota
                        </option>
                        <option value="Tarapacá">Tarapacá</option>
                        <option value="Antofagasta">Antofagasta</option>
                        <option value="Atacama">Atacama</option>
                        <option value="Coquimbo">Coquimbo</option>
                        <option value="Valparaíso">Valparaíso</option>
                        <option value="Metropolitana">
                          Metropolitana
                        </option>
                        <option value="O'Higgins">O&apos;Higgins</option>
                        <option value="Maule">Maule</option>
                        <option value="Ñuble">Ñuble</option>
                        <option value="Biobío">Biobío</option>
                        <option value="La Araucanía">
                          La Araucanía
                        </option>
                        <option value="Los Ríos">Los Ríos</option>
                        <option value="Los Lagos">Los Lagos</option>
                        <option value="Aysén">Aysén</option>
                        <option value="Magallanes">Magallanes</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                        Comuna
                      </label>

                      <input
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="Ej: Providencia"
                        className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <div className="mt-10">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#17213a] sm:text-4xl">
                    Tu perfil profesional
                  </h2>

                  <p className="mt-3 leading-7 text-[#777d8d]">
                    Queremos entender tu experiencia y cómo te presentarás ante
                    futuros clientes.
                  </p>

                  <div className="mt-8 space-y-6">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                        Profesión o especialidad
                      </label>

                      <input
                        value={professionalTitle}
                        onChange={(e) =>
                          setProfessionalTitle(e.target.value)
                        }
                        placeholder="Ej: Desarrollador Full Stack"
                        className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                          Resumen profesional
                        </label>

                        <span className="text-xs text-[#999daa]">
                          {bio.length}/500
                        </span>
                      </div>

                      <textarea
                        value={bio}
                        maxLength={500}
                        onChange={(e) => setBio(e.target.value)}
                        rows={6}
                        placeholder="Ej: Soy desarrollador Full Stack con experiencia construyendo aplicaciones web para startups y empresas..."
                        className="w-full resize-none rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                          Años de experiencia
                        </label>

                        <select
                          value={yearsExperience}
                          onChange={(e) =>
                            setYearsExperience(e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                        >
                          <option value="">Selecciona una opción</option>
                          <option value="menos_1">
                            Menos de 1 año
                          </option>
                          <option value="1_3">1 - 3 años</option>
                          <option value="4_6">4 - 6 años</option>
                          <option value="7_10">7 - 10 años</option>
                          <option value="mas_10">
                            Más de 10 años
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                          Nivel profesional
                        </label>

                        <select
                          value={experienceLevel}
                          onChange={(e) =>
                            setExperienceLevel(e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                        >
                          <option value="">Selecciona una opción</option>
                          <option value="junior">Junior</option>
                          <option value="semi_senior">
                            Semi Senior
                          </option>
                          <option value="senior">Senior</option>
                          <option value="especialista">
                            Especialista / Consultor
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <div className="mt-10">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#17213a] sm:text-4xl">
                    Servicios y habilidades
                  </h2>

                  <p className="mt-3 leading-7 text-[#777d8d]">
                    Selecciona las áreas en las que trabajas y agrega las
                    habilidades que mejor representan tu experiencia.
                  </p>

                  <div className="mt-8 space-y-8">

                    <div>
                      <label className="mb-4 block text-sm font-semibold text-[#34394d]">
                        ¿En qué áreas trabajas?
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {AREAS.map((area) => {
                          const selected = areas.includes(area);

                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => toggleArea(area)}
                              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                                selected
                                  ? "border-[#6f4cf6] bg-[#6f4cf6] text-white shadow-sm"
                                  : "border-[#dedfe9] bg-white text-[#606678] hover:border-[#b9adff] hover:bg-[#f8f6ff]"
                              }`}
                            >
                              {selected ? "✓ " : ""}
                              {area}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-[#34394d]">
                        Principales habilidades
                      </label>

                      <div className="flex gap-3">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          placeholder="Ej: React, Excel, Figma, Ventas..."
                          className="min-w-0 flex-1 rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                        />

                        <button
                          type="button"
                          onClick={addSkill}
                          className="rounded-2xl bg-[#eeeaff] px-5 py-3 text-sm font-semibold text-[#6f4cf6] transition hover:bg-[#e5dfff]"
                        >
                          + Agregar
                        </button>
                      </div>

                      {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <div
                              key={skill}
                              className="flex items-center gap-2 rounded-full bg-[#f2efff] px-3.5 py-2 text-sm font-medium text-[#625692]"
                            >
                              {skill}

                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[#8b82aa] transition hover:bg-white hover:text-[#433b63]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-4 block text-sm font-semibold text-[#34394d]">
                        ¿Qué tipo de servicios ofreces?
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {SERVICE_TYPES.map((service) => {
                          const selected =
                            serviceTypes.includes(service);

                          return (
                            <button
                              key={service}
                              type="button"
                              onClick={() =>
                                toggleServiceType(service)
                              }
                              className={`rounded-[18px] border p-4 text-left text-sm font-medium transition ${
                                selected
                                  ? "border-[#a99aff] bg-[#f4f1ff] text-[#5647aa]"
                                  : "border-[#dedfe9] bg-white text-[#62687a] hover:border-[#beb4f7]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                                    selected
                                      ? "border-[#6f4cf6] bg-[#6f4cf6] text-white"
                                      : "border-[#d4d5df]"
                                  }`}
                                >
                                  {selected ? "✓" : ""}
                                </div>

                                {service}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4 */}
              {step === 4 && (
                <div className="mt-10">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#17213a] sm:text-4xl">
                    Disponibilidad y enlaces
                  </h2>

                  <p className="mt-3 leading-7 text-[#777d8d]">
                    Cuéntanos cómo quieres trabajar y agrega tus perfiles
                    profesionales si los tienes.
                  </p>

                  <div className="mt-8 space-y-7">
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-[#34394d]">
                        Modalidad de trabajo
                      </label>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            value: "remoto",
                            label: "Remoto",
                            icon: "🏠",
                          },
                          {
                            value: "presencial",
                            label: "Presencial",
                            icon: "🏢",
                          },
                          {
                            value: "hibrido",
                            label: "Híbrido",
                            icon: "🔄",
                          },
                        ].map((option) => {
                          const selected =
                            workMode === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setWorkMode(option.value)
                              }
                              className={`rounded-[18px] border p-4 text-center transition ${
                                selected
                                  ? "border-[#a99aff] bg-[#f4f1ff] shadow-sm"
                                  : "border-[#dedfe9] bg-white hover:border-[#c6bdfa]"
                              }`}
                            >
                              <div className="text-2xl">
                                {option.icon}
                              </div>

                              <div
                                className={`mt-2 text-sm font-semibold ${
                                  selected
                                    ? "text-[#5b4caf]"
                                    : "text-[#555b6d]"
                                }`}
                              >
                                {option.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                          Disponibilidad
                        </label>

                        <select
                          value={availability}
                          onChange={(e) =>
                            setAvailability(e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                        >
                          <option value="">Selecciona una opción</option>
                          <option value="disponible">
                            Disponible ahora
                          </option>
                          <option value="parcial">
                            Disponible parcialmente
                          </option>
                          <option value="no_disponible">
                            No disponible actualmente
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#34394d]">
                          Horas disponibles por semana
                        </label>

                        <select
                          value={weeklyHours}
                          onChange={(e) =>
                            setWeeklyHours(e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                        >
                          <option value="">
                            Selecciona una opción
                          </option>
                          <option value="menos_10">
                            Menos de 10 horas
                          </option>
                          <option value="10_20">
                            10 - 20 horas
                          </option>
                          <option value="21_30">
                            21 - 30 horas
                          </option>
                          <option value="31_40">
                            31 - 40 horas
                          </option>
                          <option value="mas_40">
                            Más de 40 horas
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-[#eeeeF4] pt-7">
                      <p className="text-sm font-semibold text-[#34394d]">
                        Presencia profesional
                      </p>

                      <p className="mt-1 text-sm text-[#8b8f9d]">
                        Estos campos son opcionales.
                      </p>

                      <div className="mt-5 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#565c6e]">
                            LinkedIn
                          </label>

                          <input
                            value={linkedinUrl}
                            onChange={(e) =>
                              setLinkedinUrl(e.target.value)
                            }
                            placeholder="https://linkedin.com/in/tu-perfil"
                            className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#565c6e]">
                            Portafolio o sitio web
                          </label>

                          <input
                            value={portfolioUrl}
                            onChange={(e) =>
                              setPortfolioUrl(e.target.value)
                            }
                            placeholder="https://tuportafolio.com"
                            className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#565c6e]">
                            GitHub
                          </label>

                          <input
                            value={githubUrl}
                            onChange={(e) =>
                              setGithubUrl(e.target.value)
                            }
                            placeholder="https://github.com/tuusuario"
                            className="w-full rounded-2xl border border-[#dedfe9] bg-white px-4 py-3.5 text-[#262d42] outline-none transition placeholder:text-[#a3a6b2] focus:border-[#9987ff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTONES */}
              <div className="mt-10 flex items-center justify-between border-t border-[#eeeeF4] pt-7">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={previousStep}
                      disabled={loading}
                      className="rounded-2xl border border-[#dedfe9] bg-white px-6 py-3.5 text-sm font-semibold text-[#555b6d] transition hover:bg-[#fafaff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      ← Atrás
                    </button>
                  )}
                </div>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-2xl bg-[#6f4cf6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(111,76,246,0.25)] transition hover:bg-[#6241e8]"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishOnboarding}
                    disabled={loading}
                    className="rounded-2xl bg-[#6f4cf6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(111,76,246,0.25)] transition hover:bg-[#6241e8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Guardando perfil..."
                      : "Completar mi perfil →"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}