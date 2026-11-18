-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 05_drop_tablas.sql
-- Propósito: Elimina las 8 tablas en orden inverso a su dependencia. ADVERTENCIA: borra todos los datos. No modifica auth.users. Ejecutar solo en un entorno de pruebas.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

DROP TABLE IF EXISTS public.professional_documents;
DROP TABLE IF EXISTS public.payment_orders;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.proposals;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.professional_profiles;
DROP TABLE IF EXISTS public.client_profiles;
DROP TABLE IF EXISTS public.profiles;
