"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Send, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TextInputEngine({
  participantId,
  participantName,
  questionId,
  sessionId,
  seconds = 180,
  minChars = 200,
  maxChars = 2000,
  tabSwitches = 0,
  onFinishResponse,
}) {
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteWarning, setPasteWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const textareaRef = useRef(null);
  const timerRef = useRef(null);
  const onFinishRef = useRef(onFinishResponse);
  onFinishRef.current = onFinishResponse;

  const currentLength = text.trim().length;
  const isMinMet = currentLength >= minChars;
  const isMaxExceeded = currentLength > maxChars;
  const progressPercent = Math.min(100, Math.round((currentLength / minChars) * 100));

  // Anti-paste & Anti-drag handler
  const handleBlockedAction = (e) => {
    e.preventDefault();
    setPasteWarning(true);
    setTimeout(() => setPasteWarning(false), 4500);
  };

  const handleKeyDown = (e) => {
    // Block Ctrl+V / Cmd+V / Shift+Insert
    if (
      (e.ctrlKey && (e.key === "v" || e.key === "V")) ||
      (e.metaKey && (e.key === "v" || e.key === "V")) ||
      (e.shiftKey && e.key === "Insert")
    ) {
      e.preventDefault();
      handleBlockedAction(e);
    }
  };

  // Submit text answer to Supabase
  const handleSubmit = async () => {
    if (!isMinMet || isMaxExceeded || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error: dbError } = await supabase.from("responses").insert({
        participant_id: participantId,
        session_id: sessionId,
        question_id: questionId,
        audio_path: null,
        response_type: "text",
        text_response: text.trim(),
        character_count: currentLength,
        duration_seconds: seconds - timeLeft,
        tab_switches_count: tabSwitches,
        recorded_at: new Date().toISOString(),
      });

      if (dbError) throw new Error("Falha ao salvar no banco: " + dbError.message);

      onFinishRef.current?.({ saved: true, responseType: "text", length: currentLength });
    } catch (err) {
      console.error("Text submit error:", err);
      setErrorMessage(err.message || "Não foi possível enviar a resposta. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    setTimeLeft(seconds);
    setText("");
    setIsSubmitting(false);
    setPasteWarning(false);
    setErrorMessage("");

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questionId, seconds]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ marginTop: 20 }}>
      {/* Mode Bar with Timer */}
      <div className="mode" style={{ marginBottom: 16 }}>
        <div className="mode-label">
          <span className="pulse-dot live" style={{ background: isMinMet ? "var(--green)" : "var(--accent)" }} />
          <span>
            {timeLeft === 0
              ? "Tempo limite atingido"
              : isMinMet
              ? "Extensão mínima atingida"
              : "Escreva sua resposta"}
          </span>
        </div>
        <div className="timer" style={{ color: timeLeft <= 30 ? "var(--danger, #b42318)" : "inherit" }}>
          <Clock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Anti-paste warning */}
      {pasteWarning && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid var(--danger, #b42318)",
            color: "var(--danger, #b42318)",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "shake 0.3s ease-in-out"
          }}
        >
          <ShieldAlert size={18} />
          <strong>Colagem desabilitada nesta avaliação.</strong> Digite sua resposta com suas próprias palavras.
        </div>
      )}

      {errorMessage && (
        <div className="card" style={{ padding: 12, marginBottom: 12, background: "#fee2e2", color: "#991b1b" }}>
          {errorMessage}
        </div>
      )}

      {/* Secure Textarea with blocked copy-paste */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handleBlockedAction}
          onDrop={handleBlockedAction}
          onContextMenu={handleBlockedAction}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua resposta aqui de forma clara e fundamentada (mínimo de 200 caracteres)..."
          rows={7}
          style={{
            width: "100%",
            background: "var(--panel, #141414)",
            border: `1px solid ${isMinMet ? "var(--green, #10b981)" : "var(--border, #2a2a2a)"}`,
            color: "var(--ink, #fff)",
            borderRadius: 12,
            padding: "16px",
            fontSize: "15px",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit"
          }}
        />
      </div>

      {/* Character Counter & Validation Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
          color: "var(--muted)",
          marginTop: 8
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isMinMet ? (
            <span style={{ color: "var(--green, #10b981)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <CheckCircle2 size={15} /> Mínimo alcançado ({currentLength} caracteres)
            </span>
          ) : (
            <span>
              Mínimo necessário: <strong>{currentLength} / {minChars}</strong> caracteres
            </span>
          )}
        </div>
        <div>
          <span>Máximo: {maxChars}</span>
        </div>
      </div>

      {/* Progress Bar for Minimum Characters */}
      <div
        style={{
          width: "100%",
          height: 4,
          background: "var(--line, #262626)",
          borderRadius: 2,
          marginTop: 8,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: isMinMet ? "var(--green, #10b981)" : "var(--accent, #eb5e28)",
            transition: "width 0.15s ease"
          }}
        />
      </div>

      {/* Actions */}
      <div className="actions" style={{ justifyContent: "center", marginTop: 22 }}>
        <button
          className="btn accent"
          onClick={handleSubmit}
          disabled={!isMinMet || isMaxExceeded || isSubmitting}
          style={{ width: "100%", maxWidth: 360, minHeight: 46, justifyContent: "center" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin" /> Enviando resposta...
            </>
          ) : !isMinMet ? (
            `Escreva mais ${minChars - currentLength} caracteres para enviar`
          ) : (
            <>
              <Send size={16} /> Enviar resposta escrita →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
