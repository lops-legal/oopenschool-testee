-- Open Startup School P01 - schema completo para Supabase
-- Execute este arquivo inteiro no SQL Editor do seu projeto.
-- Antes de executar, troque o email e a senha no bloco "BOOTSTRAP DO ADMIN".

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tabelas da aplicacao
-- -----------------------------------------------------------------------------

create table if not exists public.participants (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists participants_email_lower_idx
  on public.participants (lower(email));

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  form_code text not null default 'A',
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'processing', 'reviewed')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  session_id uuid not null,
  question_id text not null,
  audio_path text not null,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists assessment_sessions_participant_idx
  on public.assessment_sessions (participant_id, started_at desc);
create index if not exists responses_participant_session_idx
  on public.responses (participant_id, session_id, recorded_at);
create index if not exists responses_question_idx
  on public.responses (question_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists participants_set_updated_at on public.participants;
create trigger participants_set_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

drop trigger if exists assessment_sessions_set_updated_at on public.assessment_sessions;
create trigger assessment_sessions_set_updated_at
before update on public.assessment_sessions
for each row execute function public.set_updated_at();

-- Cria automaticamente o perfil publico de todo novo usuario do Auth.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.participants (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    case when new.raw_app_meta_data ->> 'app_role' = 'admin' then 'admin' else 'participant' end
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.participants p
    where p.id = check_user_id and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS das tabelas
-- -----------------------------------------------------------------------------

alter table public.participants enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.responses enable row level security;

drop policy if exists participants_select_own_or_admin on public.participants;
create policy participants_select_own_or_admin
on public.participants for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists participants_insert_own on public.participants;
create policy participants_insert_own
on public.participants for insert to authenticated
with check (id = (select auth.uid()) and role = 'participant');

drop policy if exists participants_update_own_or_admin on public.participants;
create policy participants_update_own_or_admin
on public.participants for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists sessions_select_own_or_admin on public.assessment_sessions;
create policy sessions_select_own_or_admin
on public.assessment_sessions for select to authenticated
using (participant_id = (select auth.uid()) or public.is_admin());

drop policy if exists sessions_insert_own on public.assessment_sessions;
create policy sessions_insert_own
on public.assessment_sessions for insert to authenticated
with check (participant_id = (select auth.uid()));

drop policy if exists sessions_update_own_or_admin on public.assessment_sessions;
create policy sessions_update_own_or_admin
on public.assessment_sessions for update to authenticated
using (participant_id = (select auth.uid()) or public.is_admin())
with check (participant_id = (select auth.uid()) or public.is_admin());

drop policy if exists responses_select_own_or_admin on public.responses;
create policy responses_select_own_or_admin
on public.responses for select to authenticated
using (participant_id = (select auth.uid()) or public.is_admin());

drop policy if exists responses_insert_own on public.responses;
create policy responses_insert_own
on public.responses for insert to authenticated
with check (participant_id = (select auth.uid()));

drop policy if exists responses_update_admin on public.responses;
create policy responses_update_admin
on public.responses for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists responses_delete_admin on public.responses;
create policy responses_delete_admin
on public.responses for delete to authenticated
using (public.is_admin());

grant usage on schema public to authenticated;
grant select, insert on public.participants to authenticated;
revoke update on public.participants from authenticated;
grant update (full_name, email, updated_at) on public.participants to authenticated;
grant select, insert, update on public.assessment_sessions to authenticated;
grant select, insert on public.responses to authenticated;
grant update, delete on public.responses to authenticated;

-- -----------------------------------------------------------------------------
-- Storage privado para as respostas de audio
-- O caminho gerado pelo app e: <user_id>/<session_id>/<question_id>__<data>.webm
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings',
  'recordings',
  false,
  104857600,
  array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists recordings_insert_own_folder on storage.objects;
create policy recordings_insert_own_folder
on storage.objects for insert to authenticated
with check (
  bucket_id = 'recordings'
  and split_part(name, '/', 1) = (select auth.uid()::text)
);

drop policy if exists recordings_select_own_or_admin on storage.objects;
create policy recordings_select_own_or_admin
on storage.objects for select to authenticated
using (
  bucket_id = 'recordings'
  and (
    split_part(name, '/', 1) = (select auth.uid()::text)
    or public.is_admin()
  )
);

drop policy if exists recordings_delete_own_or_admin on storage.objects;
create policy recordings_delete_own_or_admin
on storage.objects for delete to authenticated
using (
  bucket_id = 'recordings'
  and (
    split_part(name, '/', 1) = (select auth.uid()::text)
    or public.is_admin()
  )
);

-- -----------------------------------------------------------------------------
-- BOOTSTRAP DO ADMIN
-- Credenciais iniciais: admin@openstartup.school / Admin@P01!2026
-- Troque os dois valores abaixo antes de usar em producao.
-- Este bloco e idempotente: se o email existir, atualiza senha, metadados e papel.
-- -----------------------------------------------------------------------------

do $$
declare
  admin_email constant text := 'admin@openstartup.school';
  admin_password constant text := 'Admin@P01!2026';
  admin_name constant text := 'Administrador P01';
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'app_role', 'admin'),
      jsonb_build_object('full_name', admin_name),
      now(),
      now()
    );
  else
    update auth.users
    set encrypted_password = crypt(admin_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object('provider', 'email', 'providers', array['email'], 'app_role', 'admin'),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
          || jsonb_build_object('full_name', admin_name),
        updated_at = now()
    where id = admin_id;
  end if;

  -- Em versoes atuais do Supabase, o login por email tambem usa auth.identities.
  if not exists (
    select 1 from auth.identities
    where user_id = admin_id and provider = 'email'
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      admin_id,
      admin_id,
      admin_id::text,
      jsonb_build_object('sub', admin_id::text, 'email', admin_email, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  insert into public.participants (id, full_name, email, role)
  values (admin_id, admin_name, admin_email, 'admin')
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      role = 'admin',
      updated_at = now();
end;
$$;

-- Verificacao final: deve retornar uma linha com role = admin.
select id, full_name, email, role, created_at
from public.participants
where email = 'admin@openstartup.school';
