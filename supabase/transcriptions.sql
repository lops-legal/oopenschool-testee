-- ============================================================================
-- OPEN STARTUP SCHOOL P01 - TRANSCRICAO E ORGANIZACAO DAS RESPOSTAS
-- O bucket `recordings` e a fonte da verdade: parte das linhas de
-- sessions/responses se perdeu, os arquivos nao. Cada audio do bucket vira
-- uma linha em public.transcriptions, e a Edge Function `transcribe-worker`
-- (supabase/functions) consome essa fila, chamada a cada minuto pelo pg_cron.
-- As views session_answers e session_summary organizam as respostas validas
-- por sessao, na ordem da Forma A. Depende de supabase/admins.sql
-- (is_admin). O script e idempotente.
-- ============================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- 1. Ordem oficial das perguntas, gerada de src/data/canonicalData.js.
-- Atualize junto quando o roteiro mudar.
create table if not exists public.form_questions (
  form text not null,
  question_id text not null,
  position integer not null,
  kind text not null,
  block text not null,
  prompt text not null,
  primary key (form, question_id)
);

insert into public.form_questions (form, question_id, position, kind, block, prompt)
values
  ('A', 'A-M1', 1, 'question', 'Bloco 0 — Modelo Mental',
   'Primeiro, pense em alguém que você consideraria muito competente para empreender. Sem usar uma lista pronta, que conhecimentos, capacidades ou maneiras de agir essa pessoa precisaria ter? Fale tudo o que vier à cabeça e explique brevemente porquê.'),
  ('A', 'A-M2', 2, 'question', 'Bloco 0 — Modelo Mental',
   'Dessas capacidades que você acabou de citar, quais você acredita que já desenvolveu mais? Conte o que faz você pensar isso.'),
  ('A', 'A-M3', 3, 'question', 'Bloco 0 — Modelo Mental',
   'E agora, por último, qual capacidade empreendedora você acredita ter desenvolvido menos ou quase nunca ter colocado à prova? Explique.'),
  ('A', 'A-K01', 4, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Entrando agora em Knowledge Fundamentals. Uma empresa vende um serviço por R$ 240. Cada venda gera R$ 90 de custos que só existem quando o serviço é prestado. Quanto sobra por venda para ajudar a pagar os custos fixos e gerar resultado? Explique rapidamente sua conta.'),
  ('A', 'A-K02', 5, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Uma adolescente usa uma plataforma de preparação para vestibular todos os dias, mas a assinatura é paga pelos pais. Quem é o usuário e quem é o pagador? Pode haver mais de um papel envolvido?'),
  ('A', 'A-K03', 6, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Uma landing page recebeu 1.200 visitas e 24 inscrições. A frase, as pessoas não entenderam a proposta, é um fato observado, uma interpretação, uma hipótese ou uma decisão? Explique.'),
  ('A', 'A-K04', 7, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Uma empresa fechou vendas suficientes para mostrar lucro no mês, mas os clientes só pagarão daqui a 90 dias e os salários vencem amanhã. A empresa pode ter lucro e mesmo assim ficar sem dinheiro? Por quê?'),
  ('A', 'A-K05', 8, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Antes de um teste, uma equipe decide que continuará a iniciativa somente se conseguir pelo menos 30 inscrições qualificadas em 48 horas. Por que definir esse critério antes de ver o resultado pode melhorar a qualidade da decisão?'),
  ('A', 'A-K06', 9, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Agora você precisa tomar duas decisões. A primeira pode ser revertida amanhã com baixo custo. A segunda envolve um contrato de dois anos e alto impacto financeiro. Você deveria exigir o mesmo nível de análise para as duas? O que muda?'),
  ('A', 'A-K07', 10, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Seu time precisa de uma competência de design por apenas duas semanas e ninguém domina isso internamente. Além de contratar uma pessoa em tempo integral, que outras rotas você consideraria? Como escolheria entre elas?'),
  ('A', 'A-K08', 11, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'O canal A custa R$ 120 para adquirir um cliente. Esse cliente deixa R$ 40 por mês depois dos custos diretos e permanece em média 10 meses. O canal B custa R$ 300 para adquirir um cliente, deixa R$ 90 por mês e permanece em média 20 meses. Qual canal parece economicamente melhor por essa conta simplificada? Explique.'),
  ('A', 'A-K09', 12, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Bem, um experimento funciona muito bem em uma universidade onde o fundador já é conhecido e tem forte reputação. Podemos concluir que o mesmo resultado ocorrerá em outras universidades? O que ainda precisaríamos saber?'),
  ('A', 'A-K10', 13, 'question', 'Bloco 1 — Conhecimentos fundamentais',
   'Para finalizar este bloco, uma ferramenta de inteligência artificial acelera muito uma análise importante, mas ninguém sabe qual é sua taxa de erro, e os erros são difíceis de perceber. Se essa análise for usada em uma decisão de alto impacto, como você desenharia o uso dessa inteligência artificial?'),
  ('A', 'A-PB01', 14, 'question', 'Bloco 2 — Experiências anteriores',
   'Entrando no bloco, Prior Behavior. Nos conte alguma coisa que você tenha criado, organizado ou colocado no mundo fora de uma obrigação puramente acadêmica. O que era e qual parte dependia diretamente de você?'),
  ('A', 'A-PB02', 15, 'question', 'Bloco 2 — Experiências anteriores',
   'Você já vendeu alguma coisa, cobrou por um serviço, conseguiu uma contribuição financeira ou convenceu alguém a pagar por algo? Nos conte o episódio e o que você fez pessoalmente.'),
  ('A', 'A-PB03', 16, 'question', 'Bloco 2 — Experiências anteriores',
   'Conta pra gente uma situação em que você precisou convencer alguém a colocar tempo, acesso, reputação, dinheiro ou outro recurso em algo que você estava propondo. O que você pediu e o que aconteceu?'),
  ('A', 'A-PB04', 17, 'question', 'Bloco 2 — Experiências anteriores',
   'Consegue lembrar de alguma decisão importante que você precisou tomar sem ter todas as informações? O que estava incerto? Como decidiu? E o que aconteceu depois?'),
  ('A', 'A-PB05', 18, 'question', 'Bloco 2 — Experiências anteriores',
   'Nos conte uma situação em que uma evidência fez você mudar de opinião, de plano ou de prioridade. O que você acreditava antes e o que mudou?'),
  ('A', 'A-PB06', 19, 'question', 'Bloco 2 — Experiências anteriores',
   'Conte um erro, tentativa ou iniciativa sua que não funcionou como você esperava. Qual foi a consequência concreta e o que você fez depois?'),
  ('A', 'A-CASE-INTRO', 20, 'intro', 'Bloco 3 — Desafio de negócio',
   'A Open Startup School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações. Imagine que a escola quer começar com universitários de diferentes cursos. A escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela, nem como transformar interessados em participantes ativos. Sua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona. Pense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final.'),
  ('A', 'A-CASE-INITIAL', 21, 'thinkaloud', 'Bloco 3 — Desafio de negócio',
   'Agora que você entendeu o desafio, queremos saber como você agiria diante dele. Explique o que você precisa entender primeiro. Quais decisões tomaria? O que faria nas primeiras 48 horas? O que não faria ainda? O que mediria? E que evidência faria você mudar de direção?'),
  ('A', 'A-CASE-C1', 22, 'question', 'Bloco 3 — Desafio de negócio',
   'Você recebeu uma nova informação. Uma universidade oferece acesso direto a 2 mil estudantes, mas pede duas atividades exclusivas para seus alunos e quer que a iniciativa apareça com a marca da universidade junto da marca da escola. Como essa informação muda ou não muda o seu plano? Pense em voz alta e diga o que avaliaria antes de aceitar.'),
  ('A', 'A-CASE-C2', 23, 'question', 'Bloco 3 — Desafio de negócio',
   'Mais uma informação. Depois da primeira campanha, a página recebeu mil visitas e apenas 20 pessoas se inscreveram. O que esse resultado diz e o que ele ainda não diz? O que você faria em seguida?'),
  ('A', 'A-PITCH-PREP', 24, 'prep', 'Bloco 4 — Síntese e apresentação',
   'Agora, organize sua proposta. Considere que você terá 90 segundos para conversar com uma pessoa que pode abrir acesso a estudantes e colocar o primeiro experimento em movimento. Prepare-se para explicar. Qual é o desafio? Para quem isso importa? O que você faria primeiro? Por que essa abordagem faz sentido? E que próximo passo concreto você pediria?'),
  ('A', 'A-PITCH', 25, 'pitch', 'Bloco 4 — Síntese e apresentação',
   'Fique à vontade para começar. Você tem até 90 segundos.'),
  ('A', 'A-PITCH-REFLECT', 26, 'question', 'Bloco 4 — Síntese e apresentação',
   'Boa! Se você pudesse melhorar apenas uma coisa nessa proposta antes de agir amanhã, o que mudaria e por quê?'),
  ('A', 'A-CLOSE', 27, 'question', 'Bloco 5 — Fechamento',
   'Para finalizar, depois de passar por esta experiência, existe alguma capacidade empreendedora que passou a parecer mais importante para você do que parecia no começo? Qual e por quê?')
on conflict (form, question_id) do update
set position = excluded.position,
    kind = excluded.kind,
    block = excluded.block,
    prompt = excluded.prompt;

alter table public.form_questions enable row level security;
revoke all on public.form_questions from anon, authenticated;
grant select on public.form_questions to authenticated;

drop policy if exists form_questions_select_all on public.form_questions;
create policy form_questions_select_all
on public.form_questions for select to authenticated
using (true);

-- 2. Uma linha por audio do bucket: identificacao, fila e resultado
create table if not exists public.transcriptions (
  audio_path text primary key,
  participant_id uuid,
  session_id uuid,
  question_id text,
  recorded_at timestamptz not null,
  size_bytes bigint,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed')),
  text text,
  model text,
  provider_key text,
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  processing_ms integer,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcriptions_queue_idx
  on public.transcriptions (next_attempt_at)
  where status in ('pending', 'processing');
create index if not exists transcriptions_session_idx
  on public.transcriptions (session_id, question_id, recorded_at);

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

drop trigger if exists transcriptions_set_updated_at on public.transcriptions;
create trigger transcriptions_set_updated_at
before update on public.transcriptions
for each row execute function public.set_updated_at();

-- Somente admins leem; so o worker (service_role) escreve
alter table public.transcriptions enable row level security;

revoke all on public.transcriptions from anon, authenticated;
grant select on public.transcriptions to authenticated;
grant select, insert, update, delete on public.transcriptions to service_role;

drop policy if exists transcriptions_select_admin on public.transcriptions;
create policy transcriptions_select_admin
on public.transcriptions for select to authenticated
using ((select public.is_admin()));

-- 3. Identifica participante, sessao e pergunta pelo caminho do arquivo.
-- Formato atual:  <participante>/<sessao>/<pergunta>__<data>.webm
-- Formato antigo: <participante>/<sessao>_<pergunta>.webm
-- Fora desses formatos, os tres campos ficam nulos.
create or replace function public.parse_recording_path(path text)
returns table (participant_id uuid, session_id uuid, question_id text)
language sql
immutable
set search_path = ''
as $$
  with re as (
    select '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' as id
  )
  select parsed.m[1]::uuid, parsed.m[2]::uuid, parsed.m[3]
  from re
  cross join lateral (
    select coalesce(
      regexp_match(path, '^(' || re.id || ')/(' || re.id || ')/([A-Za-z0-9-]+)__[^/]+$'),
      regexp_match(path, '^(' || re.id || ')/(' || re.id || ')_([A-Za-z0-9-]+)\.[a-z0-9]+$')
    ) as m
  ) parsed;
$$;

revoke all on function public.parse_recording_path(text) from public, anon, authenticated;

-- Coloca na fila todo audio do bucket que ainda nao esta nela. Roda em cada
-- chamada do worker, entao audios cuja linha em responses falhou tambem
-- sao transcritos.
create or replace function public.sync_transcription_queue()
returns integer
language sql
security definer
set search_path = ''
as $$
  with inserted as (
    insert into public.transcriptions
      (audio_path, participant_id, session_id, question_id, recorded_at, size_bytes)
    select
      o.name,
      p.participant_id,
      p.session_id,
      p.question_id,
      o.created_at,
      (o.metadata ->> 'size')::bigint
    from storage.objects o
    cross join lateral public.parse_recording_path(o.name) p
    where o.bucket_id = 'recordings'
      and not exists (select 1 from public.transcriptions t where t.audio_path = o.name)
    on conflict (audio_path) do nothing
    returning 1
  )
  select count(*)::integer from inserted;
$$;

revoke all on function public.sync_transcription_queue() from public, anon, authenticated;
grant execute on function public.sync_transcription_queue() to service_role;

select public.sync_transcription_queue();

-- 4. Organizacao. Um audio e valido quando o caminho segue o padrao, a
-- pergunta pede resposta gravada (question, thinkaloud ou pitch), a conta
-- nao e de teste e ele e a primeira gravacao daquela pergunta na sessao; as
-- seguintes ficam como `gravacao_repetida`. Nada e apagado: os criterios
-- vivem so nas views.

-- Contas usadas para testar a plataforma. O app nao consegue gravar esta
-- coluna (ver os grants de supabase/admins.sql).
alter table public.participants
  add column if not exists is_test boolean not null default false;

update public.participants
set is_test = true
where lower(email) in ('lucascardososilva@usp.br', 'boml41195@gmail.com');

create or replace view public.recordings_catalog
with (security_invoker = true)
as
select
  c.*,
  c.invalid_reason is null as is_valid
from (
  select
    t.audio_path,
    t.participant_id,
    t.session_id,
    t.question_id,
    q.position,
    t.recorded_at,
    t.size_bytes,
    row_number() over takes as take,
    count(*) over (partition by t.session_id, t.question_id) as takes_total,
    case
      when t.session_id is null then 'caminho_fora_do_padrao'
      when q.question_id is null then 'pergunta_desconhecida'
      when q.kind not in ('question', 'thinkaloud', 'pitch') then 'nao_e_resposta'
      when p.is_test then 'conta_de_teste'
      when row_number() over takes > 1 then 'gravacao_repetida'
    end as invalid_reason,
    t.status,
    t.text as transcript
  from public.transcriptions t
  left join public.form_questions q
    on q.form = 'A' and q.question_id = t.question_id
  left join public.participants p on p.id = t.participant_id
  window takes as (partition by t.session_id, t.question_id order by t.recorded_at)
) c;

-- Respostas validas agrupadas por sessao, na ordem da Forma A
create or replace view public.session_answers
with (security_invoker = true)
as
select
  c.session_id,
  min(c.recorded_at) over (partition by c.session_id) as session_started_at,
  c.participant_id,
  p.full_name as participant_name,
  p.email as participant_email,
  p.role as participant_role,
  c.position,
  c.question_id,
  q.block,
  q.prompt,
  c.recorded_at,
  c.takes_total,
  c.status,
  c.transcript,
  c.audio_path
from public.recordings_catalog c
join public.form_questions q
  on q.form = 'A' and q.question_id = c.question_id
left join public.participants p on p.id = c.participant_id
where c.is_valid
order by session_started_at, c.session_id, c.position;

-- Uma linha por sessao: completude e andamento da transcricao
create or replace view public.session_summary
with (security_invoker = true)
as
with expected as (
  select count(*) as answers
  from public.form_questions
  where form = 'A' and kind in ('question', 'thinkaloud', 'pitch')
)
select
  a.session_id,
  a.participant_id,
  a.participant_name,
  a.participant_email,
  a.participant_role,
  min(a.recorded_at) as started_at,
  max(a.recorded_at) as last_answer_at,
  count(*) as answers,
  max(expected.answers) as expected_answers,
  count(*) = max(expected.answers) as complete,
  count(*) filter (where a.status = 'done') as transcribed,
  count(*) filter (where a.status = 'failed') as failed,
  exists (select 1 from public.sessions s where s.id = a.session_id) as in_sessions_table
from public.session_answers a
cross join expected
group by a.session_id, a.participant_id, a.participant_name, a.participant_email, a.participant_role
order by started_at;

revoke all on public.recordings_catalog, public.session_answers, public.session_summary
  from anon, authenticated;
grant select on public.recordings_catalog, public.session_answers, public.session_summary
  to authenticated;

-- 5. Reserva um lote para o worker. So entram audios validos: os demais
-- ficam `pending` e passam a ser transcritos se o criterio mudar (por
-- exemplo, desmarcando is_test). SKIP LOCKED deixa execucoes simultaneas
-- pegarem lotes diferentes; itens presos em `processing` por mais de 10
-- minutos (worker morto no meio) voltam para a fila.
create or replace function public.claim_transcriptions(batch_size integer default 5)
returns table (
  audio_path text,
  attempts integer,
  last_error text,
  audio_exists boolean
)
language sql
volatile
security definer
set search_path = ''
as $$
  select public.sync_transcription_queue();

  with valid as (
    select c.audio_path from public.recordings_catalog c where c.is_valid
  ),
  picked as (
    select t.audio_path
    from public.transcriptions t
    where t.audio_path in (select valid.audio_path from valid)
      and (
        (t.status = 'pending' and t.next_attempt_at <= now())
        or (t.status = 'processing' and t.locked_at < now() - interval '10 minutes')
      )
    order by t.next_attempt_at
    limit greatest(batch_size, 0)
    for update of t skip locked
  ),
  claimed as (
    update public.transcriptions t
    set status = 'processing',
        locked_at = now(),
        attempts = t.attempts + 1
    from picked
    where t.audio_path = picked.audio_path
    returning t.audio_path, t.attempts, t.last_error
  )
  select
    c.audio_path,
    c.attempts,
    c.last_error,
    exists (
      select 1 from storage.objects o
      where o.bucket_id = 'recordings' and o.name = c.audio_path
    )
  from claimed c;
$$;

revoke all on function public.claim_transcriptions(integer) from public, anon, authenticated;
grant execute on function public.claim_transcriptions(integer) to service_role;

-- 6. Segredo que o pg_cron envia ao worker. E gerado aqui dentro e nunca sai
-- do banco: a Edge Function le o valor pela funcao abaixo (so service_role).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'transcribe_worker_secret') then
    perform vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'transcribe_worker_secret',
      'Autentica o pg_cron na Edge Function transcribe-worker'
    );
  end if;
end;
$$;

create or replace function public.transcribe_worker_secret()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = 'transcribe_worker_secret';
$$;

revoke all on function public.transcribe_worker_secret() from public, anon, authenticated;
grant execute on function public.transcribe_worker_secret() to service_role;

-- 7. Agendamento: chama o worker a cada minuto
select cron.schedule(
  'transcribe-worker',
  '* * * * *',
  $cron$
  select net.http_post(
    url := 'https://ovaiapivmpcwneyqeddy.supabase.co/functions/v1/transcribe-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-worker-secret', (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'transcribe_worker_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
  $cron$
);
