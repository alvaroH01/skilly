-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 07_propuesta_correcciones.sql
-- Propósito: PROPUESTA de correcciones de seguridad e integridad, derivadas
--            de la revisión de políticas RLS, funciones y código.
-- ADVERTENCIA: NO ejecutar en producción sin probar antes en una copia
--            (proyecto Supabase de prueba). Revisar cada bloque.
-- Requiere : 01, 02, 03 y 06 ya ejecutados; roles de Supabase (anon,
--            authenticated) y la función auth.uid().
-- =====================================================================

-- Todo el script corre en una sola transacción: si algo falla, no queda nada a medias.
BEGIN;

-- ---------------------------------------------------------------------
-- 0. Función auxiliar: ¿el usuario actual es admin?
--    SECURITY DEFINER evita la recursión infinita de RLS sobre profiles.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------
-- 1. Nadie puede asignarse ni quitarse el rol admin.
--    Hallazgo: profiles permite al dueño actualizar toda su fila, incluida role.
--    Se sigue permitiendo cambiar entre cliente / profesional / ambos (onboarding).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;  -- SQL Editor / service_role / admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN RAISE EXCEPTION 'No puedes asignarte el rol admin.'; END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND (NEW.role = 'admin' OR OLD.role = 'admin') THEN
    RAISE EXCEPTION 'No puedes cambiar a o desde el rol admin.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_guard_role ON public.profiles;
CREATE TRIGGER profiles_guard_role BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- ---------------------------------------------------------------------
-- 2. Un cliente no puede publicar ni validar sus propios proyectos.
--    Hallazgo: el valor por defecto de projects.status es 'activo' y las
--    políticas no restringen estados.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_project_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'borrador';
    NEW.validation_status := 'no_enviado';
    NEW.validation_submitted_at := NULL; NEW.validation_meeting_at := NULL;
    NEW.validated_at := NULL; NEW.validated_by := NULL;
    RETURN NEW;
  END IF;
  IF NEW.validation_status IS DISTINCT FROM OLD.validation_status
     AND NEW.validation_status IN ('reunion_agendada', 'en_revision', 'validado') THEN
    RAISE EXCEPTION 'Solo Skilly puede cambiar la validación del proyecto.';
  END IF;
  IF (NEW.validated_by IS NOT NULL AND NEW.validated_by IS DISTINCT FROM OLD.validated_by)
     OR (NEW.validated_at IS NOT NULL AND NEW.validated_at IS DISTINCT FROM OLD.validated_at) THEN
    RAISE EXCEPTION 'Solo Skilly puede registrar la validación del proyecto.';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'activo'
     AND NEW.validation_status IS DISTINCT FROM 'validado' THEN
    RAISE EXCEPTION 'Un proyecto solo se publica después de ser validado por Skilly.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS projects_guard_status ON public.projects;
CREATE TRIGGER projects_guard_status BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.guard_project_status();

-- ---------------------------------------------------------------------
-- 3. Políticas faltantes sobre proposals
--    Hallazgo: el profesional no podía leer ni actualizar sus propuestas,
--    el admin no podía guardar la curaduría y el cliente podía editar cualquier columna.
-- ---------------------------------------------------------------------
CREATE POLICY "Professionals can view own proposals" ON public.proposals
  FOR SELECT TO authenticated USING (professional_id = auth.uid());

CREATE POLICY "Professionals can update own pending proposals" ON public.proposals
  FOR UPDATE TO authenticated
  USING (professional_id = auth.uid() AND status = 'pendiente')
  WITH CHECK (professional_id = auth.uid() AND status IN ('pendiente', 'retirada'));

CREATE POLICY "Admins can update proposals" ON public.proposals
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can update project proposals" ON public.proposals;
CREATE POLICY "Clients can reject project proposals" ON public.proposals
  FOR UPDATE TO authenticated
  USING (status = 'pendiente' AND EXISTS (
    SELECT 1 FROM public.projects pj WHERE pj.id = proposals.project_id AND pj.client_id = auth.uid()))
  WITH CHECK (status = 'rechazada');

DROP POLICY IF EXISTS "Professionals can create proposals" ON public.proposals;
CREATE POLICY "Professionals can create pending proposals" ON public.proposals
  FOR INSERT TO authenticated
  WITH CHECK (professional_id = auth.uid() AND status = 'pendiente' AND EXISTS (
    SELECT 1 FROM public.projects pj WHERE pj.id = project_id AND pj.status = 'activo'));

-- ---------------------------------------------------------------------
-- 4. Lectura y actualización para administradores (basadas en rol, no en un UUID fijo)
-- ---------------------------------------------------------------------
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can view client profiles" ON public.client_profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can view professional profiles" ON public.professional_profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update professional profiles" ON public.professional_profiles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Retirar la política atada a un UUID fijo SOLO después de comprobar que la cuenta
-- de Skilly tiene role = 'admin' en profiles:
-- DROP POLICY "Skilly admin account can update projects" ON public.projects;

-- ---------------------------------------------------------------------
-- 5. Flujo de pago completo dentro de la base (hoy la app intenta actualizar
--    payment_orders directamente, pero no existe ninguna política UPDATE).
--    NOTA: en producción, mark_payment_paid debe invocarse solo desde el
--    servidor, DESPUÉS de confirmar el pago con el proveedor (Transbank).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_payment_order_token(
  p_order_id uuid, p_token_hash text, p_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Solo un administrador puede emitir el enlace de pago.'; END IF;
  UPDATE public.payment_orders
     SET payment_token_hash = p_token_hash, token_expires_at = p_expires_at,
         status = 'enviado', updated_at = now()
   WHERE id = p_order_id AND status = 'pendiente';
  IF NOT FOUND THEN RAISE EXCEPTION 'La orden no existe o ya no está pendiente.'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.set_payment_order_token(uuid, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_payment_order_token(uuid, text, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_payment_paid(
  p_token_hash text, p_provider text DEFAULT 'webpay_sandbox', p_provider_payment_id text DEFAULT NULL)
RETURNS TABLE(order_id uuid, amount integer) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.payment_orders%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.payment_orders
   WHERE payment_token_hash = p_token_hash
     AND status IN ('pendiente', 'enviado', 'en_proceso')
     AND token_expires_at IS NOT NULL AND token_expires_at > now()
   FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El enlace de pago no es válido, ya fue usado o expiró.'; END IF;
  IF auth.uid() IS DISTINCT FROM o.client_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo el cliente de la orden puede pagarla.';
  END IF;
  UPDATE public.payment_orders
     SET status = 'pagado', paid_at = now(), token_used_at = now(), updated_at = now(),
         provider = p_provider, provider_payment_id = p_provider_payment_id
   WHERE id = o.id;
  UPDATE public.proposals SET status = 'confirmada' WHERE id = o.proposal_id;
  UPDATE public.projects  SET status = 'en_ejecucion', updated_at = now() WHERE id = o.project_id;
  INSERT INTO public.notifications (user_id, type, title, message, link) VALUES
    (o.professional_id, 'payment_confirmed', 'Pago confirmado', 'El cliente pagó el proyecto. Ya puedes comenzar.', '/dashboard/profesional/propuestas'),
    (o.client_id, 'payment_confirmed', 'Pago recibido', 'Tu pago fue registrado y el proyecto está en ejecución.', '/dashboard/cliente/proyectos');
  order_id := o.id; amount := o.amount; RETURN NEXT;
END $$;
REVOKE ALL ON FUNCTION public.mark_payment_paid(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_payment_paid(text, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 6. La notificación al profesional usaba un estado inexistente ('aceptada').
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_professional_proposal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE project_title text;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  SELECT title INTO project_title FROM public.projects WHERE id = NEW.project_id;
  IF NEW.status = 'seleccionada' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (NEW.professional_id, 'proposal_accepted', '¡Tu propuesta fue seleccionada!',
            'Tu propuesta para "' || project_title || '" fue seleccionada por el cliente.', '/dashboard/profesional/propuestas');
  ELSIF NEW.status = 'rechazada' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (NEW.professional_id, 'proposal_rejected', 'Actualización de propuesta',
            'Tu propuesta para "' || project_title || '" no fue seleccionada.', '/dashboard/profesional/propuestas');
  END IF;
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------------
-- 7. Integridad de datos y limpieza
--    (NOT VALID: se aplican a filas nuevas sin fallar por datos de prueba existentes)
-- ---------------------------------------------------------------------
ALTER TABLE public.projects  ADD CONSTRAINT projects_budget_range_chk
  CHECK (budget_min >= 0 AND budget_max >= 0 AND (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)) NOT VALID;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_amount_chk
  CHECK (proposed_amount IS NULL OR proposed_amount > 0) NOT VALID;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_days_chk
  CHECK (estimated_days IS NULL OR estimated_days > 0) NOT VALID;
-- El token en texto plano no se usa en el código; solo se conserva el hash:
ALTER TABLE public.payment_orders DROP COLUMN IF EXISTS payment_token;

-- ---------------------------------------------------------------------
-- 8. Índices recomendados para llaves foráneas y filtros frecuentes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS projects_client_id_idx          ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx             ON public.projects (status);
CREATE INDEX IF NOT EXISTS proposals_professional_id_idx   ON public.proposals (professional_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx            ON public.proposals (status);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_client_id_idx    ON public.payment_orders (client_id);
CREATE INDEX IF NOT EXISTS payment_orders_professional_idx ON public.payment_orders (professional_id);
CREATE INDEX IF NOT EXISTS payment_orders_project_id_idx   ON public.payment_orders (project_id);

COMMIT;
