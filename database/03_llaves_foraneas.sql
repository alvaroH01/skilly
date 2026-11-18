-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 03_llaves_foraneas.sql
-- Propósito: Agrega las llaves foráneas (llaves ajenas). Ejecutar después de 02_llaves_primarias.sql.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

-- Identidad: profiles depende del esquema de autenticación de Supabase
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE public.client_profiles
  ADD CONSTRAINT client_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.professional_profiles
  ADD CONSTRAINT professional_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.projects
  ADD CONSTRAINT projects_client_id_fkey    FOREIGN KEY (client_id)    REFERENCES public.profiles(id),
  ADD CONSTRAINT projects_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.profiles(id);

ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_project_id_fkey      FOREIGN KEY (project_id)      REFERENCES public.projects(id),
  ADD CONSTRAINT proposals_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.payment_orders
  ADD CONSTRAINT payment_orders_project_id_fkey      FOREIGN KEY (project_id)      REFERENCES public.projects(id),
  ADD CONSTRAINT payment_orders_proposal_id_fkey     FOREIGN KEY (proposal_id)     REFERENCES public.proposals(id),
  ADD CONSTRAINT payment_orders_client_id_fkey       FOREIGN KEY (client_id)       REFERENCES public.profiles(id),
  ADD CONSTRAINT payment_orders_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id);

ALTER TABLE public.professional_documents
  ADD CONSTRAINT professional_documents_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id);
