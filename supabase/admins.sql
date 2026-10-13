-- ============================================================================
-- OPEN STARTUP SCHOOL P01 - CONTAS ADMIN
-- O banco em producao nao tem papel de admin (falta participants.role e a
-- funcao is_admin()). Este script cria esse papel, impede que participantes
-- se promovam pelo navegador e promove as contas listadas no passo 5.
--
-- As contas precisam existir antes: crie pelo cadastro do app ou em
-- Authentication > Users > Add user. Se o script rodar antes, nada e
-- promovido; basta rodar de novo. O script e idempotente.
-- ============================================================================

-- 1. Papel do participante
alter table public.participants
  add column if not exists role text not null default 'participant';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'participants_role_check'
      and conrelid = 'public.participants'::regclass
  ) then
    alter table public.participants
      add constraint participants_role_check check (role in ('participant', 'admin'));
  end if;
end;
$$;

-- 2. O navegador so grava as colunas do proprio perfil. `role` fica fora do
-- alcance do app mesmo que alguma policy de RLS existente seja permissiva.
revoke insert, update on public.participants from anon, authenticated;
grant insert (id, full_name, email) on public.participants to authenticated;
grant update (full_name, email, updated_at) on public.participants to authenticated;

-- 3. Verificacao de admin usada pelas policies (mesma assinatura do setup.sql)
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

revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

-- 4. Admin le tudo. Policies se somam as existentes (OR): isto so amplia o
-- acesso dos admins e nao muda o que os participantes ja enxergam.
drop policy if exists participants_select_admin on public.participants;
create policy participants_select_admin
on public.participants for select to authenticated
using ((select public.is_admin()));

drop policy if exists sessions_select_admin on public.sessions;
create policy sessions_select_admin
on public.sessions for select to authenticated
using ((select public.is_admin()));

drop policy if exists responses_select_admin on public.responses;
create policy responses_select_admin
on public.responses for select to authenticated
using ((select public.is_admin()));

drop policy if exists recordings_select_admin on storage.objects;
create policy recordings_select_admin
on storage.objects for select to authenticated
using (bucket_id = 'recordings' and (select public.is_admin()));

-- 5. Promove as contas
insert into public.participants (id, full_name, email, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)),
  u.email,
  'admin'
from auth.users u
where lower(u.email) in ('lucascardososilva@usp.br', 'luccaroswelld@gmail.com')
on conflict (id) do update
  set role = 'admin';

-- 6. Conferencia: as duas contas devem aparecer com role = admin. Confira se
-- created_at bate com quando voces criaram as contas: o cadastro e aberto e
-- sem confirmacao de email, entao qualquer pessoa pode registrar um email.
-- admin@openstartup.school e a conta de bootstrap do setup.sql, cuja senha
-- esta no repositorio publico: se aparecer, apague em Authentication > Users.
select u.email, u.created_at, u.last_sign_in_at, coalesce(p.role, '(sem perfil)') as role
from auth.users u
left join public.participants p on p.id = u.id
where lower(u.email) in (
  'lucascardososilva@usp.br',
  'luccaroswelld@gmail.com',
  'admin@openstartup.school'
)
order by u.email;
