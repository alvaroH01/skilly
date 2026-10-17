"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/clients";

/* ======================================================
   TIPOS
====================================================== */

type ProfessionalSettingsFormProps = {
  displayName: string;
  email: string;

  initialWorkMode: string;
  initialAvailability: string;
  initialWeeklyHours: string;

  hasPasswordProvider: boolean;
  usesGoogle: boolean;
};

type MessageType =
  | "success"
  | "error"
  | "";

/* ======================================================
   COMPONENTE
====================================================== */

export default function ProfessionalSettingsForm({
  displayName,
  email,
  initialWorkMode,
  initialAvailability,
  initialWeeklyHours,
  hasPasswordProvider,
  usesGoogle,
}: ProfessionalSettingsFormProps) {
  const router = useRouter();

  const supabase =
    createClient();

  /* ====================================================
     PREFERENCIAS
  ==================================================== */

  const [workMode, setWorkMode] =
    useState(initialWorkMode);

  const [
    availability,
    setAvailability,
  ] = useState(
    initialAvailability
  );

  const [
    weeklyHours,
    setWeeklyHours,
  ] = useState(
    initialWeeklyHours
  );

  const [
    savingPreferences,
    setSavingPreferences,
  ] = useState(false);

  const [
    preferencesMessage,
    setPreferencesMessage,
  ] = useState("");

  const [
    preferencesMessageType,
    setPreferencesMessageType,
  ] =
    useState<MessageType>("");

  /* ====================================================
     CONTRASEÑA
  ==================================================== */

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordMessageType,
    setPasswordMessageType,
  ] =
    useState<MessageType>("");

  /* ====================================================
     SESIÓN
  ==================================================== */

  const [
    logoutLoading,
    setLogoutLoading,
  ] = useState(false);

  /* ======================================================
     GUARDAR PREFERENCIAS
  ====================================================== */

  async function savePreferences() {
    try {
      setSavingPreferences(true);

      setPreferencesMessage("");
      setPreferencesMessageType("");

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "No encontramos una sesión activa."
        );
      }

      const {
        error,
      } = await supabase
        .from(
          "professional_profiles"
        )
        .update({
          work_mode:
            workMode || null,

          availability:
            availability || null,

          weekly_hours:
            weeklyHours.trim() ||
            null,
        })
        .eq(
          "user_id",
          user.id
        );

      if (error) {
        throw error;
      }

      setPreferencesMessage(
        "Preferencias actualizadas correctamente."
      );

      setPreferencesMessageType(
        "success"
      );

      router.refresh();
    } catch (error: any) {
      console.error(
        "Error guardando preferencias:",
        error
      );

      setPreferencesMessage(
        error?.message ||
          "No pudimos guardar los cambios."
      );

      setPreferencesMessageType(
        "error"
      );
    } finally {
      setSavingPreferences(false);
    }
  }

  /* ======================================================
     CAMBIAR CONTRASEÑA
  ====================================================== */

  async function changePassword() {
    try {
      setPasswordLoading(true);

      setPasswordMessage("");
      setPasswordMessageType("");

      /* ================================================
         VALIDAR CONTRASEÑA ACTUAL
      ================================================= */

      if (!currentPassword) {
        setPasswordMessage(
          "Ingresa tu contraseña actual."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      /* ================================================
         VALIDAR NUEVA CONTRASEÑA
      ================================================= */

      if (!newPassword) {
        setPasswordMessage(
          "Ingresa una nueva contraseña."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        setPasswordMessage(
          "La nueva contraseña debe tener al menos 8 caracteres."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordMessage(
          "Las nuevas contraseñas no coinciden."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordMessage(
          "La nueva contraseña debe ser distinta a la contraseña actual."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      /* ================================================
         VERIFICAR QUE LA CONTRASEÑA ACTUAL SEA CORRECTA
      ================================================= */

      const {
        error:
          verificationError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password:
              currentPassword,
          }
        );

      if (
        verificationError
      ) {
        setPasswordMessage(
          "La contraseña actual no es correcta."
        );

        setPasswordMessageType(
          "error"
        );

        return;
      }

      /* ================================================
         CAMBIAR CONTRASEÑA
      ================================================= */

      const {
        error: updateError,
      } =
        await supabase.auth.updateUser(
          {
            password:
              newPassword,
          }
        );

      if (updateError) {
        throw updateError;
      }

      /* ================================================
         LIMPIAR FORMULARIO
      ================================================= */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Tu contraseña fue actualizada correctamente."
      );

      setPasswordMessageType(
        "success"
      );
    } catch (error: any) {
      console.error(
        "Error cambiando contraseña:",
        error
      );

      setPasswordMessage(
        error?.message ||
          "No pudimos actualizar tu contraseña."
      );

      setPasswordMessageType(
        "error"
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  /* ======================================================
     CERRAR SESIÓN
  ====================================================== */

  async function logout() {
    try {
      setLogoutLoading(true);

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Error cerrando sesión:",
          error
        );

        return;
      }

      router.push("/login");
      router.refresh();
    } finally {
      setLogoutLoading(false);
    }
  }

  /* ======================================================
     INTERFAZ
  ====================================================== */

  return (
    <div className="p-6 sm:p-9">

      {/* ==================================================
          INFORMACIÓN DE CUENTA
      ================================================== */}

      <section>

        <div>

          <h2 className="text-lg font-semibold text-[#252b40]">
            Información de la cuenta
          </h2>

          <p className="mt-1 text-sm text-[#858a99]">
            Datos generales asociados
            a tu cuenta Skilly.
          </p>

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* NOMBRE */}

          <div>

            <label className="text-xs font-semibold text-[#696e7c]">
              Nombre
            </label>

            <div className="mt-2 rounded-2xl border border-[#e4e5eb] bg-[#f8f8fb] px-4 py-3.5 text-sm text-[#5d6271]">
              {displayName}
            </div>

            <p className="mt-2 text-xs text-[#9a9eaa]">
              Puedes modificarlo
              desde Mi perfil.
            </p>

          </div>

          {/* EMAIL */}

          <div>

            <label className="text-xs font-semibold text-[#696e7c]">
              Correo electrónico
            </label>

            <div className="mt-2 break-all rounded-2xl border border-[#e4e5eb] bg-[#f8f8fb] px-4 py-3.5 text-sm text-[#5d6271]">
              {email}
            </div>

            <p className="mt-2 text-xs text-[#9a9eaa]">
              Correo asociado a
              tu cuenta.
            </p>

          </div>

        </div>

        {/* MÉTODO DE ACCESO */}

        <div className="mt-5 rounded-[20px] border border-[#e9e7f0] bg-[#fafafe] p-4">

          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a9eaa]">
            Método de acceso
          </p>

          <div className="mt-2 flex flex-wrap gap-2">

            {hasPasswordProvider && (
              <span className="rounded-full bg-[#eeeaff] px-3 py-1.5 text-xs font-semibold text-[#6848ef]">
                Correo y contraseña
              </span>
            )}

            {usesGoogle && (
              <span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold text-[#4574b8]">
                Google
              </span>
            )}

          </div>

        </div>

      </section>

      <div className="my-9 h-px bg-[#eeeef4]" />

      {/* ==================================================
          PREFERENCIAS PROFESIONALES
      ================================================== */}

      <section>

        <div>

          <h2 className="text-lg font-semibold text-[#252b40]">
            Preferencias profesionales
          </h2>

          <p className="mt-1 text-sm text-[#858a99]">
            Define cómo quieres trabajar
            y tu disponibilidad actual.
          </p>

        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          {/* MODALIDAD */}

          <div>

            <label
              htmlFor="workMode"
              className="text-xs font-semibold text-[#696e7c]"
            >
              Modalidad de trabajo
            </label>

            <select
              id="workMode"
              value={workMode}
              onChange={(event) =>
                setWorkMode(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
            >
              <option value="">
                Selecciona una modalidad
              </option>

              <option value="remoto">
                Remoto
              </option>

              <option value="presencial">
                Presencial
              </option>

              <option value="hibrido">
                Híbrido
              </option>

            </select>

          </div>

          {/* DISPONIBILIDAD */}

          <div>

            <label
              htmlFor="availability"
              className="text-xs font-semibold text-[#696e7c]"
            >
              Disponibilidad
            </label>

            <select
              id="availability"
              value={availability}
              onChange={(event) =>
                setAvailability(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
            >

              <option value="">
                Selecciona disponibilidad
              </option>

              <option value="disponible">
                Disponible
              </option>

              <option value="parcial">
                Disponibilidad parcial
              </option>

              <option value="no_disponible">
                No disponible
              </option>

            </select>

          </div>

          {/* HORAS */}

          <div className="sm:col-span-2">

            <label
              htmlFor="weeklyHours"
              className="text-xs font-semibold text-[#696e7c]"
            >
              Horas disponibles
              por semana
            </label>

            <input
              id="weeklyHours"
              type="text"
              value={weeklyHours}
              onChange={(event) =>
                setWeeklyHours(
                  event.target.value
                )
              }
              placeholder="Ej: 20 horas"
              className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition placeholder:text-[#a5a8b2] focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
            />

          </div>

        </div>

        {/* MENSAJE PREFERENCIAS */}

        {preferencesMessage && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              preferencesMessageType ===
              "success"
                ? "border border-[#cdebd9] bg-[#eef9f3] text-[#287b59]"
                : "border border-[#f0d2d2] bg-[#fff4f4] text-[#c45858]"
            }`}
          >
            {preferencesMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end">

          <button
            type="button"
            disabled={savingPreferences}
            onClick={savePreferences}
            className="rounded-2xl bg-[#6f4cf6] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(111,76,246,0.18)] transition hover:bg-[#6040df] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPreferences
              ? "Guardando..."
              : "Guardar preferencias"}
          </button>

        </div>

      </section>

      <div className="my-9 h-px bg-[#eeeef4]" />

      {/* ==================================================
          SEGURIDAD
      ================================================== */}

      <section>

        <div>

          <h2 className="text-lg font-semibold text-[#252b40]">
            Seguridad
          </h2>

          <p className="mt-1 text-sm text-[#858a99]">
            Administra la contraseña
            de acceso a tu cuenta.
          </p>

        </div>

        {/* ==================================================
            CUENTA CON CONTRASEÑA
        ================================================== */}

        {hasPasswordProvider ? (
          <div className="mt-6 max-w-[650px]">

            <div className="rounded-[22px] border border-[#e8e5ef] bg-[#fbfbfd] p-5">

              <p className="text-sm font-semibold text-[#34394c]">
                Cambiar contraseña
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8b8f9d]">
                Por seguridad, primero
                comprobaremos tu contraseña
                actual antes de permitir el cambio.
              </p>

            </div>

            <div className="mt-5 grid gap-4">

              {/* ACTUAL */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="text-xs font-semibold text-[#696e7c]"
                >
                  Contraseña actual
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  value={
                    currentPassword
                  }
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  placeholder="Ingresa tu contraseña actual"
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition placeholder:text-[#a5a8b2] focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                />

              </div>

              {/* NUEVA */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="text-xs font-semibold text-[#696e7c]"
                >
                  Nueva contraseña
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={
                    newPassword
                  }
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition placeholder:text-[#a5a8b2] focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                />

              </div>

              {/* CONFIRMAR */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-[#696e7c]"
                >
                  Confirmar nueva contraseña
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-[#e0e1e8] bg-white px-4 py-3.5 text-sm text-[#454b5c] outline-none transition placeholder:text-[#a5a8b2] focus:border-[#aa9aff] focus:ring-4 focus:ring-[#6f4cf6]/10"
                />

              </div>

            </div>

            {/* MENSAJE CONTRASEÑA */}

            {passwordMessage && (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  passwordMessageType ===
                  "success"
                    ? "border border-[#cdebd9] bg-[#eef9f3] text-[#287b59]"
                    : "border border-[#f0d2d2] bg-[#fff4f4] text-[#c45858]"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            {/* BOTÓN */}

            <button
              type="button"
              onClick={
                changePassword
              }
              disabled={
                passwordLoading
              }
              className="mt-6 rounded-2xl border border-[#d8d1ff] bg-white px-6 py-3 text-sm font-semibold text-[#6848ef] transition hover:bg-[#f8f6ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading
                ? "Verificando..."
                : "Cambiar contraseña"}
            </button>

          </div>
        ) : (

          /* ==================================================
              CUENTA GOOGLE
          ================================================== */

          <div className="mt-6 max-w-[650px] rounded-[22px] border border-[#dce8f7] bg-[#f6faff] p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                G
              </div>

              <div>

                <p className="font-semibold text-[#30364a]">
                  Acceso mediante Google
                </p>

                <p className="mt-2 text-sm leading-6 text-[#747a89]">
                  Tu cuenta utiliza Google
                  para iniciar sesión, por
                  lo que no tienes una
                  contraseña de Skilly que
                  debamos verificar desde
                  esta sección.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#9095a2]">
                  Si necesitas modificar la
                  contraseña de tu cuenta
                  Google, debes hacerlo desde
                  la configuración de Google.
                </p>

              </div>

            </div>

          </div>
        )}

      </section>

      <div className="my-9 h-px bg-[#eeeef4]" />

      {/* ==================================================
          SESIÓN
      ================================================== */}

      <section className="rounded-[22px] border border-[#f0dddd] bg-[#fffafa] p-5 sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-semibold text-[#363b4e]">
              Cerrar sesión
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-[#858a99]">
              Cierra tu sesión actual
              en este dispositivo.
              Podrás volver a ingresar
              cuando quieras.
            </p>

          </div>

          <button
            type="button"
            onClick={logout}
            disabled={
              logoutLoading
            }
            className="shrink-0 rounded-2xl border border-[#efc8c8] bg-white px-5 py-3 text-sm font-semibold text-[#c65c5c] transition hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutLoading
              ? "Cerrando..."
              : "Cerrar sesión"}
          </button>

        </div>

      </section>

    </div>
  );
}