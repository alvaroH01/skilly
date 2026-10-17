"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

export default function PerfilProfesionalPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [professionalTitle, setProfessionalTitle] =
    useState("");
  const [bio, setBio] = useState("");

  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "profesional") {
        router.push("/dashboard");
        return;
      }

      setFullName(profile.full_name ?? "");

      const { data: professional } = await supabase
        .from("professional_profiles")
        .select(
          `
          professional_title,
          bio,
          phone,
          region,
          commune,
          linkedin_url,
          portfolio_url,
          github_url
          `
        )
        .eq("user_id", user.id)
        .single();

      if (professional) {
        setProfessionalTitle(
          professional.professional_title ?? ""
        );
        setBio(professional.bio ?? "");
        setPhone(professional.phone ?? "");
        setRegion(professional.region ?? "");
        setCommune(professional.commune ?? "");
        setLinkedinUrl(professional.linkedin_url ?? "");
        setPortfolioUrl(professional.portfolio_url ?? "");
        setGithubUrl(professional.github_url ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(profileError);
      alert("No pudimos actualizar tu nombre.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("professional_profiles")
      .update({
        professional_title: professionalTitle.trim(),
        bio: bio.trim(),
        phone,
        region,
        commune,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      alert("No pudimos actualizar tu perfil.");
      setSaving(false);
      return;
    }

    setSaving(false);
    alert("Perfil actualizado correctamente.");
    router.refresh();
  };

  const initial =
    fullName.trim().charAt(0).toUpperCase() || "P";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#ddd6ff] border-t-[#6f4cf6]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1500px] overflow-hidden rounded-[30px] border border-[#e9e9f1] bg-white shadow-[0_30px_90px_rgba(80,70,130,0.08)]">

        <header className="flex min-h-[82px] items-center justify-between border-b border-[#eeeeF4] px-6 sm:px-8">
          <Link href="/dashboard/profesional">
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly"
              width={170}
              height={65}
              className="h-auto w-[135px]"
            />
          </Link>

          <Link
            href="/dashboard/profesional"
            className="rounded-xl border border-[#e2e2ea] px-4 py-2.5 text-sm font-semibold text-[#5f6473] transition hover:bg-[#f8f8fb]"
          >
            ← Volver al dashboard
          </Link>
        </header>

        <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-10">

          <p className="text-sm font-semibold text-[#7458e8]">
            Perfil profesional
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#191f34] sm:text-4xl">
            Mi perfil
          </h1>

          <p className="mt-3 text-[#777d8d]">
            Esta información ayudará a los clientes a conocerte
            antes de enviarte una oportunidad.
          </p>

          <div className="mt-9 grid gap-7 lg:grid-cols-[320px_1fr]">

            <aside>
              <div className="rounded-[26px] border border-[#ebeaf1] bg-[#fafafe] p-7 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#6f4cf6] text-3xl font-semibold text-white">
                  {initial}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#20263a]">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#7259e5]">
                  {professionalTitle || "Profesional"}
                </p>

                {bio ? (
                  <p className="mt-5 text-sm leading-6 text-[#686e7d]">
                    {bio}
                  </p>
                ) : (
                  <p className="mt-5 text-sm italic text-[#a0a4af]">
                    Agrega una breve descripción sobre ti.
                  </p>
                )}

              </div>
            </aside>

            <section className="rounded-[26px] border border-[#ebeaf1] p-6 sm:p-8">

              <div className="grid gap-6 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Nombre completo
                  </label>

                  <input
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Correo
                  </label>

                  <input
                    value={email}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-[#e7e7ed] bg-[#f6f6f9] px-5 py-4 text-[#9296a4]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Título profesional
                  </label>

                  <input
                    value={professionalTitle}
                    onChange={(e) =>
                      setProfessionalTitle(e.target.value)
                    }
                    placeholder="Ej: Diseñador UX/UI"
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-semibold text-[#30364a]">
                      Mini biografía
                    </label>

                    <span className="text-xs text-[#999dab]">
                      {bio.length}/500
                    </span>
                  </div>

                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value.slice(0, 500))
                    }
                    rows={6}
                    placeholder="Cuéntales a los clientes sobre tu experiencia, especialidad y qué tipo de proyectos te interesa desarrollar..."
                    className="mt-2 w-full resize-none rounded-2xl border border-[#e3e3ec] px-5 py-4 leading-7 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Teléfono
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Región
                  </label>

                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Comuna
                  </label>

                  <input
                    value={commune}
                    onChange={(e) =>
                      setCommune(e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    LinkedIn
                  </label>

                  <input
                    value={linkedinUrl}
                    onChange={(e) =>
                      setLinkedinUrl(e.target.value)
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    Portafolio
                  </label>

                  <input
                    value={portfolioUrl}
                    onChange={(e) =>
                      setPortfolioUrl(e.target.value)
                    }
                    placeholder="https://"
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#30364a]">
                    GitHub
                  </label>

                  <input
                    value={githubUrl}
                    onChange={(e) =>
                      setGithubUrl(e.target.value)
                    }
                    placeholder="https://github.com/"
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-2xl bg-[#6f4cf6] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6241e8] disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>

            </section>
          </div>
        </div>
      </div>
    </main>
  );
}