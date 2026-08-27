-- Estrutura inicial para migrar o CertifyAI do localStorage para Supabase.
-- Execute no SQL Editor do Supabase somente quando o projeto Supabase estiver configurado.

create extension if not exists "pgcrypto";

create table if not exists public.institution_settings (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id text primary key,
  course_id text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id text primary key,
  course_id text,
  class_id text,
  document_number text,
  email text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists students_document_unique on public.students (document_number) where document_number is not null and document_number <> '';
create unique index if not exists students_email_unique on public.students (lower(email)) where email is not null and email <> '';

create table if not exists public.certificates (
  id text primary key,
  code text not null unique,
  student_id text,
  course_id text,
  status text not null default 'active',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key,
  action text not null,
  certificate_id text,
  certificate_code text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.institution_settings enable row level security;
alter table public.courses enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_logs enable row level security;

-- Política inicial: somente usuários autenticados podem acessar os dados.
-- Antes de uso multi-instituição, substitua por políticas baseadas em instituição/organização.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['institution_settings','courses','classes','students','certificates','audit_logs']
  loop
    execute format('drop policy if exists authenticated_access on public.%I', table_name);
    execute format('create policy authenticated_access on public.%I for all to authenticated using (true) with check (true)', table_name);
  end loop;
end $$;
