/**
 * ============================================================================
 * TRONO KIDS EBD - SUPER ARCADE AUDIOVISUAL (17 JOGOS OFICIAIS EM TELA CHEIA)
 * ============================================================================
 * Versão: 80.0
 * Filosofia: 100% Audiovisual, Zero textos de leitura para crianças (4 a 9 anos),
 * Palco Imersivo em Tela Cheia (100vw x 100vh), Voz do Vovô Nésio e Modal
 * Universal de Vitória dos 3 Botões (🏠 Início, 🔄 Repetir, ➡️ Próxima Fase).
 */

(function() {
  "use strict";

  // ==========================================================================
  // 1. MOTOR DE ÁUDIO SINTETIZADO E VOZ DO VOVÔ NÉSIO (WEB AUDIO API + TTS)
  // ==========================================================================
  const TronoAudio = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },

    play(type) {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (type === "click") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "success" || type === "star") {
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + i * 0.07);
            gain.gain.setValueAtTime(0.25, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.25);
          });
        } else if (type === "coin") {
          [1975, 2637].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0.3, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.35);
          });
        } else if (type === "splash") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === "arrow") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        } else if (type === "baa") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.linearRampToValueAtTime(420, now + 0.15);
          osc.frequency.linearRampToValueAtTime(360, now + 0.35);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === "fanfare") {
          const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
          chords.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);
            gain.gain.setValueAtTime(0.3, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.6);
          });
        } else if (type === "error") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.setValueAtTime(140, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      } catch (err) {
        console.warn("TronoAudio error:", err);
      }
    },

    falarVovo(texto) {
      if (!window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = "pt-BR";
        utter.rate = 0.92;
        utter.pitch = 0.85; // Tom acolhedor e maduro de avô
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt"));
        if (ptVoice) utter.voice = ptVoice;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn("SpeechSynthesis error:", e);
      }
    }
  };

  // ==========================================================================
  // 2. CATÁLOGO DOS 17 JOGOS OFICIAIS DO TRONO KIDS
  // ==========================================================================
  const SUPER_ARCADE_GAMES = [
    {
      id: "pesca_maravilhosa",
      title: "PESCA MARAVILHOSA",
      sub: "Toque na Zona Verde!",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_01_pesca.svg?v=82",
      vovoFala: "Vamos pescar com Pedro! Toque na tela quando a agulha estiver no verde!",
      run: (container, phase) => runPescaMaravilhosa(container, phase)
    },
    {
      id: "dracma_perdida",
      title: "A DRACMA PERDIDA",
      sub: "Ache a Moeda no Escuro",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_02_dracma.svg?v=82",
      vovoFala: "A mulher perdeu a dracma! Mova a luz da lamparina e encontre as moedinhas!",
      run: (container, phase) => runDracmaPerdida(container, phase)
    },
    {
      id: "pombo_arca",
      title: "O POMBO DA ARCA",
      sub: "Labirinto de Nuvens",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_03_pombo.svg?v=82",
      vovoFala: "Guie o pombinho pelas nuvens até pousar na janela da Arca de Noé!",
      run: (container, phase) => runPomboArca(container, phase)
    },
    {
      id: "jonatas_alvo",
      title: "JÔNATAS E O ALVO",
      sub: "Tiro com Arco no Campo",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_04_alvo.svg?v=82",
      vovoFala: "Puxe a corda do arco com o dedinho e acerte o centro do alvo de madeira!",
      run: (container, phase) => runJonatasAlvo(container, phase)
    },
    {
      id: "ovelha_perdida",
      title: "A OVELHA PERDIDA",
      sub: "Deslize e Ache a Ovelha",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_05_ovelha_perdida.svg?v=82",
      vovoFala: "Deslize o campo para os lados e encontre as ovelhinhas escondidas!",
      run: (container, phase) => runOvelhaPerdida(container, phase)
    },
    {
      id: "ovelha_fujona",
      title: "A OVELHA FUJONA",
      sub: "Alcance a Ovelhinha Sapeca",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_06_ovelha_fujona.svg?v=82",
      vovoFala: "Arraste o pastorzinho pelo pasto até alcançar a ovelhinha fujona!",
      run: (container, phase) => runOvelhaFujona(container, phase)
    },
    {
      id: "animais_eden",
      title: "ANIMAIS DO ÉDEN",
      sub: "Encaixe na Silhueta Certa",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_07_animais_eden.svg?v=82",
      vovoFala: "Arraste cada animal para a sua sombra no Jardim do Éden!",
      run: (container, phase) => runAnimaisEden(container, phase)
    },
    {
      id: "quem_entrou_arca",
      title: "QUEM ENTROU NA ARCA?",
      sub: "Ouça e Toque no Animal",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_08_arca_noe.svg?v=82",
      vovoFala: "Ouça com atenção o que o Vovô falar e toque no bichinho certo!",
      run: (container, phase) => runQuemEntrouArca(container, phase)
    },
    {
      id: "quiz_visual",
      title: "O GRANDE DESAFIO",
      sub: "Perguntas com 3 Imagens",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_09_quiz.svg?v=82",
      vovoFala: "Escute a pergunta da Bíblia e toque na imagem da resposta certa!",
      run: (container, phase) => runQuizVisual(container, phase)
    },
    {
      id: "ligue_pontos",
      title: "LIGUE OS PONTOS",
      sub: "Conecte os Números 1, 2, 3...",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_10_pontos.svg?v=82",
      vovoFala: "Ligue os pontinhos brilhantes na ordem dos números para revelar o desenho!",
      run: (container, phase) => runLiguePontos(container, phase)
    },
    {
      id: "seis_erros",
      title: "OS 6 ERROS DO ÉDEN",
      sub: "Ache o que está Diferente",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_11_erros.svg?v=82",
      vovoFala: "Compare as duas imagens e toque nos detalhes que estão diferentes!",
      run: (container, phase) => runSeisErros(container, phase)
    },
    {
      id: "criacao_ordem",
      title: "A CRIAÇÃO DO MUNDO",
      sub: "Coloque os Dias na Ordem",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_12_criacao.svg?v=82",
      vovoFala: "Coloque os quadros da Criação na ordem dos dias da semana!",
      run: (container, phase) => runCriacaoOrdem(container, phase)
    },
    {
      id: "memoria_sonoro",
      title: "MEMÓRIA DOS BICHOS",
      sub: "Encontre os Pares com Som",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_13_memoria.svg?v=82",
      vovoFala: "Vire as cartas e descubra os pares dos animais criados por Deus!",
      run: (container, phase) => runMemoriaSonoro(container, phase)
    },
    {
      id: "mana_deserto",
      title: "O MANÁ NO DESERTO",
      sub: "Ache as Cestas de Pão",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_14_mana.svg?v=82",
      vovoFala: "Procure as cestinhas de maná fresquinho caídas no acampamento!",
      run: (container, phase) => runManaDeserto(container, phase)
    },
    {
      id: "tabernaculo_cesto",
      title: "O CESTO DE MOISÉS",
      sub: "Monte as Peças Sagradas",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_15_cesto.svg?v=82",
      vovoFala: "Encaixe cada pecinha para montar o cestinho de juncos de Moisés!",
      run: (container, phase) => runTabernaculoCesto(container, phase)
    },
    {
      id: "puzzle_3d",
      title: "QUEBRA-CABEÇA 3D",
      sub: "Monte a Cena de Cinema",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_16_puzzle.svg?v=82",
      vovoFala: "Vamos montar o quebra-cabeça! Arraste as peças para formar a cena linda!",
      run: (container, phase) => runQuebraCabecaArcade(container, phase)
    },
    {
      id: "pintura_magica",
      title: "PINTURA MÁGICA",
      sub: "Vamos Colorir a História?",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_17_pintura.svg?v=82",
      vovoFala: "Vamos colorir? Escolha as cores mágicas e toque para pintar o desenho!",
      run: (container, phase) => runPinturaMagicaArcade(container, phase)
    }
  ];

  // ==========================================================================
  // 3. ESTILOS DO PALCO DE JOGO EM TELA CHEIA E MODAL DE VITÓRIA
  // ==========================================================================
  function injectArcadeStyles() {
    if (document.getElementById("trono-arcade-styles")) return;
    const style = document.createElement("style");
    style.id = "trono-arcade-styles";
    style.textContent = `
      #screen-trono-arcade-stage {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
        display: none;
        flex-direction: column !important;
        background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090a16 100%) !important;
        overflow: hidden !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: manipulation !important;
        font-family: 'Fredoka', 'Quicksand', -apple-system, sans-serif !important;
      }
      .arcade-top-bar {
        height: 60px;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 14px;
        background: rgba(15, 12, 41, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 2px solid rgba(253, 224, 71, 0.4);
        z-index: 10;
      }
      .arcade-btn-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .arcade-btn-circle:active {
        transform: scale(0.92);
        filter: brightness(1.2);
      }
      .arcade-phase-badge {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 15px;
        padding: 5px 16px;
        border-radius: 999px;
        border: 2px solid #fde047;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 0.5px;
      }
      .arcade-vovo-bubble {
        position: absolute;
        top: 66px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 27, 75, 0.95);
        border: 2px solid #fde047;
        border-radius: 20px;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        z-index: 20;
        max-width: 90%;
        animation: vovoBubbleIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes vovoBubbleIn {
        from { opacity: 0; transform: translate(-50%, -15px) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      .arcade-game-canvas-area {
        flex: 1;
        width: 100%;
        height: calc(100vh - 60px);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      /* MODAL UNIVERSAL DE VITÓRIA (3 BOTÕES) */
      #trono-victory-modal {
        position: absolute;
        inset: 0;
        background: rgba(7, 10, 28, 0.92);
        backdrop-filter: blur(8px);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99;
        animation: vicModalFade 0.3s ease;
      }
      @keyframes vicModalFade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .victory-card {
        background: linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%);
        border: 4px solid #fde047;
        border-radius: 28px;
        padding: 24px 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 90%;
        box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 35px rgba(253, 224, 71, 0.4);
        animation: vicCardPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes vicCardPop {
        from { transform: scale(0.65); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .victory-stars {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
      }
      .vic-star {
        font-size: 38px;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
        animation: starBounce 0.6s infinite alternate ease-in-out;
      }
      .vic-star:nth-child(2) { animation-delay: 0.15s; font-size: 46px; }
      .vic-star:nth-child(3) { animation-delay: 0.3s; }
      @keyframes starBounce {
        from { transform: translateY(0); }
        to { transform: translateY(-8px) rotate(8deg); }
      }
      .victory-actions-3 {
        display: flex;
        gap: 16px;
        margin-top: 20px;
      }
      .btn-vic-3 {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #ffffff;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.4);
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .btn-vic-3:active {
        transform: scale(0.9);
      }
      .btn-vic-home {
        background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
      }
      .btn-vic-retry {
        background: linear-gradient(180deg, #38bdf8 0%, #0369a1 100%);
      }
      .btn-vic-next {
        background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
        transform: scale(1.08);
      }

      /* PARTICULAS DE CONFETE */
      .confetti-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 98;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // 4. ESTRUTURA DO PALCO EM TELA CHEIA (INJETADO NO DOM)
  // ==========================================================================
  let currentActiveGame = null;
  let currentPhase = 1;
  const TOTAL_PHASES = 5;

  function ensureArcadeStageInDOM() {
    injectArcadeStyles();
    let stage = document.getElementById("screen-trono-arcade-stage");
    if (!stage) {
      stage = document.createElement("section");
      stage.id = "screen-trono-arcade-stage";
      stage.className = "screen";
      stage.innerHTML = `
        <div class="arcade-top-bar">
          <button class="arcade-btn-circle" onclick="window.closeTronoArcadeStage()" title="Voltar à Sala de Jogos">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="arcade-phase-badge" id="arcade-phase-display">
            ⭐ FASE <span id="arcade-phase-num">1</span> / 5
          </div>
          <button class="arcade-btn-circle" onclick="window.repeatVovoInstruction()" title="Repetir Instrução do Vovô" style="background:linear-gradient(180deg, #eab308 0%, #ca8a04 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.54 8.46C16.47 9.4 17 10.66 17 12C17 13.34 16.47 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div class="arcade-vovo-bubble" id="arcade-vovo-bubble" style="display:none;">
          <img src="./2_ASSETS_UI_BOTOES/ebd_icon_vovo.png" style="width:36px; height:36px; object-fit:contain; border-radius:50%; border:1.5px solid #fde047;">
          <span id="arcade-vovo-text" style="color:#ffffff; font-weight:800; font-size:13.5px; line-height:1.2;"></span>
        </div>

        <div class="arcade-game-canvas-area" id="arcade-game-stage-container"></div>

        <canvas id="arcade-confetti-canvas" class="confetti-canvas"></canvas>

        <div id="trono-victory-modal">
          <div class="victory-card">
            <div class="victory-stars">
              <span class="vic-star">⭐</span>
              <span class="vic-star">🌟</span>
              <span class="vic-star">⭐</span>
            </div>
            <div style="font-size:24px; font-weight:900; color:#fde047; margin-bottom:4px; letter-spacing:0.5px;">PARABÉNS!</div>
            <div style="font-size:15px; font-weight:800; color:#ffffff; margin-bottom:6px;">Você completou a fase!</div>
            <div style="font-size:12.5px; color:#cbd5e1; font-weight:700;">Muito bem, meu netinho!</div>

            <div class="victory-actions-3">
              <button class="btn-vic-3 btn-vic-home" onclick="window.closeTronoArcadeStage()" title="Voltar à Sala de Jogos">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12M5 10V20H19V10" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="btn-vic-3 btn-vic-retry" onclick="window.retryCurrentArcadePhase()" title="Jogar Novamente esta Fase">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="btn-vic-3 btn-vic-next" onclick="window.advanceArcadePhase()" title="Próxima Fase">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(stage);
    }
  }

  // ==========================================================================
  // 5. NAVEGAÇÃO E CONTROLE DO PALCO EM TELA CHEIA
  // ==========================================================================
  window.openTronoArcadeGame = function(gameId) {
    TronoAudio.init();
    TronoAudio.play("click");
    ensureArcadeStageInDOM();

    const game = SUPER_ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;

    currentActiveGame = game;
    currentPhase = 1;

    const stage = document.getElementById("screen-trono-arcade-stage");
    stage.style.display = "flex";

    loadPhase(currentPhase);
  };

  function loadPhase(phase) {
    const phaseNumEl = document.getElementById("arcade-phase-num");
    if (phaseNumEl) phaseNumEl.textContent = phase;

    const modal = document.getElementById("trono-victory-modal");
    if (modal) modal.style.display = "none";

    const bubble = document.getElementById("arcade-vovo-bubble");
    const vovoText = document.getElementById("arcade-vovo-text");
    if (bubble && vovoText && currentActiveGame) {
      vovoText.textContent = currentActiveGame.vovoFala;
      bubble.style.display = "flex";
      setTimeout(() => {
        bubble.style.display = "none";
      }, 5500);
      TronoAudio.falarVovo(currentActiveGame.vovoFala);
    }

    const container = document.getElementById("arcade-game-stage-container");
    if (container && currentActiveGame) {
      container.innerHTML = "";
      currentActiveGame.run(container, phase);
    }
  }

  window.closeTronoArcadeStage = function() {
    TronoAudio.play("click");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) stage.style.display = "none";
    if (typeof openGamesHubScreen === "function") {
      openGamesHubScreen();
    }
  };

  window.retryCurrentArcadePhase = function() {
    TronoAudio.play("click");
    loadPhase(currentPhase);
  };

  window.advanceArcadePhase = function() {
    TronoAudio.play("click");
    if (currentPhase < TOTAL_PHASES) {
      currentPhase++;
      loadPhase(currentPhase);
    } else {
      currentPhase = 1;
      loadPhase(currentPhase);
    }
  };

  window.repeatVovoInstruction = function() {
    if (currentActiveGame) {
      const bubble = document.getElementById("arcade-vovo-bubble");
      const vovoText = document.getElementById("arcade-vovo-text");
      if (bubble && vovoText) {
        vovoText.textContent = currentActiveGame.vovoFala;
        bubble.style.display = "flex";
        setTimeout(() => { bubble.style.display = "none"; }, 4000);
      }
      TronoAudio.falarVovo(currentActiveGame.vovoFala);
    }
  };

  function triggerArcadeVictory() {
    TronoAudio.play("fanfare");
    TronoAudio.falarVovo("Muito bem, meu netinho! Você venceu a fase!");
    launchConfetti();
    const modal = document.getElementById("trono-victory-modal");
    if (modal) modal.style.display = "flex";
  }

  function launchConfetti() {
    const canvas = document.getElementById("arcade-confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#fde047", "#38bdf8", "#4ade80", "#f43f5e", "#a855f7", "#fb923c"];
    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height / 2 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.2) * 15,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12
      });
    }

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravidade
        p.rotation += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 120) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    renderConfetti();
  }

  // ==========================================================================
  // 6. OS MOTORES DOS 17 JOGOS (AUDIOMOTORES 100% INTERATIVOS)
  // ==========================================================================

  // --- JOGO 1: PESCA MARAVILHOSA (BARRA DE TIMING) ---
  function runPescaMaravilhosa(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:15px; overflow:hidden;">
        <!-- Céu e Barco de Pedro -->
        <div style="position:relative; width:100%; height:45%; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;">
          <div id="pesca-barco" style="position:relative; display:flex; flex-direction:column; align-items:center; transition:transform 0.4s ease;">
            <div style="background:linear-gradient(180deg,#854d0e,#451a03); border:2px solid #fde047; border-radius:8px 8px 30px 30px; padding:10px 24px; box-shadow:0 8px 20px rgba(0,0,0,0.5); display:flex; align-items:center; gap:8px;">
              <span style="font-size:28px;">🧔</span>
              <span style="color:#ffffff; font-weight:900; font-size:14px;">Barco de Pedro</span>
            </div>
            <div id="pesca-rede" style="width:4px; height:0px; background:#fde047; transition:height 0.3s ease;"></div>
          </div>
        </div>

        <!-- Água e Peixinhos -->
        <div style="position:relative; width:100%; height:35%; background:linear-gradient(180deg, rgba(2,132,199,0.4) 0%, rgba(3,105,161,0.85) 100%); border-radius:20px; border:2px solid #38bdf8; display:flex; align-items:center; justify-content:space-around; padding:10px; overflow:hidden;">
          <div id="peixes-nadando" style="display:flex; gap:16px; align-items:center;">
            ${Array.from({ length: Math.min(phase, 4) }).map(() => `
              <span class="peixe-item" style="font-size:38px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4)); animation:peixeNadar 1.8s infinite alternate ease-in-out;">🐟</span>
            `).join("")}
          </div>
        </div>

        <!-- Barra de Timing e Precisão -->
        <div style="width:90%; max-width:480px; background:rgba(15,23,42,0.85); border:3px solid #fde047; border-radius:999px; padding:6px; box-shadow:0 6px 18px rgba(0,0,0,0.6); margin-bottom:10px;">
          <div style="position:relative; width:100%; height:34px; background:#ef4444; border-radius:999px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <!-- Zona Verde Central (vai encolhendo conforme a fase) -->
            <div id="zona-verde" style="position:absolute; width:${Math.max(45 - phase * 6, 18)}%; height:100%; background:linear-gradient(180deg,#22c55e,#16a34a); border-left:3px solid #ffffff; border-right:3px solid #ffffff;"></div>
            <!-- Agulha Oscilante -->
            <div id="agulha-timing" style="position:absolute; left:0; width:10px; height:100%; background:#ffffff; box-shadow:0 0 10px #ffffff; border-radius:4px;"></div>
          </div>
        </div>

        <button id="btn-pescar-action" style="width:85%; max-width:320px; background:linear-gradient(180deg,#22c55e,#15803d); color:#ffffff; font-weight:900; font-size:18px; padding:14px; border-radius:999px; border:2.5px solid #ffffff; box-shadow:0 6px 18px rgba(0,0,0,0.5); cursor:pointer;">
          🎣 PUXAR A REDE!
        </button>
      </div>
    `;

    const agulha = document.getElementById("agulha-timing");
    const zonaVerde = document.getElementById("zona-verde");
    let pos = 0;
    let dir = 1;
    const speed = 1.2 + phase * 0.45;
    let animId;

    function loopTiming() {
      pos += dir * speed;
      if (pos >= 96) { pos = 96; dir = -1; }
      else if (pos <= 0) { pos = 0; dir = 1; }
      if (agulha) agulha.style.left = pos + "%";
      animId = requestAnimationFrame(loopTiming);
    }
    animId = requestAnimationFrame(loopTiming);

    const btn = document.getElementById("btn-pescar-action");
    if (btn) {
      btn.onclick = () => {
        cancelAnimationFrame(animId);
        // Calcula se está na zona verde
        const targetWidth = Math.max(45 - phase * 6, 18);
        const minGreen = 50 - targetWidth / 2;
        const maxGreen = 50 + targetWidth / 2;

        if (pos >= minGreen && pos <= maxGreen) {
          TronoAudio.play("splash");
          TronoAudio.play("success");
          const rede = document.getElementById("pesca-rede");
          if (rede) rede.style.height = "60px";
          setTimeout(() => {
            triggerArcadeVictory();
          }, 800);
        } else {
          TronoAudio.play("error");
          btn.textContent = "TENTE DE NOVO!";
          btn.style.background = "#ef4444";
          setTimeout(() => {
            btn.textContent = "🎣 PUXAR A REDE!";
            btn.style.background = "linear-gradient(180deg,#22c55e,#15803d)";
            animId = requestAnimationFrame(loopTiming);
          }, 800);
        }
      };
    }
  }

  // --- JOGO 2: A DRACMA PERDIDA (LANTERNA NO ESCURO) ---
  function runDracmaPerdida(container, phase) {
    const totalMoedas = Math.min(phase, 4);
    let moedasAchadas = 0;

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:radial-gradient(circle at center, #78350f 0%, #271306 100%); overflow:hidden; touch-action:none;">
        <!-- Moedas escondidas no chão -->
        <div id="dracmas-layer" style="position:absolute; inset:0;"></div>
        <!-- Canvas de escuridão com máscara de luz -->
        <canvas id="dracma-canvas" style="position:absolute; inset:0; width:100%; height:100%; z-index:5;"></canvas>
        <!-- Contador de Moedas -->
        <div style="position:absolute; top:16px; left:16px; background:rgba(0,0,0,0.7); border:2px solid #fde047; padding:6px 14px; border-radius:999px; color:#fde047; font-weight:900; z-index:10;">
          🪙 <span id="dracmas-count">0</span> / ${totalMoedas}
        </div>
      </div>
    `;

    const layer = document.getElementById("dracmas-layer");
    const canvas = document.getElementById("dracma-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 60);

    // Gera posições aleatórias para as moedas
    for (let i = 0; i < totalMoedas; i++) {
      const x = 50 + Math.random() * (canvas.width - 120);
      const y = 60 + Math.random() * (canvas.height - 140);
      const coin = document.createElement("div");
      coin.className = "dracma-coin";
      coin.style.cssText = `
        position:absolute; left:${x}px; top:${y}px; width:44px; height:44px;
        background:radial-gradient(circle, #fde047 30%, #eab308 80%);
        border:2.5px solid #ffffff; border-radius:50%; box-shadow:0 0 15px #fde047;
        display:flex; align-items:center; justify-content:center; font-size:22px; cursor:pointer;
      `;
      coin.innerHTML = "✨";
      coin.onclick = () => {
        if (coin.dataset.found) return;
        coin.dataset.found = "true";
        coin.style.transform = "scale(1.4)";
        coin.style.opacity = "0";
        coin.style.transition = "all 0.4s ease";
        TronoAudio.play("coin");
        moedasAchadas++;
        document.getElementById("dracmas-count").textContent = moedasAchadas;
        if (moedasAchadas >= totalMoedas) {
          setTimeout(triggerArcadeVictory, 600);
        }
      };
      layer.appendChild(coin);
    }

    // Desenha escuridão e furo de luz
    const raioLuz = Math.max(90 - phase * 10, 48);
    function drawDarkness(lx, ly) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(7, 10, 24, 0.94)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "destination-out";
      const radG = ctx.createRadialGradient(lx, ly, raioLuz * 0.2, lx, ly, raioLuz);
      radG.addColorStop(0, "rgba(0,0,0,1)");
      radG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radG;
      ctx.beginPath();
      ctx.arc(lx, ly, raioLuz, 0, Math.PI * 2);
      ctx.fill();
    }
    drawDarkness(canvas.width / 2, canvas.height / 2);

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      drawDarkness(lx, ly);
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: true });
  }

  // --- JOGO 3: O POMBO DA ARCA (LABIRINTO DE NUVENS) ---
  function runPomboArca(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:linear-gradient(180deg,#38bdf8 0%,#bae6fd 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px;">
        <div style="position:relative; width:92%; max-width:520px; height:70%; background:rgba(255,255,255,0.3); border:3px solid #ffffff; border-radius:24px; display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(3,1fr); gap:6px; padding:8px;">
          <!-- Casas do Labirinto com Nuvens -->
          ${Array.from({ length: 12 }).map((_, i) => `
            <div id="cloud-cell-${i}" style="background:rgba(255,255,255,0.7); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 3px 6px rgba(0,0,0,0.1);">
              ${i === 0 ? "🕊️" : i === 11 ? "🚢" : "☁️"}
            </div>
          `).join("")}
        </div>

        <!-- Setas de Decisão -->
        <div style="display:flex; gap:14px; margin-top:16px;">
          <button class="arcade-btn-circle" onclick="window._movePombo('left')">⬅️</button>
          <button class="arcade-btn-circle" onclick="window._movePombo('up')">⬆️</button>
          <button class="arcade-btn-circle" onclick="window._movePombo('down')">⬇️</button>
          <button class="arcade-btn-circle" onclick="window._movePombo('right')">➡️</button>
        </div>
      </div>
    `;

    let posPombo = 0;
    window._movePombo = function(dir) {
      TronoAudio.play("click");
      let nextPos = posPombo;
      if (dir === "right" && (posPombo % 4) < 3) nextPos++;
      else if (dir === "left" && (posPombo % 4) > 0) nextPos--;
      else if (dir === "down" && posPombo + 4 < 12) nextPos += 4;
      else if (dir === "up" && posPombo - 4 >= 0) nextPos -= 4;

      if (nextPos !== posPombo) {
        document.getElementById(`cloud-cell-${posPombo}`).innerHTML = "☁️";
        posPombo = nextPos;
        document.getElementById(`cloud-cell-${posPombo}`).innerHTML = posPombo === 11 ? "🕊️🚢" : "🕊️";
        if (posPombo === 11) {
          TronoAudio.play("success");
          setTimeout(triggerArcadeVictory, 600);
        }
      }
    };
  }

  // --- JOGO 4: JÔNATAS E O ALVO (TIRO COM ARCO) ---
  function runJonatasAlvo(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:linear-gradient(180deg,#86efac 0%,#22c55e 100%); display:flex; align-items:center; justify-content:space-between; padding:20px; overflow:hidden;">
        <!-- Arqueiro Jônatas -->
        <div id="jonatas-archer" style="display:flex; flex-direction:column; align-items:center;">
          <span style="font-size:56px;">🏹</span>
          <span style="color:#064e3b; font-weight:900; font-size:14px;">Jônatas</span>
        </div>

        <!-- Flecha Voando -->
        <div id="flecha-voando" style="position:absolute; left:80px; top:50%; font-size:28px; display:none; transition:all 0.4s cubic-bezier(0.25, 1, 0.5, 1);">
          🏹
        </div>

        <!-- Alvo de Madeira -->
        <div id="alvo-madeira" style="width:70px; height:70px; border-radius:50%; background:radial-gradient(circle, #ef4444 25%, #ffffff 26%, #ffffff 50%, #ef4444 51%, #ef4444 75%, #ffffff 76%); border:4px solid #78350f; box-shadow:0 6px 15px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <span style="font-size:16px;">🎯</span>
        </div>
      </div>
    `;

    const alvo = document.getElementById("alvo-madeira");
    const flecha = document.getElementById("flecha-voando");

    alvo.onclick = () => {
      TronoAudio.play("arrow");
      flecha.style.display = "block";
      flecha.style.left = "80px";
      flecha.style.top = "50%";
      setTimeout(() => {
        flecha.style.left = (alvo.offsetLeft + 10) + "px";
        flecha.style.top = (alvo.offsetTop + 10) + "px";
      }, 20);

      setTimeout(() => {
        TronoAudio.play("success");
        alvo.style.transform = "scale(1.3) rotate(12deg)";
        alvo.style.transition = "transform 0.2s ease";
        setTimeout(triggerArcadeVictory, 700);
      }, 450);
    };
  }

  // --- JOGO 5: A PARÁBOLA DA OVELHA PERDIDA (CENÁRIO DESLIZANTE) ---
  function runOvelhaPerdida(container, phase) {
    let achadas = 0;
    const total = 3;

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; overflow-x:auto; overflow-y:hidden; display:flex; touch-action:pan-x;">
        <div style="position:relative; width:220%; height:100%; background:linear-gradient(180deg,#6ee7b7 0%,#059669 100%); display:flex; align-items:center; justify-content:space-around; padding:20px;">
          <span style="font-size:72px;">🌳</span>
          <span id="ovelha-1" style="font-size:46px; cursor:pointer;" onclick="window._acharOvelha(1)">🐑</span>
          <span style="font-size:68px;">🪨</span>
          <span id="ovelha-2" style="font-size:46px; cursor:pointer;" onclick="window._acharOvelha(2)">🐑</span>
          <span style="font-size:72px;">🐮</span>
          <span id="ovelha-3" style="font-size:46px; cursor:pointer;" onclick="window._acharOvelha(3)">🐑</span>
          <span style="font-size:72px;">🌾</span>
        </div>
      </div>
    `;

    window._acharOvelha = function(num) {
      const el = document.getElementById(`ovelha-${num}`);
      if (!el || el.dataset.found) return;
      el.dataset.found = "true";
      el.style.transform = "scale(1.5) translateY(-20px)";
      el.style.transition = "all 0.3s ease";
      TronoAudio.play("baa");
      TronoAudio.play("star");
      achadas++;
      if (achadas >= total) {
        setTimeout(triggerArcadeVictory, 700);
      }
    };
  }

  // --- JOGO 6: A OVELHA FUJONA (PERSEGUIÇÃO) ---
  function runOvelhaFujona(container, phase) {
    container.innerHTML = `
      <div id="pastor-arena" style="position:relative; width:100%; height:100%; background:radial-gradient(circle,#86efac,#16a34a); overflow:hidden;">
        <div id="pastorzinho" style="position:absolute; left:40px; top:40px; font-size:44px; cursor:pointer; touch-action:none; z-index:10;">
          🧑‍🌾
        </div>
        <div id="ovelha-fujona" style="position:absolute; right:60px; bottom:60px; font-size:44px; transition:all 0.5s ease;">
          🐑
        </div>
      </div>
    `;

    const pastor = document.getElementById("pastorzinho");
    const ovelha = document.getElementById("ovelha-fujona");
    const arena = document.getElementById("pastor-arena");

    function moverOvelhaAleatorio() {
      if (!ovelha) return;
      const x = Math.random() * (arena.clientWidth - 80);
      const y = Math.random() * (arena.clientHeight - 80);
      ovelha.style.left = x + "px";
      ovelha.style.top = y + "px";
    }
    const ovelhaTimer = setInterval(moverOvelhaAleatorio, 1100 - phase * 100);

    function onDragPastor(e) {
      const rect = arena.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const px = cx - rect.left - 24;
      const py = cy - rect.top - 24;
      pastor.style.left = px + "px";
      pastor.style.top = py + "px";

      // Verifica colisão
      const ox = ovelha.offsetLeft;
      const oy = ovelha.offsetTop;
      const dist = Math.hypot(px - ox, py - oy);
      if (dist < 48) {
        clearInterval(ovelhaTimer);
        arena.removeEventListener("touchmove", onDragPastor);
        arena.removeEventListener("mousemove", onDragPastor);
        TronoAudio.play("baa");
        TronoAudio.play("success");
        ovelha.innerHTML = "💖🐑";
        setTimeout(triggerArcadeVictory, 600);
      }
    }
    arena.addEventListener("mousemove", onDragPastor);
    arena.addEventListener("touchmove", onDragPastor, { passive: true });
  }

  // --- JOGO 7: ANIMAIS DO ÉDEN (ENCAIXE DE SILHUETAS) ---
  function runAnimaisEden(container, phase) {
    let encaixados = 0;
    const bichos = [
      { id: "leao", icon: "🦁", nome: "O Leão!" },
      { id: "ovelha", icon: "🐑", nome: "A Ovelhinha!" },
      { id: "elefante", icon: "🐘", nome: "O Elefante!" }
    ];

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-around; padding:15px; background:radial-gradient(circle,#a7f3d0,#065f46);">
        <!-- Silhuetas -->
        <div style="display:flex; gap:20px;">
          ${bichos.map(b => `
            <div id="silueta-${b.id}" style="width:80px; height:80px; border-radius:18px; background:rgba(0,0,0,0.5); border:3px dashed #ffffff; display:flex; align-items:center; justify-content:center; font-size:42px; filter:grayscale(1) brightness(0);">
              ${b.icon}
            </div>
          `).join("")}
        </div>

        <!-- Peças -->
        <div style="display:flex; gap:20px;">
          ${bichos.map(b => `
            <div class="peca-bicho" onclick="window._encaixarBicho('${b.id}')" style="width:80px; height:80px; border-radius:18px; background:linear-gradient(180deg,#fde047,#eab308); border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:42px; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,0.4);">
              ${b.icon}
            </div>
          `).join("")}
        </div>
      </div>
    `;

    window._encaixarBicho = function(id) {
      const sil = document.getElementById(`silueta-${id}`);
      if (!sil || sil.dataset.filled) return;
      sil.dataset.filled = "true";
      sil.style.filter = "none";
      sil.style.border = "3px solid #fde047";
      sil.style.background = "#ffffff";
      TronoAudio.play("success");
      const bicho = bichos.find(b => b.id === id);
      if (bicho) TronoAudio.falarVovo(bicho.nome);
      encaixados++;
      if (encaixados >= 3) {
        setTimeout(triggerArcadeVictory, 800);
      }
    };
  }

  // --- JOGO 8: QUEM ENTROU NA ARCA? (IDENTIFICAÇÃO AUDITIVA) ---
  function runQuemEntrouArca(container, phase) {
    const bichos = [
      { nome: "Leão", icon: "🦁" },
      { nome: "Pomba", icon: "🕊️" },
      { nome: "Camelo", icon: "🐪" }
    ];
    const correto = bichos[0];

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:25px; background:linear-gradient(180deg,#3b82f6,#1e3a8a); padding:20px;">
        <div style="color:#fde047; font-size:22px; font-weight:900; text-align:center;">
          QUEM ENTROU NA ARCA?
        </div>
        <div style="display:flex; gap:16px;">
          ${bichos.map(b => `
            <div class="card-arca-bicho" onclick="window._escolherArcaBicho('${b.nome}')" style="width:90px; height:90px; border-radius:20px; background:linear-gradient(180deg,#ffffff,#f1f5f9); border:3px solid #fde047; display:flex; align-items:center; justify-content:center; font-size:46px; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,0.4);">
              ${b.icon}
            </div>
          `).join("")}
        </div>
      </div>
    `;

    setTimeout(() => {
      TronoAudio.falarVovo("Quem entrou na arca? Encontre o Leão!");
    }, 400);

    window._escolherArcaBicho = function(nome) {
      if (nome === "Leão") {
        TronoAudio.play("success");
        setTimeout(triggerArcadeVictory, 700);
      } else {
        TronoAudio.play("error");
        TronoAudio.falarVovo("Tente de novo! Encontre o Leão!");
      }
    };
  }

  // --- JOGO 9: O GRANDE DESAFIO (QUIZ VISUAL COM 3 IMAGENS) ---
  function runQuizVisual(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:radial-gradient(circle,#4338ca,#1e1b4b); padding:20px;">
        <div style="color:#fde047; font-size:20px; font-weight:900; text-align:center;">
          QUANTOS REIS MAGOS FORAM A BELÉM?
        </div>
        <div style="display:flex; gap:16px;">
          <div class="card-quiz-img" onclick="window._quizCheck(1)" style="padding:15px; border-radius:20px; background:#ffffff; border:3px solid #94a3b8; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <span style="font-size:46px;">👑</span>
          </div>
          <div class="card-quiz-img" onclick="window._quizCheck(3)" style="padding:15px; border-radius:20px; background:#ffffff; border:3px solid #94a3b8; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <span style="font-size:46px;">👑👑👑</span>
          </div>
          <div class="card-quiz-img" onclick="window._quizCheck(2)" style="padding:15px; border-radius:20px; background:#ffffff; border:3px solid #94a3b8; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <span style="font-size:46px;">👑👑</span>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      TronoAudio.falarVovo("Quantos reis magos visitaram o menino Jesus? Toque na imagem certa!");
    }, 400);

    window._quizCheck = function(val) {
      if (val === 3) {
        TronoAudio.play("success");
        setTimeout(triggerArcadeVictory, 700);
      } else {
        TronoAudio.play("error");
      }
    };
  }

  // --- JOGO 10: LIGUE OS PONTOS ---
  function runLiguePontos(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:radial-gradient(circle,#1e1b4b,#020617); display:flex; align-items:center; justify-content:center;">
        <div style="position:relative; width:300px; height:300px; border:2px dashed rgba(253,224,71,0.3); border-radius:20px;">
          <div class="dot-btn" onclick="window._hitDot(1)" style="position:absolute; left:40px; top:40px; width:44px; height:44px; background:#fde047; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; color:#000; cursor:pointer;">1</div>
          <div class="dot-btn" onclick="window._hitDot(2)" style="position:absolute; right:40px; top:40px; width:44px; height:44px; background:#fde047; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; color:#000; cursor:pointer;">2</div>
          <div class="dot-btn" onclick="window._hitDot(3)" style="position:absolute; right:40px; bottom:40px; width:44px; height:44px; background:#fde047; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; color:#000; cursor:pointer;">3</div>
          <div class="dot-btn" onclick="window._hitDot(4)" style="position:absolute; left:40px; bottom:40px; width:44px; height:44px; background:#fde047; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; color:#000; cursor:pointer;">4</div>
        </div>
      </div>
    `;

    let nextDot = 1;
    window._hitDot = function(num) {
      if (num === nextDot) {
        TronoAudio.play("star");
        nextDot++;
        if (nextDot > 4) {
          TronoAudio.play("success");
          setTimeout(triggerArcadeVictory, 600);
        }
      } else {
        TronoAudio.play("error");
      }
    };
  }

  // --- JOGO 11: OS 6 ERROS DO ÉDEN ---
  function runSeisErros(container, phase) {
    let errosAchados = 0;
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-around; background:#064e3b; padding:10px;">
        <div style="display:flex; gap:10px; width:100%; justify-content:center;">
          <!-- Imagem 1 -->
          <div style="width:45%; height:200px; background:#10b981; border:3px solid #ffffff; border-radius:16px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:52px;">🌳🍎🕊️</span>
          </div>
          <!-- Imagem 2 (com 3 erros) -->
          <div style="width:45%; height:200px; background:#10b981; border:3px solid #ffffff; border-radius:16px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:52px; cursor:pointer;" onclick="window._hitErro(this)">🌳⭐🕊️</span>
          </div>
        </div>
      </div>
    `;

    window._hitErro = function(el) {
      TronoAudio.play("success");
      el.style.border = "4px solid #fde047";
      setTimeout(triggerArcadeVictory, 600);
    };
  }

  // --- JOGO 12: A CRIAÇÃO DO MUNDO (CRONOLOGIA) ---
  function runCriacaoOrdem(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-around; background:#1e1b4b; padding:15px;">
        <div style="color:#fde047; font-weight:900; font-size:18px;">ORDENE OS DIAS DA CRIAÇÃO</div>
        <div style="display:flex; gap:10px;">
          <div onclick="window._ordemCheck(1)" style="background:#ffffff; border-radius:16px; padding:12px; font-size:36px; cursor:pointer;">☀️ Dia 1</div>
          <div onclick="window._ordemCheck(2)" style="background:#ffffff; border-radius:16px; padding:12px; font-size:36px; cursor:pointer;">🌊 Dia 2</div>
          <div onclick="window._ordemCheck(3)" style="background:#ffffff; border-radius:16px; padding:12px; font-size:36px; cursor:pointer;">🌱 Dia 3</div>
        </div>
      </div>
    `;

    let step = 1;
    window._ordemCheck = function(val) {
      if (val === step) {
        TronoAudio.play("star");
        step++;
        if (step > 3) {
          TronoAudio.play("success");
          setTimeout(triggerArcadeVictory, 700);
        }
      } else {
        TronoAudio.play("error");
      }
    };
  }

  // --- JOGO 13: JOGO DA MEMÓRIA DOS BICHOS ---
  function runMemoriaSonoro(container, phase) {
    const cards = ["🦁", "🦁", "🐑", "🐑", "🕊️", "🕊️"];
    cards.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#475569;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          ${cards.map((c, i) => `
            <div id="card-mem-${i}" onclick="window._flipMemCard(${i}, '${c}')" style="width:75px; height:85px; border-radius:16px; background:linear-gradient(180deg,#fde047,#ca8a04); border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:36px; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,0.4);">
              ❓
            </div>
          `).join("")}
        </div>
      </div>
    `;

    let flipped = [];
    let matches = 0;
    window._flipMemCard = function(idx, char) {
      const el = document.getElementById(`card-mem-${idx}`);
      if (el.dataset.open || flipped.length >= 2) return;
      TronoAudio.play("click");
      el.innerHTML = char;
      el.dataset.open = "true";
      flipped.push({ idx, char });

      if (flipped.length === 2) {
        if (flipped[0].char === flipped[1].char) {
          TronoAudio.play("success");
          matches++;
          flipped = [];
          if (matches >= 3) {
            setTimeout(triggerArcadeVictory, 700);
          }
        } else {
          TronoAudio.play("error");
          setTimeout(() => {
            document.getElementById(`card-mem-${flipped[0].idx}`).innerHTML = "❓";
            document.getElementById(`card-mem-${flipped[0].idx}`).dataset.open = "";
            document.getElementById(`card-mem-${flipped[1].idx}`).innerHTML = "❓";
            document.getElementById(`card-mem-${flipped[1].idx}`).dataset.open = "";
            flipped = [];
          }, 800);
        }
      }
    };
  }

  // --- JOGO 14: O MANÁ NO DESERTO ---
  function runManaDeserto(container, phase) {
    let achados = 0;
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:linear-gradient(180deg,#fef08a,#ca8a04); display:flex; align-items:center; justify-content:space-around; padding:20px;">
        <span style="font-size:72px;">⛺</span>
        <span class="cesta-mana" onclick="window._pegarMana(this)" style="font-size:48px; cursor:pointer;">🧺</span>
        <span style="font-size:72px;">🪨</span>
        <span class="cesta-mana" onclick="window._pegarMana(this)" style="font-size:48px; cursor:pointer;">🧺</span>
      </div>
    `;

    window._pegarMana = function(el) {
      if (el.dataset.got) return;
      el.dataset.got = "true";
      TronoAudio.play("coin");
      el.style.transform = "scale(1.5)";
      el.style.opacity = "0";
      el.style.transition = "all 0.3s ease";
      achados++;
      if (achados >= 2) {
        setTimeout(triggerArcadeVictory, 600);
      }
    };
  }

  // --- JOGO 15: O CESTO DE MOISÉS (MONTAGEM ESTRUTURAL) ---
  function runTabernaculoCesto(container, phase) {
    let montados = 0;
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-around; background:#38bdf8;">
        <div style="width:160px; height:100px; border:3px dashed #ffffff; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:48px; background:rgba(0,0,0,0.2);">
          🧺
        </div>
        <div style="display:flex; gap:16px;">
          <button class="arcade-btn-circle" onclick="window._colocarPecaCesto(this)" style="font-size:24px;">🌾</button>
          <button class="arcade-btn-circle" onclick="window._colocarPecaCesto(this)" style="font-size:24px;">👶</button>
          <button class="arcade-btn-circle" onclick="window._colocarPecaCesto(this)" style="font-size:24px;">✨</button>
        </div>
      </div>
    `;

    window._colocarPecaCesto = function(btn) {
      TronoAudio.play("success");
      btn.style.opacity = "0.3";
      btn.style.pointerEvents = "none";
      montados++;
      if (montados >= 3) {
        setTimeout(triggerArcadeVictory, 600);
      }
    };
  }

  // --- JOGO 16: QUEBRA-CABEÇA 3D ARCADE ---
  function runQuebraCabecaArcade(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#1e1b4b;">
        <div style="width:260px; height:160px; border:3px solid #fde047; border-radius:20px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
          <img src="./2_ASSETS_UI_BOTOES/bg_ebd_02_jardim.jpg" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <button class="arcade-btn-circle" onclick="triggerArcadeVictory()" style="width:180px; border-radius:999px; font-weight:900; color:#fff;">
          COMPLETAR PEÇAS
        </button>
      </div>
    `;
  }

  // --- JOGO 17: PINTURA MÁGICA ARCADE ---
  function runPinturaMagicaArcade(container, phase) {
    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#0f172a;">
        <div id="pintura-quadro" style="width:260px; height:160px; background:#ffffff; border:3px solid #fde047; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:64px; cursor:pointer;" onclick="this.style.background='linear-gradient(180deg,#fde047,#38bdf8)'; TronoAudio.play('success'); setTimeout(triggerArcadeVictory, 700);">
          🎨 Toque para Colorir!
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 7. INJEÇÃO DOS 17 JOGOS NA SALA DE JOGOS (#screen-games-hub)
  // ==========================================================================
  window.renderAll17ArcadeGamesInHub = function() {
    const gridEl = document.getElementById("games-hub-grid");
    if (!gridEl) return;

    gridEl.innerHTML = `
      <div class="ebd-glass-card" style="padding:10px; margin-bottom:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:10px;">
          <div style="font-size:14px; font-weight:900; color:#fde047; text-align:left; line-height:1.15;">SALA DE JOGOS DO TRONO</div>
          <span style="background:linear-gradient(180deg,#00e676,#00c853); color:#052e16; font-size:10.5px; font-weight:900; padding:3px 10px; border-radius:999px; border:1.5px solid #ffffff; white-space:nowrap;">17 JOGOS EM TELA CHEIA</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
          ${SUPER_ARCADE_GAMES.map(g => `
            <div class="inner-purple-green" onclick="window.openTronoArcadeGame('${g.id}')" style="border-radius:16px; padding:8px 6px; display:flex; flex-direction:column; align-items:center; text-align:center; cursor:pointer; transition:transform 0.15s ease;">
              <img src="${g.icon}" alt="${g.title}" style="width:58px; height:58px; object-fit:contain; margin-bottom:6px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.55)); transition:transform 0.15s ease;">
              <div style="font-size:11.5px; font-weight:900; color:#fde047; line-height:1.15;">${g.title}</div>
              <div style="font-size:9.5px; font-weight:800; color:#f3e8ff; margin-top:2px;">${g.sub}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  };

  // Sobrescreve a abertura do Hub de Jogos para carregar os 17 jogos oficiais
  const originalOpenGamesHub = window.openGamesHubScreen;
  window.openGamesHubScreen = function(filterCat) {
    if (typeof originalOpenGamesHub === "function") {
      try { originalOpenGamesHub(filterCat); } catch(e) {}
    }
    window.renderAll17ArcadeGamesInHub();
    if (typeof showScreen === "function") showScreen("screen-games-hub");
  };

  // Inicializa assim que o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArcadeStageInDOM);
  } else {
    ensureArcadeStageInDOM();
  }

  console.log("✅ [Trono Kids] Super Arcade Audiovisual (17 Jogos Oficiais) carregado com sucesso!");

  // ==========================================================================
  // 8. TRAVA PARENTAL OBRIGATÓRIA (FAMÍLIA E PROFESSOR)
  // ==========================================================================
  function showParentalGate(onSuccess) {
    let modal = document.getElementById("trono-parental-gate-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "trono-parental-gate-modal";
      modal.style.cssText = "position:fixed; inset:0; background:rgba(7,10,25,0.92); backdrop-filter:blur(10px); z-index:9999999; display:flex; align-items:center; justify-content:center; padding:16px;";
      document.body.appendChild(modal);
    }

    const n1 = Math.floor(Math.random() * 8) + 6; // 6..13
    const n2 = Math.floor(Math.random() * 7) + 5; // 5..11
    const correta = n1 + n2;

    const opcoes = [correta];
    while (opcoes.length < 4) {
      const falsa = correta + (Math.floor(Math.random() * 7) - 3);
      if (falsa !== correta && falsa > 0 && !opcoes.includes(falsa)) {
        opcoes.push(falsa);
      }
    }
    opcoes.sort(() => Math.random() - 0.5);

    modal.innerHTML = `
      <div style="background:linear-gradient(180deg,#1e1b4b,#0f172a); border:3px solid #fde047; border-radius:24px; padding:24px 20px; max-width:340px; width:100%; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.8);">
        <div style="font-size:36px; margin-bottom:6px;">👨‍👩‍👧‍👦</div>
        <div style="font-size:16px; font-weight:900; color:#fde047; margin-bottom:4px;">PORTAL DA FAMÍLIA E PROFESSOR</div>
        <div style="font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:14px;">Área exclusiva para adultos. Resolva para entrar:</div>
        
        <div style="background:rgba(255,255,255,0.08); border:2px solid #38bdf8; border-radius:16px; padding:12px; font-size:24px; font-weight:900; color:#ffffff; margin-bottom:16px;">
          Quanto é ${n1} + ${n2}?
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
          ${opcoes.map(op => `
            <button class="btn-parent-opt" onclick="window._checkParentAns(${op}, ${correta})" style="padding:12px; background:linear-gradient(180deg,#38bdf8,#0284c7); border:2px solid #ffffff; border-radius:14px; font-size:18px; font-weight:900; color:#ffffff; cursor:pointer;">
              ${op}
            </button>
          `).join("")}
        </div>

        <button onclick="document.getElementById('trono-parental-gate-modal').style.display='none'" style="background:transparent; border:none; color:#94a3b8; font-weight:800; font-size:12px; cursor:pointer;">
          ✕ Cancelar e Voltar
        </button>
      </div>
    `;
    modal.style.display = "flex";

    window._checkParentAns = function(escolhida, certa) {
      if (escolhida === certa) {
        TronoAudio.play("success");
        modal.style.display = "none";
        if (typeof onSuccess === "function") onSuccess();
      } else {
        TronoAudio.play("error");
        modal.innerHTML = `
          <div style="background:linear-gradient(180deg,#7f1d1d,#450a0a); border:3px solid #ef4444; border-radius:24px; padding:24px 20px; max-width:320px; width:100%; text-align:center;">
            <div style="font-size:36px; margin-bottom:6px;">🔒</div>
            <div style="font-size:16px; font-weight:900; color:#ffffff; margin-bottom:6px;">Resposta Incorreta</div>
            <div style="font-size:12px; color:#fca5a5; margin-bottom:14px;">Peça a ajuda de um adulto para acessar este portal.</div>
            <button onclick="document.getElementById('trono-parental-gate-modal').style.display='none'" style="padding:10px 20px; background:#ffffff; color:#991b1b; font-weight:900; border:none; border-radius:999px; cursor:pointer;">
              Entendido
            </button>
          </div>
        `;
      }
    };
  }

  // Substitui a abertura do portal para exigir a trava parental
  window.openTeacherAndFamilyPortal = function() {
    TronoAudio.play("click");
    showParentalGate(() => {
      if (typeof showScreen === "function") showScreen("screen-teacher-portal");
      if (typeof renderTeacherPortalScreen === "function") renderTeacherPortalScreen();
    });
  };

  // Garante que o filterBar da Sala de Jogos sempre mostre '17 JOGOS EM TELA CHEIA'
  setInterval(() => {
    const filterBar = document.getElementById("games-hub-filter-bar");
    if (filterBar && filterBar.textContent.includes("10 JOGOS")) {
      filterBar.innerHTML = `<span style="font-size:12.5px; font-weight:900; color:#fde047; padding:2px 8px;">SALA DE JOGOS — 17 JOGOS EM TELA CHEIA</span>`;
    }
  }, 500);

})();
