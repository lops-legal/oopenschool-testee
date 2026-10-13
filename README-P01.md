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

## Arquivos principais

- `src/app/page.js`: fluxo completo da plataforma.
- `src/data/canonicalData.js`: roteiro e sequência oficial da Forma A.
- `public/audios/`: todos os 29 arquivos usados pela interface.
- `src/components/assessment/VoiceRecorderEngine.js`: captura e upload das respostas.
- `supabase/setup.sql`: banco, RLS, Storage e usuário admin.
