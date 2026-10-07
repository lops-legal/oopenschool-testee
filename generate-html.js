import fs from "fs";

const questions = JSON.parse(fs.readFileSync("questions_forma_a.json", "utf8"));
const transcriptions = JSON.parse(fs.readFileSync("transcricoes-forma-a.json", "utf8"));

const introData = transcriptions["TA-intro"] || {
  text: "Bem-vindo à Avaliação de Competências Empreendedoras da Open Startups School.",
  file: "TABERTURA.mp3"
};

const finalData = transcriptions["TTELA-FINAL"] || {
  text: "Avaliação concluída com sucesso. Suas respostas foram salvas com segurança no banco de dados.",
  file: "TTELA FINAL.mp3"
};

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Open Startups School — Avaliação de Competências (Forma A)</title>
  
  <!-- Font & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  
  <!-- Supabase JS Client CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <style>
    :root {
      --bg: #07090e;
      --bg-surface: #0f1420;
      --bg-card: rgba(19, 26, 42, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --border-glow: rgba(99, 102, 241, 0.3);
      --text-main: #f3f4f6;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-light: rgba(99, 102, 241, 0.15);
      --accent: #06b6d4;
      --success: #10b981;
      --danger: #ef4444;
      --danger-glow: rgba(239, 68, 68, 0.3);
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: radial-gradient(circle at 50% 0%, #171f38 0%, var(--bg) 75%);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Ambient Glow */
    .glow-orb {
      position: fixed;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
      top: -150px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Top Navigation */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(7, 9, 14, 0.85);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
      color: #fff;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
    }

    .brand-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-form {
      background: var(--primary-light);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      font-family: var(--font-mono);
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
    }

    .btn-logout {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      margin-left: 6px;
      transition: color 0.2s;
    }
    .btn-logout:hover { color: var(--danger); }

    /* Layout Main */
    main {
      flex: 1;
      display: flex;
      position: relative;
      z-index: 10;
      max-width: 1300px;
      width: 100%;
      margin: 0 auto;
      padding: 24px;
      gap: 24px;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 320px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: fit-content;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    .sidebar-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      font-weight: 700;
    }

    .module-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-main);
    }

    .nav-item.active {
      background: var(--primary-light);
      border-color: rgba(99, 102, 241, 0.4);
      color: #fff;
      font-weight: 600;
    }

    .nav-item.completed {
      color: var(--success);
    }

    .nav-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
      font-family: var(--font-mono);
    }

    /* Content Area */
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Card */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }

    .card-eyebrow {
      font-size: 12px;
      color: var(--accent);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
      color: #fff;
    }

    .target-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 12px;
    }

    /* Audio Player Box */
    .prompt-audio-box {
      background: rgba(15, 20, 32, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .audio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .audio-tag {
      font-size: 11px;
      font-weight: 600;
      color: #818cf8;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .audio-player-custom {
      width: 100%;
      height: 38px;
      outline: none;
    }

    .prompt-text {
      font-size: 16px;
      line-height: 1.6;
      color: #e2e8f0;
      margin-bottom: 28px;
      background: rgba(255, 255, 255, 0.02);
      border-left: 3px solid var(--primary);
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
    }

    /* Voice Recorder Section */
    .recorder-container {
      background: rgba(10, 14, 24, 0.9);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      position: relative;
      overflow: hidden;
    }

    .recorder-container.recording {
      border-color: var(--danger);
      box-shadow: 0 0 30px var(--danger-glow);
    }

    .timer-display {
      font-size: 42px;
      font-weight: 800;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;
      color: #fff;
    }

    .timer-display.recording {
      color: var(--danger);
      animation: pulse 1.5s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .wave-container {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 36px;
    }

    .wave-bar {
      width: 4px;
      background: #475569;
      border-radius: 4px;
      height: 8px;
      transition: height 0.1s ease;
    }

    .recording .wave-bar {
      background: var(--danger);
      animation: wave 0.8s infinite ease-in-out alternate;
    }

    .recording .wave-bar:nth-child(2) { animation-delay: 0.1s; }
    .recording .wave-bar:nth-child(3) { animation-delay: 0.2s; }
    .recording .wave-bar:nth-child(4) { animation-delay: 0.3s; }
    .recording .wave-bar:nth-child(5) { animation-delay: 0.4s; }
    .recording .wave-bar:nth-child(6) { animation-delay: 0.2s; }
    .recording .wave-bar:nth-child(7) { animation-delay: 0.5s; }

    @keyframes wave {
      0% { height: 6px; }
      100% { height: 32px; }
    }

    .recorder-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      font-family: var(--font-sans);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: #fff;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
    }

    .btn-danger {
      background: var(--danger);
      color: #fff;
      box-shadow: 0 4px 16px var(--danger-glow);
    }
    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border-color: var(--border);
      color: var(--text-main);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
    }
    .btn-success:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }

    /* Auth Screen Modal */
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 9, 14, 0.95);
      backdrop-filter: blur(20px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #0f1422;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }

    .auth-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
    }

    .auth-tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .auth-tab.active {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 14px;
      color: #fff;
      font-family: var(--font-sans);
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .auth-msg {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .auth-msg.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      display: block;
    }
    .auth-msg.success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
      display: block;
    }

    .config-link {
      display: block;
      margin-top: 18px;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      cursor: pointer;
      text-decoration: underline;
    }

    /* Finished View */
    .finished-view {
      text-align: center;
      padding: 40px 20px;
    }

    .check-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid var(--success);
      color: var(--success);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
    }

    @media (max-width: 900px) {
      main { flex-direction: column; }
      .sidebar { width: 100%; max-height: none; }
    }
  </style>
</head>
<body>

  <div class="glow-orb"></div>

  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">OS</div>
      <div>
        <div class="brand-title">Open Startups School</div>
        <div class="brand-subtitle">Avaliação de Competências Empreendedoras</div>
      </div>
    </div>
    <div class="header-actions">
      <span class="badge-form">FORMA A</span>
      <div id="userPill" class="user-pill" style="display: none;">
        <span id="userName">Participante</span>
        <button class="btn-logout" onclick="handleLogout()" title="Sair">Sair</button>
      </div>
    </div>
  </header>

  <!-- Auth Modal -->
  <div id="authModal" class="auth-overlay">
    <div class="auth-card">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="brand-logo" style="margin: 0 auto 12px; width: 44px; height: 44px; font-size: 18px;">OS</div>
        <h2 style="font-size: 20px; font-weight: 700; color: #fff;">Identificação do Participante</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Entre ou cadastre-se para iniciar a avaliação</p>
      </div>

      <div class="auth-tabs">
        <button id="tabLogin" class="auth-tab active" onclick="switchAuthTab('login')">Entrar</button>
        <button id="tabRegister" class="auth-tab" onclick="switchAuthTab('register')">Criar Conta</button>
      </div>

      <div id="authAlert" class="auth-msg"></div>

      <form id="authForm" onsubmit="handleAuthSubmit(event)">
        <div id="nameGroup" class="form-group" style="display: none;">
          <label class="form-label">Nome Completo</label>
          <input type="text" id="authFullName" class="form-input" placeholder="Seu nome completo" />
        </div>

        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input type="email" id="authEmail" class="form-input" required placeholder="seu.email@exemplo.com" />
        </div>

        <div class="form-group">
          <label class="form-label">Senha</label>
          <input type="password" id="authPassword" class="form-input" required placeholder="••••••••" minlength="6" />
        </div>

        <button type="submit" id="authSubmitBtn" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
          Entrar e Continuar
        </button>
      </form>

      <div id="configSection" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); display: none;">
        <div class="form-group">
          <label class="form-label">Supabase URL</label>
          <input type="text" id="cfgSupabaseUrl" class="form-input" placeholder="https://xxx.supabase.co" />
        </div>
        <div class="form-group">
          <label class="form-label">Supabase Anon Key</label>
          <input type="password" id="cfgSupabaseKey" class="form-input" placeholder="eyJhb..." />
        </div>
        <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="saveSupabaseConfig()">Salvar Credenciais</button>
      </div>

      <a class="config-link" onclick="toggleConfig()">⚙ Configurar chaves do Supabase</a>
    </div>
  </div>

  <!-- Main App Layout -->
  <main id="appMain" style="display: none;">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-title">Estrutura da Avaliação</div>
      <div id="sidebarNav" class="module-group">
        <!-- Injetado via JS -->
      </div>
    </aside>

    <!-- Content Area -->
    <section class="content">
      <div class="card">
        
        <!-- Intro Screen View -->
        <div id="viewIntro" style="display: none;">
          <div class="card-eyebrow">Instruções Iniciais</div>
          <h1 class="card-title" style="font-size: 26px; margin-bottom: 16px;">Bem-vindo à Avaliação</h1>
          
          <div class="prompt-audio-box">
            <div class="audio-header">
              <span class="audio-tag">🎧 Áudio de Abertura</span>
            </div>
            <audio id="introAudioPlayer" class="audio-player-custom" controls>
              <source src="/audios/TABERTURA.mp3" type="audio/mpeg" />
              <source src="audios/TABERTURA.mp3" type="audio/mpeg" />
            </audio>
          </div>

          <div class="prompt-text">${introData.text}</div>

          <button class="btn btn-primary" style="font-size: 16px; padding: 14px 28px;" onclick="startEvaluation()">
            Iniciar Avaliação Agora →
          </button>
        </div>

        <!-- Question View -->
        <div id="viewQuestion" style="display: none;">
          <div class="card-header">
            <div>
              <div id="qModuleBadge" class="card-eyebrow">Bloco 0 — Modelo Mental</div>
              <h2 id="qTitle" class="card-title">Pergunta 1 de 22</h2>
            </div>
            <div class="target-time">
              ⏱ Meta: <span id="qTargetTime">45s</span>
            </div>
          </div>

          <!-- Prompt Audio -->
          <div class="prompt-audio-box">
            <div class="audio-header">
              <span class="audio-tag">📢 Pergunta em Áudio</span>
              <span id="qAudioName" style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">TA-M1.mp3</span>
            </div>
            <audio id="promptAudioPlayer" class="audio-player-custom" controls>
              <source id="promptAudioSrc" src="" type="audio/mpeg" />
            </audio>
          </div>

          <!-- Prompt Text Transcript -->
          <div id="qPromptText" class="prompt-text">Texto da pergunta...</div>

          <!-- Voice Recorder Section -->
          <div id="recorderBox" class="recorder-container">
            <div id="timerDisplay" class="timer-display">00:00</div>
            
            <div class="wave-container">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>

            <!-- Preview Recorded Audio -->
            <audio id="recordedPreview" class="audio-player-custom" controls style="display: none; max-width: 400px; margin-top: 10px;"></audio>

            <!-- Actions -->
            <div class="recorder-actions">
              <button id="btnRecord" class="btn btn-primary" onclick="startRecording()">
                🎤 Gravar Resposta
              </button>
              <button id="btnStop" class="btn btn-danger" style="display: none;" onclick="stopRecording()">
                ⏹ Finalizar Gravação
              </button>
              <button id="btnRerecord" class="btn btn-secondary" style="display: none;" onclick="resetRecording()">
                🔄 Regravar
              </button>
              <button id="btnSend" class="btn btn-success" style="display: none;" onclick="uploadAndNext()">
                💾 Salvar e Avançar →
              </button>
            </div>
            
            <div id="uploadStatus" style="font-size: 12px; color: var(--accent); margin-top: 8px; display: none;">
              Enviando áudio para o Supabase...
            </div>
          </div>
        </div>

        <!-- Finished View -->
        <div id="viewFinished" class="finished-view" style="display: none;">
          <div class="check-icon">✓</div>
          <h2 style="font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 12px;">Avaliação Concluída!</h2>
          <p style="font-size: 15px; color: var(--text-muted); max-width: 540px; margin: 0 auto 24px; line-height: 1.6;">
            ${finalData.text}
          </p>
          <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; padding: 16px; max-width: 400px; margin: 0 auto 24px; text-align: left;">
            <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 6px;"><strong>Participante:</strong> <span id="finishUser"></span></div>
            <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 6px;"><strong>Respostas Gravadas:</strong> <span id="finishCount"></span> / 22</div>
            <div style="font-size: 13px; color: #cbd5e1;"><strong>Status:</strong> Salvo no Supabase Storage</div>
          </div>
          <button class="btn btn-secondary" onclick="location.reload()">Reiniciar Visualização</button>
        </div>

      </div>
    </section>
  </main>

  <script>
    // Global Questions Data
    const QUESTIONS = ${JSON.stringify(questions)};
    
    // Supabase Client Setup
    let supabaseClient = null;
    let currentUser = null;
    let currentSessionId = null;
    let currentQIndex = -1; // -1 is Intro
    const answeredMap = {};

    // Audio Recorder State
    let mediaRecorder = null;
    let audioChunks = [];
    let recordedBlob = null;
    let recordStartTime = null;
    let timerInterval = null;
    let recordedDurationSeconds = 0;

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      initSupabase();
      checkAuth();
    });

    function initSupabase() {
      const defaultUrl = 'https://ovaiapivmpcwneyqeddy.supabase.co';
      const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YWlhcGl2bXBjd25leXFlZGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzUxMTksImV4cCI6MjEwNjkxMTExOX0.ue_RzP69_wnqmU3-0syvODPQKhGMgeEfX9HXtadIxig';

      const storedUrl = localStorage.getItem('OSS_SUPABASE_URL') || defaultUrl;
      const storedKey = localStorage.getItem('OSS_SUPABASE_KEY') || defaultKey;
      
      document.getElementById('cfgSupabaseUrl').value = storedUrl;
      document.getElementById('cfgSupabaseKey').value = storedKey;

      if (window.supabase && storedUrl && storedKey) {
        supabaseClient = window.supabase.createClient(storedUrl, storedKey);
      }
    }

    function saveSupabaseConfig() {
      const url = document.getElementById('cfgSupabaseUrl').value.trim();
      const key = document.getElementById('cfgSupabaseKey').value.trim();
      localStorage.setItem('OSS_SUPABASE_URL', url);
      localStorage.setItem('OSS_SUPABASE_KEY', key);
      initSupabase();
      alert('Configurações salvas!');
      document.getElementById('configSection').style.display = 'none';
    }

    function toggleConfig() {
      const cfg = document.getElementById('configSection');
      cfg.style.display = cfg.style.display === 'none' ? 'block' : 'none';
    }

    // Auth Handling
    let authMode = 'login';

    function switchAuthTab(mode) {
      authMode = mode;
      document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
      document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
      document.getElementById('nameGroup').style.display = mode === 'register' ? 'block' : 'none';
      document.getElementById('authSubmitBtn').innerText = mode === 'login' ? 'Entrar e Continuar' : 'Criar Conta e Iniciar';
      document.getElementById('authAlert').style.display = 'none';
    }

    async function handleAuthSubmit(e) {
      e.preventDefault();
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const fullName = document.getElementById('authFullName').value.trim();
      const alertBox = document.getElementById('authAlert');

      alertBox.className = 'auth-msg';
      alertBox.style.display = 'none';

      if (!supabaseClient) {
        // Modo local de demonstração se Supabase ainda não foi configurado
        currentUser = { id: 'local-' + Date.now(), email, user_metadata: { full_name: fullName || email.split('@')[0] } };
        onAuthSuccess();
        return;
      }

      try {
        if (authMode === 'register') {
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });
          if (error) throw error;
          
          if (data?.user) {
            await supabaseClient.from('participants').upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName || data.user.email
            });
            currentUser = data.user;
            onAuthSuccess();
          }
        } else {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          currentUser = data.user;
          onAuthSuccess();
        }
      } catch (err) {
        alertBox.className = 'auth-msg error';
        alertBox.innerText = err.message || 'Erro na autenticação';
        alertBox.style.display = 'block';
      }
    }

    async function checkAuth() {
      if (supabaseClient) {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session?.user) {
          currentUser = data.session.user;
          onAuthSuccess();
        }
      }
    }

    function onAuthSuccess() {
      document.getElementById('authModal').style.display = 'none';
      document.getElementById('appMain').style.display = 'flex';
      document.getElementById('userPill').style.display = 'flex';
      
      const displayName = currentUser.user_metadata?.full_name || currentUser.email || 'Participante';
      document.getElementById('userName').innerText = displayName;

      currentSessionId = 'sess_' + Date.now();
      renderSidebar();
      showIntro();
    }

    async function handleLogout() {
      if (supabaseClient) await supabaseClient.auth.signOut();
      currentUser = null;
      location.reload();
    }

    // Navigation & UI Render
    function renderSidebar() {
      const nav = document.getElementById('sidebarNav');
      nav.innerHTML = '';

      // Intro item
      const introBtn = document.createElement('button');
      introBtn.className = 'nav-item ' + (currentQIndex === -1 ? 'active' : '');
      introBtn.innerHTML = '<span>0. Abertura Oficial</span><span class="nav-badge">Intro</span>';
      introBtn.onclick = () => showIntro();
      nav.appendChild(introBtn);

      // Question items
      QUESTIONS.forEach((q, idx) => {
        const isAnswered = !!answeredMap[q.id];
        const isActive = currentQIndex === idx;
        const btn = document.createElement('button');
        btn.className = 'nav-item ' + (isActive ? 'active ' : '') + (isAnswered ? 'completed' : '');
        btn.innerHTML = \`<span>\${idx + 1}. \${q.id}</span><span class="nav-badge">\${q.seconds}s</span>\`;
        btn.onclick = () => loadQuestion(idx);
        nav.appendChild(btn);
      });
    }

    function showIntro() {
      currentQIndex = -1;
      document.getElementById('viewIntro').style.display = 'block';
      document.getElementById('viewQuestion').style.display = 'none';
      document.getElementById('viewFinished').style.display = 'none';
      renderSidebar();
    }

    function startEvaluation() {
      loadQuestion(0);
    }

    function loadQuestion(idx) {
      if (idx >= QUESTIONS.length) {
        showFinished();
        return;
      }
      currentQIndex = idx;
      const q = QUESTIONS[idx];

      document.getElementById('viewIntro').style.display = 'none';
      document.getElementById('viewQuestion').style.display = 'block';
      document.getElementById('viewFinished').style.display = 'none';

      document.getElementById('qModuleBadge').innerText = q.module;
      document.getElementById('qTitle').innerText = \`Pergunta \${idx + 1} de \${QUESTIONS.length}\`;
      document.getElementById('qTargetTime').innerText = q.seconds + 's';
      document.getElementById('qAudioName').innerText = q.audioFile;
      document.getElementById('qPromptText').innerText = q.text;

      // Audio player src (compatível tanto abrindo direto via file:/// quanto via servidor local)
      const audioPlayer = document.getElementById('promptAudioPlayer');
      audioPlayer.src = 'audios/' + q.audioFile;
      audioPlayer.load();

      resetRecording();
      renderSidebar();
    }

    function showFinished() {
      document.getElementById('viewIntro').style.display = 'none';
      document.getElementById('viewQuestion').style.display = 'none';
      document.getElementById('viewFinished').style.display = 'block';

      document.getElementById('finishUser').innerText = currentUser.user_metadata?.full_name || currentUser.email;
      document.getElementById('finishCount').innerText = Object.keys(answeredMap).length;
    }

    // Audio Recorder & MediaRecorder
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        
        const mimeType = ['audio/webm', 'audio/ogg', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          recordedBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          const audioUrl = URL.createObjectURL(recordedBlob);
          const preview = document.getElementById('recordedPreview');
          preview.src = audioUrl;
          preview.style.display = 'block';
        };

        mediaRecorder.start();
        recordStartTime = Date.now();
        
        // UI updates
        document.getElementById('recorderBox').classList.add('recording');
        document.getElementById('timerDisplay').classList.add('recording');
        document.getElementById('btnRecord').style.display = 'none';
        document.getElementById('btnStop').style.display = 'inline-flex';
        document.getElementById('btnRerecord').style.display = 'none';
        document.getElementById('btnSend').style.display = 'none';
        document.getElementById('recordedPreview').style.display = 'none';

        timerInterval = setInterval(updateTimer, 1000);
      } catch (err) {
        alert('Erro ao acessar o microfone. Permita o acesso ao microfone no navegador.');
      }
    }

    function updateTimer() {
      const elapsed = Math.floor((Date.now() - recordStartTime) / 1000);
      recordedDurationSeconds = elapsed;
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      document.getElementById('timerDisplay').innerText = \`\${mins}:\${secs}\`;
    }

    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(timerInterval);

      document.getElementById('recorderBox').classList.remove('recording');
      document.getElementById('timerDisplay').classList.remove('recording');
      document.getElementById('btnStop').style.display = 'none';
      document.getElementById('btnRerecord').style.display = 'inline-flex';
      document.getElementById('btnSend').style.display = 'inline-flex';
    }

    function resetRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(timerInterval);
      audioChunks = [];
      recordedBlob = null;
      recordedDurationSeconds = 0;

      document.getElementById('timerDisplay').innerText = '00:00';
      document.getElementById('recorderBox').classList.remove('recording');
      document.getElementById('timerDisplay').classList.remove('recording');
      document.getElementById('btnRecord').style.display = 'inline-flex';
      document.getElementById('btnStop').style.display = 'none';
      document.getElementById('btnRerecord').style.display = 'none';
      document.getElementById('btnSend').style.display = 'none';
      document.getElementById('recordedPreview').style.display = 'none';
      document.getElementById('uploadStatus').style.display = 'none';
    }

    async function uploadAndNext() {
      if (!recordedBlob) return;
      const q = QUESTIONS[currentQIndex];
      const statusEl = document.getElementById('uploadStatus');
      statusEl.style.display = 'block';
      statusEl.innerText = 'Salvando resposta no Supabase...';

      const ext = recordedBlob.type.includes('ogg') ? 'ogg' : recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const filePath = \`\${currentUser.id}/\${currentSessionId}_\${q.id}.\${ext}\`;

      if (supabaseClient) {
        try {
          // 1. Upload audio to storage bucket 'recordings'
          const { error: uploadError } = await supabaseClient.storage
            .from('recordings')
            .upload(filePath, recordedBlob, { contentType: recordedBlob.type, upsert: true });

          if (uploadError) console.warn('Storage upload error:', uploadError);

          // 2. Insert metadata into table 'responses'
          await supabaseClient.from('responses').insert({
            participant_id: currentUser.id,
            session_id: currentSessionId,
            question_id: q.id,
            audio_path: filePath,
            duration_seconds: recordedDurationSeconds
          });
        } catch (err) {
          console.error('Error syncing response:', err);
        }
      }

      answeredMap[q.id] = true;
      statusEl.style.display = 'none';
      loadQuestion(currentQIndex + 1);
    }
  </script>
</body>
</html>`;

fs.writeFileSync("index.html", htmlContent);
fs.writeFileSync("C:/Users/100OS/Documents/oopenschool-testee/public/standalone.html", htmlContent);
console.log("Static index.html generated successfully in both locations!");
