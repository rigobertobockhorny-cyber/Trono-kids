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

    falarVovo(audioFile) {
      if (this.vovoPlayer) {
        try {
          this.vovoPlayer.pause();
          this.vovoPlayer.currentTime = 0;
        } catch (e) {}
      }
      if (!audioFile) return;
      try {
        const src = `./6_ASSETS_AUDIO/jogos_vovo/${audioFile}?v=91`;
        this.vovoPlayer = new Audio(src);
        this.vovoPlayer.play().catch(err => {
          console.warn("Audio play prevented:", err);
        });
      } catch (e) {
        console.warn("TronoAudio error:", e);
      }
    },

    tocarVitoria() {
      this.play("success");
      setTimeout(() => {
        this.falarVovo("vovo_vitoria.mp3");
      }, 400);
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
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_01_pesca.svg?v=91",
      audioFile: "vovo_jogo_01.mp3",
      vovoFala: "Vamos pescar com Pedro! Toque na tela quando a agulha estiver no verde!",
      run: (container, phase) => runPescaMaravilhosa(container, phase)
    },
    {
      id: "dracma_perdida",
      title: "A DRACMA PERDIDA",
      sub: "Ache a Moeda no Escuro",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_02_dracma.svg?v=91",
      audioFile: "vovo_jogo_02.mp3",
      vovoFala: "A mulher perdeu a dracma! Mova a luz da lamparina e encontre as moedinhas!",
      run: (container, phase) => runDracmaPerdida(container, phase)
    },
    {
      id: "pombo_arca",
      title: "O POMBO DA ARCA",
      sub: "Labirinto de Nuvens",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_03_pombo.svg?v=91",
      audioFile: "vovo_jogo_03.mp3",
      vovoFala: "Guie o pombinho pelas nuvens até pousar na janela da Arca de Noé!",
      run: (container, phase) => runPomboArca(container, phase)
    },
    {
      id: "jonatas_alvo",
      title: "JÔNATAS E O ALVO",
      sub: "Tiro com Arco no Campo",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_04_alvo.svg?v=91",
      audioFile: "vovo_jogo_04.mp3",
      vovoFala: "Puxe a corda do arco com o dedinho e acerte o centro do alvo de madeira!",
      run: (container, phase) => runJonatasAlvo(container, phase)
    },
    {
      id: "ovelha_perdida",
      title: "A OVELHA PERDIDA",
      sub: "Deslize e Ache a Ovelha",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_05_ovelha_perdida.svg?v=91",
      audioFile: "vovo_jogo_05.mp3",
      vovoFala: "Deslize o campo para os lados e encontre as ovelhinhas escondidas!",
      run: (container, phase) => runOvelhaPerdida(container, phase)
    },
    {
      id: "ovelha_fujona",
      title: "A OVELHA FUJONA",
      sub: "Alcance a Ovelhinha Sapeca",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_06_ovelha_fujona.svg?v=91",
      audioFile: "vovo_jogo_06.mp3",
      vovoFala: "Arraste o pastorzinho pelo pasto até alcançar a ovelhinha fujona!",
      run: (container, phase) => runOvelhaFujona(container, phase)
    },
    {
      id: "animais_eden",
      title: "ANIMAIS DO ÉDEN",
      sub: "Encaixe na Silhueta Certa",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_07_animais_eden.svg?v=91",
      audioFile: "vovo_jogo_07.mp3",
      vovoFala: "Arraste cada animal para a sua sombra no Jardim do Éden!",
      run: (container, phase) => runAnimaisEden(container, phase)
    },
    {
      id: "quem_entrou_arca",
      title: "QUEM ENTROU NA ARCA?",
      sub: "Ouça e Toque no Animal",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_08_arca_noe.svg?v=91",
      audioFile: "vovo_jogo_08.mp3",
      vovoFala: "Ouça com atenção o que o Vovô falar e toque no bichinho certo!",
      run: (container, phase) => runQuemEntrouArca(container, phase)
    },
    {
      id: "quiz_visual",
      title: "O GRANDE DESAFIO",
      sub: "Perguntas com 3 Imagens",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_09_quiz.svg?v=91",
      audioFile: "vovo_jogo_09.mp3",
      vovoFala: "Escute a pergunta da Bíblia e toque na imagem da resposta certa!",
      run: (container, phase) => runQuizVisual(container, phase)
    },
    {
      id: "ligue_pontos",
      title: "LIGUE OS PONTOS",
      sub: "Conecte os Números 1, 2, 3...",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_10_pontos.svg?v=91",
      audioFile: "vovo_jogo_10.mp3",
      vovoFala: "Ligue os pontinhos brilhantes na ordem dos números para revelar o desenho!",
      run: (container, phase) => runLiguePontos(container, phase)
    },
    {
      id: "seis_erros",
      title: "OS 6 ERROS DO ÉDEN",
      sub: "Ache o que está Diferente",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_11_erros.svg?v=91",
      audioFile: "vovo_jogo_11.mp3",
      vovoFala: "Compare as duas imagens e toque nos detalhes que estão diferentes!",
      run: (container, phase) => runSeisErros(container, phase)
    },
    {
      id: "criacao_ordem",
      title: "A CRIAÇÃO DO MUNDO",
      sub: "Coloque os Dias na Ordem",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_12_criacao.svg?v=91",
      audioFile: "vovo_jogo_12.mp3",
      vovoFala: "Coloque os quadros da Criação na ordem dos dias da semana!",
      run: (container, phase) => runCriacaoOrdem(container, phase)
    },
    {
      id: "memoria_sonoro",
      title: "MEMÓRIA DOS BICHOS",
      sub: "Encontre os Pares com Som",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_13_memoria.svg?v=91",
      audioFile: "vovo_jogo_13.mp3",
      vovoFala: "Vire as cartas e descubra os pares dos animais criados por Deus!",
      run: (container, phase) => runMemoriaSonoro(container, phase)
    },
    {
      id: "mana_deserto",
      title: "O MANÁ NO DESERTO",
      sub: "Ache as Cestas de Pão",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_14_mana.svg?v=91",
      audioFile: "vovo_jogo_14.mp3",
      vovoFala: "Procure as cestinhas de maná fresquinho caídas no acampamento!",
      run: (container, phase) => runManaDeserto(container, phase)
    },
    {
      id: "tabernaculo_cesto",
      title: "O CESTO DE MOISÉS",
      sub: "Monte as Peças Sagradas",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_15_cesto.svg?v=91",
      audioFile: "vovo_jogo_15.mp3",
      vovoFala: "Encaixe cada pecinha para montar o cestinho de juncos de Moisés!",
      run: (container, phase) => runTabernaculoCesto(container, phase)
    },
    {
      id: "puzzle_3d",
      title: "QUEBRA-CABEÇA 3D",
      sub: "Monte a Cena de Cinema",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_16_puzzle.svg?v=91",
      audioFile: "vovo_jogo_16.mp3",
      vovoFala: "Vamos montar o quebra-cabeça! Arraste as peças para formar a cena linda!",
      run: (container, phase) => runQuebraCabecaArcade(container, phase)
    },
    {
      id: "pintura_magica",
      title: "PINTURA MÁGICA",
      sub: "Vamos Colorir a História?",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_17_pintura.svg?v=91",
      audioFile: "vovo_jogo_17.mp3",
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
        z-index: 9999999 !important;
        display: none !important;
        flex-direction: column !important;
        background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090a16 100%) !important;
        overflow: hidden !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: manipulation !important;
        font-family: 'Fredoka', 'Quicksand', -apple-system, sans-serif !important;
      }
      #screen-trono-arcade-stage.active {
        display: flex !important;
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

      
      /* ANIMAÇÕES PESCA MARAVILHOSA */
      @keyframes balancoBarcoReal {
        0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
        50% { transform: translateY(8px) rotate(1.8deg); }
      }
      @keyframes ondasSuperficie {
        0% { transform: translateX(0); }
        50% { transform: translateX(-30px); }
        100% { transform: translateX(0); }
      }
      @keyframes peixeNadoSuave {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-7px) rotate(2deg); }
      }
      @keyframes bolhasSubindo {
        0% { transform: translateY(140px) scale(0.6); opacity: 0; }
        30% { opacity: 0.7; }
        100% { transform: translateY(-60px) scale(1.1); opacity: 0; }
      }

      
      @keyframes starTrophyPulse {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.12) rotate(4deg); }
      }
      @keyframes aliveBtnFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes titlePopBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.04); }
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
  const TOTAL_PHASES = 15;
  const FREE_PHASES = 5;


  let arcadeDevTapCount = 0;
  let arcadeDevTapTimer = null;
  window.handleArcadeDevTap = function() {
    arcadeDevTapCount++;
    if (arcadeDevTapTimer) clearTimeout(arcadeDevTapTimer);
    arcadeDevTapTimer = setTimeout(() => { arcadeDevTapCount = 0; }, 2000);
    if (arcadeDevTapCount >= 3) {
      arcadeDevTapCount = 0;
      if (typeof window.openDeveloperDialog === 'function') {
        window.openDeveloperDialog();
        const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
        const totalEl = document.getElementById("arcade-phase-total");
        if (totalEl) totalEl.textContent = isVip ? "15" : "5";
      } else {
        const pass = prompt("🔐 Senha do Desenvolvedor (Liberar 15 Fases):");
        if (pass && pass.trim() === "12345") {
          localStorage.setItem('trono_vip_active_v4', '1');
          if (typeof isVipUnlocked !== 'undefined') isVipUnlocked = true;
          const totalEl = document.getElementById("arcade-phase-total");
          if (totalEl) totalEl.textContent = "15";
          alert("🛠️ Senha 12345 aceita! 15 Fases Liberadas no Arcade!");
        } else if (pass) {
          alert("❌ Senha incorreta!");
        }
      }
    }
  };

  function ensureArcadeStageInDOM() {
    injectArcadeStyles();
    let stage = document.getElementById("screen-trono-arcade-stage");
    if (!stage) {
      stage = document.createElement("section");
      stage.id = "screen-trono-arcade-stage";
      stage.className = "trono-fullscreen-stage";
      stage.innerHTML = `
        <div class="arcade-top-bar">
          <button class="arcade-btn-circle" onclick="window.closeTronoArcadeStage()" title="Voltar à Sala de Jogos">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="arcade-phase-badge" id="arcade-phase-display" onclick="window.handleArcadeDevTap()" style="cursor:pointer;" title="Toque 3x para Modo Desenvolvedor (12345)">
            ⭐ FASE <span id="arcade-phase-num">1</span> / <span id="arcade-phase-total">5</span>
          </div>
          <button class="arcade-btn-circle" onclick="window.repeatVovoInstruction()" title="Repetir Instrução do Vovô" style="background:linear-gradient(180deg, #eab308 0%, #ca8a04 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.54 8.46C16.47 9.4 17 10.66 17 12C17 13.34 16.47 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <!-- Área de Jogo Limpa (Sem balões de texto bloqueando a tela) -->
        <div class="arcade-game-canvas-area" id="arcade-game-stage-container"></div>

        <canvas id="arcade-confetti-canvas" class="confetti-canvas"></canvas>

        <!-- MODAL CANÔNICO DE VITÓRIA (IDENTIDADE VISUAL PADRÃO TRONO KIDS) -->
        <div id="trono-victory-modal"></div>
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
    if (stage) {
      stage.classList.add("active");
      stage.style.display = "flex";
    }

    loadPhase(currentPhase);
  };

  function loadPhase(phase) {
    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const phaseNumEl = document.getElementById("arcade-phase-num");
    if (phaseNumEl) phaseNumEl.textContent = phase;
    const phaseTotalEl = document.getElementById("arcade-phase-total");
    if (phaseTotalEl) phaseTotalEl.textContent = isVip ? "15" : "5";

    const modal = document.getElementById("trono-victory-modal");
    if (modal) modal.style.display = "none";

    // O Vovô Nésio fala a instrução apenas em áudio (tela 100% limpa, sem texto)
    if (currentActiveGame && currentActiveGame.audioFile) {
      TronoAudio.falarVovo(currentActiveGame.audioFile);
    }

    const container = document.getElementById("arcade-game-stage-container");
    if (container && currentActiveGame) {
      container.innerHTML = "";
      currentActiveGame.run(container, phase);
    }
  }

  window.closeTronoArcadeStage = function() {
    TronoAudio.play("click");
    if (TronoAudio.vovoPlayer) { try { TronoAudio.vovoPlayer.pause(); } catch(e){} }
    if (celebrationClapAudio) { try { celebrationClapAudio.pause(); } catch(e){} }
    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) {
      stage.classList.remove("active");
      stage.style.display = "none";
    }
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
    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';

    if (currentPhase < FREE_PHASES) {
      currentPhase++;
      loadPhase(currentPhase);
    } else if (currentPhase === FREE_PHASES) {
      if (isVip) {
        currentPhase++;
        loadPhase(currentPhase);
      } else {
        if (typeof openModal === 'function') {
          openModal('modal-subscribe');
        } else {
          alert("Assine o Clube Trono Kids para liberar mais 10 fases exclusivas!");
        }
      }
    } else if (currentPhase < TOTAL_PHASES) {
      currentPhase++;
      loadPhase(currentPhase);
    } else {
      window.closeTronoArcadeStage();
    }
  };

  window.repeatVovoInstruction = function() {
    if (currentActiveGame && currentActiveGame.audioFile) {
      TronoAudio.falarVovo(currentActiveGame.audioFile);
    }
  };

  let celebrationClapAudio = null;

  function triggerArcadeVictory() {
    // 1. Crianças aplaudindo e comemorando ("êêê!")
    try {
      if (!celebrationClapAudio) {
        celebrationClapAudio = new Audio('./6_ASSETS_AUDIO/11_festa_comemoracao_aplausos.wav');
      }
      celebrationClapAudio.currentTime = 0;
      celebrationClapAudio.volume = 1.0;
      celebrationClapAudio.play().catch(() => {});
    } catch(e) {}

    // 2. Voz afetuosa e neutra do Vovô Nésio
    setTimeout(() => {
      TronoAudio.falarVovo("vovo_vitoria.mp3");
    }, 450);

    // 3. Chuva de confetes coloridos
    launchConfetti();

    // 4. Monta e exibe o CARD CANÔNICO OFICIAL DO TRONO KIDS
    renderCanonicalVictoryModal();
  }

  function renderCanonicalVictoryModal() {
    const modal = document.getElementById("trono-victory-modal");
    if (!modal) return;

    const game = currentActiveGame || {
      title: "Pesca Maravilhosa",
      sub: "Lance a Rede com Pedro",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_01_pesca.svg?v=91"
    };

    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const current = currentPhase || 1;

    let dotsHtml = "";
    if (!isVip) {
      // 5 Bolinhas Gratuitas (1 a 5) + 6ª Bolinha com Cadeadinho VIP
      for (let i = 1; i <= 5; i++) {
        const isJustWon = i === current;
        const isDone = i < current || (current >= 5 && i <= 5);
        const bg = (isJustWon || isDone)
          ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)"
          : "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)";
        const border = isJustWon ? "3px solid #fde047" : "2px solid #ffffff";
        const shadow = isJustWon
          ? "box-shadow: 0 0 16px rgba(253,224,71,0.95), 0 4px 10px rgba(0,0,0,0.5);"
          : "box-shadow: 0 4px 8px rgba(0,0,0,0.4);";
        const starIcon = (isJustWon || (current >= 5 && i === 5))
          ? `<img src="./2_ASSETS_UI_BOTOES/ui_icon_06.png" style="position:absolute; top:-14px; right:-8px; width:22px; height:22px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));" alt="Estrela">`
          : "";

        dotsHtml += `
          <div style="position:relative; width:44px; height:44px; border-radius:50%; background:${bg}; border:${border}; ${shadow} display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:18px;">
            <span>${i}</span>
            ${starIcon}
          </div>
        `;
      }

      // 6ª Bolinha com Cadeadinho Dourado (+10 Fases VIP)
      dotsHtml += `
        <div onclick="if(typeof openModal === 'function') openModal('modal-subscribe');" style="position:relative; width:44px; height:44px; border-radius:50%; background:linear-gradient(180deg, #f59e0b 0%, #b45309 100%); border:2.5px solid #fde047; box-shadow:0 0 14px rgba(253,224,71,0.7), 0 4px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:20px; cursor:pointer;" title="Liberar +10 Fases VIP">
          <span>🔒</span>
        </div>
      `;
    } else {
      // Jogador VIP: mostra o bloco das 15 fases
      const batchStart = Math.floor((current - 1) / 5) * 5 + 1;
      for (let i = batchStart; i < batchStart + 5 && i <= 15; i++) {
        const isJustWon = i === current;
        const isDone = i < current;
        const bg = (isJustWon || isDone)
          ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)"
          : "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)";
        const border = isJustWon ? "3px solid #fde047" : "2px solid #ffffff";
        dotsHtml += `
          <div style="position:relative; width:44px; height:44px; border-radius:50%; background:${bg}; border:${border}; display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:18px;">
            <span>${i}</span>
          </div>
        `;
      }
    }

    let actionsHtml = "";
    if (!isVip && current >= 5) {
      actionsHtml = `
        <button id="btn-canonical-continue" style="position:relative; z-index:2; width:100%; padding:15px; font-size:18px; font-weight:900; color:#ffffff; background:linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border:2.5px solid #fde047; border-radius:999px; box-shadow:0 0 22px rgba(245,158,11,0.85), 0 6px 16px rgba(0,0,0,0.75); cursor:pointer; text-shadow:0 2px 4px rgba(0,0,0,0.5); animation:aliveBtnFloat 1.9s ease-in-out infinite;" onclick="if(typeof openModal === 'function') openModal('modal-subscribe');">
          🔓 LIBERAR +10 FASES VIP!
        </button>
        <div onclick="window.closeTronoArcadeStage()" style="margin-top:14px; color:#fef08a; font-weight:800; font-size:15px; cursor:pointer; text-decoration:underline;">
          Voltar à Sala de Jogos
        </div>
      `;
    } else {
      const btnText = (isVip && current >= 15) ? "🎉 FINALIZAR JOGUINHO!" : "CONTINUAR BRINCANDO";
      actionsHtml = `
        <button id="btn-canonical-continue" style="position:relative; z-index:2; width:100%; padding:15px; font-size:19px; font-weight:900; color:#ffffff; background:linear-gradient(180deg, #00e676 0%, #00c853 100%); border:2.5px solid #ffffff; border-radius:999px; box-shadow:0 0 22px rgba(0,230,118,0.85), 0 6px 16px rgba(0,0,0,0.75); cursor:pointer; text-shadow:0 2px 4px rgba(0,0,0,0.5); animation:aliveBtnFloat 1.9s ease-in-out infinite; transition:transform 0.15s ease;" onclick="window.advanceArcadePhase()">
          ${btnText}
        </button>
      `;
    }

    modal.innerHTML = `
      <div class="canonical-victory-card" style="width:90%; max-width:340px; padding:24px 18px; border:3.5px solid #fde047; border-radius:28px; background:linear-gradient(180deg, #aa00ff 0%, #581c87 100%); box-shadow:0 0 32px rgba(170,0,255,0.85), 0 18px 44px rgba(0,0,0,0.95); text-align:center; position:relative; overflow:hidden; animation:vicCardPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <!-- 1. Único Ícone 3D Oficial do Jogo no Topo -->
        <div style="position:relative; z-index:2; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
          <img src="${game.icon}" style="width:84px; height:84px; object-fit:contain; border-radius:22px; border:3px solid #fde047; background:rgba(255,255,255,0.15); box-shadow:0 0 20px rgba(253,224,71,0.8), 0 8px 16px rgba(0,0,0,0.7); animation:aliveBtnFloat 2.0s ease-in-out infinite;" alt="${game.title}">
        </div>

        <!-- 2. Título Amarelo Dourado Brilhante (Somente isso!) -->
        <div style="position:relative; z-index:2; font-size:27px; font-weight:900; color:#fde047; text-shadow:0 3px 8px rgba(0,0,0,0.9); line-height:1.15; margin-bottom:18px; letter-spacing:0.5px; animation:titlePopBounce 1.4s ease-in-out infinite;">
          PARABÉNS! MUITO BEM!
        </div>

        <!-- 3. Bolinhas de Progresso (1 a 5 + 🔒) -->
        <div style="position:relative; z-index:2; display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:22px; min-height:50px;">
          ${dotsHtml}
        </div>

        <!-- 4. Ações de Vitória -->
        ${actionsHtml}
      </div>
    `;

    modal.style.display = "flex";
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
        p.vy += 0.35;
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

  // --- JOGO 1: PESCA MARAVILHOSA (BARRA DE TIMING) ---
  function runPescaMaravilhosa(container, phase) {
    // Curva Suave Rigoberto: Fase 1 a 5 fáceis e amigáveis; Fase 15 nível mestre!
    const targetWidth = Math.max(46 - phase * 1.85, 18);
    const speed = 0.95 + phase * 0.115;

    // REGRA DE OURO RIGOBERTO: Fase 1 = 1 peixinho, Fase 2 = 2 peixinhos, Fase 3 = 3 peixinhos...
    const totalPeixes = Math.min(phase, 5);

    // Peixes nadando na água turquesa cristalina da pintura 3D Pixar
    const peixesPos = [
      { top: "69%", left: "calc(50% - 35px)", delay: "0s", dur: "3.0s", size: "60px", isBlue: false },
      { top: "64%", left: "calc(50% - 95px)", delay: "0.4s", dur: "3.3s", size: "54px", isBlue: true },
      { top: "74%", left: "calc(50% + 35px)", delay: "0.8s", dur: "2.8s", size: "58px", isBlue: false },
      { top: "66%", left: "calc(50% + 75px)", delay: "0.2s", dur: "3.5s", size: "52px", isBlue: true },
      { top: "77%", left: "calc(50% - 80px)", delay: "1.0s", dur: "3.1s", size: "56px", isBlue: false }
    ];

    const peixesHtml = peixesPos.slice(0, totalPeixes).map((p, idx) => {
      const src = p.isBlue ? "./2_ASSETS_UI_BOTOES/peixinho_pesca_azul.svg?v=94" : "./2_ASSETS_UI_BOTOES/peixinho_pesca.svg?v=94";
      return `
        <div class="peixe-rio-item" id="peixe-rio-${idx}" style="position:absolute; top:${p.top}; left:${p.left}; width:${p.size}; height:auto; animation:peixeNadoSuave ${p.dur} infinite ease-in-out ${p.delay}; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transition:all 0.4s ease;">
          <img src="${src}" style="width:100%; height:auto;" alt="Peixinho da Pesca">
        </div>
      `;
    }).join("");

    // Peixes capturados dentro da rede (EXATAMENTE a mesma quantidade da fase)
    const peixesNaRedeHtml = Array.from({ length: totalPeixes }).map((_, i) => {
      const isBlue = i % 2 === 1;
      const src = isBlue ? "./2_ASSETS_UI_BOTOES/peixinho_pesca_azul.svg?v=94" : "./2_ASSETS_UI_BOTOES/peixinho_pesca.svg?v=94";
      const rot = (i % 2 === 0 ? -12 : 16) + (i * 6);
      const size = Math.max(54 - i * 3, 40);
      return `<img src="${src}" style="width:${size}px; height:auto; transform:rotate(${rot}deg); margin:0 -6px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">`;
    }).join("");

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; overflow:hidden; user-select:none; touch-action:none; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 35%, #0369a1 70%, #0c4a6e 100%);">
        <!-- 0. IMAGEM OFICIAL 3D PIXAR COM CARREGAMENTO IMEDIATO E ALTA PRIORIDADE -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_pesca_maravilhosa_3d.jpg?v=94" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; z-index:0;" alt="Cenário 3D Pesca Maravilhosa" loading="eager" decoding="async">
        <!-- 1. CAMADA DE PROFUNDIDADE CINEMATOGRÁFICA 3D PIXAR -->
        <!-- Brilho dourado celestial sutil no céu -->
        <div style="position:absolute; top:0; left:0; width:100%; height:35%; pointer-events:none; background:radial-gradient(circle at 18% 38%, rgba(254, 240, 138, 0.28) 0%, rgba(253, 224, 71, 0.08) 50%, transparent 80%);"></div>

        <!-- Efeito sutil de luz solar nas águas cristalinas -->
        <div style="position:absolute; bottom:0; left:0; width:100%; height:55%; pointer-events:none; background:linear-gradient(180deg, rgba(2, 132, 199, 0.0) 0%, rgba(3, 105, 161, 0.25) 50%, rgba(12, 74, 110, 0.55) 100%);"></div>

        <!-- Respingo de Água (Splash) 3D Centralizado nas Águas -->
        <div id="pesca-splash" style="position:absolute; top:43%; left:0; right:0; margin:0 auto; transform:scale(0.2); width:160px; height:50px; border-radius:50%; border:3px solid #ffffff; background:radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(56,189,248,0.6) 60%, rgba(2,132,199,0) 100%); z-index:22; opacity:0; pointer-events:none; transition:all 0.4s ease-out; box-shadow:0 0 20px rgba(56, 189, 248, 0.9);"></div>

        <!-- Corda de Tração dourada descendo do barco de Pedro para a Rede -->
        <div id="pesca-corda-conexao" style="position:absolute; top:36%; left:0; right:0; margin:0 auto; width:3.5px; height:0px; background:linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%); box-shadow:0 0 6px #ffffff, 0 0 14px rgba(56, 189, 248, 0.8); z-index:18; opacity:0; transition:all 0.5s ease-out; pointer-events:none;"></div>

        <!-- 3. ÁREA DAS ÁGUAS CRISTALINAS DA GALILEIA COM PEIXES -->
        <div id="pesca-riozao" style="position:relative; flex:1; width:100%; overflow:hidden;">
          <!-- Raios de sol subaquáticos cristalinos -->
          <div style="position:absolute; inset:0; opacity:0.14; pointer-events:none; background:repeating-linear-gradient(75deg, rgba(255,255,255,0.45) 0px, rgba(255,255,255,0.45) 22px, transparent 22px, transparent 70px);"></div>

          <!-- Bolhinhas mágicas subindo nas águas límpidas -->
          <div style="position:absolute; left:14%; bottom:25%; width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.6); border:1px solid #ffffff; animation:bolhasSubindo 3.5s infinite ease-in;"></div>
          <div style="position:absolute; right:18%; bottom:35%; width:13px; height:13px; border-radius:50%; background:rgba(255,255,255,0.5); border:1px solid #ffffff; animation:bolhasSubindo 4.2s infinite ease-in 1.2s;"></div>
          <div style="position:absolute; left:52%; bottom:18%; width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.7); border:1px solid #ffffff; animation:bolhasSubindo 2.8s infinite ease-in 0.6s;"></div>

          <!-- Cardume de Peixes Nadando de Verdade (Centralizados sob a rede) -->
          <div id="cardume-peixes" style="position:absolute; inset:0; pointer-events:none;">
            ${peixesHtml}
          </div>

          <!-- A REDINHA (Lançada do barco de Pedro diretamente nas águas da Galileia) -->
          <div id="pesca-rede-lanca" style="position:absolute; top:38%; left:0; right:0; margin:0 auto; transform:scale(0.2); width:190px; height:190px; z-index:20; opacity:0; pointer-events:none; transition:all 0.65s cubic-bezier(0.2, 0.9, 0.3, 1);">
            <img src="./2_ASSETS_UI_BOTOES/rede_pesca_maravilhosa.svg?v=94" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 4px 12px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 18px rgba(56, 189, 248, 0.7));" alt="Rede de Pesca">
            <!-- Peixinhos recolhidos na rede (EXATAMENTE a mesma quantidade da fase) -->
            <div id="peixes-na-rede" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s ease;">
              ${peixesNaRedeHtml}
            </div>
          </div>
        </div>

        <!-- 4. PAINEL DE CONTROLE / TIMING E BOTÃO DE LANÇAMENTO -->
        <div style="position:relative; width:100%; padding:10px 16px 16px 16px; background:rgba(15, 23, 42, 0.82); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-top:2.5px solid #fde047; box-shadow:0 -8px 25px rgba(0,0,0,0.7); display:flex; flex-direction:column; align-items:center; gap:10px; z-index:30;">
          <!-- Barra de Precisão da Agulha -->
          <div style="width:100%; max-width:440px; background:#1e293b; border:2.5px solid #ca8a04; border-radius:999px; padding:4px; box-shadow:inset 0 3px 6px rgba(0,0,0,0.6);">
            <div style="position:relative; width:100%; height:32px; background:linear-gradient(90deg, #ef4444 0%, #dc2626 100%); border-radius:999px; overflow:hidden;">
              <!-- Zona Verde Central de Sucesso -->
              <div id="zona-verde" style="position:absolute; width:${targetWidth}%; height:100%; left:${50 - targetWidth/2}%; background:linear-gradient(180deg, #22c55e 0%, #16a34a 100%); border-left:3px solid #ffffff; border-right:3px solid #ffffff; box-shadow:0 0 12px rgba(34,197,94,0.8);"></div>
              <!-- Agulha Oscilante Branca -->
              <div id="agulha-timing" style="position:absolute; left:0; width:12px; height:100%; background:#ffffff; box-shadow:0 0 12px #ffffff; border-radius:4px;"></div>
            </div>
          </div>

          <!-- Botão Gigante de Lançar a Rede -->
          <button id="btn-pescar-action" style="width:90%; max-width:360px; background:linear-gradient(180deg, #22c55e 0%, #15803d 100%); color:#ffffff; font-weight:900; font-size:19px; padding:15px; border-radius:999px; border:3px solid #ffffff; box-shadow:0 8px 20px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4); cursor:pointer; text-shadow:0 2px 4px rgba(0,0,0,0.5); transition:transform 0.15s ease, filter 0.15s ease;">
            🎣 LANÇAR A REDE!
          </button>
        </div>
      </div>
    `;

    const agulha = document.getElementById("agulha-timing");
    let pos = 0;
    let dir = 1;
    let animId;
    let isActionInProgress = false;

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
        if (isActionInProgress) return;
        isActionInProgress = true;
        cancelAnimationFrame(animId);

        const minGreen = 50 - targetWidth / 2;
        const maxGreen = 50 + targetWidth / 2;

        const barco = document.getElementById("barco-container");
        const rede = document.getElementById("pesca-rede-lanca");
        const corda = document.getElementById("pesca-corda-conexao");
        const splash = document.getElementById("pesca-splash");
        const peixesCardume = document.getElementById("cardume-peixes");
        const peixesNaRede = document.getElementById("peixes-na-rede");

        if (pos >= minGreen && pos <= maxGreen) {
          // === SUCESSO: ACERTOU NO VERDE! ===
          btn.textContent = "✨ LANÇOU A REDE!";
          btn.style.filter = "brightness(1.15)";

          // Movimento de arremesso do barco/Pedro
          if (barco) {
            barco.style.transform = "translateY(5px) rotate(3deg)";
            setTimeout(() => {
              barco.style.transform = "translateY(-6px) rotate(-2deg)";
            }, 300);
            setTimeout(() => {
              barco.style.transform = "";
            }, 700);
          }

          // 1. A rede se projeta exatamente do centro do barco e mergulha
          if (rede) {
            rede.style.opacity = "1";
            rede.style.transform = "scale(0.75)";
            rede.style.top = "44%";
          }
          if (corda) {
            corda.style.opacity = "1";
            corda.style.height = "80px";
          }

          // 2. A rede mergulha fundo nas águas turquesas onde os peixes estão
          setTimeout(() => {
            TronoAudio.play("splash");
            if (splash) {
              splash.style.opacity = "1";
              splash.style.transform = "scale(1.6)";
              setTimeout(() => { splash.style.opacity = "0"; }, 350);
            }
            if (rede) {
              rede.style.transform = "scale(1.2)";
              rede.style.top = "70%";
            }
            if (corda) {
              corda.style.height = "240px";
            }
          }, 250);

          // 3. Os peixes são cercados e entram na rede!
          setTimeout(() => {
            TronoAudio.play("star");
            if (peixesCardume) {
              peixesCardume.style.transition = "all 0.4s ease";
              peixesCardume.style.opacity = "0";
              peixesCardume.style.transform = "scale(0.5)";
            }
            if (peixesNaRede) {
              peixesNaRede.style.opacity = "1";
            }
            if (rede) {
              rede.style.transform = "scale(1.0)";
            }
          }, 700);

          // 4. A rede sobe puxando os peixes cheia de glória de volta ao barco!
          setTimeout(() => {
            TronoAudio.play("success");
            TronoAudio.play("fanfare");
            if (rede) {
              rede.style.top = "40%";
              rede.style.transform = "scale(1.15)";
            }
            if (corda) {
              corda.style.height = "60px";
            }
          }, 1100);

          // 5. Vitória consagrada!
          setTimeout(() => {
            triggerArcadeVictory();
          }, 1700);

        } else {
          // === ERROU O TIMING: TENTE DE NOVO ===
          TronoAudio.play("error");
          btn.textContent = "TENTE DE NOVO!";
          btn.style.background = "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)";

          if (rede) {
            rede.style.opacity = "0.7";
            rede.style.top = "52%";
            rede.style.transform = "scale(0.65)";
          }

          const peixes = document.querySelectorAll(".peixe-rio-item");
          peixes.forEach(p => {
            p.style.transition = "transform 0.4s ease";
            p.style.transform = "translateX(90px) scale(0.7)";
          });

          setTimeout(() => {
            if (rede) {
              rede.style.opacity = "0";
              rede.style.top = "4%";
              rede.style.transform = "scale(0.18)";
            }
            peixes.forEach(p => {
              p.style.transform = "translateX(0) scale(1)";
            });
            btn.textContent = "🎣 LANÇAR A REDE!";
            btn.style.background = "linear-gradient(180deg, #22c55e 0%, #15803d 100%)";
            isActionInProgress = false;
            animId = requestAnimationFrame(loopTiming);
          }, 1000);
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
      if (bicho) TronoAudio.play("star");
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

    // O áudio oficial vovo_jogo_08.mp3 já toca na entrada da fase

    window._escolherArcaBicho = function(nome) {
      if (nome === "Leão") {
        TronoAudio.play("success");
        setTimeout(triggerArcadeVictory, 700);
      } else {
        TronoAudio.play("error");
        TronoAudio.play("error");
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

    // O áudio oficial vovo_jogo_09.mp3 já toca na entrada da fase

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
