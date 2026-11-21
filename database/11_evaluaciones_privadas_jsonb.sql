-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 11_evaluaciones_privadas_jsonb.sql
-- Propósito: Guardar la evaluación privada post-servicio como un documento
--            JSONB (dato semiestructurado) en una tabla propia, en lugar de
--            agregarla al final de la descripción de la contratación.
--            1) Tabla private_evaluations con columna payload JSONB, índice GIN
--               y restricciones de forma.
--            2) RLS: solo el administrador de Skilly puede leer; nadie escribe
--               directamente (la escritura pasa por la función de abajo).
--            3) Función submit_private_evaluation (SECURITY DEFINER): valida al
--               Contratador, el estado de la contratación y el contenido.
--            4) Migración de las evaluaciones antiguas guardadas como texto en
--               projects.description y limpieza de ese texto, para que el
--               Profesional deje de poder leerlas.
-- Requiere : 01 a 07, 09 y 10 ya ejecutados.
-- Ejecutar : en el SQL Editor de Supabase. Corre en una sola transacción.
-- =====================================================================
BEGIN;

-- ---------------------------------------------------------------------
-- 1. Tabla con el documento JSONB
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.private_evaluations (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  evaluator_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload         jsonb       NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_evaluations_project_unique UNIQUE (project_id),
  CONSTRAINT private_evaluations_payload_chk CHECK (
    jsonb_typeof(payload) = 'object'
    AND (
      payload ? 'texto_legado'
      OR (payload ? 'plazos' AND payload ? 'calidad' AND payload ? 'comunicacion')
    )
  )
);

COMMENT ON TABLE public.private_evaluations IS
  'Evaluación privada y confidencial del Contratador. Sin estrellas ni ranking público. payload es un documento JSONB: {version, plazos, calidad, comunicacion, fortalezas, mejoras}.';

-- Índice GIN para consultar por contenido del documento (operadores @>, ?, ->>)
CREATE INDEX IF NOT EXISTS private_evaluations_payload_gin
  ON public.private_evaluations USING gin (payload jsonb_path_ops);
CREATE INDEX IF NOT EXISTS private_evaluations_professional_idx
  ON public.private_evaluations (professional_id);

-- ---------------------------------------------------------------------
-- 2. RLS: solo lectura para el administrador
-- ---------------------------------------------------------------------
ALTER TABLE public.private_evaluations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.private_evaluations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.private_evaluations TO authenticated;

DROP POLICY IF EXISTS "Admins can view private evaluations" ON public.private_evaluations;
CREATE POLICY "Admins can view private evaluations" ON public.private_evaluations
  FOR SELECT TO authenticated USING (public.is_admin());
-- Sin políticas de INSERT/UPDATE/DELETE: ni el Contratador ni el Profesional
-- pueden leer ni modificar evaluaciones por la API; solo la función de abajo escribe.

-- ---------------------------------------------------------------------
-- 3. Función de registro
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_private_evaluation(
  p_project_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p          public.projects%ROWTYPE;
  v_prof     uuid;
  v_id       uuid;
  v_doc      jsonb;
  v_fort     text;
  v_mej      text;
  v_admin    record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para enviar tu evaluación.';
  END IF;

  SELECT * INTO p FROM public.projects WHERE id = p_project_id;
  IF NOT FOUND OR p.client_id <> auth.uid() THEN
    RAISE EXCEPTION 'Solo el Contratador de la contratación puede evaluarla.';
  END IF;

  IF p.status NOT IN ('en_ejecucion', 'pausado', 'cerrado') THEN
    RAISE EXCEPTION 'Solo se puede evaluar un servicio ya pagado (en ejecución, pausado o cerrado).';
  END IF;

  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'La evaluación debe enviarse como un documento JSON.';
  END IF;

  IF COALESCE(p_payload->>'plazos', '') NOT IN
     ('excelente', 'conforme', 'retrasos_justificados', 'retrasos_no_avisados') THEN
    RAISE EXCEPTION 'Valor no válido en "plazos".';
  END IF;
  IF COALESCE(p_payload->>'calidad', '') NOT IN
     ('supero_expectativas', 'conforme', 'requirio_ajustes', 'insuficiente') THEN
    RAISE EXCEPTION 'Valor no válido en "calidad".';
  END IF;
  IF COALESCE(p_payload->>'comunicacion', '') NOT IN
     ('fluida', 'adecuada', 'falto_comunicacion') THEN
    RAISE EXCEPTION 'Valor no válido en "comunicacion".';
  END IF;

  v_fort := btrim(COALESCE(p_payload->>'fortalezas', ''));
  v_mej  := btrim(COALESCE(p_payload->>'mejoras', ''));
  IF v_fort = '' AND v_mej = '' THEN
    RAISE EXCEPTION 'Comparte al menos un comentario sobre fortalezas o mejoras.';
  END IF;
  IF length(v_fort) > 2000 OR length(v_mej) > 2000 THEN
    RAISE EXCEPTION 'Los comentarios no pueden superar los 2000 caracteres.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.private_evaluations WHERE project_id = p_project_id) THEN
    RAISE EXCEPTION 'Esta contratación ya fue evaluada.';
  END IF;

  SELECT pr.professional_id INTO v_prof
  FROM public.proposals pr
  WHERE pr.project_id = p_project_id
    AND pr.status IN ('seleccionada', 'pendiente_pago', 'confirmada')
  ORDER BY pr.created_at DESC LIMIT 1;

  -- Solo se guardan las claves esperadas (se descarta cualquier otra)
  v_doc := jsonb_build_object(
    'version', 1,
    'plazos', p_payload->>'plazos',
    'calidad', p_payload->>'calidad',
    'comunicacion', p_payload->>'comunicacion',
    'fortalezas', v_fort,
    'mejoras', v_mej);

  INSERT INTO public.private_evaluations (project_id, evaluator_id, professional_id, payload)
  VALUES (p_project_id, auth.uid(), v_prof, v_doc)
  RETURNING id INTO v_id;

  FOR v_admin IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (v_admin.id, 'private_evaluation', 'Nueva evaluación privada',
            'Se registró una evaluación confidencial de la contratación "' || p.title || '".',
            '/dashboard/admin/evaluaciones');
  END LOOP;

  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_private_evaluation(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_private_evaluation(uuid, jsonb) TO authenticated;

-- ---------------------------------------------------------------------
-- 4. Migrar las evaluaciones antiguas (texto agregado a la descripción)
--    y quitarlas de projects.description (el Profesional podía leerlas).
-- ---------------------------------------------------------------------
INSERT INTO public.private_evaluations (project_id, evaluator_id, professional_id, payload, created_at)
SELECT pj.id,
       pj.client_id,
       (SELECT pr.professional_id FROM public.proposals pr
         WHERE pr.project_id = pj.id
           AND pr.status IN ('seleccionada', 'pendiente_pago', 'confirmada')
         ORDER BY pr.created_at DESC LIMIT 1),
       jsonb_build_object(
         'version', 1,
         'texto_legado',
         btrim(substr(pj.description, strpos(pj.description, '[EVALUACIÓN PRIVADA SKILLY]')))),
       pj.updated_at
FROM public.projects pj
WHERE strpos(pj.description, '[EVALUACIÓN PRIVADA SKILLY]') > 0
ON CONFLICT (project_id) DO NOTHING;

-- Las funciones y triggers de protección no actúan en el SQL Editor (auth.uid() es nulo)
UPDATE public.projects
SET description = btrim(substr(description, 1, strpos(description, '[EVALUACIÓN PRIVADA SKILLY]') - 1))
WHERE strpos(description, '[EVALUACIÓN PRIVADA SKILLY]') > 0;

COMMIT;
