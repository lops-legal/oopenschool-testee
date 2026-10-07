-- ============================================================================
-- OPEN STARTUP SCHOOL P01 - ATUALIZAÇÃO PARA RESPOSTAS HÍBRIDAS (TEXTO + ÁUDIO)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- 1. Permitir que respostas sejam de Texto ou Áudio na tabela public.responses
alter table if exists public.responses
  alter column audio_path drop not null;

alter table if exists public.responses
  add column if not exists response_type text not null default 'audio' check (response_type in ('audio', 'text')),
  add column if not exists text_response text,
  add column if not exists character_count integer default 0,
  add column if not exists tab_switches_count integer not null default 0,
  add column if not exists tab_switch_events jsonb default '[]'::jsonb;

-- 2. Garantir a tabela de sessões (public.sessions) com suporte a contadores
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  form text not null default 'A',
  status text not null default 'in_progress',
  total_questions integer default 27,
  tab_switches_count integer default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Habilitar RLS e criar políticas seguras para public.sessions
alter table public.sessions enable row level security;

drop policy if exists sessions_select_own on public.sessions;
create policy sessions_select_own
on public.sessions for select to authenticated
using (participant_id = (select auth.uid()) or public.is_admin());

drop policy if exists sessions_insert_own on public.sessions;
create policy sessions_insert_own
on public.sessions for insert to authenticated
with check (participant_id = (select auth.uid()));

drop policy if exists sessions_update_own on public.sessions;
create policy sessions_update_own
on public.sessions for update to authenticated
using (participant_id = (select auth.uid()) or public.is_admin())
with check (participant_id = (select auth.uid()) or public.is_admin());

grant select, insert, update on public.sessions to authenticated;

-- 3. Índices para performance em consultas com 30+ participantes simultâneos
create index if not exists idx_responses_session_id on public.responses(session_id);
create index if not exists idx_responses_participant_id on public.responses(participant_id);
create index if not exists idx_sessions_participant_id on public.sessions(participant_id);
