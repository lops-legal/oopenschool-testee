import { createClient } from "@supabase/supabase-js";

// Chaves publicaveis sao seguras no navegador quando o RLS esta ativo. As
// variaveis de ambiente permitem trocar de projeto; os fallbacks mantem o
// deploy estatico funcional sem expor nenhuma chave secreta.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ovaiapivmpcwneyqeddy.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Kpoq0NSgw4aE550Nd6fQEw_UjiDsbXU";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL?.startsWith("http") && SUPABASE_ANON_KEY
);

// Valores locais neutros permitem gerar o build antes de o projeto Supabase
// ser conectado. A interface bloqueia login/cadastro com uma mensagem clara.
const clientUrl = isSupabaseConfigured ? SUPABASE_URL : "http://127.0.0.1:54321";
const clientKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : "supabase-not-configured";

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Necessario para trocar o `code` que o Google devolve apos o OAuth por
    // uma sessao persistida no navegador.
    detectSessionInUrl: true,
  },
});
