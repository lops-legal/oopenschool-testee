# Open Startup School — P01

Aplicação Next.js completa da avaliação gamificada Forma A, com autenticação Supabase, dashboard do participante, checagem de hardware, 27 estímulos, reprodução dos áudios oficiais, gravação por microfone e envio das respostas ao Supabase Storage.

As respostas de voz são capturadas com o codec Opus a 24 kbps. Conforme o
navegador, o contêiner será WebM (`.webm`) ou Ogg (`.ogg`); nos dois casos o
codec do áudio é Opus. A estimativa de armazenamento é de cerca de 180 KB por
minuto de fala, sem contar o pequeno overhead do contêiner.

## Configuração

1. Crie ou abra um projeto no Supabase.
2. Execute todo o arquivo `supabase/setup.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local` e preencha a URL e a chave anon/publishable do projeto.
4. Instale e rode:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Não há conta admin padrão. Crie a conta pelo app e promova-a com
`supabase/admins.sql` (edite a lista de emails do passo 5 antes de rodar).

## Transcrição automática

Todo áudio do bucket `recordings` entra numa fila (`public.transcriptions`); o
bucket é a fonte da verdade, mesmo quando a linha em `responses` se perdeu. A
Edge Function `transcribe-worker`, chamada pelo `pg_cron` a cada minuto, baixa
o áudio, transcreve com o Groq (`whisper-large-v3-turbo`, rodízio entre
`GROQ_API_KEY_1..N`) e grava o texto. Só admins leem os resultados:

- `session_summary`: uma linha por sessão (completude e progresso).
- `session_answers`: respostas válidas de cada sessão na ordem da Forma A, com
  pergunta e transcrição.
- `recordings_catalog`: todos os áudios, com o motivo quando não são válidos.

Instalação (uma vez, nesta ordem):

```bash
npx supabase login
npx supabase secrets set --env-file .env --project-ref ovaiapivmpcwneyqeddy
npx supabase functions deploy transcribe-worker --project-ref ovaiapivmpcwneyqeddy --no-verify-jwt --use-api
```

Depois rode `supabase/admins.sql` e `supabase/transcriptions.sql` no SQL Editor.
Sempre publique a função com `--no-verify-jwt`: o cron se autentica pelo
header `x-worker-secret`, cujo valor fica no Vault.

## Exportação para o Google Drive

Cada sessão vira um Google Doc com a transcrição pura (sem correção) das
respostas válidas, na ordem da Forma A. A Edge Function
`export-transcriptions` entrega as sessões em JSON; o Apps Script
`integrations/google-drive/Code.gs`, instalado na conta dona da pasta, busca
esse JSON a cada hora e cria ou atualiza os Docs. Uma sessão só é exportada
quando nada dela está na fila e não chega gravação nova há 30 minutos. Um Doc
só é reescrito quando a sessão muda no banco.

```bash
npx supabase secrets set EXPORT_SECRET=<valor-aleatorio> --project-ref ovaiapivmpcwneyqeddy
npx supabase functions deploy export-transcriptions --project-ref ovaiapivmpcwneyqeddy --no-verify-jwt --use-api
npx supabase functions deploy backup-export --project-ref ovaiapivmpcwneyqeddy --no-verify-jwt --use-api
```

As duas funções se autenticam pelo header `x-export-secret`. A instalação do
script (propriedades `EXPORT_URL`, `EXPORT_SECRET`, `FOLDER_ID` e
`BACKUP_FOLDER_ID`, depois executar `instalar`) está no cabeçalho do `Code.gs`.

Os Docs vão para a pasta "01 - Transcrições originais" (`FOLDER_ID`
`180xi4lj-BR6GR1GMzIQCYJU8t4_ZtZ8e`), dentro de "04 - Transcrições P01 | Forma
A", com o título `P01 — Forma A — Transcrição — <nome>`. Docs que já estão na
pasta e citam a sessão são adotados sem reescrever. O worker `transcribe-worker`
só grava o texto no Supabase; quem escreve no Drive é o Apps Script.

## Backup

O plano atual do Supabase não guarda backups. O mesmo Apps Script roda
`fazerBackup` a cada hora: a função `backup-export` entrega as tabelas do app e
links assinados dos áudios, e o script grava `banco/banco-AAAA-MM-DD.json` (um
por dia) e `audios/<participante>/<sessão>/` na pasta do backup. Só copia os
áudios que ainda não estão lá (`manifesto-audios.json`); arquivos apagados do
bucket continuam no Drive.

## Proteção dos dados

`supabase/hardening.sql` (rode no SQL Editor depois dos outros scripts) faz o
banco recusar áudio e resposta fora de uma sessão do próprio participante, uma
segunda linha para o mesmo áudio e os privilégios que o app não usa (TRUNCATE,
DELETE, acesso anônimo). Participantes não apagam nem alteram o que gravaram.

No dia da avaliação presencial, o limite de cadastro e login por IP
(Authentication > Rate Limits > sign ups and sign ins) precisa estar em 300 ou
mais: a turma inteira sai pelo mesmo IP do Wi-Fi.

## Arquivos principais

- `src/app/page.js`: fluxo completo da plataforma.
- `src/data/canonicalData.js`: roteiro e sequência oficial da Forma A.
- `public/audios/`: todos os 29 arquivos usados pela interface.
- `src/components/assessment/VoiceRecorderEngine.js`: captura e upload das respostas.
- `supabase/setup.sql`: banco, RLS, Storage e usuário admin.
