"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Mic, RotateCcw, Square } from "lucide-react";

const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4"
];

export default function VoiceRecorderEngine({
  seconds,
  silencePrompt,
  silenceAfter,
  participantId,
  participantName,
  questionId,
  onFinishResponse
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [status, setStatus] = useState("requesting");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const stoppingRef = useRef(false);
  const mountedRef = useRef(true);
  const onFinishResponseRef = useRef(onFinishResponse);

  useEffect(() => {
    onFinishResponseRef.current = onFinishResponse;
  }, [onFinishResponse]);

  const clearTimers = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    timerIntervalRef.current = null;
    silenceTimerRef.current = null;
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stopRecording = () => {
    if (stoppingRef.current) return;

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    stoppingRef.current = true;
    clearTimers();
    setStatus("saving");
    recorder.stop();
  };

  const uploadRecording = async (blob) => {
    const formData = new FormData();
    const extension = blob.type.includes("ogg")
      ? "ogg"
      : blob.type.includes("mp4")
        ? "m4a"
        : "webm";

    formData.append("participantId", participantId);
    formData.append("participantName", participantName);
    formData.append("questionId", questionId);
    formData.append("audio", blob, `${questionId}.${extension}`);

    const response = await fetch("/api/recordings", {
      method: "POST",
      body: formData
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Não foi possível salvar o áudio.");
    }

    return result;
  };

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    stoppingRef.current = false;
    audioChunksRef.current = [];
    setTimeLeft(seconds);
    setStatus("requesting");
    setErrorMessage("");
    setShowSilenceWarning(false);

    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          throw new Error("Este navegador não oferece suporte à gravação de áudio.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        recorder.onerror = () => {
          clearTimers();
          stopTracks();
          if (!cancelled && mountedRef.current) {
            setStatus("error");
            setErrorMessage("O navegador interrompeu a gravação. Tente novamente.");
          }
        };

        recorder.onstop = async () => {
          clearTimers();
          stopTracks();

          const audioType = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: audioType });

          if (blob.size === 0) {
            if (!cancelled && mountedRef.current) {
              stoppingRef.current = false;
              setStatus("error");
              setErrorMessage("Nenhum áudio foi capturado. Verifique o microfone e tente novamente.");
            }
            return;
          }

          try {
            const savedRecording = await uploadRecording(blob);
            if (!cancelled && mountedRef.current) {
              setStatus("saved");
              onFinishResponseRef.current?.(savedRecording);
            }
          } catch (error) {
            console.error("Audio upload error:", error);
            if (!cancelled && mountedRef.current) {
              stoppingRef.current = false;
              setStatus("error");
              setErrorMessage(error.message || "Não foi possível salvar o áudio.");
            }
          }
        };

        recorder.start(1000);
        setStatus("recording");

        timerIntervalRef.current = setInterval(() => {
          setTimeLeft((previous) => {
            if (previous <= 1) {
              setTimeout(stopRecording, 0);
              return 0;
            }
            return previous - 1;
          });
        }, 1000);

        if (silencePrompt && silenceAfter) {
          silenceTimerRef.current = setTimeout(() => {
            if (!cancelled && mountedRef.current) setShowSilenceWarning(true);
          }, silenceAfter * 1000);
        }
      } catch (error) {
        console.warn("MediaRecorder microphone access error:", error);
        stopTracks();
        if (mountedRef.current && !cancelled) {
          setStatus("error");
          setErrorMessage(
            error.name === "NotAllowedError"
              ? "O acesso ao microfone foi negado. Autorize o microfone no navegador e tente novamente."
              : error.message || "Não foi possível acessar o microfone."
          );
        }
      }
    };

    startRecording();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearTimers();
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === "recording") recorder.stop();
      stopTracks();
    };
  }, [participantId, participantName, questionId, retryKey, seconds, silenceAfter, silencePrompt]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  if (status === "requesting") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 36, marginTop: 20 }}>
        <Mic size={30} style={{ marginBottom: 12 }} />
        <h3>Solicitando acesso ao microfone</h3>
        <p className="muted">Autorize o uso do microfone para iniciar a gravação.</p>
      </div>
    );
  }

  if (status === "saving" || status === "saved") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 36, marginTop: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💾</div>
        <h3>{status === "saved" ? "Áudio salvo" : "Salvando áudio da resposta"}</h3>
        <p className="muted">Confirmando o arquivo no servidor antes de prosseguir...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 30, marginTop: 20 }}>
        <AlertCircle color="var(--danger, #b42318)" size={32} style={{ marginBottom: 12 }} />
        <h3>Não foi possível gravar</h3>
        <p className="muted" style={{ margin: "10px 0 18px" }}>{errorMessage}</p>
        <button className="btn primary" onClick={() => setRetryKey((value) => value + 1)}>
          <RotateCcw size={16} /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div className="mode">
        <div className="mode-label">
          <span className="pulse-dot" />
          <span>Gravando sua resposta...</span>
        </div>
        <div className="timer">{formatTime(timeLeft)}</div>
      </div>

      <div className="wave">
        <i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>

      {showSilenceWarning && (
        <div
          className="card"
          style={{
            padding: "12px 18px",
            background: "#fff8e6",
            border: "1px solid var(--gold)",
            borderRadius: 14,
            margin: "14px 0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14
          }}
        >
          <AlertCircle color="var(--gold)" size={20} />
          <span><strong>Aviso de silêncio:</strong> {silencePrompt}</span>
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
