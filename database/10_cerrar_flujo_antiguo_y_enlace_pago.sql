-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 10_cerrar_flujo_antiguo_y_enlace_pago.sql
-- Propósito: 1) Cerrar en la base de datos el flujo antiguo de proyectos
--               publicados por el cliente y propuestas del profesional.
--            2) Impedir que el contratador altere el estado, el precio u
--               otros datos de su contratación desde la API.
--            3) Permitir que el contratador obtenga su propio enlace de pago.
-- Requiere : 01 a 07 y 09 ya ejecutados.
-- Ejecutar : en el SQL Editor de Supabase. Corre en una sola transacción.
-- =====================================================================
BEGIN;

-- ---------------------------------------------------------------------
-- 1. Cerrar el flujo antiguo
--    Las contrataciones se crean con contratar_servicio (SECURITY DEFINER),
--    que no depende de estas políticas.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Clients can create projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Professionals can create pending proposals" ON public.proposals;
DROP POLICY IF EXISTS "Professionals can update own pending proposals" ON public.proposals;
DROP POLICY IF EXISTS "Clients can reject project proposals" ON public.proposals;

-- Funciones del flujo antiguo: se retira el permiso de ejecución (no se borran)
REVOKE ALL ON FUNCTION public.select_proposal(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_project_for_validation(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Cambios directos del contratador sobre su contratación
--    Hallazgo (DEF-002): la política "Clients can update own projects" deja
--    modificar cualquier columna, incluido el estado y el precio.
--    Desde la API solo se permite:
--      - agregar texto al final de la descripción (evaluación e incidencias)
--      - pasar de en_ejecucion a pausado (reporte de incidencia)
--    Las funciones de la plataforma (pago, órdenes) siguen funcionando porque
--    ejecutan con el rol dueño de la función, no con el rol "authenticated".
--    La función es SECURITY INVOKER a propósito: así current_user refleja
--    quién ejecuta realmente el UPDATE.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_project_client_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user <> 'authenticated' OR auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - 'description' - 'status' - 'updated_at')
     IS DISTINCT FROM (to_jsonb(OLD) - 'description' - 'status' - 'updated_at') THEN
    RAISE EXCEPTION 'No puedes modificar los datos de la contratación.';
  END IF;

  IF NEW.description IS DISTINCT FROM OLD.description
     AND left(NEW.description, char_length(OLD.description)) <> OLD.description THEN
    RAISE EXCEPTION 'La descripción solo permite agregar texto al final.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (OLD.status = 'en_ejecucion' AND NEW.status = 'pausado') THEN
    RAISE EXCEPTION 'No puedes cambiar el estado de la contratación (% → %).', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS projects_guard_client_update ON public.projects;
CREATE TRIGGER projects_guard_client_update BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.guard_project_client_update();

-- ---------------------------------------------------------------------
-- 3. El contratador obtiene su propio enlace de pago
--    El servidor genera un token aleatorio, guarda solo su hash SHA-256 y
--    entrega el enlace al contratador dueño de la orden. Cada llamada invalida
--    el enlace anterior (también sirve cuando venció el de 24 horas).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_payment_link(
  p_order_id uuid, p_token_hash text, p_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión.'; END IF;
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Token de pago inválido.';
  END IF;
  IF p_expires_at IS NULL OR p_expires_at < now() + interval '1 minute'
     OR p_expires_at > now() + interval '25 hours' THEN
    RAISE EXCEPTION 'La vigencia del enlace de pago no es válida.';
  END IF;

  UPDATE public.payment_orders
     SET payment_token_hash = p_token_hash,
         token_expires_at = p_expires_at,
         status = 'enviado',
         updated_at = now()
   WHERE id = p_order_id
     AND client_id = auth.uid()
     AND status IN ('pendiente', 'enviado');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La orden no existe, no es tuya o ya no admite pago.';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.issue_payment_link(uuid, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_payment_link(uuid, text, timestamptz) TO authenticated;

COMMIT;
