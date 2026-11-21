-- =====================================================================
-- Archivo  : 08_correcciones_pruebas.sql
-- Propósito: Correcciones derivadas de la ejecución de pruebas del 18/11/2026.
-- Requiere : 01, 02, 03, 06 y 07 ejecutados. Probar primero en una copia.
-- =====================================================================
BEGIN;
-- DEF-001: monto obligatorio en postulaciones nuevas (NOT VALID: no falla por filas antiguas)
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_amount_required_chk CHECK (proposed_amount IS NOT NULL) NOT VALID;

-- DEF-004: retirar la política atada a un UUID fijo (is_admin() ya cubre al administrador).
-- Antes, confirmar que la cuenta de Skilly tiene role = 'admin' en profiles.
DROP POLICY IF EXISTS "Skilly admin account can update projects" ON public.projects;

-- DEF-003: el profesional adjudicado debe ver su proyecto cuando deja de estar 'activo'.
-- Se usa una función SECURITY DEFINER para evitar recursión de RLS entre projects y proposals.
CREATE OR REPLACE FUNCTION public.professional_has_proposal(p_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.proposals
                  WHERE project_id = p_project_id AND professional_id = auth.uid()
                    AND status IN ('seleccionada','pendiente_pago','confirmada'));
$$;
REVOKE ALL ON FUNCTION public.professional_has_proposal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.professional_has_proposal(uuid) TO authenticated;
CREATE POLICY "Professionals can view awarded projects" ON public.projects
  FOR SELECT TO authenticated USING (public.professional_has_proposal(id));
COMMIT;
