"use client";

import React, { useState, useEffect, useRef } from "react";
import { Headphones, Mic, CheckCircle2, ShieldCheck, ArrowRight, Volume2 } from "lucide-react";

export default function HardwareCheck({ onComplete, onCancel }) {
  const [step, setStep] = useState("consent"); // consent -> headphones -> mic -> ready -> instructions -> start
  
  // Consent state
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeRecord, setAgreeRecord] = useState(false);

  // Headphones state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTested, setAudioTested] = useState(false);
  const audioRef = useRef(null);

  // Mic state
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micTested, setMicTested] = useState(false);
  const [micError, setMicError] = useState("");
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);

  // Headphones test
  const handlePlayAudioTest = () => {
    setIsPlayingAudio(true);
    setAudioTested(true);
    if (!audioRef.current) {
      audioRef.current = new Audio("/audios/TA-intro.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => console.log("Audio play error:", err));
    audioRef.current.onended = () => {
      setIsPlayingAudio(false);
    };
  };

  const handleStopAudioTest = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
  };

  // Mic test with real Web Audio API volume measurement
  const handleStartMicTest = async () => {
    try {
      setMicError("");
      setMicTested(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") await audioCtx.resume();
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let detectedFrames = 0;

      setIsMicTesting(true);

      const updateVolume = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(normalized);
        if (normalized >= 2) {
          detectedFrames += 1;
          if (detectedFrames >= 3) setMicTested(true);
        }
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      handleStopMicTest();
      setMicError(
        err.name === "NotAllowedError"
          ? "Acesso ao microfone negado. Autorize o microfone no navegador e tente novamente."
          : err.message || "Nao foi possivel acessar o microfone."
      );
    }
  };

  const handleStopMicTest = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    setIsMicTesting(false);
  };

  useEffect(() => {
    return () => {
      handleStopAudioTest();
      handleStopMicTest();
    };
  }, []);

  return (
    <div className="assess-main">
      {/* Consent Step */}
      {step === "consent" && (
        <div className="center-card">
          <div className="eyebrow">Antes de começar</div>
          <h2>Consentimento e gravação</h2>
          <p className="lead" style={{ marginBottom: 24 }}>
            Suas respostas em áudio serão registradas para processamento, análise e geração do Laudo Formativo P01.
          </p>
          <div style={{ textAlign: "left", margin: "24px 0" }}>
            <label style={{ display: "flex", gap: 14, padding: "18px 0", borderTop: "1px solid var(--line)" }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: "var(--accent)" }}
              />
              <span>
                <strong>Li e concordo com os termos da avaliação.</strong>
                <br />
                <span className="muted" style={{ fontSize: 13 }}>
                  Texto e protocolo alinhados aos parâmetros pedagógicos do P01.
                </span>
              </span>
            </label>
            <label style={{ display: "flex", gap: 14, padding: "18px 0", borderTop: "1px solid var(--line)" }}>
              <input
                type="checkbox"
                checked={agreeRecord}
                onChange={(e) => setAgreeRecord(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: "var(--accent)" }}
              />
              <span>
                <strong>Autorizo a gravação das respostas em áudio.</strong>
              </span>
            </label>
          </div>
          <div className="actions" style={{ justifyContent: "center" }}>
            <button
              className="btn primary"
              disabled={!agreeTerms || !agreeRecord}
              onClick={() => setStep("headphones")}
            >
              Continuar <ArrowRight size={18} />
            </button>
            {onCancel && (
              <button className="btn ghost" onClick={onCancel}>
                Voltar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Headphones Step */}
      {step === "headphones" && (
        <div className="center-card">
          <div className="eyebrow">Teste 1 de 2 · Fones de ouvido</div>
          <div className={`hardware-icon ${isPlayingAudio ? "live" : ""}`}>
            <Headphones size={72} color="var(--ink)" strokeWidth={1.5} />
          </div>
          <h2>Coloque seus fones de ouvido.</h2>
          <p className="lead">
            As perguntas serão lidas para você. Vamos confirmar que o som está confortável e claro.
          </p>

          <div className={`soundbars ${isPlayingAudio ? "playing" : ""}`}>
            <i /><i /><i /><i /><i /><i /><i /><i /><i />
          </div>

          {!isPlayingAudio ? (
            <button className="btn primary" onClick={handlePlayAudioTest}>
              <Volume2 size={18} /> Reproduzir teste de áudio
            </button>
          ) : (
            <button className="btn ghost" onClick={handleStopAudioTest}>
              Pausar teste
            </button>
          )}

          {audioTested && (
            <div className="actions" style={{ justifyContent: "center", marginTop: 24 }}>
              <button
                className="btn accent"
                onClick={() => {
                  handleStopAudioTest();
                  setStep("mic");
                }}
              >
                Estou ouvindo com clareza →
              </button>
              <button className="btn ghost" onClick={handlePlayAudioTest}>
                Ouvir novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Microphone Step */}
      {step === "mic" && (
        <div className="center-card">
          <div className="eyebrow">Teste 2 de 2 · Microfone</div>
          <div className={`hardware-icon ${isMicTesting ? "live" : ""}`}>
            <Mic size={72} color="var(--ink)" strokeWidth={1.5} />
          </div>
          <h2>Teste seu microfone.</h2>
          <p className="lead">
            Fale normalmente por alguns segundos. A gravação começará automaticamente após a leitura da pergunta.
          </p>

          <div className="meter">
            <span style={{ width: `${micVolume}%` }} />
          </div>

          <div className="muted" style={{ margin: "14px 0", fontSize: 14 }}>
            {isMicTesting
              ? "Captando áudio... Fale uma frase para testar."
              : "Clique abaixo para autorizar e testar a entrada de áudio."}
          </div>

          {micError && (
            <div style={{ color: "var(--danger, #b42318)", marginBottom: 14, fontSize: 14 }}>
              {micError}
            </div>
          )}

          {!isMicTesting ? (
            <button className="btn primary" onClick={handleStartMicTest}>
              Testar microfone
            </button>
          ) : (
            <button className="btn ghost" onClick={handleStopMicTest}>
              Parar teste
            </button>
          )}

          {micTested && (
            <div className="actions" style={{ justifyContent: "center", marginTop: 24 }}>
              <button
                className="btn accent"
                onClick={() => {
                  handleStopMicTest();
                  setStep("instructions");
                }}
              >
                Microfone funcionando perfeitamente →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions Step */}
      {step === "instructions" && (
        <div className="center-card">
          <div className="eyebrow">Instruções de aplicação</div>
          <h2>Como a avaliação funciona</h2>
          <p className="lead">
            Você verá na tela o mesmo texto que ouvirá em áudio. Quando a leitura terminar, a gravação e o tempo começarão automaticamente.
          </p>

          <div style={{ display: "grid", gap: 12, textAlign: "left", marginTop: 24 }}>
            <div className="card" style={{ padding: 18, background: "var(--soft)" }}>
              <strong>Sem retorno:</strong> Depois de concluir a resposta e avançar, você não poderá voltar para alterar a questão.
            </div>
            <div className="card" style={{ padding: 18, background: "var(--soft)" }}>
              <strong>Sem feedback item a item:</strong> A plataforma não informará acerto ou erro durante a aplicação.
            </div>
            <div className="card" style={{ padding: 18, background: "var(--soft)" }}>
              <strong>Responda sozinho:</strong> Não consulte outras pessoas, fontes na internet nem ferramentas de Inteligência Artificial.
            </div>
          </div>

          <div className="actions" style={{ justifyContent: "center", marginTop: 28 }}>
            <button className="btn primary" onClick={onComplete}>
              Entendi, iniciar avaliação →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
