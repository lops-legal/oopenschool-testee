"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import HardwareCheck from "@/components/assessment/HardwareCheck";
import ModuleProgressBar from "@/components/assessment/ModuleProgressBar";
import AudioPlayerEngine from "@/components/assessment/AudioPlayerEngine";
import VoiceRecorderEngine from "@/components/assessment/VoiceRecorderEngine";
import AuditModal from "@/components/assessment/AuditModal";

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
  ChevronLeft,
  RotateCcw,
  Sparkles
} from "lucide-react";

const PARTICIPANT = {
  id: "participant_preview_001",
  name: "Lucas"
};

export default function Home() {
  // Navigation & Screen states
  // screen: "entry" | "dashboard" | "hardware" | "assessment" | "pitchPrep" | "complete"
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
    setIsReadyToAnswer(false);

    if (showOpening) {
      setShowOpening(false);
      setShowModuleCover(true);
      setIsAudioFinished(false);
      return;
    }

    if (showModuleCover) {
      setShowModuleCover(false);
      setIsAudioFinished(false);
      return;
    }

    // Check if current question is Pitch Prep
    if (currentQuestion.kind === "prep") {
      setScreen("pitchPrep");
      return;
    }

    // Advance question index
    if (currentStepIndex < questions.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextQuestion = questions[nextIndex];

      // If next question belongs to a new module, show cover
      if (nextQuestion.moduleIndex !== currentModuleIndex) {
        setShowModuleCover(true);
      } else {
        setShowModuleCover(false);
      }

      setCurrentStepIndex(nextIndex);
      setIsAudioFinished(false);
    } else {
      // Assessment Completed
      setAssessmentStatus("SUBMITTED");
      setScreen("complete");
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0 && !showOpening) {
      setCurrentStepIndex((prev) => prev - 1);
      setShowModuleCover(false);
      setIsAudioFinished(false);
      setIsReadyToAnswer(false);
    }
  };

  const handleVoiceRecorded = (savedRecording) => {
    setUserResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: savedRecording
    }));
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
              <div className="eyebrow">P01 · Baseline formativo</div>
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
                    <strong>Avaliação guiada</strong>
                    <div className="muted">Fones, áudio, microfone, instruções e prova.</div>
                  </div>
                  <div className="mini-item">
                    <strong>Laudo formativo</strong>
                    <div className="muted">Liberado após processamento e QA.</div>
                  </div>
                </div>
              </div>

              <div
                className="card"
                style={{ background: "#f3eee6", padding: 16, fontSize: 13, color: "var(--muted)", marginTop: 20 }}
              >
                <strong>Versão v0.4:</strong> Design responsivo otimizado para mobile e desktop, controle de cadência e gravação de áudio.
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* 2. MAIN DASHBOARD */}
      {screen === "dashboard" && (
        <div className="app-shell">
          <Sidebar activePage={activeTab} setActivePage={setActiveTab} />

          <main className="main-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Área do participante</div>
                    <h1>Boa noite, Lucas.</h1>
                  </div>
                  <div className="badge">
                    <span
                      className={`dot ${assessmentStatus === "SUBMITTED" ? "green" : "orange"}`}
                    />
                    P01 · v0.4
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card hero">
                    <div className="eyebrow">Próxima avaliação</div>
                    <h2>Baseline de Competências Empreendedoras — P01</h2>
                    <p className="muted" style={{ margin: "12px 0" }}>
                      Sessão individual de aproximadamente 60 minutos, com perguntas em áudio,
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
                        <b>Forma C</b>
                        <span className="muted">atribuída</span>
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
                          className={`t-dot ${assessmentStatus === "READY" ? "current" : "done"}`}
                        />
                        <div className="t-body">
                          <strong>Avaliação disponível</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Pronta para iniciar a qualquer momento.
                          </div>
                        </div>
                      </div>
                      <div className="t-item">
                        <div
                          className={`t-dot ${assessmentStatus === "SUBMITTED" ? "current" : ""}`}
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
                          <strong>Laudo formativo</strong>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Disponível pós-revisão.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Assessments Tab */}
            {activeTab === "assessments" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Minhas avaliações</div>
                    <h1>Avaliações P01</h1>
                  </div>
                </div>
                <div className="card hero">
                  <div className="eyebrow">Disponível</div>
                  <h2>P01 — Baseline de Competências Empreendedoras</h2>
                  <p className="muted">Forma C atribuída pelo sistema.</p>
                  <div className="meta">
                    <div>
                      <b>v0.4</b>
                      <span className="muted">versão</span>
                    </div>
                    <div>
                      <b>60 min</b>
                      <span className="muted">duração</span>
                    </div>
                    <div>
                      <b>{assessmentStatus}</b>
                      <span className="muted">status</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn accent" onClick={handleStartAssessment}>
                      Iniciar →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Laudos P01</div>
                    <h1>Seus laudos formativos</h1>
                  </div>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 36 }}>
                  <div style={{ fontSize: 42, marginBottom: 14 }}>🔒</div>
                  <h2>
                    {assessmentStatus === "SUBMITTED"
                      ? "Em processamento e revisão QA"
                      : "Laudo ainda não liberado"}
                  </h2>
                  <p className="muted" style={{ maxWidth: 500, margin: "10px auto 20px" }}>
                    {assessmentStatus === "SUBMITTED"
                      ? "Suas respostas gravadas foram salvas. O laudo formativo está em fase de verificação de evidências."
                      : "A aplicação precisa ser realizada e passar pela revisão antes da liberação."}
                  </p>
                </div>
              </section>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Histórico</div>
                    <h1>Aplicações realizadas</h1>
                  </div>
                </div>
                <div className="card">
                  {assessmentStatus === "SUBMITTED" ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <strong>P01 — Forma C Concluída</strong>
                        <div className="muted" style={{ fontSize: 13 }}>
                          27 respostas gravadas
                        </div>
                      </div>
                      <span className="badge" style={{ background: "#e6f1eb", color: "var(--green)" }}>
                        Enviado / QA
                      </span>
                    </div>
                  ) : (
                    <p className="muted">Nenhuma aplicação concluída ainda.</p>
                  )}
                </div>
              </section>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <section>
                <div className="topline">
                  <div>
                    <div className="eyebrow">Minha conta</div>
                    <h1>Dados do participante</h1>
                  </div>
                </div>
                <div className="card">
                  <h2>Identificação</h2>
                  <p className="muted">
                    <strong>Nome:</strong> Lucas
                  </p>
                  <p className="muted" style={{ marginTop: 8 }}>
                    <strong>ID:</strong> participant_preview_001
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* 3. HARDWARE CHECK */}
      {screen === "hardware" && (
        <div className="assess-wrapper">
          <div className="assess-top">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>
            <div className="badge">P01 · v0.4</div>
          </div>
          <HardwareCheck
            onComplete={handleHardwareComplete}
            onCancel={() => setScreen("dashboard")}
          />
        </div>
      )}

      {/* 4. ASSESSMENT RUNNER */}
      {screen === "assessment" && (
        <div className="assess-wrapper">
          <div className="assess-top">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>
            <div className="badge">P01 · Forma C</div>
          </div>

          <ModuleProgressBar
            currentModuleIndex={currentModuleIndex}
            currentStepIndex={currentStepIndex}
            totalSteps={questions.length}
          />

          <main className="assess-main">
            {/* OFFICIAL OPENING */}
            {showOpening ? (
              <div className="center-card" style={{ textAlign: "left" }}>
                <div className="eyebrow">00:00–02:00 · Abertura Oficial</div>
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
              <div className="center-card">
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
            ) : (
              /* QUESTION SCREEN WITH SIDE TAP ZONES FOR EASY NAVIGATION */
              <div className="q-shell">

                {/* Side tap zone Right (Pass to next card if ready) */}
                {!isReadyToAnswer && (
                <div
                  className="side-tap-zone right"
                  title="Avançar card"
                  onClick={handleNextStep}
                >
                  <div className="side-tap-btn">
                    <ChevronRight size={20} color="var(--ink)" />
                  </div>
                </div>
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
                      seconds={currentQuestion?.seconds || 90}
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

      {/* 5. PITCH PREP SCREEN */}
      {screen === "pitchPrep" && (
        <div className="assess-wrapper">
          <div className="assess-top">
            <div className="brand">
              <span className="logo">O</span>
              <span>Open Startup School</span>
            </div>
            <div className="badge">P01 · Preparação</div>
          </div>
          <main className="assess-main">
            <div className="center-card">
              <div className="eyebrow">Síntese / Pitch</div>
              <h2>Prepare sua proposta.</h2>
              <p className="lead" style={{ margin: "16px 0" }}>
                Você terá agora 90 segundos para apresentar sua proposta. Deixe claro: a oportunidade, a primeira ação e o próximo compromisso.
              </p>

              <AudioPlayerEngine
                audioFile={currentQuestion?.audioFile || "TA-P24.mp3"}
                onAudioEnded={() => {}}
              />

              <div className="card" style={{ padding: 16, background: "#f3eee6", margin: "20px 0" }}>
                <strong>Microfone pausado.</strong> Esta etapa é de preparação silenciosa.
              </div>

              <div className="actions" style={{ justifyContent: "center" }}>
                <button
                  className="btn primary"
                  onClick={() => {
                    setScreen("assessment");
                    setShowModuleCover(false);
                    setIsAudioFinished(true);
                    setIsReadyToAnswer(true);
                  }}
                  style={{ width: "100%", maxWidth: 380 }}
                >
                  Estou pronto para apresentar →
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 6. COMPLETE SCREEN */}
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
                  color: "#fff",
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

      {/* DEV AUDIT FAB */}
      <AuditModal />
    </>
  );
}
