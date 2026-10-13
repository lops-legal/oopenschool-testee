# Deploy

O app roda na Vercel e usa o Supabase como backend (Auth, banco, Storage e a
Edge Function de transcrição). Não há outro destino de deploy.

## Vercel

- Projeto: `openaplication`, produção em https://openaplication.vercel.app
- Branch de produção: `main` (cada PR ganha um preview)
- Framework: Next.js com exportação estática (`output: "export"`)

O deploy não requer chaves secretas: a chave publicável do Supabase vai no
cliente e o RLS protege as tabelas. Para apontar para outro projeto Supabase,
defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas
variáveis de ambiente da Vercel; sem elas, valem os valores de
`src/lib/supabase.js`.

## Supabase

Em Authentication > URL Configuration:

- Site URL: `https://openaplication.vercel.app`
- Redirect URLs: `https://openaplication.vercel.app/**` e `http://localhost:3000/**`

O banco e a transcrição automática são configurados pelos scripts em
`supabase/`; veja a seção "Transcrição automática" do `README-P01.md`.
