-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 09_catalogo_servicios.sql
-- Propósito: Catálogo de servicios. El Profesional publica un servicio,
--            Skilly lo revisa y sugiere ajustes (varias rondas), el
--            Profesional acepta la versión final y recién entonces se
--            publica. El Contratador contrata un servicio del catálogo.
--
-- Diseño   : la contratación se materializa como un proyecto + una propuesta
--            ya "seleccionada" (tablas existentes). Así siguen funcionando,
--            sin cambios, create_payment_order, mark_payment_paid, el
--            checkout, la evaluación privada y las incidencias.
-- Requiere : 01 a 07 ya ejecutados (is_admin(), guard_project_status, etc.)
-- Ejecutar : en el SQL Editor de Supabase. Todo corre en una transacción.
-- =====================================================================
BEGIN;

-- ---------------------------------------------------------------------
-- 1. Tabla de servicios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id         uuid NOT NULL REFERENCES public.profiles(id),
  title                   text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  description             text NOT NULL CHECK (char_length(btrim(description)) >= 20),
  category                text NOT NULL,
  modality                text NOT NULL CHECK (modality = ANY (ARRAY['remoto','presencial','hibrido'])),
  price                   integer NOT NULL CHECK (price > 0),
  duration_days           integer NOT NULL DEFAULT 1 CHECK (duration_days > 0),
  skills                  text[] NOT NULL DEFAULT '{}',
  status                  text NOT NULL DEFAULT 'borrador'
                          CHECK (status = ANY (ARRAY['borrador','activo','pausado'])),
  validation_status       text NOT NULL DEFAULT 'no_enviado'
                          CHECK (validation_status = ANY (ARRAY['no_enviado','pendiente','en_revision',
                                 'cambios_solicitados','propuesta_final','validado'])),
  suggested_price         integer CHECK (suggested_price IS NULL OR suggested_price > 0),
  validation_notes        text,
  validation_submitted_at timestamptz,
  validated_at            timestamptz,
  validated_by            uuid REFERENCES public.profiles(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS services_professional_idx ON public.services (professional_id);
CREATE INDEX IF NOT EXISTS services_catalog_idx ON public.services (status, validation_status);

-- Vínculo de la contratación con el servicio de origen y fecha de inicio pactada
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheduled_start date;
CREATE INDEX IF NOT EXISTS projects_service_idx ON public.projects (service_id);

-- ---------------------------------------------------------------------
-- 2. Reglas de integridad del servicio (trigger)
--    El Profesional no puede publicar ni validar su propio servicio.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_service()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_content_changed boolean;
BEGIN
  -- SQL Editor / service_role / admin: sin restricciones
  IF auth.uid() IS NULL OR public.is_admin() THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'borrador';
    NEW.validation_status := 'no_enviado';
    NEW.suggested_price := NULL; NEW.validation_notes := NULL;
    NEW.validation_submitted_at := NULL; NEW.validated_at := NULL; NEW.validated_by := NULL;
    RETURN NEW;
  END IF;

  IF NEW.professional_id IS DISTINCT FROM OLD.professional_id THEN
    RAISE EXCEPTION 'No se puede cambiar el profesional dueño del servicio.';
  END IF;

  -- Campos de revisión: solo los modifica Skilly (se restauran si el dueño los toca)
  NEW.suggested_price := OLD.suggested_price;
  NEW.validation_notes := OLD.validation_notes;
  NEW.validated_by := OLD.validated_by;
  NEW.validated_at := OLD.validated_at;
  NEW.validation_submitted_at := OLD.validation_submitted_at;

  v_content_changed :=
       NEW.title <> OLD.title OR NEW.description <> OLD.description
    OR NEW.category <> OLD.category OR NEW.modality <> OLD.modality
    OR NEW.price <> OLD.price OR NEW.duration_days <> OLD.duration_days
    OR NEW.skills IS DISTINCT FROM OLD.skills;

  -- Aceptación de la propuesta final de Skilly: el único camino a "validado"
  IF NEW.validation_status IS DISTINCT FROM OLD.validation_status
     AND NEW.validation_status = 'validado' THEN
    IF OLD.validation_status <> 'propuesta_final' THEN
      RAISE EXCEPTION 'Solo Skilly puede validar un servicio; el profesional solo acepta la propuesta final.';
    END IF;
    IF NEW.price IS DISTINCT FROM COALESCE(OLD.suggested_price, OLD.price)
       OR NEW.title <> OLD.title OR NEW.description <> OLD.description
       OR NEW.category <> OLD.category OR NEW.modality <> OLD.modality
       OR NEW.duration_days <> OLD.duration_days OR NEW.skills IS DISTINCT FROM OLD.skills THEN
      RAISE EXCEPTION 'Al aceptar la propuesta final no se pueden modificar los datos del servicio.';
    END IF;
    NEW.status := 'activo';
    NEW.validated_at := now();
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Transiciones de validación permitidas al profesional
  IF NEW.validation_status IS DISTINCT FROM OLD.validation_status THEN
    IF NOT (NEW.validation_status = 'pendiente'
            AND OLD.validation_status IN ('no_enviado', 'cambios_solicitados')) THEN
      RAISE EXCEPTION 'Transición de validación no permitida (% → %).', OLD.validation_status, NEW.validation_status;
    END IF;
    NEW.validation_submitted_at := now();
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Si cambia el contenido, el servicio vuelve a revisión (Skilly debe validar de nuevo)
  IF v_content_changed AND OLD.validation_status NOT IN ('no_enviado', 'cambios_solicitados') THEN
    NEW.validation_status := 'no_enviado';
    NEW.status := 'borrador';
    NEW.suggested_price := NULL;
    NEW.validated_at := NULL;
  END IF;

  -- Estado de publicación: solo activo <-> pausado, y solo si está validado
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'activo' AND NEW.validation_status <> 'validado' THEN
      RAISE EXCEPTION 'Un servicio solo se publica después de ser validado por Skilly.';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS services_guard ON public.services;
CREATE TRIGGER services_guard BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.guard_service();

-- ---------------------------------------------------------------------
-- 3. Seguridad a nivel de filas (RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professionals can view own services" ON public.services;
CREATE POLICY "Professionals can view own services" ON public.services
  FOR SELECT TO authenticated USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view services" ON public.services;
CREATE POLICY "Admins can view services" ON public.services
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Professionals can create own services" ON public.services;
CREATE POLICY "Professionals can create own services" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (
    professional_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN ('profesional', 'ambos'))
  );

DROP POLICY IF EXISTS "Professionals can update own services" ON public.services;
CREATE POLICY "Professionals can update own services" ON public.services
  FOR UPDATE TO authenticated
  USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());

DROP POLICY IF EXISTS "Professionals can delete own draft services" ON public.services;
CREATE POLICY "Professionals can delete own draft services" ON public.services
  FOR DELETE TO authenticated
  USING (professional_id = auth.uid() AND status = 'borrador' AND validation_status = 'no_enviado');

DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Catálogo público: solo servicios validados y activos
--    Vista con los datos públicos del servicio y del profesional.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.service_catalog AS
SELECT s.id, s.title, s.description, s.category, s.modality, s.price, s.duration_days,
       s.skills, s.created_at, s.professional_id,
       p.full_name AS professional_name,
       pp.professional_title, pp.bio AS professional_bio,
       pp.experience_level AS professional_level
FROM public.services s
JOIN public.profiles p ON p.id = s.professional_id
LEFT JOIN public.professional_profiles pp ON pp.user_id = s.professional_id
WHERE s.status = 'activo' AND s.validation_status = 'validado';
GRANT SELECT ON public.service_catalog TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Profesional envía su servicio a revisión de Skilly
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_service_for_validation(p_service_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid; v_validation text; v_title text; v_admin record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión.'; END IF;
  SELECT professional_id, validation_status, title INTO v_owner, v_validation, v_title
    FROM public.services WHERE id = p_service_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'El servicio no existe.'; END IF;
  IF v_owner <> auth.uid() THEN RAISE EXCEPTION 'No tienes permiso para enviar este servicio a revisión.'; END IF;
  IF v_validation NOT IN ('no_enviado', 'cambios_solicitados') THEN
    RAISE EXCEPTION 'El servicio ya se encuentra dentro del proceso de revisión.';
  END IF;

  UPDATE public.services SET validation_status = 'pendiente' WHERE id = p_service_id;

  FOR v_admin IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (v_admin.id, 'service_submitted', 'Servicio por revisar',
            'Un profesional envió el servicio "' || v_title || '" para revisión.',
            '/dashboard/admin/servicios');
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.submit_service_for_validation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_service_for_validation(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 6. Skilly revisa el servicio (curaduría comercial)
--    p_action: 'en_revision' | 'cambios' | 'aprobar'
--    'aprobar' deja una propuesta final (con el precio sugerido, si lo hay)
--    que el profesional debe aceptar para que se publique.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.review_service(
  p_service_id uuid, p_action text, p_notes text DEFAULT NULL, p_suggested_price integer DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid; v_validation text; v_title text; v_msg text; v_new text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Solo un administrador de Skilly puede revisar servicios.'; END IF;
  IF p_action NOT IN ('en_revision', 'cambios', 'aprobar') THEN RAISE EXCEPTION 'Acción de revisión no válida.'; END IF;
  SELECT professional_id, validation_status, title INTO v_owner, v_validation, v_title
    FROM public.services WHERE id = p_service_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'El servicio no existe.'; END IF;
  IF v_validation NOT IN ('pendiente', 'en_revision') THEN
    RAISE EXCEPTION 'El servicio no está pendiente de revisión.';
  END IF;
  IF p_action = 'cambios' AND (p_notes IS NULL OR btrim(p_notes) = '') THEN
    RAISE EXCEPTION 'Indica las observaciones para el profesional.';
  END IF;
  IF p_suggested_price IS NOT NULL AND p_suggested_price <= 0 THEN
    RAISE EXCEPTION 'El precio sugerido debe ser mayor a cero.';
  END IF;

  IF p_action = 'en_revision' THEN
    v_new := 'en_revision';
    UPDATE public.services SET validation_status = v_new WHERE id = p_service_id;
    RETURN;
  ELSIF p_action = 'cambios' THEN
    v_new := 'cambios_solicitados';
    v_msg := 'Skilly revisó tu servicio "' || v_title || '" y solicita ajustes. Revisa las observaciones.';
  ELSE
    v_new := 'propuesta_final';
    v_msg := 'Skilly aprobó tu servicio "' || v_title || '". Revisa la propuesta final y acéptala para publicarlo.';
  END IF;

  UPDATE public.services
     SET validation_status = v_new,
         validation_notes = NULLIF(btrim(COALESCE(p_notes, '')), ''),
         suggested_price = p_suggested_price,
         validated_by = CASE WHEN v_new = 'propuesta_final' THEN auth.uid() ELSE validated_by END
   WHERE id = p_service_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (v_owner, 'service_review', 'Revisión de tu servicio', v_msg, '/dashboard/profesional/servicios');
END $$;
REVOKE ALL ON FUNCTION public.review_service(uuid, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_service(uuid, text, text, integer) TO authenticated;

-- ---------------------------------------------------------------------
-- 7. Profesional acepta la propuesta final de Skilly -> se publica
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_service_proposal(p_service_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid; v_validation text; v_price integer; v_suggested integer; v_title text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión.'; END IF;
  SELECT professional_id, validation_status, price, suggested_price, title
    INTO v_owner, v_validation, v_price, v_suggested, v_title
    FROM public.services WHERE id = p_service_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'El servicio no existe.'; END IF;
  IF v_owner <> auth.uid() THEN RAISE EXCEPTION 'No tienes permiso para aceptar esta propuesta.'; END IF;
  IF v_validation <> 'propuesta_final' THEN
    RAISE EXCEPTION 'El servicio no tiene una propuesta final pendiente de aceptación.';
  END IF;

  UPDATE public.services
     SET price = COALESCE(v_suggested, v_price), validation_status = 'validado'
   WHERE id = p_service_id;
  -- el trigger deja status = 'activo' y registra validated_at

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (auth.uid(), 'service_published', 'Servicio publicado',
          'Tu servicio "' || v_title || '" ya está visible en el catálogo.',
          '/dashboard/profesional/servicios');
END $$;
REVOKE ALL ON FUNCTION public.accept_service_proposal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_service_proposal(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 8. Contratador contrata un servicio del catálogo
--    El precio y el profesional salen del servicio, no del navegador.
--    Crea proyecto + propuesta ya seleccionada; Skilly emite luego la orden
--    de pago con create_payment_order (sin cambios).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.contratar_servicio(
  p_service_id uuid, p_start_date date, p_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.services%ROWTYPE;
  v_role text; v_project_id uuid; v_proposal_id uuid; v_name text; v_admin record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión.'; END IF;
  SELECT role, full_name INTO v_role, v_name FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('cliente', 'ambos') THEN
    RAISE EXCEPTION 'Solo una cuenta de contratador puede contratar servicios.';
  END IF;

  SELECT * INTO s FROM public.services WHERE id = p_service_id;
  IF NOT FOUND OR s.status <> 'activo' OR s.validation_status <> 'validado' THEN
    RAISE EXCEPTION 'El servicio no está disponible para contratación.';
  END IF;
  IF s.professional_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes contratar tu propio servicio.';
  END IF;
  IF p_start_date IS NULL OR p_start_date < current_date THEN
    RAISE EXCEPTION 'Indica una fecha de inicio válida (hoy o posterior).';
  END IF;
  IF EXISTS (SELECT 1 FROM public.projects
              WHERE service_id = s.id AND client_id = auth.uid() AND status <> 'cerrado') THEN
    RAISE EXCEPTION 'Ya tienes una contratación en curso de este servicio.';
  END IF;

  INSERT INTO public.projects (client_id, title, description, category, modality,
                               budget_min, budget_max, deadline, skills,
                               service_id, scheduled_start)
  VALUES (auth.uid(), s.title,
          s.description || COALESCE(E'\n\nNotas del contratador: ' || NULLIF(btrim(p_notes), ''), ''),
          s.category, s.modality, s.price, s.price,
          p_start_date + s.duration_days, s.skills, s.id, p_start_date)
  RETURNING id INTO v_project_id;

  INSERT INTO public.proposals (project_id, professional_id, message, proposed_amount, estimated_days, status)
  VALUES (v_project_id, s.professional_id,
          'Contratación del servicio "' || s.title || '" publicado en el catálogo de Skilly.',
          s.price, s.duration_days, 'pendiente')
  RETURNING id INTO v_proposal_id;

  UPDATE public.proposals SET status = 'seleccionada' WHERE id = v_proposal_id;
  UPDATE public.projects SET status = 'propuesta_seleccionada', updated_at = now() WHERE id = v_project_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (s.professional_id, 'service_hired', 'Nueva contratación',
          COALESCE(v_name, 'Un contratador') || ' contrató tu servicio "' || s.title ||
          '" con inicio el ' || to_char(p_start_date, 'DD/MM/YYYY') || '. Queda pendiente el pago.',
          '/dashboard/profesional/propuestas');

  FOR v_admin IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (v_admin.id, 'service_hired', 'Contratación pendiente de pago',
            'Se contrató el servicio "' || s.title || '". Genera la orden de pago.',
            '/dashboard/admin/propuestas');
  END LOOP;

  RETURN v_project_id;
END $$;
REVOKE ALL ON FUNCTION public.contratar_servicio(uuid, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contratar_servicio(uuid, date, text) TO authenticated;

COMMIT;
