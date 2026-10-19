-- ============================================================================
-- OPEN STARTUP SCHOOL P01 - PROTECAO DOS DADOS GRAVADOS
-- Achados da auditoria de carga de 19/10/2026:
--   * anon e authenticated tinham TRUNCATE, DELETE, REFERENCES e TRIGGER nas
--     tabelas do app (padrao do Supabase). O RLS barrava DELETE e a API nao
--     expoe TRUNCATE, mas nada disso e usado: fica so o necessario.
--   * O upload aceitava qualquer caminho dentro da pasta do usuario, inclusive
--     o formato do app antigo, sem sessao no banco. Agora o audio so entra em
--     <usuario>/<sessao>/... quando a sessao existe e e do proprio usuario.
--   * responses aceitava linha sem sessao ou com sessao de outra pessoa, e o
--     mesmo audio podia gerar duas linhas.
-- Rode depois de setup.sql, admins.sql e transcriptions.sql. Idempotente.
-- ============================================================================

-- 1. Privilegios: o app so roda logado; anon nao precisa de nada nessas tabelas.
revoke all on public.participants, public.sessions, public.responses from anon;
revoke truncate, references, trigger, delete
  on public.participants, public.sessions, public.responses from authenticated;
-- Respostas sao imutaveis para o participante: grava e le, nao altera.
revoke update on public.responses from authenticated;

-- 2. Audio so entra numa sessao existente do proprio usuario.
drop policy if exists "recordings: own upload" on storage.objects;
drop policy if exists recordings_insert_own_folder on storage.objects;
create policy "recordings: own upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'recordings'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.sessions s
    where s.id::text = (storage.foldername(name))[2]
      and s.participant_id = (select auth.uid())
  )
);

-- 3. Resposta so entra numa sessao existente do proprio usuario.
drop policy if exists "responses: own insert" on public.responses;
drop policy if exists responses_insert_own on public.responses;
create policy "responses: own insert"
on public.responses for insert to authenticated
with check (
  participant_id = (select auth.uid())
  and exists (
    select 1 from public.sessions s
    where s.id = session_id
      and s.participant_id = (select auth.uid())
  )
);

-- 4. Um audio, uma linha: o app reenvia apos timeout e trata a duplicata como
-- salva. As respostas escritas antigas ("TEXT: ...") ficam de fora.
create unique index if not exists responses_audio_path_key
  on public.responses (audio_path)
  where audio_path is not null and audio_path not like 'TEXT:%';

-- 5. Conferencia: privilegios que sobraram.
select t.tbl, r.role,
  has_table_privilege(r.role, t.tbl, 'SELECT') as sel,
  has_table_privilege(r.role, t.tbl, 'INSERT') as ins,
  has_table_privilege(r.role, t.tbl, 'UPDATE') as upd,
  has_table_privilege(r.role, t.tbl, 'DELETE') as del,
  has_table_privilege(r.role, t.tbl, 'TRUNCATE') as trunc
from (values ('public.participants'), ('public.sessions'), ('public.responses')) t(tbl)
cross join (values ('anon'), ('authenticated')) r(role)
order by 1, 2;
