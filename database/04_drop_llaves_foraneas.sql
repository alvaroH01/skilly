-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 04_drop_llaves_foraneas.sql
-- Propósito: Elimina todas las llaves foráneas. Útil para vaciar o reordenar tablas sin errores de dependencia. Ejecutar antes de 05_drop_tablas.sql.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

ALTER TABLE public.professional_documents DROP CONSTRAINT IF EXISTS professional_documents_professional_id_fkey;

ALTER TABLE public.payment_orders
  DROP CONSTRAINT IF EXISTS payment_orders_professional_id_fkey,
  DROP CONSTRAINT IF EXISTS payment_orders_client_id_fkey,
  DROP CONSTRAINT IF EXISTS payment_orders_proposal_id_fkey,
  DROP CONSTRAINT IF EXISTS payment_orders_project_id_fkey;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.proposals
  DROP CONSTRAINT IF EXISTS proposals_professional_id_fkey,
  DROP CONSTRAINT IF EXISTS proposals_project_id_fkey;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_validated_by_fkey,
  DROP CONSTRAINT IF EXISTS projects_client_id_fkey;

ALTER TABLE public.professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_user_id_fkey;
ALTER TABLE public.client_profiles       DROP CONSTRAINT IF EXISTS client_profiles_user_id_fkey;
ALTER TABLE public.profiles              DROP CONSTRAINT IF EXISTS profiles_id_fkey;
