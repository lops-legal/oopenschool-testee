"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, AlertCircle, Square, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function extensionFor(mimeType) {
  if (!mimeType) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
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
  // requesting | recording | stopping | saving | saved | error
  const [status, setStatus] = useState("requesting");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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

  // Upload para Supabase Storage + registro em responses (comportamento original:
  // uma tentativa por envio; em caso de erro, "Tentar novamente" reinicia a gravacao).
  const uploadRecording = async (blob) => {
    const ext = extensionFor(blob.type);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `${participantId}/${sessionId}/${questionId}__${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(filePath, blob, {
        contentType: blob.type || "audio/webm",
        upsert: false,
      });

    if (uploadError) throw new Error("Falha no upload: " + uploadError.message);

    // Salvar metadados no banco
    const { error: dbError } = await supabase.from("responses").insert({
      participant_id: participantId,
      session_id: sessionId,
      question_id: questionId,
      audio_path: filePath,
      duration_seconds: elapsedSecondsRef.current,
      recorded_at: new Date().toISOString(),
    });

    if (dbError) throw new Error("Falha ao salvar metadados: " + dbError.message);

    return { saved: true, audioPath: filePath };
  };

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    stoppingRef.current = false;
    audioChunksRef.current = [];
    elapsedSecondsRef.current = 0;
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

        const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
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
          const audioType = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: audioType });
          if (blob.size === 0) {
            if (!cancelled && mountedRef.current) {
              stoppingRef.current = false; setStatus("error");
              setErrorMessage("Nenhum audio capturado. Verifique o microfone.");
            }
            return;
          }
          if (!cancelled && mountedRef.current) setStatus("saving");
          try {
            const result = await uploadRecording(blob);
            if (!cancelled && mountedRef.current) {
              setStatus("saved"); onFinishResponseRef.current?.(result);
            }
          } catch (err) {
            console.error("Upload error:", err);
            if (!cancelled && mountedRef.current) {
              stoppingRef.current = false; setStatus("error");
              setErrorMessage(err.message || "Nao foi possivel salvar o audio.");
            }
          }
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
      <p className="muted">Enviando para o servidor antes de prosseguir...</p>
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
