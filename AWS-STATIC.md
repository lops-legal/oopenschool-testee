# Publicação estática na AWS

O site final está inteiro em `index.html`. CSS, JavaScript, cliente Supabase e os 29 áudios MP3 estão incorporados no arquivo.

## S3

1. Crie um bucket para o site.
2. Envie somente `index.html` para a raiz.
3. Defina `Content-Type: text/html; charset=utf-8`.
4. Configure `index.html` como documento inicial.

## HTTPS obrigatório

A gravação pelo microfone (`getUserMedia`) funciona apenas em contexto seguro. Em produção, publique o bucket por uma distribuição CloudFront com HTTPS. O endpoint HTTP de website do S3 não é suficiente para o gravador.

## Supabase

Na primeira abertura, use **Configurar Supabase** e informe:

- URL do projeto;
- chave pública anon/publishable.

Esses valores ficam no `localStorage` do navegador. Execute antes o arquivo `supabase/setup.sql` no SQL Editor do projeto.
