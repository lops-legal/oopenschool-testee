import fs from "fs";

const targetPath = "C:/Users/100OS/Documents/oopenschool-testee/src/app/page.js";

const content = `"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import HardwareCheck from "@/components/assessment/HardwareCheck";
import ModuleProgressBar from "@/components/assessment/ModuleProgressBar";
import AudioPlayerEngine from "@/components/assessment/AudioPlayerEngine";
import VoiceRecorderEngine from "@/components/assessment/VoiceRecorderEngine";

import {
  FORMS,
  MODULE_COVERS,
  OPENING_AUDIO
} from "@/data/canonicalData";

import {
  Play,
  CheckCircle2,
  Clock,
  Mic,
  Shield,
  FileText,
  Lock,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X
} from "lucide-react";

const PARTICIPANT = {
  id: "participant_preview_001",
  name: "Lucas"
};

export default function Home() {
  // Navigation & Screen states
  // screen: "entry" | "dashboard" | "hardware" | "assessment" | "complete"
  const [screen, setScreen] = useState("entry");
  const [activeTab, setActiveTab] = useState("overview");

  // Assessment Engine States
  const [questions] = useState(FORMS.C);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showModuleCover, setShowModuleCover] = useState(true);
  const [showOpening, setShowOpening] = useState(true);
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [isReadyToAnswer, setIsReadyToAnswer] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [assessmentStatus, setAssessmentStatus] = useState("READY");

  // Current question or cover computation
  const currentQuestion = questions[currentStepIndex];
  const currentModuleIndex = currentQuestion ? currentQuestion.moduleIndex : 0;
  const currentCover = MODULE_COVERS.find((m) => m.index === currentModuleIndex);

  // Handle starting assessment flow
  const handleStartAssessment = () => {
    setScreen("hardware");
  };

  // Hardware check complete -> Start official opening / assessment
  const handleHardwareComplete = () => {
    setScreen("assessment");
    setShowOpening(true);
    setShowModuleCover(true);
    setCurrentStepIndex(0);
    setIsAudioFinished(false);
    setIsReadyToAnswer(false);
  };

  // Move to next step in assessment engine
  const handleNextStep = () => {
    if (showOpening) {
      setShowOpening(false);
      setShowModuleCover(true);
      setIsAudioFinished(false);
      setIsReadyToAnswer(false);
      return;
    }

    if (showModuleCover) {
      setShowModuleCover(false);
      setIsAudioFinished(false);
      setIsReadyToAnswer(false);
      return;
    }

    // Check if current question is Pitch Prep -> Advance directly to Pitch Question with recording enabled
    if (currentQuestion && currentQuestion.kind === "prep") {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentStepIndex(nextIndex);
        setShowModuleCover(false);
        setIsAudioFinished(true);
        setIsReadyToAnswer(true);
      }
      return;
    }

    // Advance question index
    if (currentStepIndex < questions.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextQuestion = questions[nextIndex];

      // If next question belongs to a new module, show cover first
      if (nextQuestion.moduleIndex !== currentModuleIndex) {
        setShowModuleCover(true);
      } else {
        setShowModuleCover(false);
      }

      setCurrentStepIndex(nextIndex);
      setIsAudioFinished(false);
      setIsReadyToAnswer(false);
    } else {
      // Assessment Completed
      setAssessmentStatus("SUBMITTED");
      setScreen("complete");
    }
  };

  const handleVoiceRecorded = (savedRecording) => {
    setUserResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: savedRecording
    }));
    handleNextStep();
  };

  const handleExitAssessment = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja sair da avaliação? Suas respostas desta sessão serão perdidas."
    );
    if (confirmed) {
      setScreen("dashboard");
    }
  };

  // Uniform tap behavior: clicking on the card during question audio playback
  // immediately transitions to audio capture mode (microphone recording), never skips or goes back.
  const handleCardTapQuestion = (e) => {
    if (e.target.closest("button, a, input, [role='button'], .mode, audio")) return;
    if (!isReadyToAnswer) {
      if (currentQuestion && currentQuestion.kind === "prep") {
        handleNextStep();
      } else {
        setIsReadyToAnswer(true);
      }
    }
  };

  const handleCardTapCover = (e) => {
    if (e.target.closest("button, a, input, [role='button'], .mode, audio")) return;
    handleNextStep();
  };

  return (
    <>
      {/* 1. ENTRY / SPLASH SCREEN */}
      {screen === "entry" && (
        <div className="entry-wrapper">
          <div className="entry-card">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>
            <h1>Baseline de Competências Empreendedoras</h1>
            <p className="lead">
              Ambiente de aplicação individual do instrumento P01. Uma jornada estruturada
              para mapear repertório, raciocínio e síntese empreendedora.
            </p>
            <div className="meta-grid">
              <div className="meta-item">
                <Clock size={16} /> 60 minutos
              </div>
              <div className="meta-item">
                <Mic size={16} /> Respostas em áudio
              </div>
              <div className="meta-item">
                <Shield size={16} /> Sessão individual
              </div>
            </div>
            <button className="btn primary" onClick={() => setScreen("dashboard")}>
              Acessar minha área <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD SCREEN */}
      {screen === "dashboard" && (
        <div className="layout">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            assessmentStatus={assessmentStatus}
            onStartAssessment={handleStartAssessment}
          />
          <main className="main-content">
            {activeTab === "overview" && (
              <div className="tab-pane">
                <div className="welcome-banner">
                  <div>
                    <div className="badge primary">P01 • Baseline</div>
                    <h2>Olá, {PARTICIPANT.name}</h2>
                    <p className="muted">
                      Sua avaliação de competências empreendedoras está pronta para ser iniciada.
                    </p>
                  </div>
                  {assessmentStatus === "READY" ? (
                    <button className="btn primary" onClick={handleStartAssessment}>
                      <Play size={16} /> Iniciar Avaliação
                    </button>
                  ) : (
                    <div className="status-tag done">
                      <CheckCircle2 size={16} /> Concluída
                    </div>
                  )}
                </div>

                <div className="section-title">Visão Geral dos Blocos</div>
                <div className="grid-3">
                  {MODULE_COVERS.map((module) => (
                    <div className="card" key={module.index}>
                      <div className="eyebrow">{module.eyebrow}</div>
                      <h3>{module.title}</h3>
                      <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                        {module.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "assessments" && (
              <div className="tab-pane">
                <h2>Minhas Avaliações</h2>
                <div className="card" style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3>P01 — Baseline de Competências Empreendedoras</h3>
                      <p className="muted">Forma C • 27 estímulos sequenciais</p>
                    </div>
                    {assessmentStatus === "READY" ? (
                      <button className="btn primary" onClick={handleStartAssessment}>
                        Iniciar
                      </button>
                    ) : (
                      <span className="status-tag done">Concluída</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="tab-pane">
                <h2>Laudos Formativos</h2>
                <div className="card locked-card" style={{ marginTop: 20, textAlign: "center", padding: "48px 24px" }}>
                  <Lock size={36} style={{ color: "var(--muted)", margin: "0 auto 16px" }} />
                  <h3>Laudo em Processamento</h3>
                  <p className="muted" style={{ maxWidth: 440, margin: "8px auto 20px" }}>
                    {assessmentStatus === "SUBMITTED"
                      ? "Suas respostas foram enviadas e estão sendo analisadas pela banca avaliadora. O laudo estará disponível em breve."
                      : "Complete a avaliação para liberar o seu laudo formativo individual."}
                  </p>
                  {assessmentStatus === "READY" && (
                    <button className="btn primary" onClick={handleStartAssessment}>
                      Realizar avaliação agora
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* 3. HARDWARE CHECK SCREEN */}
      {screen === "hardware" && (
        <HardwareCheck
          onComplete={handleHardwareComplete}
          onCancel={() => setScreen("dashboard")}
        />
      )}

      {/* 4. ASSESSMENT RUNTIME SCREEN */}
      {screen === "assessment" && (
        <div className="assess-wrapper">
          <div className="assess-top">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>

            <ModuleProgressBar
              currentStepIndex={currentStepIndex}
              totalSteps={questions.length}
              currentModuleIndex={currentModuleIndex}
            />

            <button className="btn ghost exit-btn" onClick={handleExitAssessment}>
              <X size={16} /> Sair
            </button>
          </div>

          <main className="assess-main">
            {showOpening ? (
              /* OFFICIAL OPENING SCREEN */
              <div
                className="center-card tap-card"
                onClick={handleCardTapCover}
              >
                <ChevronRight className="tap-hint right" size={20} />
                <div className="eyebrow">00:00–02:00 • Abertura Oficial</div>
                <h2>Instruções Iniciais</h2>

                <p
                  className="lead"
                  style={{ whiteSpace: "pre-line", fontSize: 15, margin: "16px 0" }}
                >
                  {OPENING_AUDIO.text}
                </p>

                <AudioPlayerEngine
                  audioFile={OPENING_AUDIO.filename}
                  onAudioEnded={() => setIsAudioFinished(true)}
                  onUserReadyToAnswer={handleNextStep}
                  isCover={true}
                />

                <div className="actions" style={{ marginTop: 24 }}>
                  <button
                    className="btn primary"
                    onClick={handleNextStep}
                    style={{ width: "100%" }}
                  >
                    Iniciar primeiro bloco →
                  </button>
                </div>
              </div>
            ) : showModuleCover ? (
              /* MODULE COVER SCREEN */
              <div
                className="center-card tap-card"
                onClick={handleCardTapCover}
              >
                <ChevronRight className="tap-hint right" size={20} />
                <div className="eyebrow">{currentCover?.eyebrow}</div>
                <h2>{currentCover?.title}</h2>
                <p className="lead" style={{ margin: "16px 0 24px" }}>
                  {currentCover?.text}
                </p>

                <AudioPlayerEngine
                  audioFile={currentCover?.filename || "TC-BLOCO-0.mp3"}
                  onAudioEnded={() => setIsAudioFinished(true)}
                  onUserReadyToAnswer={handleNextStep}
                  isCover={true}
                />

                <div className="actions" style={{ justifyContent: "center", marginTop: 24 }}>
                  <button
                    className="btn primary"
                    onClick={handleNextStep}
                    style={{ width: "100%", maxWidth: 360 }}
                  >
                    Ir para as perguntas do bloco →
                  </button>
                </div>
              </div>
            ) : currentQuestion?.kind === "prep" ? (
              /* PITCH PREPARATION SCREEN (SILENT PREPARATION) */
              <div className="center-card tap-card" onClick={handleCardTapCover}>
                <div className="eyebrow">Síntese / Pitch</div>
                <h2>Prepare sua proposta.</h2>
                <p className="lead" style={{ margin: "16px 0", whiteSpace: "pre-line" }}>
                  {currentQuestion?.text}
                </p>

                <AudioPlayerEngine
                  audioFile={currentQuestion?.audioFile || "TA-PITCH-PREP.mp3"}
                  onAudioEnded={() => setIsAudioFinished(true)}
                  onUserReadyToAnswer={handleNextStep}
                  isCover={true}
                />

                <div className="card" style={{ padding: 16, background: "var(--soft)", margin: "20px 0" }}>
                  <strong>Microfone pausado.</strong> Esta etapa é de preparação silenciosa.
                </div>

                <div className="actions" style={{ justifyContent: "center" }}>
                  <button
                    className="btn primary"
                    onClick={handleNextStep}
                    style={{ width: "100%", maxWidth: 380 }}
                  >
                    Estou pronto para apresentar →
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD QUESTION SCREEN — CLICK TRANSITIONS TO VOICE CAPTURE MODE */
              <div
                className="q-shell tap-card"
                onClick={handleCardTapQuestion}
              >
                {!isReadyToAnswer && (
                  <ChevronRight className="tap-hint right" size={20} />
                )}

                <div className="q-head">
                  <div>
                    <div className="q-index">
                      Questão {currentStepIndex + 1} de {questions.length}
                    </div>
                    <div className="muted">{currentQuestion?.block}</div>
                  </div>
                  <div className="badge">{currentQuestion?.id}</div>
                </div>

                <div className="card q-card">
                  <p className="q-text">{currentQuestion?.text}</p>

                  {!isReadyToAnswer ? (
                    <AudioPlayerEngine
                      audioFile={currentQuestion?.audioFile}
                      onAudioEnded={() => setIsAudioFinished(true)}
                      onUserReadyToAnswer={() => setIsReadyToAnswer(true)}
                    />
                  ) : (
                    <VoiceRecorderEngine
                      seconds={currentQuestion?.seconds || 60}
                      silencePrompt={currentQuestion?.silencePrompt}
                      silenceAfter={currentQuestion?.silenceAfter}
                      participantId={PARTICIPANT.id}
                      participantName={PARTICIPANT.name}
                      questionId={currentQuestion?.id}
                      onFinishResponse={handleVoiceRecorded}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* 5. COMPLETE SCREEN */}
      {screen === "complete" && (
        <div className="assess-wrapper">
          <main className="assess-main">
            <div className="center-card">
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--green)",
                  color: "#000",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 20px",
                  fontSize: 40
                }}
              >
                ✓
              </div>
              <div className="eyebrow">AVALIAÇÃO CONCLUÍDA</div>
              <h2>Obrigado! Sua avaliação foi registrada.</h2>
              <p className="lead" style={{ margin: "14px 0 24px" }}>
                Suas respostas foram processadas e salvas com sucesso. O laudo formativo descreve
                evidências observadas nesta aplicação e ficará disponível após a revisão.
              </p>
              <button
                className="btn primary"
                onClick={() => {
                  setScreen("dashboard");
                  setActiveTab("reports");
                }}
                style={{ width: "100%", maxWidth: 360 }}
              >
                Voltar para minha área →
              </button>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync(targetPath, content, "utf8");
console.log("page.js updated successfully.");
