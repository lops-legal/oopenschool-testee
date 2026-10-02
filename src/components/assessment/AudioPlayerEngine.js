"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, Play, Pause, RotateCcw, FastForward, CheckCircle } from "lucide-react";

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
  const audioRef = useRef(null);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsFinished(false);

    const audioPath = `/audios/${audioFile}`;
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setIsFinished(true);
      if (onAudioEnded) {
        onAudioEnded();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // Auto play audio prompt
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn("Autoplay blocked or audio load error:", err);
    });

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioFile]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => console.log(err));
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setIsFinished(false);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="mode">
        <div className="mode-label">
          <span className="pulse-dot" />
          <span>{isPlaying ? "Reproduzindo áudio" : isFinished ? "Leitura concluída" : "Áudio pausado"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={togglePlay}
            className="btn ghost"
            style={{ minHeight: 36, padding: "6px 12px", fontSize: 13 }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? "Pausar" : "Ouvir"}
          </button>

          <button
            onClick={handleReplay}
            className="btn ghost"
            title="Reouvir áudio"
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
