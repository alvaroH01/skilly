-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 02_llaves_primarias.sql
-- Propósito: Agrega las llaves primarias de las 8 tablas. Ejecutar después de 01_crear_tablas.sql.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

ALTER TABLE public.profiles               ADD CONSTRAINT profiles_pkey               PRIMARY KEY (id);
ALTER TABLE public.client_profiles        ADD CONSTRAINT client_profiles_pkey        PRIMARY KEY (user_id);
ALTER TABLE public.professional_profiles  ADD CONSTRAINT professional_profiles_pkey  PRIMARY KEY (user_id);
ALTER TABLE public.projects               ADD CONSTRAINT projects_pkey               PRIMARY KEY (id);
ALTER TABLE public.proposals              ADD CONSTRAINT proposals_pkey              PRIMARY KEY (id);
ALTER TABLE public.notifications          ADD CONSTRAINT notifications_pkey          PRIMARY KEY (id);
ALTER TABLE public.payment_orders         ADD CONSTRAINT payment_orders_pkey         PRIMARY KEY (id);
ALTER TABLE public.professional_documents ADD CONSTRAINT professional_documents_pkey PRIMARY KEY (id);
