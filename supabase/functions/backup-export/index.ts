// Copia de seguranca fora do Supabase: o plano atual nao tem backup. Entrega
// as tabelas do app e os audios do bucket ao Apps Script
// (integrations/google-drive), que grava tudo numa pasta do Drive.
//   GET  ?part=tables  todas as linhas das tabelas do app
//   GET  ?part=files   todos os arquivos do bucket (caminho, tamanho, data)
//   POST ?part=urls    {"paths": [...]} -> links assinados para baixar
// Autentica pelo header `x-export-secret` (o mesmo EXPORT_SECRET da
// export-transcriptions). Publique com --no-verify-jwt.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { sameSecret } from "../_shared/secret.ts";

const BUCKET = "recordings";
// Tabela -> coluna que ordena a paginacao.
const TABLES: Record<string, string> = {
  participants: "id",
  sessions: "id",
  responses: "id",
  transcriptions: "audio_path",
  form_questions: "question_id",
};
const PAGE_SIZE = 1000;
const URL_TTL_SECONDS = 60 * 60;
const MAX_URLS_PER_REQUEST = 100;

type StoredFile = { path: string; size: number | null; created_at: string | null };

const env = Deno.env.toObject();

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function dumpTables() {
  const tables: Record<string, unknown[]> = {};
  for (const [table, orderBy] of Object.entries(TABLES)) {
    const rows: unknown[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy)
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(`${table} falhou: ${error.message}`);
      rows.push(...data);
      if (data.length < PAGE_SIZE) break;
    }
    tables[table] = rows;
  }
  return tables;
}

// O Storage lista uma pasta por vez; pastas vem com id nulo.
async function listFiles(prefix = ""): Promise<StoredFile[]> {
  const files: StoredFile[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list ${prefix || "/"} falhou: ${error.message}`);
    for (const item of data) {
      if (item.name === ".emptyFolderPlaceholder") continue;
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listFiles(path)));
      else files.push({ path, size: item.metadata?.size ?? null, created_at: item.created_at ?? null });
    }
    if (data.length < PAGE_SIZE) return files;
  }
}

async function signedUrls(paths: string[]) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, URL_TTL_SECONDS);
  if (error) throw new Error(`createSignedUrls falhou: ${error.message}`);
  return data.map((item) => ({ path: item.path, url: item.signedUrl ?? null, error: item.error ?? null }));
}

Deno.serve(async (request) => {
  if (!env.EXPORT_SECRET) return new Response("misconfigured", { status: 500 });
  if (!sameSecret(request.headers.get("x-export-secret"), env.EXPORT_SECRET)) {
    return new Response("unauthorized", { status: 401 });
  }

  const part = new URL(request.url).searchParams.get("part");
  const generated_at = new Date().toISOString();
  try {
    if (request.method === "GET" && part === "tables") {
      return Response.json({ generated_at, tables: await dumpTables() });
    }
    if (request.method === "GET" && part === "files") {
      return Response.json({ generated_at, bucket: BUCKET, files: await listFiles() });
    }
    if (request.method === "POST" && part === "urls") {
      const body = await request.json().catch(() => null);
      const paths = Array.isArray(body?.paths) ? body.paths.filter((p: unknown) => typeof p === "string") : [];
      if (!paths.length || paths.length > MAX_URLS_PER_REQUEST) {
        return Response.json({ error: `envie de 1 a ${MAX_URLS_PER_REQUEST} caminhos` }, { status: 400 });
      }
      return Response.json({ generated_at, urls: await signedUrls(paths) });
    }
    return new Response("not found", { status: 404 });
  } catch (error) {
    console.error(`backup-export ${error instanceof Error ? error.message : error}`);
    return Response.json({ error: "backup failed" }, { status: 500 });
  }
});
