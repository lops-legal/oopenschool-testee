-- Open Startup School P01 - schema completo para Supabase
-- Execute este arquivo inteiro no SQL Editor do seu projeto.

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
-- As gravacoes usam o codec Opus a 24 kbps em container WebM (ou Ogg, quando
-- oferecido pelo navegador). MP3, WAV e MP4 nao sao aceitos para novas capturas.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings',
  'recordings',
  false,
  104857600,
  array['audio/webm', 'audio/ogg']
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
-- ADMINS
-- Nao ha conta admin padrao: crie a conta pelo app e promova-a com
-- supabase/admins.sql.
-- -----------------------------------------------------------------------------
