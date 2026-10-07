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
  FORMA_B,
  OPENING_AUDIO,
  FINAL_AUDIO,
  MODULE_BLOCKS
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
  // Navigation & Screen states: "entry" | "dashboard" | "hardware" | "assessment" | "complete"
  const [screen, setScreen] = useState("entry");
  const [activeTab, setActiveTab] = useState("overview");

  // Pure Forma B (27 questions with 100% native TB audio files)
  const questions = FORMA_B;

  // Assessment Engine States
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showOpening, setShowOpening] = useState(true);
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [isReadyToAnswer, setIsReadyToAnswer] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [assessmentStatus, setAssessmentStatus] = useState("READY");

  // Current question computation
  const currentQuestion = questions[currentStepIndex];
  const currentModuleIndex = currentQuestion ? currentQuestion.moduleIndex : 0;

  // Handle starting assessment flow
  const handleStartAssessment = () => {
    setScreen("hardware");
  };

  // Hardware check complete -> Start official opening / assessment
  const handleHardwareComplete = () => {
    setScreen("assessment");
    setShowOpening(true);
    setCurrentStepIndex(0);
    setIsAudioFinished(false);
    setIsReadyToAnswer(false);
  };

  // Move to next step in assessment engine
  const handleNextStep = () => {
    if (showOpening) {
      setShowOpening(false);
      setIsAudioFinished(false);
      setIsReadyToAnswer(false);
      return;
    }

    // Advance from Pitch Prep directly to Pitch Question in recording mode
    if (currentQuestion && currentQuestion.kind === "prep") {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentStepIndex(nextIndex);
        setIsAudioFinished(true);
        setIsReadyToAnswer(true);
      }
      return;
    }

    // Advance question index
    if (currentStepIndex < questions.length - 1) {
      const nextIndex = currentStepIndex + 1;
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

  // Uniform tap behavior: clicking on question card transitions to audio recording mode
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

  const handleCardTapOpening = (e) => {
    if (e.target.closest("button, a, input, [role='button'], .mode, audio")) return;
    handleNextStep();
  };

  return (
    <>
      {/* 1. ENTRY GATE */}
      {screen === "entry" && (
        <div className="entry-gate">
          <div className="entry-inner">
            <section className="entry-hero">
              <div className="brand" style={{ marginBottom: 36 }}>
                <span className="logo">O</span>
                <span>
                  <small>Open Startup</small>
                  School
                </span>
              </div>
              <div className="eyebrow">P01 · Baseline formativo (Forma B)</div>
              <h1>Conheça suas <span className="hero-highlight">competências empreendedoras</span>.</h1>
              <p className="lead" style={{ margin: "18px 0 28px" }}>
                Uma experiência estruturada de aproximadamente 60 minutos para observar conhecimento,
                experiências relatadas, raciocínio em situação simulada e comunicação.
              </p>
              <div className="actions">
                <button className="btn accent" onClick={() => setScreen("dashboard")}>
                  Entrar na plataforma <ArrowRight size={18} />
                </button>
              </div>
            </section>

            <aside className="entry-side">
              <div>
                <div className="eyebrow">Antes de entrar</div>
                <h2>O que você vai encontrar</h2>
                <div className="mini-list">
                  <div className="mini-item">
                    <strong>Área do participante</strong>
                    <div className="muted">Avaliações, histórico e Laudos P01.</div>
                  </div>
                  <div className="mini-item">
                    <strong>Avaliação guiada — Forma B</strong>
                    <div className="muted">27 estímulos em áudio e respostas faladas.</div>
                  </div>
                  <div className="mini-item">
                    <strong>Laudo formativo</strong>
                    <div className="muted">Liberado após processamento e QA.</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* 2. MAIN DASHBOARD */}
      {screen === "dashboard" && (
        <div className="app-shell">
          <Sidebar
            activePage={activeTab}
            setActivePage={setActiveTab}
            onLogout={() => setScreen("entry")}
          />

          <main className="main-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Área do participante</div>
                    <h1>Boa noite, {PARTICIPANT.name}.</h1>
                  </div>
                  <div className="badge">
                    <span
                      className={"dot " + (assessmentStatus === "SUBMITTED" ? "green" : "orange")}
                    />
                    {assessmentStatus === "SUBMITTED" ? "Avaliação enviada" : "Avaliação pendente"}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card hero">
                    <div className="eyebrow">Próxima avaliação</div>
                    <h2>Baseline de Competências Empreendedoras — Forma B</h2>
                    <p className="muted" style={{ margin: "12px 0" }}>
                      Sessão individual de aproximadamente 60 minutos, com perguntas em áudio oficial,
                      respostas faladas e tempo controlado.
                    </p>
                    <div className="meta">
                      <div>
                        <b>60 min</b>
                        <span className="muted">duração-alvo</span>
                      </div>
                      <div>
                        <b>Áudio</b>
                        <span className="muted">respostas gravadas</span>
                      </div>
                      <div>
                        <b>Forma B</b>
                        <span className="muted">27 estímulos</span>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="btn accent" onClick={handleStartAssessment}>
                        {assessmentStatus === "SUBMITTED" ? "Refazer avaliação →" : "Iniciar avaliação →"}
                      </button>
                      <button className="btn ghost" onClick={() => setActiveTab("assessments")}>
                        Ver detalhes
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <div className="eyebrow">Seu processo</div>
                    <div className="timeline">
                      <div className="t-item">
                        <div
                          className={"t-dot " + (assessmentStatus === "READY" ? "current" : "done")}
                        />
                        <div className="t-body">
                          <strong>Avaliação disponível</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Pronta para iniciar com áudio oficial da Forma B.
                          </div>
                        </div>
                      </div>
                      <div className="t-item">
                        <div
                          className={"t-dot " + (assessmentStatus === "SUBMITTED" ? "current" : "")}
                        />
                        <div className="t-body">
                          <strong>Análise das respostas</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Organização dos áudios e evidências.
                          </div>
                        </div>
                      </div>
                      <div className="t-item">
                        <div className="t-dot" />
                        <div className="t-body">
                          <strong>Revisão QA</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Validação pedagógica.
                          </div>
                        </div>
                      </div>
                      <div className="t-item">
                        <div className="t-dot" />
                        <div className="t-body">
                          <strong>Laudo formativo liberado</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Disponível na aba de laudos.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-head" style={{ marginTop: 36 }}>
                  <div>
                    <div className="eyebrow">Estrutura da Prova</div>
                    <h2>Blocos do Instrumento P01 — Forma B</h2>
                  </div>
                </div>

                <div className="grid-3" style={{ marginTop: 14 }}>
                  {MODULE_BLOCKS.map((module) => (
                    <div className="card" key={module.index}>
                      <div className="eyebrow">{module.eyebrow}</div>
                      <h3>{module.title}</h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Assessments Tab */}
            {activeTab === "assessments" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Instrumentos</div>
                    <h1>Suas avaliações</h1>
                  </div>
                </div>

                <div className="card" style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3>P01 — Baseline de Competências Empreendedoras</h3>
                      <p className="muted">Forma B • 27 estímulos sequenciais com áudios oficiais</p>
                    </div>
                    {assessmentStatus === "READY" ? (
                      <button className="btn accent" onClick={handleStartAssessment}>
                        Iniciar
                      </button>
                    ) : (
                      <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        Concluída
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Resultados</div>
                    <h1>Laudos P01</h1>
                  </div>
                </div>

                <div className="card locked-card" style={{ marginTop: 20, textAlign: "center", padding: "54px 24px" }}>
                  <Lock size={36} style={{ color: "var(--muted)", margin: "0 auto 16px" }} />
                  <h3>Laudo Formativo Individual</h3>
                  <p className="muted" style={{ maxWidth: 440, margin: "8px auto 20px" }}>
                    {assessmentStatus === "SUBMITTED"
                      ? "Suas respostas foram enviadas e estão sendo analisadas pela banca avaliadora. O laudo estará disponível em breve."
                      : "Complete a avaliação para liberar o seu laudo formativo individual."}
                  </p>
                  {assessmentStatus === "READY" && (
                    <button className="btn accent" onClick={handleStartAssessment}>
                      Realizar avaliação agora
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Registro</div>
                    <h1>Histórico de aplicações</h1>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 20 }}>
                  <p className="muted">Nenhuma aplicação anterior registrada para este participante.</p>
                </div>
              </section>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Conta</div>
                    <h1>Minha conta</h1>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 20 }}>
                  <p><strong>Nome:</strong> {PARTICIPANT.name}</p>
                  <p className="muted" style={{ marginTop: 8 }}><strong>ID:</strong> {PARTICIPANT.id}</p>
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* 3. HARDWARE SETUP */}
      {screen === "hardware" && (
        <div className="assess-wrapper">
          <div className="assess-top">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>
            <button className="btn ghost exit-btn" onClick={() => setScreen("dashboard")}>
              <X size={16} /> Sair
            </button>
          </div>
          <HardwareCheck
            onComplete={handleHardwareComplete}
            onCancel={() => setScreen("dashboard")}
          />
        </div>
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
              /* OFFICIAL OPENING SCREEN — FORMA B (TABERTURA.mp3) */
              <div
                className="center-card tap-card"
                onClick={handleCardTapOpening}
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
                    Iniciar Bloco 0 — Modelo Mental →
                  </button>
                </div>
              </div>
            ) : currentQuestion?.kind === "prep" ? (
              /* PITCH PREPARATION SCREEN (SILENT PREPARATION) — FORMA B (TB-PITCH-PREP.mp3) */
              <div className="center-card tap-card" onClick={handleCardTapOpening}>
                <div className="eyebrow">Bloco 4 — Síntese e apresentação</div>
                <h2>Prepare sua proposta.</h2>
                <p className="lead" style={{ margin: "16px 0", whiteSpace: "pre-line" }}>
                  {currentQuestion?.text}
                </p>

                <AudioPlayerEngine
                  audioFile={currentQuestion?.audioFile || "TB-PITCH-PREP.mp3"}
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
              /* STANDARD QUESTION SCREEN — FORMA B */
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
                  <p className="q-text" style={{ whiteSpace: "pre-line" }}>{currentQuestion?.text}</p>

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

      {/* 5. COMPLETE SCREEN — FORMA B (TTELA FINAL.mp3) */}
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
              <p className="lead" style={{ margin: "14px 0 24px", whiteSpace: "pre-line" }}>
                {FINAL_AUDIO.text}
              </p>

              <AudioPlayerEngine
                audioFile={FINAL_AUDIO.filename}
                onAudioEnded={() => {}}
                isCover={true}
              />

              <div className="actions" style={{ marginTop: 24, justifyContent: "center" }}>
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
            </div>
          </main>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync(targetPath, content, "utf8");
console.log("page.js updated to 100% pure Forma B with proper audio and CSS flow.");
