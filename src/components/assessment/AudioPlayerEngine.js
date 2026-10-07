"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, Play, Pause, RotateCcw, FastForward, CheckCircle, AlertCircle } from "lucide-react";

export default function AudioPlayerEngine({
  audioFile,
  onAudioEnded,
  onUserReadyToAnswer,
  isCover = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);

  const audioSrc = audioFile ? `/audios/${encodeURIComponent(audioFile)}` : "";

  // Handle play/pause
  const playAudio = useCallback(() => {
    if (!audioRef.current) return;
    setAudioError(null);
    audioRef.current.volume = 1.0;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch((err) => {
        console.warn("Audio play blocked or waiting user gesture:", err);
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });
  }, [playbackRate]);

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setIsFinished(false);
    playAudio();
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Audio lifecycle
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsFinished(false);
    setAutoplayBlocked(false);
    setAudioError(null);

    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    audio.load();
    audio.playbackRate = playbackRate;
    audio.volume = 1.0;

    // Attempt auto play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.log("Browser policy blocked autoplay, waiting user click:", err);
          setAutoplayBlocked(true);
          setIsPlaying(false);
        });
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audioSrc]);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio && audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(100);
          setIsFinished(true);
          if (onAudioEnded) onAudioEnded();
        }}
        onError={(e) => {
          console.error("Audio element error:", e);
          setAudioError("Não foi possível carregar o áudio. Tente novamente.");
          setIsPlaying(false);
        }}
      />

      {autoplayBlocked && !isPlaying && !isFinished && (
        <div
          onClick={playAudio}
          style={{
            background: "rgba(235, 94, 40, 0.12)",
            border: "1px solid var(--accent, #eb5e28)",
            color: "var(--ink)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Volume2 size={22} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Clique aqui para ouvir a pergunta em áudio
            </span>
          </div>
          <button className="btn accent" style={{ minHeight: 34, padding: "4px 14px", fontSize: 13 }} onClick={playAudio}>
            <Play size={14} /> Ouvir agora
          </button>
        </div>
      )}

      {audioError && (
        <div className="card" style={{ padding: 12, marginBottom: 12, background: "#fee2e2", color: "#991b1b", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: 13 }}>{audioError}</span>
          <button className="btn ghost" style={{ marginLeft: "auto", fontSize: 12 }} onClick={playAudio}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="mode">
        <div className="mode-label">
          <span className={"pulse-dot" + (isPlaying ? " live" : "")} />
          <span>{isPlaying ? "Reproduzindo áudio" : isFinished ? "Leitura concluída" : "Áudio pausado"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={togglePlay}
            className="btn ghost"
            style={{ minHeight: 36, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? "Pausar" : "Ouvir"}
          </button>

          <button
            onClick={handleReplay}
            className="btn ghost"
            title="Reouvir áudio do início"
            style={{ minHeight: 36, padding: "6px 10px", fontSize: 12 }}
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={toggleSpeed}
            className="btn ghost"
            title="Velocidade de reprodução"
            style={{ minHeight: 36, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}
          >
            {playbackRate}x
          </button>
        </div>

        {/* Audio Progress Line */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "var(--line)",
            borderRadius: 2,
            marginTop: 10,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              transition: "width 0.1s linear"
            }}
          />
        </div>
      </div>

      {/* Cadence Control: Let user decide when to start recording */}
      {!isCover && onUserReadyToAnswer && (
        <div className="actions" style={{ justifyContent: "center", marginTop: 14 }}>
          <button
            className="btn accent"
            onClick={onUserReadyToAnswer}
            style={{ width: "100%", maxWidth: 360 }}
          >
            <CheckCircle size={18} /> Estou pronto para responder →
          </button>
        </div>
      )}
    </div>
  );
}

