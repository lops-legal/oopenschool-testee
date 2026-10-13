// Worker de transcricao: drena a fila public.transcriptions usando a API do
// Groq com rodizio de chaves, a mesma estrategia de src/transcribe.js.
// Chamado pelo pg_cron a cada minuto (ver supabase/transcriptions.sql).
// `?sync` processa na hora e devolve o resumo, util para testar.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined;

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = "whisper-large-v3-turbo";
const BUCKET = "recordings";
const MAX_ATTEMPTS = 5;
const MAX_RETRIES_PER_KEY = 1;
const BASE_RETRY_DELAY_MS = 500;
const MAX_INLINE_RETRY_MS = 5_000;
const DEFAULT_RATE_LIMIT_MS = 60_000;
const MAX_BACKOFF_MS = 30 * 60_000;
// Fica abaixo do intervalo do cron para duas execucoes nao se sobreporem.
const TIME_BUDGET_MS = 45_000;
const REQUEST_TIMEOUT_MS = 60_000;

type Key = { number: number; label: string; apiKey: string };
type Claimed = {
  audio_path: string;
  attempts: number;
  last_error: string | null;
  audio_exists: boolean;
};
type Outcome = "done" | "retry" | "failed";

const env = Deno.env.toObject();

const keys: Key[] = Object.entries(env)
  .map(([name, value]) => {
    const match = /^GROQ_API_KEY_([1-9]\d*)$/.exec(name);
    if (!match || !value?.trim()) return null;
    return { number: Number(match[1]), label: `KEY ${match[1]}`, apiKey: value.trim() };
  })
  .filter((key): key is Key => key !== null)
  .sort((first, second) => first.number - second.number);

const concurrency = Math.max(1, Number(env.TRANSCRIPTION_CONCURRENCY) || 4);
const batchSize = Math.max(1, Number(env.TRANSCRIPTION_BATCH_SIZE) || concurrency * 2);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Chave -> instante em que volta a aceitar requisicoes (apos HTTP 429).
const cooldownUntil = new Map<number, number>();

class GroqError extends Error {
  constructor(message: string, readonly status: number, readonly retryAfterMs: number | null) {
    super(message);
  }

  get temporary() {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

function sanitize(message: unknown) {
  const text = keys.reduce(
    (current, key) => current.replaceAll(key.apiKey, "[CHAVE OCULTA]"),
    String(message),
  );
  return text.slice(0, 500);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function parseRetryAfter(headers: Headers) {
  const milliseconds = Number(headers.get("retry-after-ms"));
  if (headers.get("retry-after-ms") && Number.isFinite(milliseconds) && milliseconds >= 0) {
    return milliseconds;
  }

  const retryAfter = headers.get("retry-after");
  if (!retryAfter) return null;

  const seconds = Number(retryAfter);
  const delay = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(retryAfter) - Date.now();
  return Number.isFinite(delay) && delay >= 0 ? delay : null;
}

async function requestTranscription(key: Key, audio: Blob, filename: string) {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", MODEL);
  form.append("language", "pt");
  form.append("response_format", "json");

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key.apiKey}` },
      body: form,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new GroqError(`falha de rede: ${error instanceof Error ? error.message : error}`, 0, null);
  }

  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try {
      message = JSON.parse(body).error?.message ?? body;
    } catch {
      // corpo nao-JSON: usa o texto bruto
    }
    throw new GroqError(message, response.status, parseRetryAfter(response.headers));
  }

  const data = await response.json();
  return String(data.text ?? "").trim();
}

function availableKeys() {
  const now = Date.now();
  return keys.filter((key) => (cooldownUntil.get(key.number) ?? 0) <= now);
}

function earliestCooldownMs() {
  const now = Date.now();
  const waits = keys.map((key) => (cooldownUntil.get(key.number) ?? now) - now);
  return Math.max(Math.min(...waits), 0) || DEFAULT_RATE_LIMIT_MS;
}

// Tenta cada chave a partir de `startIndex`; erros temporarios repetem na
// mesma chave, 429 coloca a chave em espera e passa para a proxima.
async function transcribeWithRouter(audio: Blob, filename: string, startIndex: number) {
  let lastError: GroqError | null = null;
  let onlyRateLimited = true;

  for (let offset = 0; offset < keys.length; offset += 1) {
    const key = keys[(startIndex + offset) % keys.length];
    if ((cooldownUntil.get(key.number) ?? 0) > Date.now()) continue;

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_KEY; attempt += 1) {
      try {
        const text = await requestTranscription(key, audio, filename);
        return { ok: true as const, text, key };
      } catch (error) {
        const groqError = error instanceof GroqError ? error : new GroqError(String(error), 0, null);
        lastError = groqError;

        if (!groqError.temporary) {
          return { ok: false as const, permanent: true, rateLimited: false, error: groqError };
        }

        if (groqError.status === 429) {
          cooldownUntil.set(key.number, Date.now() + (groqError.retryAfterMs ?? DEFAULT_RATE_LIMIT_MS));
          console.log(`${key.label} -> limite atingido, proxima chave`);
          break;
        }

        onlyRateLimited = false;
        if (attempt === MAX_RETRIES_PER_KEY) break;

        const delay = Math.min(groqError.retryAfterMs ?? BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_INLINE_RETRY_MS);
        console.log(`${key.label} -> erro temporario (${groqError.status}), retry em ${delay}ms`);
        await wait(delay);
      }
    }
  }

  return {
    ok: false as const,
    permanent: false,
    rateLimited: onlyRateLimited,
    error: lastError ?? new GroqError("todas as chaves em espera por limite", 429, null),
  };
}

async function save(item: Claimed, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from("transcriptions")
    .update({ ...patch, locked_at: null })
    .eq("audio_path", item.audio_path);

  if (error) console.error(`${item.audio_path} -> erro ao salvar: ${error.message}`);
}

async function fail(item: Claimed, reason: string): Promise<Outcome> {
  await save(item, {
    status: "failed",
    last_error: sanitize(reason),
    completed_at: new Date().toISOString(),
  });
  console.error(`${item.audio_path} -> FALHOU: ${sanitize(reason)}`);
  return "failed";
}

async function retryLater(item: Claimed, reason: string, delayMs: number, refundAttempt: boolean): Promise<Outcome> {
  await save(item, {
    status: "pending",
    last_error: sanitize(reason),
    next_attempt_at: new Date(Date.now() + delayMs).toISOString(),
    // Limite de taxa nao e culpa do audio: nao gasta tentativa.
    attempts: refundAttempt ? item.attempts - 1 : item.attempts,
  });
  return "retry";
}

async function processItem(item: Claimed, routeIndex: number): Promise<Outcome> {
  if (!item.audio_exists) {
    return fail(item, "audio_not_found: arquivo nao existe no bucket recordings");
  }
  if (item.attempts > MAX_ATTEMPTS) {
    return fail(item, `excedeu ${MAX_ATTEMPTS} tentativas. Ultimo erro: ${item.last_error ?? "-"}`);
  }
  if (availableKeys().length === 0) {
    return retryLater(item, "todas as chaves em espera por limite", earliestCooldownMs(), true);
  }

  const started = Date.now();
  const { data: audio, error: downloadError } = await supabase.storage.from(BUCKET).download(item.audio_path);
  if (downloadError || !audio) {
    return retryLater(item, `download falhou: ${downloadError?.message ?? "sem conteudo"}`, DEFAULT_RATE_LIMIT_MS, false);
  }

  const filename = item.audio_path.split("/").pop() ?? "audio.webm";
  const result = await transcribeWithRouter(audio, filename, routeIndex);

  if (result.ok) {
    await save(item, {
      status: "done",
      text: result.text,
      model: MODEL,
      provider_key: result.key.label,
      last_error: null,
      processing_ms: Date.now() - started,
      completed_at: new Date().toISOString(),
    });
    console.log(`${item.audio_path} -> ${result.key.label} -> OK`);
    return "done";
  }

  const reason = `HTTP ${result.error.status}: ${result.error.message}`;
  if (result.permanent) return fail(item, reason);
  if (result.rateLimited) return retryLater(item, reason, earliestCooldownMs(), true);

  const backoff = Math.min(DEFAULT_RATE_LIMIT_MS * 2 ** (item.attempts - 1), MAX_BACKOFF_MS);
  return retryLater(item, reason, backoff, false);
}

async function runPool<T>(items: T[], size: number, handler: (item: T) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await handler(item);
    }
  });
  await Promise.all(workers);
}

async function drain() {
  if (keys.length === 0) throw new Error("Nenhuma GROQ_API_KEY_N configurada nos secrets.");

  const deadline = Date.now() + TIME_BUDGET_MS;
  const summary: Record<Outcome, number> = { done: 0, retry: 0, failed: 0 };
  let routeCursor = 0;

  while (Date.now() < deadline && availableKeys().length > 0) {
    const { data, error } = await supabase.rpc("claim_transcriptions", { batch_size: batchSize });
    if (error) throw new Error(`claim_transcriptions falhou: ${error.message}`);

    const items = (data ?? []) as Claimed[];
    if (items.length === 0) break;

    await runPool(items, concurrency, async (item) => {
      const routeIndex = routeCursor;
      routeCursor += 1;
      try {
        summary[await processItem(item, routeIndex)] += 1;
      } catch (error) {
        summary[await retryLater(item, `erro inesperado: ${error}`, DEFAULT_RATE_LIMIT_MS, false)] += 1;
      }
    });
  }

  return summary;
}

// O segredo vive no Vault (ver supabase/transcriptions.sql); fica em cache
// enquanto a instancia estiver quente.
let workerSecret: string | null = null;

async function loadWorkerSecret() {
  if (workerSecret) return workerSecret;
  const { data, error } = await supabase.rpc("transcribe_worker_secret");
  if (error) throw new Error(`transcribe_worker_secret falhou: ${error.message}`);
  workerSecret = typeof data === "string" && data ? data : null;
  return workerSecret;
}

function sameSecret(received: string | null, expected: string | null) {
  if (!received || !expected) return false;
  const a = new TextEncoder().encode(received);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

Deno.serve(async (request) => {
  let expected: string | null;
  try {
    expected = await loadWorkerSecret();
  } catch (error) {
    console.error(`transcribe-worker ${error instanceof Error ? error.message : error}`);
    return new Response("misconfigured", { status: 500 });
  }

  if (!sameSecret(request.headers.get("x-worker-secret"), expected)) {
    return new Response("unauthorized", { status: 401 });
  }

  const job = drain().then((summary) => {
    console.log(`transcribe-worker ${JSON.stringify(summary)}`);
    return summary;
  });

  if (new URL(request.url).searchParams.has("sync") || typeof EdgeRuntime === "undefined") {
    try {
      return Response.json(await job);
    } catch (error) {
      return Response.json({ error: sanitize(error instanceof Error ? error.message : error) }, { status: 500 });
    }
  }

  EdgeRuntime.waitUntil(
    job.catch((error) => console.error(`transcribe-worker ${sanitize(error instanceof Error ? error.message : error)}`)),
  );
  return Response.json({ accepted: true }, { status: 202 });
});
