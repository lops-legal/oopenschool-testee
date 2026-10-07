# Open Startup School — P01

Aplicação Next.js completa da avaliação gamificada Forma A, com autenticação Supabase, dashboard do participante, checagem de hardware, 27 estímulos, reprodução dos áudios oficiais, gravação por microfone e envio das respostas ao Supabase Storage.

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

Credenciais iniciais definidas no SQL:

- Email: `admin@openstartup.school`
- Senha: `Admin@P01!2026`

Troque essas duas constantes no bloco `BOOTSTRAP DO ADMIN` antes de executar em um ambiente real.

## Arquivos principais

- `src/app/page.js`: fluxo completo da plataforma.
- `src/data/canonicalData.js`: roteiro e sequência oficial da Forma A.
- `public/audios/`: todos os 29 arquivos usados pela interface.
- `src/components/assessment/VoiceRecorderEngine.js`: captura e upload das respostas.
- `supabase/setup.sql`: banco, RLS, Storage e usuário admin.
