"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";


export default function PerfilClientePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");
  const [bio, setBio] = useState("");

  const [clientType, setClientType] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [website, setWebsite] = useState("");

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

      if (!profile || profile.role !== "cliente") {
        router.push("/dashboard");
        return;
      }

      setFullName(profile.full_name ?? "");

      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select(
          `
          phone,
          region,
          commune,
          bio,
          client_type,
          organization_name,
          job_title,
          website
          `
        )
        .eq("user_id", user.id)
        .single();

      if (clientProfile) {
        setPhone(clientProfile.phone ?? "");
        setRegion(clientProfile.region ?? "");
        setCommune(clientProfile.commune ?? "");
        setBio(clientProfile.bio ?? "");
        setClientType(clientProfile.client_type ?? "");
        setOrganizationName(clientProfile.organization_name ?? "");
        setJobTitle(clientProfile.job_title ?? "");
        setWebsite(clientProfile.website ?? "");
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

    const { error: clientError } = await supabase
      .from("client_profiles")
      .update({
        phone,
        region,
        commune,
        bio: bio.trim(),
        organization_name:
          clientType === "organizacion"
            ? organizationName
            : null,
        job_title:
          clientType === "organizacion"
            ? jobTitle
            : null,
        website:
          clientType === "organizacion"
            ? website
            : null,
      })
      .eq("user_id", user.id);

    if (clientError) {
      console.error(clientError);
      alert("No pudimos actualizar tu perfil.");
      setSaving(false);
      return;
    }

    setSaving(false);
    alert("Perfil actualizado correctamente.");
    router.refresh();
  };

  const initial =
    fullName.trim().charAt(0).toUpperCase() || "U";

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

        {/* HEADER */}
        <header className="flex min-h-[82px] items-center justify-between border-b border-[#eeeeF4] px-6 sm:px-8">

          <Link href="/dashboard/cliente">
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly"
              width={170}
              height={65}
              className="h-auto w-[135px]"
            />
          </Link>

          <Link
            href="/dashboard/cliente"
            className="rounded-xl border border-[#e2e2ea] px-4 py-2.5 text-sm font-semibold text-[#5f6473] transition hover:bg-[#f8f8fb]"
          >
            ← Volver al dashboard
          </Link>

        </header>

        <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-10">

          <div className="mb-9">
            <p className="text-sm font-semibold text-[#7458e8]">
              Mi cuenta
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#191f34] sm:text-4xl">
              Mi perfil
            </h1>

            <p className="mt-3 text-[#777d8d]">
              Actualiza la información que utilizas dentro de Skilly.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[320px_1fr]">

            {/* TARJETA LATERAL */}
            <aside>
              <div className="rounded-[26px] border border-[#ebeaf1] bg-[#fafafe] p-7 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#6848ef] text-3xl font-semibold text-white">
                  {initial}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#20263a]">
                  {fullName || "Usuario Skilly"}
                </h2>

                <p className="mt-1 text-sm text-[#9296a4]">
                  Cliente
                </p>

                {bio ? (
                  <p className="mt-5 text-sm leading-6 text-[#686e7d]">
                    {bio}
                  </p>
                ) : (
                  <p className="mt-5 text-sm italic leading-6 text-[#a0a4af]">
                    Aún no has agregado una biografía.
                  </p>
                )}

              </div>
            </aside>

            {/* FORMULARIO */}
            <section className="rounded-[26px] border border-[#ebeaf1] bg-white p-6 sm:p-8">

              <div className="grid gap-6 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Nombre completo
                  </label>

                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] bg-[#fcfcff] px-5 py-4 outline-none transition focus:border-[#8b7bf4] focus:ring-4 focus:ring-[#8b7bf4]/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#30364a]">
                    Correo electrónico
                  </label>

                  <input
                    value={email}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-2xl border border-[#e7e7ed] bg-[#f6f6f9] px-5 py-4 text-[#9296a4]"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-[#30364a]">
                      Mini biografía
                    </label>

                    <span className="text-xs text-[#9a9eab]">
                      {bio.length}/300
                    </span>
                  </div>

                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value.slice(0, 300))
                    }
                    rows={5}
                    placeholder="Cuéntale brevemente a la comunidad quién eres, qué haces o qué tipo de profesionales buscas..."
                    className="mt-2 w-full resize-none rounded-2xl border border-[#e3e3ec] bg-[#fcfcff] px-5 py-4 leading-7 outline-none transition focus:border-[#8b7bf4] focus:ring-4 focus:ring-[#8b7bf4]/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#9498a6]">
                    Esta descripción aparecerá en tu perfil dentro de Skilly.
                  </p>
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
                    onChange={(e) => setCommune(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                  />
                </div>

                {clientType === "organizacion" && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-[#30364a]">
                        Organización
                      </label>

                      <input
                        value={organizationName}
                        onChange={(e) =>
                          setOrganizationName(e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#30364a]">
                        Cargo
                      </label>

                      <input
                        value={jobTitle}
                        onChange={(e) =>
                          setJobTitle(e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-[#30364a]">
                        Sitio web
                      </label>

                      <input
                        value={website}
                        onChange={(e) =>
                          setWebsite(e.target.value)
                        }
                        placeholder="https://"
                        className="mt-2 w-full rounded-2xl border border-[#e3e3ec] px-5 py-4 outline-none focus:border-[#8b7bf4]"
                      />
                    </div>
                  </>
                )}

              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-2xl bg-[#6f4cf6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(111,76,246,0.23)] transition hover:bg-[#6241e8] disabled:cursor-not-allowed disabled:opacity-60"
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