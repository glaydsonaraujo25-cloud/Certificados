-- Estrutura inicial do CertifyAI no Supabase
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'operator' check (role in ('admin','operator','instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create table if not exists public.courses (
  id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  workload_hours integer not null check (workload_hours > 0),
  start_date date,
  end_date date,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(owner_id,id),
  check (start_date is null or end_date is null or start_date <= end_date)
);

create table if not exists public.students (
  id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  document_number text,
  registration_number text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(owner_id,id),
  unique(owner_id,document_number)
);

create table if not exists public.course_classes (
  id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(owner_id,id),
  foreign key(owner_id,course_id) references public.courses(owner_id,id) on delete restrict
);

create table if not exists public.certificates (
  id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  student_id text not null,
  course_id text not null,
  status text not null default 'active' check (status in ('active','cancelled','expired')),
  issue_date date not null,
  expires_at date,
  integrity_hash text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(owner_id,id),
  unique(owner_id,code),
  foreign key(owner_id,student_id) references public.students(owner_id,id) on delete restrict,
  foreign key(owner_id,course_id) references public.courses(owner_id,id) on delete restrict
);

create table if not exists public.audit_logs (
  id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  certificate_id text,
  details text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(owner_id,id)
);

create index if not exists students_owner_name_idx on public.students(owner_id,full_name);
create index if not exists students_owner_registration_idx on public.students(owner_id,registration_number);
create index if not exists certificates_owner_student_idx on public.certificates(owner_id,student_id);
create index if not exists certificates_owner_status_issue_idx on public.certificates(owner_id,status,issue_date desc);
create index if not exists audit_logs_owner_created_idx on public.audit_logs(owner_id,created_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists institutions_updated_at on public.institutions;
create trigger institutions_updated_at before update on public.institutions for each row execute function public.set_updated_at();
drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists students_updated_at on public.students;
create trigger students_updated_at before update on public.students for each row execute function public.set_updated_at();
drop trigger if exists classes_updated_at on public.course_classes;
create trigger classes_updated_at before update on public.course_classes for each row execute function public.set_updated_at();
drop trigger if exists certificates_updated_at on public.certificates;
create trigger certificates_updated_at before update on public.certificates for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'name',''),'operator')
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.course_classes enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_logs enable row level security;

do $$ declare table_name text;
begin
  foreach table_name in array array['profiles','institutions','courses','students','course_classes','certificates','audit_logs']
  loop
    execute format('drop policy if exists owner_all on public.%I',table_name);
    if table_name='profiles' then
      execute 'create policy owner_all on public.profiles for all to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()))';
    else
      execute format('create policy owner_all on public.%I for all to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()))',table_name);
    end if;
  end loop;
end $$;

revoke all on public.profiles,public.institutions,public.courses,public.students,public.course_classes,public.certificates,public.audit_logs from anon;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update(name) on public.profiles to authenticated;
grant select,insert,update,delete on public.institutions,public.courses,public.students,public.course_classes,public.certificates,public.audit_logs to authenticated;
