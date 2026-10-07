# Deploy

## Vercel

Importe o repositório no painel da Vercel. O projeto é um Next.js com exportação
estática e não requer chaves secretas no deploy: a chave publicável do Supabase é
incluída no cliente e o RLS protege as tabelas.

## Cloudflare Pages

Ao importar o repositório no Cloudflare Pages, use:

- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`

Após receber o domínio final (`*.vercel.app` ou `*.pages.dev`), adicione-o em
Supabase Authentication > URL Configuration como Site URL e Redirect URL. Para
Google OAuth, adicione também esse domínio em Authorized JavaScript origins no
Google Cloud Console.
