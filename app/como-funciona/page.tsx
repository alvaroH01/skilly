import Image from "next/image";
import Link from "next/link";

/* ======================================================
   ICONOS
====================================================== */

function UserIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 20C5.8 15.9 8 14 12 14C16 14 18.2 15.9 18.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3.5"
        width="16"
        height="17"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="9"
        cy="9"
        r="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 15C7.3 12.9 8.4 12 10 12C11.6 12 12.7 12.9 13 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 8H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 12H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 6V4.5C8 3.7 8.7 3 9.5 3H14.5C15.3 3 16 3.7 16 4.5V6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 11H21"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 15L20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProposalIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H18.5C19.3 4 20 4.7 20 5.5V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 9H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 13H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 17H11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.5 12L10.5 15L16.5 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ======================================================
   DATOS
====================================================== */

const clientSteps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description:
      "Regístrate en Skilly y selecciona el perfil Cliente para comenzar.",
    icon: <UserIcon />,
    bg: "#eee8ff",
    color: "#6543dc",
  },
  {
    number: "02",
    title: "Completa tu perfil",
    description:
      "Agrega tus datos personales o los de tu organización y define tus áreas de interés.",
    icon: <ProfileIcon />,
    bg: "#e8f7f1",
    color: "#24966e",
  },
  {
    number: "03",
    title: "Publica tu proyecto",
    description:
      "Describe lo que necesitas, presupuesto, modalidad y habilidades requeridas.",
    icon: <ProjectIcon />,
    bg: "#fff0df",
    color: "#d78328",
  },
  {
    number: "04",
    title: "Recibe propuestas",
    description:
      "Los profesionales interesados podrán enviar una propuesta asociada a tu proyecto.",
    icon: <ProposalIcon />,
    bg: "#e9f2ff",
    color: "#347fc2",
  },
  {
    number: "05",
    title: "Revisa y decide",
    description:
      "Compara las propuestas recibidas y selecciona la alternativa que mejor se ajuste a tu necesidad.",
    icon: <CheckIcon />,
    bg: "#ffe9e2",
    color: "#d96849",
  },
];

const professionalSteps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description:
      "Regístrate en Skilly y elige el perfil Profesional.",
    icon: <UserIcon />,
    bg: "#eee8ff",
    color: "#6543dc",
  },
  {
    number: "02",
    title: "Construye tu perfil",
    description:
      "Presenta tu experiencia, especialidad, habilidades, disponibilidad y enlaces profesionales.",
    icon: <ProfileIcon />,
    bg: "#e8f7f1",
    color: "#24966e",
  },
  {
    number: "03",
    title: "Explora oportunidades",
    description:
      "Busca proyectos disponibles y revisa cuáles se ajustan mejor a tu perfil.",
    icon: <SearchIcon />,
    bg: "#e9f2ff",
    color: "#347fc2",
  },
  {
    number: "04",
    title: "Envía tu propuesta",
    description:
      "Indica tu mensaje, valor propuesto y plazo estimado para realizar el proyecto.",
    icon: <ProposalIcon />,
    bg: "#fff0df",
    color: "#d78328",
  },
  {
    number: "05",
    title: "Revisa el resultado",
    description:
      "Podrás consultar el estado de tu propuesta y recibir notificaciones cuando exista una actualización.",
    icon: <CheckIcon />,
    bg: "#ffe9e2",
    color: "#d96849",
  },
];

/* ======================================================
   PAGE
====================================================== */

export default function HowItWorksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf3] text-[#171b2d]">

      {/* ==================================================
          FONDO
      =================================================== */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 10%, rgba(255,221,130,.48), transparent 28%), radial-gradient(circle at 90% 22%, rgba(77,205,163,.28), transparent 30%), radial-gradient(circle at 12% 78%, rgba(183,135,239,.22), transparent 30%), radial-gradient(circle at 88% 85%, rgba(243,126,86,.28), transparent 32%)",
        }}
      />

      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="relative z-50 border-b border-white/70 bg-white/45 backdrop-blur-xl">

        <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 lg:px-12">

          <Link
            href="/"
            className="flex items-center"
          >
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly LATAM"
              width={200}
              height={80}
              priority
              className="h-auto w-[160px] object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-medium text-[#343846] lg:flex">

            <Link
              href="/buscar"
              className="transition hover:text-[#6543dc]"
            >
              Encuentra talento
            </Link>


            <Link
              href="/como-funciona"
              className="font-semibold text-[#6543dc]"
            >
              Cómo funciona
            </Link>

            <Link
              href="/conocenos"
              className="transition hover:text-[#6543dc]"
            >
              Conócenos
            </Link>

          </nav>

          <div className="flex items-center gap-3">

            <Link
              href="/login"
              className="hidden rounded-xl border border-[#ded8d1] bg-white/80 px-5 py-3 text-sm font-medium text-[#292d3a] transition hover:bg-white sm:inline-flex"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="rounded-xl bg-[#6543dc] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(101,67,220,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5634ca]"
            >
              Únete a Skilly
            </Link>

          </div>

        </div>

      </header>

      {/* ==================================================
          HERO
      =================================================== */}

      <section className="relative z-10">

        <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-16 text-center lg:px-12 lg:pb-20 lg:pt-20">

          <div className="mx-auto inline-flex items-center rounded-full border border-[#ded6ff] bg-white/70 px-4 py-2 text-xs font-semibold text-[#6543dc] shadow-sm backdrop-blur">
            Simple, claro y pensado para conectar talento
          </div>

          <h1 className="mx-auto mt-6 max-w-[850px] text-4xl font-semibold tracking-[-0.04em] text-[#181d31] sm:text-5xl lg:text-[58px] lg:leading-[1.08]">
            Así funciona Skilly
          </h1>

          <p className="mx-auto mt-6 max-w-[720px] text-base leading-8 text-[#686d79] sm:text-lg">
            Encuentra talento o descubre nuevas oportunidades siguiendo un
            proceso simple, ordenado y directo.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              href="/registro"
              className="rounded-2xl bg-[#6543dc] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(101,67,220,0.24)] transition hover:-translate-y-0.5 hover:bg-[#5634ca]"
            >
              Crear mi cuenta
            </Link>

            <Link
              href="/buscar"
              className="rounded-2xl border border-[#ded8e6] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#414654] transition hover:bg-white"
            >
              Explorar oportunidades
            </Link>

          </div>

        </div>

      </section>

      {/* ==================================================
          BLOQUE CLIENTE
      =================================================== */}

      <section className="relative z-10 mx-auto max-w-[1250px] px-6 pb-14 lg:px-12">

        <div className="rounded-[34px] border border-white/80 bg-white/72 p-6 shadow-[0_28px_80px_rgba(75,61,110,0.09)] backdrop-blur-xl sm:p-9 lg:p-11">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <span className="inline-flex rounded-full bg-[#eee8ff] px-4 py-2 text-xs font-semibold text-[#6543dc]">
                Para clientes
              </span>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#20253a]">
                Encuentra el talento que necesitas
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#737884]">
                Publica una necesidad específica y permite que profesionales
                interesados presenten sus propuestas.
              </p>

            </div>

            <Link
              href="/registro"
              className="text-sm font-semibold text-[#6543dc]"
            >
              Publicar un proyecto →
            </Link>

          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

            {clientSteps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-[24px] border border-[#ebe8ef] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d8d0ff] hover:shadow-[0_16px_35px_rgba(77,60,120,0.08)]"
              >

                <div className="flex items-center justify-between">

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: step.bg,
                      color: step.color,
                    }}
                  >
                    {step.icon}
                  </div>

                  <span className="text-xs font-semibold text-[#b2b4bc]">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-5 text-base font-semibold text-[#282d40]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#7b808c]">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ==================================================
          BLOQUE PROFESIONAL
      =================================================== */}

      <section className="relative z-10 mx-auto max-w-[1250px] px-6 pb-14 lg:px-12">

        <div className="rounded-[34px] border border-[#e8e4f4] bg-[#f8f6ff]/88 p-6 shadow-[0_28px_80px_rgba(75,61,110,0.08)] backdrop-blur-xl sm:p-9 lg:p-11">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <span className="inline-flex rounded-full bg-[#e6f6ef] px-4 py-2 text-xs font-semibold text-[#23845f]">
                Para profesionales
              </span>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#20253a]">
                Encuentra nuevas oportunidades
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#737884]">
                Construye tu perfil, descubre proyectos y presenta propuestas
                que reflejen tu experiencia y disponibilidad.
              </p>

            </div>

            <Link
              href="/buscar"
              className="text-sm font-semibold text-[#6543dc]"
            >
              Explorar proyectos →
            </Link>

          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

            {professionalSteps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-[24px] border border-[#e7e4ef] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d8d0ff] hover:shadow-[0_16px_35px_rgba(77,60,120,0.08)]"
              >

                <div className="flex items-center justify-between">

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: step.bg,
                      color: step.color,
                    }}
                  >
                    {step.icon}
                  </div>

                  <span className="text-xs font-semibold text-[#b2b4bc]">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-5 text-base font-semibold text-[#282d40]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#7b808c]">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ==================================================
          BENEFICIOS
      =================================================== */}

      <section className="relative z-10 mx-auto max-w-[1150px] px-6 pb-16 lg:px-12">

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-[26px] border border-white/80 bg-white/70 p-6 backdrop-blur">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eee8ff] text-[#6543dc]">
              <SearchIcon />
            </div>

            <h3 className="mt-5 font-semibold text-[#262c40]">
              Todo en un mismo lugar
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#797e8a]">
              Descubre perfiles, proyectos y oportunidades sin depender de
              múltiples canales.
            </p>

          </div>

          <div className="rounded-[26px] border border-white/80 bg-white/70 p-6 backdrop-blur">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f7f1] text-[#24966e]">
              <CheckIcon />
            </div>

            <h3 className="mt-5 font-semibold text-[#262c40]">
              Procesos más claros
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#797e8a]">
              Revisa proyectos, propuestas y estados desde una interfaz simple y
              ordenada.
            </p>

          </div>

          <div className="rounded-[26px] border border-white/80 bg-white/70 p-6 backdrop-blur">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0df] text-[#d78328]">
              <ProjectIcon />
            </div>

            <h3 className="mt-5 font-semibold text-[#262c40]">
              Oportunidades concretas
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#797e8a]">
              Cada proyecto presenta una necesidad específica para facilitar una
              conexión más relevante.
            </p>

          </div>

        </div>

      </section>

      {/* ==================================================
          CTA FINAL
      =================================================== */}

      <section className="relative z-10 px-6 pb-20 lg:px-12">

        <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[34px] bg-[#6543dc] px-7 py-12 text-center shadow-[0_28px_70px_rgba(101,67,220,0.25)] sm:px-12">

          <div className="pointer-events-none absolute" />

          <p className="text-sm font-semibold text-white/75">
            Empieza hoy
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Conecta necesidades con talento en Skilly
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75">
            Crea tu perfil y comienza a descubrir una forma más simple de
            encontrar talento u oportunidades.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">

            <Link
              href="/registro"
              className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#6543dc] transition hover:-translate-y-0.5"
            >
              Crear cuenta
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Iniciar sesión
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}