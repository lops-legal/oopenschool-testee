// Entrega as transcricoes validas, agrupadas por sessao e na ordem da Forma A,
// para integracoes externas como a exportacao para o Google Drive
// (integrations/google-drive). So leitura: le a view session_answers.
// Autentica pelo header `x-export-secret`, comparado com o secret
// EXPORT_SECRET da funcao. Publique com --no-verify-jwt.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { sameSecret } from "../_shared/secret.ts";

const PAGE_SIZE = 1000;
// Uma sessao fica pronta para exportar quando nada dela esta na fila e nao
// chega gravacao nova ha este tempo (o participante pode estar no meio).
const QUIET_MS = 30 * 60_000;

type Row = {
  session_id: string;
  session_started_at: string;
  participant_id: string | null;
  participant_name: string | null;
  position: number;
  question_id: string;
  block: string;
  recorded_at: string;
  status: string;
  transcript: string | null;
};

type Session = {
  session_id: string;
  participant_id: string | null;
  participant_name: string | null;
  started_at: string;
  last_recorded_at: string;
  answers: number;
  transcribed: number;
  failed: number;
  pending: number;
  ready: boolean;
  items: { position: number; question_id: string; block: string; status: string; text: string | null }[];
};

const env = Deno.env.toObject();

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function loadAnswers() {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("session_answers")
      .select(
        "session_id, session_started_at, participant_id, participant_name, position, question_id, block, recorded_at, status, transcript",
      )
      .order("session_started_at")
      .order("session_id")
      .order("position")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`session_answers falhou: ${error.message}`);
    rows.push(...(data as Row[]));
    if (data.length < PAGE_SIZE) return rows;
  }
}

function groupBySession(rows: Row[], now: number) {
  const sessions = new Map<string, Session>();
  for (const row of rows) {
    let session = sessions.get(row.session_id);
    if (!session) {
      session = {
        session_id: row.session_id,
        participant_id: row.participant_id,
        participant_name: row.participant_name,
        started_at: row.session_started_at,
        last_recorded_at: row.recorded_at,
        answers: 0,
        transcribed: 0,
        failed: 0,
        pending: 0,
        ready: false,
        items: [],
      };
      sessions.set(row.session_id, session);
    }
    if (Date.parse(row.recorded_at) > Date.parse(session.last_recorded_at)) {
      session.last_recorded_at = row.recorded_at;
    }
    session.answers += 1;
    if (row.status === "done") session.transcribed += 1;
    else if (row.status === "failed") session.failed += 1;
    else session.pending += 1;
    session.items.push({
      position: row.position,
      question_id: row.question_id,
      block: row.block,
      status: row.status,
      text: row.status === "done" ? row.transcript : null,
    });
  }
  for (const session of sessions.values()) {
    session.ready = session.pending === 0 && now - Date.parse(session.last_recorded_at) >= QUIET_MS;
  }
  return [...sessions.values()];
}

Deno.serve(async (request) => {
  if (!env.EXPORT_SECRET) return new Response("misconfigured", { status: 500 });
  if (!sameSecret(request.headers.get("x-export-secret"), env.EXPORT_SECRET)) {
    return new Response("unauthorized", { status: 401 });
  }
  if (request.method !== "GET") return new Response("method not allowed", { status: 405 });

  try {
    const now = Date.now();
    const sessions = groupBySession(await loadAnswers(), now);
    return Response.json({ generated_at: new Date(now).toISOString(), form: "A", sessions });
  } catch (error) {
    console.error(`export-transcriptions ${error instanceof Error ? error.message : error}`);
    return Response.json({ error: "export failed" }, { status: 500 });
  }
});
