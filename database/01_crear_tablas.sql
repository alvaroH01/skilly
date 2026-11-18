-- =====================================================================
-- Proyecto : Skilly LATAM  |  Asignatura: Proyecto Integrado (INACAP)
-- Archivo  : 01_crear_tablas.sql
-- Propósito: Crea las 8 tablas del esquema public con columnas, tipos, valores por defecto, NOT NULL, CHECK y UNIQUE. Las llaves primarias (02) y foráneas (03) se agregan en archivos separados. Orden de ejecución: 01 -> 02 -> 03 -> 06.
-- Motor    : PostgreSQL (Supabase)
-- Autores  : Álvaro Herrera, Fernanda Cabezas, Valentín Robledo
-- =====================================================================

-- Identidad base (vinculada a auth.users en el script 03)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  role text CHECK (role = ANY (ARRAY['cliente'::text, 'profesional'::text, 'ambos'::text, 'admin'::text])),
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_profiles (
  user_id uuid NOT NULL,
  phone text,
  region text,
  commune text,
  client_type text CHECK (client_type = ANY (ARRAY['persona'::text, 'organizacion'::text])),
  organization_name text,
  job_title text,
  organization_size text CHECK (organization_size = ANY (ARRAY['1-10'::text, '11-50'::text, '51-200'::text, '201-500'::text, '501+'::text])),
  website text,
  hiring_frequency text CHECK (hiring_frequency = ANY (ARRAY['puntual'::text, 'algunas_veces'::text, 'frecuentemente'::text, 'no_se'::text])),
  interest_areas text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  bio text
);

CREATE TABLE public.professional_profiles (
  user_id uuid NOT NULL,
  phone text,
  region text,
  commune text,
  professional_title text,
  bio text,
  years_experience text CHECK (years_experience = ANY (ARRAY['menos_1'::text, '1_3'::text, '4_6'::text, '7_10'::text, 'mas_10'::text])),
  experience_level text CHECK (experience_level = ANY (ARRAY['junior'::text, 'semi_senior'::text, 'senior'::text, 'especialista'::text])),
  areas text[] NOT NULL DEFAULT '{}'::text[],
  skills text[] NOT NULL DEFAULT '{}'::text[],
  service_types text[] NOT NULL DEFAULT '{}'::text[],
  work_mode text CHECK (work_mode = ANY (ARRAY['remoto'::text, 'presencial'::text, 'hibrido'::text])),
  availability text CHECK (availability = ANY (ARRAY['disponible'::text, 'parcial'::text, 'no_disponible'::text])),
  weekly_hours text,
  linkedin_url text,
  portfolio_url text,
  github_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  verification_status text NOT NULL DEFAULT 'no_enviado'::text CHECK (verification_status = ANY (ARRAY['no_enviado'::text, 'pendiente'::text, 'en_revision'::text, 'cambios_solicitados'::text, 'aprobado'::text, 'rechazado'::text])),
  verification_submitted_at timestamp with time zone,
  verification_reviewed_at timestamp with time zone,
  verification_notes text
);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['remoto'::text, 'presencial'::text, 'hibrido'::text])),
  budget_min integer,
  budget_max integer,
  deadline date,
  skills text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'activo'::text CHECK (status = ANY (ARRAY['borrador'::text, 'activo'::text, 'pausado'::text, 'propuesta_seleccionada'::text, 'pendiente_pago'::text, 'en_ejecucion'::text, 'cerrado'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  validation_status text NOT NULL DEFAULT 'no_enviado'::text CHECK (validation_status = ANY (ARRAY['no_enviado'::text, 'pendiente'::text, 'reunion_agendada'::text, 'en_revision'::text, 'cambios_solicitados'::text, 'validado'::text])),
  validation_submitted_at timestamp with time zone,
  validation_meeting_at timestamp with time zone,
  validation_notes text,
  validated_at timestamp with time zone,
  validated_by uuid
);

CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  professional_id uuid NOT NULL,
  message text NOT NULL,
  proposed_amount integer,
  estimated_days integer,
  status text NOT NULL DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'seleccionada'::text, 'rechazada'::text, 'retirada'::text, 'pendiente_pago'::text, 'confirmada'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  proposal_id uuid NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  professional_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'en_proceso'::text, 'pagado'::text, 'fallido'::text, 'cancelado'::text])),
  payment_token text UNIQUE,
  token_expires_at timestamp with time zone,
  token_used_at timestamp with time zone,
  provider text,
  provider_payment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone,
  payment_token_hash text
);

CREATE TABLE public.professional_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type = ANY (ARRAY['identidad'::text, 'titulo_profesional'::text, 'certificacion'::text, 'curriculum'::text, 'otro'::text])),
  document_name text NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'observado'::text, 'rechazado'::text])),
  admin_comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);
