import Image from "next/image";
import Link from "next/link";

export default function ConocenosPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfe] text-[#17213a]">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}
      <div className="mx-auto max-w-[1536px] px-5 sm:px-8 lg:px-12">
        <header className="flex h-[104px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-skilly-clean.png"
              alt="Skilly Latam"
              width={230}
              height={92}
              priority
              className="h-auto w-[180px] object-contain sm:w-[210px]"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-[15px] font-medium text-[#20263a] lg:flex">
            <Link href="/" className="transition hover:text-[#6f57f5]">
              Inicio
            </Link>
            <Link
              href="/conocenos"
              className="font-semibold text-[#6f57f5]"
            >
              Conócenos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-[14px] border border-[#dfe1eb] bg-white px-6 py-3 text-sm font-medium text-[#253047] transition hover:bg-[#fafaff] sm:block"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="rounded-[14px] bg-[#6e49f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(110,73,246,0.24)] transition hover:bg-[#5e3ee0]"
            >
              Únete a Skilly
            </Link>
          </div>
        </header>
      </div>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden">
        {/* decoración */}
        <div className="absolute left-[-120px] top-[70px] h-[320px] w-[320px] rounded-full bg-[#eee9ff] blur-[2px]" />

        <div className="absolute right-[-100px] top-[20px] h-[330px] w-[330px] rounded-full bg-[#f4efff]" />

        <div className="absolute right-[12%] top-[120px] h-[90px] w-[90px] rounded-[30px] bg-[#e1f8ef] rotate-12" />

        <div className="absolute left-[15%] top-[390px] h-[60px] w-[60px] rounded-full bg-[#ffe7bd]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-[1536px] items-center justify-center px-5 py-20 text-center sm:px-8 lg:px-12">
          <div className="relative z-10 max-w-[960px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e3ddff] bg-white px-5 py-2 text-sm font-semibold text-[#6f4cf6] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#7657f5]" />
              Conoce Skilly
            </span>

            <h1 className="mt-8 text-[48px] font-semibold leading-[1.06] tracking-[-0.045em] text-[#101c3e] sm:text-[60px] lg:text-[72px]">
              Conectamos talento,
              <br />
              experiencia y
              <span className="text-[#6f4cf6]"> oportunidades.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-[760px] text-[18px] leading-8 text-[#777e93]">
              Creamos un espacio donde el talento experto y las organizaciones
              pueden encontrarse, colaborar y crecer juntos.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-3 rounded-[15px] bg-[#6e49f6] px-7 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(110,73,246,0.22)] transition hover:bg-[#5f3fdf]"
              >
                Sé parte de Skilly
                <span>→</span>
              </Link>

              <a
                href="#nuestra-historia"
                className="inline-flex items-center justify-center rounded-[15px] border border-[#dedbea] bg-white px-7 py-4 font-semibold text-[#4f5668] transition hover:border-[#cfc8f7] hover:bg-[#faf9ff]"
              >
                Conoce nuestra historia
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* NUESTRA HISTORIA */}
      {/* ========================================================= */}
      <section
        id="nuestra-historia"
        className="mx-auto max-w-[1536px] scroll-mt-10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* IZQUIERDA */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#7657f5]">
              Nuestra historia
            </p>

            <h2 className="mt-5 max-w-[620px] text-4xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#101c3e] sm:text-5xl">
              Skilly nace de una forma diferente de entender el{" "}
              <span className="text-[#6f4cf6]">talento.</span>
            </h2>

            <p className="mt-7 max-w-[650px] text-[17px] leading-8 text-[#777e93]">
              Skilly surge desde la experiencia de sus fundadoras en gestión de
              personas, tecnología aplicada a Recursos Humanos y
              sostenibilidad.
            </p>

            <p className="mt-5 max-w-[650px] text-[17px] leading-8 text-[#777e93]">
              Al descubrir cómo sus conocimientos y habilidades se
              complementaban, nació una idea: crear una plataforma capaz de
              conectar talento experto con organizaciones que necesitan nuevas
              formas de acceder a conocimiento y experiencia.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <div className="h-px w-14 bg-[#7657f5]" />

              <p className="text-sm font-semibold text-[#5e6475]">
                Talento + tecnología + sostenibilidad
              </p>
            </div>
          </div>

          {/* DERECHA */}
          <div className="relative">
            <div className="rounded-[36px] bg-gradient-to-br from-[#6e49f6] via-[#7959ef] to-[#9a76f8] p-8 text-white shadow-[0_30px_70px_rgba(99,73,220,0.18)] sm:p-10 lg:p-12">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                Nuestro propósito
              </span>

              <h3 className="mt-8 text-3xl font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[38px]">
                Crear conexiones que generen nuevas oportunidades.
              </h3>

              <p className="mt-6 text-[17px] leading-8 text-white/80">
                Queremos construir un espacio digital seguro donde
                profesionales independientes y organizaciones puedan
                encontrarse, colaborar y desarrollar relaciones de trabajo más
                flexibles, ágiles y sostenibles.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-2xl">✦</p>

                  <p className="mt-3 font-semibold">
                    Talento experto
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Experiencia disponible para nuevos desafíos.
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-2xl">↗</p>

                  <p className="mt-3 font-semibold">
                    Organizaciones ágiles
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Acceso flexible a conocimiento especializado.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -right-7 -z-10 h-[180px] w-[180px] rounded-full bg-[#e8e1ff]" />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TALENT AS A SERVICE */}
      {/* ========================================================= */}
      <section className="bg-[#f6f4ff]">
        <div className="mx-auto max-w-[1536px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[850px] text-center">
            <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#6f4cf6] shadow-sm">
              Talent as a Service
            </span>

            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.035em] text-[#101c3e] sm:text-5xl">
              El talento que necesitas,
              <br />
              <span className="text-[#6f4cf6]">
                cuando realmente lo necesitas.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-[720px] text-[17px] leading-8 text-[#777e93]">
              Una forma flexible de acceder a profesionales especializados
              para proyectos, horas o actividades específicas, adaptándose a
              las necesidades de cada organización.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#e7e3f5] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eeeaff] text-2xl">
                🤝
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#17213a]">
                Conectamos personas
              </h3>

              <p className="mt-3 leading-7 text-[#7b8192]">
                Acercamos profesionales con experiencia a organizaciones que
                necesitan resolver desafíos concretos.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e7e3f5] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#e3f8ef] text-2xl">
                ⚡
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#17213a]">
                Impulsamos la agilidad
              </h3>

              <p className="mt-3 leading-7 text-[#7b8192]">
                Facilitamos el acceso a talento de manera flexible según las
                necesidades y tiempos de cada proyecto.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e7e3f5] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fff1d8] text-2xl">
                🌱
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#17213a]">
                Promovemos sostenibilidad
              </h3>

              <p className="mt-3 leading-7 text-[#7b8192]">
                Promovemos nuevas relaciones de trabajo que permitan crecer de
                manera más eficiente, colaborativa y sostenible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FUNDADORAS */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-[1536px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[800px] text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#7657f5]">
            Las personas detrás de Skilly
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#101c3e] sm:text-5xl">
            Conoce a nuestras fundadoras
          </h2>

          <p className="mx-auto mt-6 max-w-[650px] text-[17px] leading-8 text-[#777e93]">
            Skilly nace de una visión compartida y de la combinación de
            experiencias, conocimientos y habilidades complementarias.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1000px] gap-7 md:grid-cols-2">
          {/* CAROLINA */}
          <div className="group overflow-hidden rounded-[32px] border border-[#e8e5f2] bg-white p-8 shadow-[0_16px_45px_rgba(67,60,110,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(67,60,110,0.10)] sm:p-9">
            <div className="flex items-start justify-between">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#ebe6ff] to-[#f5f2ff] text-2xl font-bold text-[#6e49f6]">
                CA
              </div>

              <span className="rounded-full bg-[#f3f0ff] px-4 py-2 text-xs font-semibold text-[#6f4cf6]">
                Cofundadora
              </span>
            </div>

            <h3 className="mt-7 text-2xl font-semibold tracking-[-0.02em] text-[#17213a]">
              Carolina Armstrong Ramos
            </h3>

            <p className="mt-2 text-sm font-medium text-[#7657f5]">
              Cofundadora de Skilly
            </p>

            <p className="mt-5 leading-7 text-[#7b8192]">
              Parte del equipo fundador que dio origen a Skilly y a su visión
              de conectar talento experto con nuevas oportunidades para
              organizaciones y profesionales.
            </p>

            <a
              href="https://www.linkedin.com/in/carolina-armstrong-ramos"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-3 rounded-[14px] border border-[#ded9f2] bg-white px-5 py-3 text-sm font-semibold text-[#5540c8] transition hover:border-[#bfb2ff] hover:bg-[#faf8ff]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a66c2] text-xs font-bold text-white">
                in
              </span>

              Ver perfil en LinkedIn
              <span>↗</span>
            </a>
          </div>

          {/* MARÍA JOSÉ */}
          <div className="group overflow-hidden rounded-[32px] border border-[#e8e5f2] bg-white p-8 shadow-[0_16px_45px_rgba(67,60,110,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(67,60,110,0.10)] sm:p-9">
            <div className="flex items-start justify-between">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#dff7ed] to-[#effbf6] text-2xl font-bold text-[#29986a]">
                MJ
              </div>

              <span className="rounded-full bg-[#ecf9f3] px-4 py-2 text-xs font-semibold text-[#29986a]">
                Cofundadora
              </span>
            </div>

            <h3 className="mt-7 text-2xl font-semibold tracking-[-0.02em] text-[#17213a]">
              María José Delgado
            </h3>

            <p className="mt-2 text-sm font-medium text-[#7657f5]">
              Cofundadora de Skilly
            </p>

            <p className="mt-5 leading-7 text-[#7b8192]">
              Parte del equipo fundador de Skilly y de la construcción de una
              plataforma orientada a nuevas formas de colaboración entre
              talento independiente y organizaciones.
            </p>

            <a
              href="https://www.linkedin.com/in/mjdelgado"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-3 rounded-[14px] border border-[#ded9f2] bg-white px-5 py-3 text-sm font-semibold text-[#5540c8] transition hover:border-[#bfb2ff] hover:bg-[#faf8ff]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a66c2] text-xs font-bold text-white">
                in
              </span>

              Ver perfil en LinkedIn
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* NUESTRO COMPROMISO */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-[1536px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="overflow-hidden rounded-[36px] border border-[#e8e5f2] bg-white">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-[#151d3b] p-9 text-white sm:p-12 lg:p-14">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#a996ff]">
                Nuestro compromiso
              </span>

              <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                Construir nuevas formas de trabajar.
              </h2>

              <p className="mt-6 leading-8 text-white/65">
                Queremos contribuir a un ecosistema laboral más humano,
                flexible y conectado.
              </p>
            </div>

            <div className="grid gap-px bg-[#eceaf2] sm:grid-cols-2">
              <div className="bg-white p-8 sm:p-9">
                <span className="text-2xl">01</span>

                <h3 className="mt-5 text-lg font-semibold">
                  Trabajo flexible
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#7b8192]">
                  Facilitar nuevas oportunidades para profesionales
                  independientes y trabajo remoto.
                </p>
              </div>

              <div className="bg-white p-8 sm:p-9">
                <span className="text-2xl">02</span>

                <h3 className="mt-5 text-lg font-semibold">
                  Más oportunidades
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#7b8192]">
                  Acercar conocimiento y experiencia a organizaciones que lo
                  necesitan.
                </p>
              </div>

              <div className="bg-white p-8 sm:p-9">
                <span className="text-2xl">03</span>

                <h3 className="mt-5 text-lg font-semibold">
                  Relaciones sostenibles
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#7b8192]">
                  Promover relaciones profesionales eficientes,
                  transparentes y sostenibles.
                </p>
              </div>

              <div className="bg-white p-8 sm:p-9">
                <span className="text-2xl">04</span>

                <h3 className="mt-5 text-lg font-semibold">
                  Tecnología con propósito
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#7b8192]">
                  Utilizar la tecnología para facilitar conexiones entre
                  talento y organizaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      
      {/* ========================================================= */}
      {/* FOOTER SIMPLE */}
      {/* ========================================================= */}
      <footer className="border-t border-[#ececf2]">
        <div className="mx-auto flex max-w-[1536px] flex-col items-center justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row lg:px-12">
          <Link href="/">
            <Image
              src="/logo-skilly.png"
              alt="Skilly Latam"
              width={170}
              height={68}
              className="h-auto w-[145px] object-contain"
            />
          </Link>

          <p className="text-sm text-[#8a8f9f]">
            Conectando talento y oportunidades en Latinoamérica.
          </p>

          <div className="flex gap-6 text-sm font-medium text-[#646a7b]">
            <Link href="/" className="hover:text-[#6f4cf6]">
              Inicio
            </Link>

            <Link href="/conocenos" className="hover:text-[#6f4cf6]">
              Conócenos
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}