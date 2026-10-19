"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, AlertCircle, Square, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const OPUS_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
];

// 24 kbps preserves clear speech while keeping each minute near 180 KB.
const OPUS_AUDIO_BITS_PER_SECOND = 24_000;

function extensionFor(mimeType) {
  if (!mimeType) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function baseMimeType(mimeType) {
  return mimeType?.split(";", 1)[0] || "audio/webm";
}

// Rede instavel nao pode custar a resposta: o audio fica guardado e o envio
// e repetido sozinho, com espera crescente, antes de pedir ajuda a pessoa.
const MAX_SAVE_ATTEMPTS = 4;
const SAVE_RETRY_DELAYS_MS = [1_000, 3_000, 7_000];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Uma tentativa que caiu por timeout pode ter gravado o arquivo ou a linha.
function isAlreadyStored(error) {
  return String(error?.statusCode ?? error?.status) === "409" || /already exists|duplicate/i.test(error?.message ?? "");
}

function isDuplicateRow(error) {
  return error?.code === "23505";
}

function isExpiredSession(error) {
  return /jwt|token|expired/i.test(error?.message ?? "");
}

function describeSaveError(error) {
  const message = error?.message ?? "";
  if (/failed to fetch|network|load failed|timeout/i.test(message)) {
    return "Sem conexao com o servidor. Confira a internet e toque em Enviar de novo: sua gravacao continua guardada.";
  }
  return `Nao foi possivel salvar o audio (${message || "erro desconhecido"}). Sua gravacao continua guardada: toque em Enviar de novo.`;
}

export default function VoiceRecorderEngine({
  participantId,
  participantName,
  questionId,
  sessionId,
  silencePrompt,
  silenceAfter,
  onFinishResponse,
}) {
  // requesting | recording | stopping | saving | saved | error | unsent
  const [status, setStatus] = useState("requesting");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);

  // Gravacao concluida e ainda nao salva: sobrevive a falhas de envio.
  const pendingRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const stoppingRef = useRef(false);
  const elapsedSecondsRef = useRef(0);
  const onFinishResponseRef = useRef(onFinishResponse);
  onFinishResponseRef.current = onFinishResponse;

  const clearTimers = () => {
    clearInterval(timerIntervalRef.current);
    clearTimeout(silenceTimerRef.current);
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const stopRecording = () => {
    if (stoppingRef.current) return;
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    stoppingRef.current = true;
    clearTimers();
    // Feedback visual imediato antes do navegador finalizar o MediaRecorder.
    if (mountedRef.current) setStatus("stopping");
    try {
      // `stop()` always emits one final dataavailable event. Recording without a
      // timeslice is more reliable on Safari/iOS and avoids zero-byte chunks.
      recorder.stop();
    } catch (err) {
      stoppingRef.current = false;
      if (mountedRef.current) {
        setStatus("error");
        setErrorMessage(err.message || "Nao foi possivel finalizar a gravacao.");
      }
    }
  };

  // Upload para o Storage + linha em responses. Cada etapa concluida fica
  // marcada no pendente, entao uma nova tentativa so refaz o que faltou.
  const saveRecording = async (pending) => {
    if (!pending.uploaded) {
      const { error } = await supabase.storage
        .from("recordings")
        .upload(pending.row.audio_path, pending.blob, {
          contentType: pending.contentType,
          upsert: false,
        });
      if (error && !isAlreadyStored(error)) throw error;
      pending.uploaded = true;
    }
    if (!pending.saved) {
      const { error } = await supabase.from("responses").insert(pending.row);
      if (error && !isDuplicateRow(error)) throw error;
      pending.saved = true;
    }
    return { saved: true, audioPath: pending.row.audio_path };
  };

  const sendPending = async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_SAVE_ATTEMPTS; attempt += 1) {
      if (!mountedRef.current) return;
      setSaveAttempt(attempt);
      setStatus("saving");
      try {
        const result = await saveRecording(pending);
        pendingRef.current = null;
        if (!mountedRef.current) return;
        setStatus("saved");
        onFinishResponseRef.current?.(result);
        return;
      } catch (error) {
        lastError = error;
        console.error(`Upload error (tentativa ${attempt}):`, error);
        if (isExpiredSession(error)) await supabase.auth.refreshSession().catch(() => {});
        if (attempt < MAX_SAVE_ATTEMPTS) await wait(SAVE_RETRY_DELAYS_MS[attempt - 1]);
      }
    }
    if (!mountedRef.current) return;
    setStatus("unsent");
    setErrorMessage(describeSaveError(lastError));
  };

  // Fechar a aba com audio nao enviado perderia a resposta: o navegador avisa.
  useEffect(() => {
    if (status !== "saving" && status !== "unsent") return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    stoppingRef.current = false;
    pendingRef.current = null;
    audioChunksRef.current = [];
    elapsedSecondsRef.current = 0;
    setSaveAttempt(0);
    setElapsedSeconds(0);
    setStatus("requesting");
    setErrorMessage("");
    setShowSilenceWarning(false);

    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          throw new Error("Este navegador nao suporta gravacao de audio.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack || audioTrack.readyState !== "live") {
          throw new Error("O microfone selecionado nao esta disponivel.");
        }

        const mimeType = OPUS_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
        if (!mimeType) {
          throw new Error("Este navegador nao oferece gravacao em Opus. Atualize o navegador e tente novamente.");
        }
        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: OPUS_AUDIO_BITS_PER_SECOND,
        });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onerror = (event) => {
          clearTimers(); stopTracks();
          if (!cancelled && mountedRef.current) {
            setStatus("error");
            setErrorMessage(event?.error?.message || "O navegador interrompeu a gravacao.");
          }
        };
        recorder.onstop = async () => {
          clearTimers(); stopTracks();
          const audioType = recorder.mimeType || mimeType;
          const blob = new Blob(audioChunksRef.current, { type: audioType });
          if (blob.size === 0) {
            if (!cancelled && mountedRef.current) {
              stoppingRef.current = false; setStatus("error");
              setErrorMessage("Nenhum audio capturado. Verifique o microfone.");
            }
            return;
          }
          // Sair da tela no meio da gravacao nao conclui a resposta. Enviar o
          // trecho criaria uma primeira tomada parcial, que valeria sobre a
          // resposta completa gravada ao voltar.
          if (cancelled || !mountedRef.current) return;
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          pendingRef.current = {
            blob,
            contentType: baseMimeType(blob.type),
            uploaded: false,
            saved: false,
            row: {
              participant_id: participantId,
              session_id: sessionId,
              question_id: questionId,
              audio_path: `${participantId}/${sessionId}/${questionId}__${timestamp}.${extensionFor(blob.type)}`,
              duration_seconds: elapsedSecondsRef.current,
              recorded_at: new Date().toISOString(),
            },
          };
          await sendPending();
        };

        // Do not pass a timeslice: some Safari/Chromium combinations can emit
        // only empty periodic chunks even though the microphone is active.
        recorder.start();
        setStatus("recording");

        // Cronometro informativo: conta o tempo decorrido, sem interromper a gravacao.
        timerIntervalRef.current = setInterval(() => {
          elapsedSecondsRef.current += 1;
          setElapsedSeconds(elapsedSecondsRef.current);
        }, 1000);

        if (silencePrompt && silenceAfter) {
          silenceTimerRef.current = setTimeout(() => {
            if (!cancelled && mountedRef.current) setShowSilenceWarning(true);
          }, silenceAfter * 1000);
        }
      } catch (err) {
        stopTracks();
        if (mountedRef.current && !cancelled) {
          setStatus("error");
          setErrorMessage(
            err.name === "NotAllowedError"
              ? "Acesso ao microfone negado. Autorize e tente novamente."
              : err.message || "Nao foi possivel acessar o microfone."
          );
        }
      }
    };

    startRecording();
    return () => {
      cancelled = true; mountedRef.current = false; clearTimers();
      const r = mediaRecorderRef.current;
      if (r?.state === "recording") r.stop();
      stopTracks();
    };
  }, [participantId, participantName, questionId, sessionId, retryKey, silenceAfter, silencePrompt]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (status === "requesting") return (
    <div className="card" style={{ textAlign: "center", padding: 36, marginTop: 20 }}>
      <Mic size={30} style={{ marginBottom: 12 }} />
      <h3>Solicitando acesso ao microfone</h3>
      <p className="muted">Autorize o microfone para iniciar a gravacao.</p>
    </div>
  );

  if (status === "stopping") return (
    <div className="card" style={{ textAlign: "center", padding: 36, marginTop: 20 }}>
      <Loader2 size={32} className="spin" style={{ marginBottom: 12 }} />
      <h3>Finalizando gravacao...</h3>
    </div>
  );

  if (status === "saving" || status === "saved") return (
    <div className="card" style={{ textAlign: "center", padding: 36, marginTop: 20 }}>
      <Loader2 size={32} className="spin" style={{ marginBottom: 12 }} />
      <h3>{status === "saved" ? "Audio salvo" : "Salvando audio..."}</h3>
      <p className="muted">
        {saveAttempt > 1 && status === "saving"
          ? `Conexao instavel: tentativa ${saveAttempt} de ${MAX_SAVE_ATTEMPTS}. Sua gravacao esta guardada.`
          : "Enviando para o servidor antes de prosseguir..."}
      </p>
    </div>
  );

  if (status === "unsent") return (
    <div className="card" style={{ textAlign: "center", padding: 30, marginTop: 20 }}>
      <AlertCircle color="var(--danger, #b42318)" size={32} style={{ marginBottom: 12 }} />
      <h3>Resposta gravada, mas ainda nao enviada</h3>
      <p className="muted" style={{ margin: "10px 0 18px" }}>{errorMessage}</p>
      <div className="actions" style={{ justifyContent: "center" }}>
        <button className="btn primary" onClick={sendPending}>
          <RotateCcw size={16} /> Enviar de novo
        </button>
        <button className="btn ghost" onClick={() => setRetryKey((v) => v + 1)}>
          Gravar de novo
        </button>
      </div>
    </div>
  );

  if (status === "error") return (
    <div className="card" style={{ textAlign: "center", padding: 30, marginTop: 20 }}>
      <AlertCircle color="var(--danger, #b42318)" size={32} style={{ marginBottom: 12 }} />
      <h3>Nao foi possivel gravar</h3>
      <p className="muted" style={{ margin: "10px 0 18px" }}>{errorMessage}</p>
      <button className="btn primary" onClick={() => setRetryKey((v) => v + 1)}>
        <RotateCcw size={16} /> Tentar novamente
      </button>
    </div>
  );

  return (
    <div style={{ marginTop: 20 }}>
      <div className="mode">
        <div className="mode-label">
          <span className="pulse-dot" />
          <span>Gravando sua resposta...</span>
        </div>
        <div className="timer">{formatTime(elapsedSeconds)}</div>
      </div>
      <div className="wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      {showSilenceWarning && (
        <div className="card" style={{
          padding: "12px 18px", background: "#fff8e6", border: "1px solid var(--gold)",
          borderRadius: 14, margin: "14px 0", display: "flex", alignItems: "center", gap: 10, fontSize: 14
        }}>
          <AlertCircle color="var(--gold)" size={20} />
          <span><strong>Aviso de silencio:</strong> {silencePrompt}</span>
        </div>
      )}
      <div className="actions" style={{ justifyContent: "center", marginTop: 20 }}>
        <button className="btn primary" onClick={stopRecording}>
          <Square size={16} fill="white" /> Concluir resposta
        </button>
      </div>
    </div>
  );
}
