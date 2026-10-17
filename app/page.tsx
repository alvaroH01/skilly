import Image from "next/image";
import Link from "next/link";

/* ======================================================
   ICONOS
====================================================== */

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M16 16L20.5 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s6-5.1 6-11a6 6 0 10-12 0c0 5.9 6 11 6 11z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="10"
        r="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.2 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ======================================================
   HOME
====================================================== */

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf3] text-[#171b2d]">

      {/* ==================================================
          FONDO GENERAL
      =================================================== */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,221,130,.62), transparent 34%), radial-gradient(circle at 85% 72%, rgba(245,132,88,.52), transparent 39%), radial-gradient(circle at 73% 24%, rgba(77,205,163,.38), transparent 31%), radial-gradient(circle at 48% 84%, rgba(188,137,242,.18), transparent 32%)",
        }}
      />

      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="relative z-50">

        <div className="mx-auto flex h-[90px] max-w-[1440px] items-center justify-between px-6 lg:px-12">

          {/* LOGO */}
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
              className="h-auto w-[165px] object-contain"
            />
          </Link>

          {/* NAVEGACIÓN */}
          <nav className="hidden items-center gap-10 text-[14px] font-medium text-[#252938] lg:flex">

            <Link
              href="/buscar"
              className="transition-colors hover:text-[#6845df]"
            >
              Encuentra talento
            </Link>

            <a
              href="/como-funciona"
              className="transition-colors hover:text-[#6845df]"
            >
              Cómo funciona
            </a>

            <Link
              href="/conocenos"
              className="transition-colors hover:text-[#6845df]"
            >
              Conócenos
            </Link>

          </nav>

          {/* CUENTA */}
          <div className="flex items-center gap-3">

            <Link
              href="/login"
              className="hidden rounded-xl border border-[#dfd9d1] bg-white/75 px-5 py-3 text-sm font-medium text-[#272b38] shadow-[0_4px_14px_rgba(43,37,68,0.06)] backdrop-blur transition hover:bg-white sm:block"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="rounded-xl bg-[#6543dc] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(101,67,220,0.30)] transition hover:-translate-y-0.5 hover:bg-[#5634ca]"
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

        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1fr_1fr] lg:px-12 lg:pb-24">

          {/* ==================================================
              IZQUIERDA
          =================================================== */}

          <div className="relative z-20 max-w-[660px]">

            <h1 className="text-[49px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171b2d] sm:text-[62px] lg:text-[68px]">
              El talento que
              <br />
              necesitas, cuando
              <br />
              lo necesitas.
            </h1>

            <p className="mt-7 max-w-[590px] text-[17px] leading-8 text-[#5f646d]">
              Conecta con profesionales independientes para proyectos,
              servicios y necesidades específicas de tu organización.
            </p>

            {/* ==================================================
                BUSCADOR FUNCIONAL
            =================================================== */}

            <form
              action="/buscar"
              method="GET"
              className="mt-9 max-w-[690px] rounded-[28px] border border-white/90 bg-white/85 p-2.5 shadow-[0_18px_50px_rgba(73,61,88,0.17)] backdrop-blur-xl"
            >

              <div className="flex flex-col gap-2 md:flex-row md:items-center">

                {/* SERVICIO */}
                <div className="flex flex-1 items-center gap-3 rounded-[20px] px-4 py-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee7ff] text-[#6949dc]">
                    <SearchIcon />
                  </div>

                  <div className="min-w-0 flex-1">

                    <label
                      htmlFor="search-service"
                      className="block text-xs font-semibold text-[#252938]"
                    >
                      ¿Qué servicio necesitas?
                    </label>

                    <input
                      id="search-service"
                      name="q"
                      type="text"
                      placeholder="Ej: Diseño, Marketing, Tecnología..."
                      className="mt-1 w-full bg-transparent text-sm text-[#565b68] outline-none placeholder:text-[#999ca5]"
                    />

                  </div>

                </div>

                {/* SEPARADOR */}
                <div className="hidden h-12 w-px bg-[#e3dfe7] md:block" />

                {/* UBICACIÓN */}
                <div className="flex min-w-[210px] items-center gap-3 rounded-[21px] px-4 py-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee7ff] text-[#6949dc]">
                    <LocationIcon />
                  </div>

                  <div className="min-w-0 flex-1">

                    <label
                      htmlFor="location"
                      className="block text-xs font-semibold text-[#252938]"
                    >
                      ¿Dónde?
                    </label>

                    <input
                      id="location"
                      name="ubicacion"
                      type="text"
                      placeholder="Santiago, Chile"
                      className="mt-1 w-full bg-transparent text-sm text-[#565b68] outline-none placeholder:text-[#999ca5]"
                    />

                  </div>

                </div>

                {/* BOTÓN */}
                <button
                  type="submit"
                  className="flex min-h-[58px] items-center justify-center rounded-[20px] bg-[#6543dc] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(101,67,220,0.30)] transition hover:-translate-y-0.5 hover:bg-[#5634ca]"
                >
                  Buscar talento
                </button>

              </div>

            </form>

            {/* ==================================================
                CTA SECUNDARIO
            =================================================== */}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">

              <Link
                href="/registro"
                className="font-semibold text-[#6140d0] transition hover:text-[#4d2bbd]"
              >
                Publica un proyecto →
              </Link>

              <span className="h-1 w-1 rounded-full bg-[#aba5af]" />

              <Link
                href="/registro"
                className="font-medium text-[#5f646c] transition hover:text-[#282c38]"
              >
                Ofrece tus servicios
              </Link>

            </div>

          </div>

          {/* ==================================================
              DERECHA
          =================================================== */}

          <div className="relative mx-auto min-h-[510px] w-full max-w-[650px] lg:min-h-[590px]">

            {/* ==================================================
                FIGURAS DE FONDO
            =================================================== */}

            {/* AZUL */}
            <div className="absolute right-[4%] top-[4%] h-[260px] w-[175px] rounded-[90px] bg-[#419AE5]" />

            {/* VERDE */}
            <div className="absolute left-[16%] top-[14%] h-[280px] w-[220px] rounded-[110px] bg-[#3FC79D]" />

            {/* DAMASCO */}
            <div className="absolute bottom-[13%] left-[4%] h-[230px] w-[230px] rounded-full bg-[#F2A338]" />

            {/* SALMÓN */}
            <div className="absolute bottom-[4%] right-[3%] h-[260px] w-[215px] rounded-[105px] bg-[#F37E56]" />

            {/* MORADO */}
            <div className="absolute left-[31%] top-[37%] h-[180px] w-[270px] rotate-[-8deg] rounded-[85px] bg-[#B787EF]" />

            {/* ==================================================
                PUNTOS IZQUIERDA
            =================================================== */}

            <div className="absolute left-[1%] top-[40%] grid grid-cols-4 gap-[7px]">

              {Array.from({
                length: 20,
              }).map((_, index) => (
                <span
                  key={index}
                  className="h-[4px] w-[4px] rounded-full bg-[#735dc4]/80"
                />
              ))}

            </div>

            {/* ==================================================
                PUNTOS DERECHA
            =================================================== */}

            <div className="absolute right-[0%] top-[17%] grid grid-cols-4 gap-[7px]">

              {Array.from({
                length: 20,
              }).map((_, index) => (
                <span
                  key={index}
                  className="h-[4px] w-[4px] rounded-full bg-[#6948cc]/75"
                />
              ))}

            </div>

            {/* ==================================================
                FLECHA DECORATIVA
            =================================================== */}

            <svg
              className="absolute left-[9%] top-[13%] text-[#6542d3]"
              width="44"
              height="40"
              viewBox="0 0 44 40"
              fill="none"
              aria-hidden="true"
            >

              <path
                d="M5 28C10 18 16 18 22 25C27 31 31 30 37 18"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M31 18H38V25"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

            {/* ==================================================
                IMAGEN
            =================================================== */}

            <div className="absolute bottom-[4%] left-[15%] right-[8%] top-[10%] z-10 overflow-hidden rounded-[36px] shadow-[0_24px_55px_rgba(47,41,62,0.12)]">

              <Image
                src="/profesional-skilly-v2.png"
                alt="Profesional independiente utilizando Skilly"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />

            </div>

            {/* ==================================================
                TARJETA FLOTANTE
            =================================================== */}

            <div className="absolute right-[-25%] top-[29%] z-30 w-[235px] rounded-[22px] border border-white/90 bg-white/92 p-5 shadow-[0_22px_55px_rgba(58,44,83,0.22)] backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9e2ff] text-[#5f3ed3]">
                  <CheckIcon />
                </div>

                <p className="text-sm font-semibold text-[#222632]">
                  Conexión directa
                </p>

              </div>

              <p className="mt-4 text-xs leading-5 text-[#6b707b]">
                Encuentra profesionales y gestiona tus oportunidades desde un
                solo lugar.
              </p>

              <div className="mt-4 h-px bg-[#ebe9ee]" />

              <div className="mt-4 space-y-3">

                {/* PASO 1 */}
                <div className="flex items-center gap-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dff5ea] text-[11px] font-bold text-[#3f966e]">
                    ✓
                  </span>

                  <span className="text-xs text-[#626771]">
                    Encuentra talento
                  </span>

                </div>

                {/* PASO 2 */}
                <div className="flex items-center gap-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebe5ff] text-[11px] font-bold text-[#6542d6]">
                    2
                  </span>

                  <span className="text-xs text-[#626771]">
                    Revisa perfiles
                  </span>

                </div>

                {/* PASO 3 */}
                <div className="flex items-center gap-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebe5ff] text-[11px] font-bold text-[#6542d6]">
                    3
                  </span>

                  <span className="text-xs text-[#626771]">
                    Recibe propuestas
                  </span>

                </div>

                {/* PASO 4 */}
                <div className="flex items-center gap-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebe5ff] text-[11px] font-bold text-[#6542d6]">
                    4
                  </span>

                  <span className="text-xs text-[#626771]">
                    Comienza a colaborar
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          PARTE INFERIOR
      =================================================== */}

      <section
        id="como-funciona"
        className="relative z-10 border-t border-white/70 bg-white/50 backdrop-blur-sm"
      >

        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 sm:grid-cols-3 lg:px-12">

          {/* TALENTO */}
          <div>

            <p className="text-sm font-semibold text-[#222632]">
              Talento especializado
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6d727c]">
              Profesionales de distintas áreas y niveles de experiencia.
            </p>

          </div>

          {/* PROYECTOS */}
          <div className="border-[#d9d4dc] sm:border-l sm:pl-8">

            <p className="text-sm font-semibold text-[#222632]">
              Proyectos concretos
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6d727c]">
              Publica necesidades específicas y recibe propuestas.
            </p>

          </div>

          {/* COLABORACIÓN */}
          <div className="border-[#d9d4dc] sm:border-l sm:pl-8">

            <p className="text-sm font-semibold text-[#222632]">
              Colaboración simple
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6d727c]">
              Conecta directamente con profesionales desde Skilly.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}