-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 06_indices.sql
-- Propósito: Índices adicionales a los creados automáticamente por PRIMARY KEY y UNIQUE. Corresponden a los índices reales de la base (consulta pg_indexes). Ejecutar después de 03.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

-- Evita postulaciones duplicadas de un profesional al mismo proyecto
CREATE UNIQUE INDEX IF NOT EXISTS proposals_project_id_professional_id_key
  ON public.proposals USING btree (project_id, professional_id);

-- El hash del token de pago es único cuando existe
CREATE UNIQUE INDEX IF NOT EXISTS payment_orders_token_hash_unique
  ON public.payment_orders USING btree (payment_token_hash) WHERE (payment_token_hash IS NOT NULL);

-- Filtros por estado de validación y verificación
CREATE INDEX IF NOT EXISTS projects_validation_status_idx
  ON public.projects USING btree (validation_status);
CREATE INDEX IF NOT EXISTS professional_profiles_verification_status_idx
  ON public.professional_profiles USING btree (verification_status);

-- Documentos de respaldo del profesional
CREATE INDEX IF NOT EXISTS professional_documents_professional_id_idx
  ON public.professional_documents USING btree (professional_id);
CREATE INDEX IF NOT EXISTS professional_documents_status_idx
  ON public.professional_documents USING btree (status);
