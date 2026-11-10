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
      if (!this.splashAudio) {
        try {
          this.splashAudio = new Audio('./6_ASSETS_AUDIO/jogos_vovo/som_splash_agua.mp3?v=104');
          this.splashAudio.volume = 1.0;
          this.splashAudio.preload = "auto";
        } catch(e) {}
      }
    },

    play(type) {
      if (window._arcadeAudioMuted) return;
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
          // Gravação acústica 100% natural e orgânica de água real (Tchibum físico sem sintetizador digital)
          if (this.splashAudio) {
            try {
              this.splashAudio.currentTime = 0;
              this.splashAudio.play().catch(() => {});
            } catch(e) {}
          }
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

    falarVovo(audioFile, onFinish) {
      if (window._arcadeAudioMuted) {
        if (typeof onFinish === 'function') onFinish();
        return;
      }
      if (this.vovoPlayer) {
        try {
          this.vovoPlayer.pause();
          this.vovoPlayer.currentTime = 0;
          this.vovoPlayer.onended = null;
        } catch (e) {}
      }
      if (this._vovoTimer) {
        clearTimeout(this._vovoTimer);
        this._vovoTimer = null;
      }
      if (!audioFile) {
        if (typeof onFinish === 'function') onFinish();
        return;
      }
      try {
        const src = `./6_ASSETS_AUDIO/jogos_vovo/${audioFile}?v=102`;
        this.vovoPlayer = new Audio(src);
        let finished = false;
        const doFinish = () => {
          if (!finished) {
            finished = true;
            if (this._vovoTimer) clearTimeout(this._vovoTimer);
            this._vovoTimer = null;
            if (typeof onFinish === 'function') onFinish();
          }
        };

        this.vovoPlayer.onended = doFinish;
        // Fallback de segurança: se o áudio passar de 6.2s:
        this._vovoTimer = setTimeout(doFinish, 6200);

        this.vovoPlayer.play().catch(err => {
          console.warn("Audio play prevented:", err);
          // Se bloqueado pelo browser/mudo, libera após 1.2s para a criança brincar
          setTimeout(doFinish, 1200);
        });
      } catch (e) {
        console.warn("TronoAudio error:", e);
        if (typeof onFinish === 'function') onFinish();
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
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_02_dracma.svg?v=105",
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
      title: "DAVI E A LANÇA DE SAUL",
      sub: "Pule, Abaixe, Avance e Recue",
      icon: "./2_ASSETS_UI_BOTOES/btn_jogo_04_lanca_saul.svg?v=112",
      audioFile: "vovo_jogo_04.mp3",
      vovoFala: "O rei Saul atirou a lança, mas Deus protegeu Davi! Use o controle para pular, abaixar, avançar e recuar!",
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

      
      
      
      /* --- JOGO 3: O POMBO DA ARCA (TELA CHEIA TOTAL v121.0 - ZERO BLOQUINHOS) --- */
      .pombo-v110-wrapper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 20%, #38bdf8 0%, #0284c7 50%, #0369a1 100%);
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        overflow: hidden;
        padding: 0;
        margin: 0;
      }
      .pombo-v110-header {
        display: none !important;
      }
      .pombo-v110-title {
        display: none !important;
      }
      .pombo-v110-board {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
        overflow: hidden;
        touch-action: none;
      }
      .pombo-v110-sky-bg {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 70%);
        pointer-events: none;
      }
      .pombo-v110-walls-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2;
      }
      .pombo-uniform-cloud {
        position: absolute;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 3px 6px rgba(2, 132, 199, 0.45));
        pointer-events: none;
        user-select: none;
      }
      .pombo-v110-ark {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        animation: arkBob 2.6s ease-in-out infinite;
      }
      .pombo-v110-ark-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
      }
      @keyframes arkBob {
        0%, 100% { transform: translate(-50%, -50%) rotate(-1deg); }
        50% { transform: translate(-50%, -53%) rotate(1.5deg); }
      }
      .pombo-v110-dove {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transition: left 0.12s cubic-bezier(0.2, 0.8, 0.4, 1), top 0.12s cubic-bezier(0.2, 0.8, 0.4, 1);
      }
      .pombo-v110-dove-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 3px 8px rgba(2, 132, 199, 0.5));
        transition: transform 0.12s ease;
      }
      .dove-blocked-bump {
        animation: doveBump 0.18s ease;
      }
      @keyframes doveBump {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(0.88); }
      }
      .pombo-v110-controller-area {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 50;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
      }
      .pombo-v110-dpad-disc {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 2.5px solid rgba(56, 189, 248, 0.6);
        border-radius: 36px;
        padding: 8px 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.15);
      }
      .pombo-v110-mid-row {
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .pombo-v110-btn {
        width: 52px;
        height: 52px;
        background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
        border: 2px solid #475569;
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.08s ease, background 0.08s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        outline: none;
      }
      .pombo-v110-btn:active {
        transform: scale(0.92);
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-color: #38bdf8;
      }
      .pombo-v110-btn .dpad-arrow-sym {
        color: #f8fafc;
        font-size: 24px;
        font-weight: 900;
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        pointer-events: none;
      }
      .pombo-v110-center-core {
        width: 36px;
        height: 36px;
        background: radial-gradient(circle, #334155 30%, #0f172a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
      }
      .pombo-v110-center-core .dpad-hub-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #64748b 0%, #334155 100%);
      }

      
            /* --- JOGO 4: DAVI E A LANÇA DE SAUL (PERSPECTIVA 3D TELA CHEIA v121.0 - ZERO BLOQUINHOS) --- */
      .davi-game-fullscreen {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        background: #0f172a;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .davi-top-spear-tracker {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 25;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.82);
        border: 1.5px solid #fde047;
        border-radius: 999px;
        padding: 4px 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        backdrop-filter: blur(6px);
      }
      .davi-tracker-title {
        color: #fde047;
        font-weight: 900;
        font-size: 12px;
        letter-spacing: 0.5px;
      }
      .davi-spear-badges {
        display: flex;
        gap: 6px;
        font-size: 14px;
        align-items: center;
      }
      .davi-badge {
        transition: transform 0.2s ease;
      }
      .davi-badge.current {
        animation: spearPulse 0.8s ease-in-out infinite alternate;
      }
      @keyframes spearPulse {
        from { transform: scale(1); }
        to { transform: scale(1.3); }
      }
      /* PALCO 3D EM TELA CHEIA TOTAL (100% DA TELA DO DISPOSITIVO) */
      .davi-palace-stage {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .davi-palace-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 36%;
        pointer-events: none;
        z-index: 1;
      }
      .davi-palace-vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%);
        pointer-events: none;
        z-index: 2;
      }
      /* REI SAUL DE CORPO INTEIRO DE FRENTE NO CHÃO DIANTE DO TRONO REAL */
      .davi-saul-throne {
        position: absolute;
        top: 56%;
        left: 50%;
        transform: translate(-50%, -100%);
        width: 164px;
        height: 154px;
        z-index: 4;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        transform-origin: 50% 100%;
        transition: transform 0.22s ease;
      }
      .saul-throne-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center bottom;
        filter: drop-shadow(0 6px 14px rgba(0,0,0,0.78));
      }
      .saul-throne-spear {
        display: none !important;
      }
      .davi-saul-throne.windup {
        transform: translate(-50%, -100%) scale(1.07) !important;
      }
      .davi-saul-throne.throw {
        transform: translate(-50%, -98%) scale(0.96) !important;
      }
      /* A LANÇA REAL FRONTAL VOANDO DO CENTRO EM DIREÇÃO A DAVI */
      .davi-spear-projectile {
        position: absolute;
        display: none;
        z-index: 12;
        pointer-events: none;
        width: 62px;
        height: 126px;
      }
      .davi-spear-projectile img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 0 12px rgba(253, 224, 71, 0.9)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.75));
      }
      /* CAMADA DE LANÇAS CRAVADAS NO PISO / TAPETE */
      .davi-stuck-impact-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
      }
      .davi-stuck-impact-spear {
        position: absolute;
        width: 50px;
        height: 100px;
        background: url("./2_ASSETS_UI_BOTOES/lanca_frontal_v123.png?v=123") no-repeat center / contain;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 6px rgba(253, 224, 71, 0.55));
        opacity: 0.92;
      }
      /* DAVI NO PRIMEIRO PLANO (DE COSTAS NO TAPETE, 100% ACIMA DO CONTROLE FLUTUANTE) */
      .davi-hero-box {
        position: absolute;
        bottom: 142px;
        left: 50%;
        transform: translateX(-50%);
        width: 64px;
        height: 128px;
        z-index: 15;
        transform-origin: 50% 100%;
        transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), left 0.24s cubic-bezier(0.25, 1, 0.5, 1);
      }
      .davi-hero-box.center-pos {
        left: 50% !important;
      }
      .davi-hero-box.dodge-left {
        left: 24% !important;
      }
      .davi-hero-box.dodge-right {
        left: 76% !important;
      }
      .davi-hero-box.jumping {
        transform: translateX(-50%) translateY(-58px) scale(0.96) !important;
      }
      .davi-hero-box.crouching {
        transform: translateX(-50%) scaleY(0.64) scaleX(1.06) !important;
      }
      .davi-hero-box.hit-stumble {
        animation: daviStumble 0.6s ease;
      }
      @keyframes daviStumble {
        0%, 100% { transform: translateX(-50%) rotate(0deg); }
        25% { transform: translateX(-58%) rotate(-10deg); filter: brightness(1.3) drop-shadow(0 0 10px #f87171); }
        75% { transform: translateX(-42%) rotate(8deg); }
      }
      .davi-hero-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center bottom;
        filter: drop-shadow(0 8px 14px rgba(0,0,0,0.72));
      }
      .davi-hero-shadow {
        position: absolute;
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
        width: 56px;
        height: 13px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,0,0,0.68) 0%, transparent 75%);
        z-index: -1;
      }
      /* BARRA DE CONTROLES COMPACTA FLUTUANTE NO RODAPÉ (SEM COBRIR DAVI) */
      .davi-controls-bar {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 25;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        pointer-events: auto;
      }
      .davi-dpad-disc {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        background: rgba(15, 23, 42, 0.56);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 2px solid rgba(253, 224, 71, 0.5);
        border-radius: 24px;
        padding: 5px 8px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45), inset 0 1px 3px rgba(255, 255, 255, 0.15);
      }
      .davi-mid-row {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .davi-dpad-btn {
        width: 40px;
        height: 36px;
        background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
        border: 1.5px solid #475569;
        border-radius: 10px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.08s ease, background 0.08s ease, border-color 0.08s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        outline: none;
        padding: 0;
      }
      .davi-dpad-btn:active {
        transform: scale(0.92);
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-color: #38bdf8;
      }
      .davi-dpad-btn .dpad-arrow-sym {
        color: #f8fafc;
        font-size: 19px;
        font-weight: 900;
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        pointer-events: none;
      }
      .davi-center-core {
        width: 26px;
        height: 26px;
        background: radial-gradient(circle, #334155 30%, #0f172a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
      }
      .davi-center-core .dpad-hub-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #fde047 0%, #ca8a04 100%);
        box-shadow: 0 0 6px #fde047;
      }

      /* TELA CHEIA OFICIAL DE VITÓRIA (100% ROXA DO TRONO KIDS - SEM BLOCO/CARD) */
      #trono-victory-modal {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 32%, #7e22ce 0%, #581c87 50%, #2e1065 100%);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        z-index: 100;
        animation: vicModalFade 0.35s ease;
      }
      @keyframes vicModalFade {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
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
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 150 !important;
        display: none;
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
          <button class="arcade-btn-circle" id="arcade-btn-back" type="button" title="Voltar à Sala de Jogos" style="pointer-events:auto; z-index:99;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="pointer-events:none;"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="arcade-phase-badge" id="arcade-phase-display" onclick="window.handleArcadeDevTap()" style="cursor:pointer;" title="Toque 3x para Modo Desenvolvedor (12345)">
            ⭐ FASE <span id="arcade-phase-num">1</span> / <span id="arcade-phase-total">5</span>
          </div>
          <button class="arcade-btn-circle" id="arcade-btn-sound" type="button" title="Cortar / Ligar Som" style="background:linear-gradient(180deg, #eab308 0%, #ca8a04 100%); pointer-events:auto; z-index:99;">
            <svg id="arcade-sound-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style="pointer-events:none;">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M15.54 8.46C16.47 9.4 17 10.66 17 12C17 13.34 16.47 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Área de Jogo Limpa em Tela Cheia (Sem balões de texto bloqueando a tela) -->
        <div class="arcade-game-canvas-area" id="arcade-game-stage-container"></div>

        <canvas id="arcade-confetti-canvas" class="confetti-canvas"></canvas>

        <!-- MODAL CANÔNICO DE VITÓRIA (IDENTIDADE VISUAL PADRÃO TRONO KIDS) -->
        <div id="trono-victory-modal"></div>
      `;
      document.body.appendChild(stage);

      // Eventos Diretos Ultra-responsivos para Mobile & Touch
      const backBtn = document.getElementById("arcade-btn-back");
      if (backBtn) {
        const handleBack = (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.closeTronoArcadeStage();
        };
        backBtn.addEventListener("pointerdown", handleBack);
        backBtn.addEventListener("click", handleBack);
      }

      const soundBtn = document.getElementById("arcade-btn-sound");
      if (soundBtn) {
        const handleSound = (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.toggleArcadeSound();
        };
        soundBtn.addEventListener("pointerdown", handleSound);
        soundBtn.addEventListener("click", handleSound);
      }
    }
  }

  // ==========================================================================
  // 5. NAVEGAÇÃO E CONTROLE DO PALCO EM TELA CHEIA
  // ==========================================================================
  // Flag de sessão: o Vovô explica a instrução apenas na primeira fase da jogada.
  // Nas fases seguintes da mesma sessão contínua, o jogo entra direto sem repetições cansativas!
  let _vovoAlreadySpokeInSession = false;

  window.openTronoArcadeGame = function(gameId) {
    try { history.pushState({ screen: "arcade-stage", gameId: gameId }, ""); } catch(e){}
    TronoAudio.init();
    TronoAudio.play("click");
    ensureArcadeStageInDOM();

    const game = SUPER_ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;

    currentActiveGame = game;
    currentPhase = 1;
    _vovoAlreadySpokeInSession = false; // Reset da sessão: ao entrar no jogo, o Vovô falará na primeira fase!

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
    stopArcadeCelebrationConfetti();

    // Reseta trava de liberação
    window._arcadeUnlockGameAction = null;

    const container = document.getElementById("arcade-game-stage-container");
    if (container && currentActiveGame) {
      container.innerHTML = "";
      currentActiveGame.run(container, phase);
    }

    // REGRA DE SESSÃO INTELIGENTE (RIGOBERTO UX):
    // 1) Na primeira fase da sessão (quando entra no jogo), o Vovô explica tudo e a trava aguarda.
    // 2) Nas fases seguintes da mesma jogada contínua, o jogo entra direto e ágil sem cansar a criança!
    // 3) Se o jogador quiser ouvir de novo, o botão do Vovô no topo repete a qualquer momento.
    const shouldSpeak = !_vovoAlreadySpokeInSession && currentActiveGame && currentActiveGame.audioFile;

    if (shouldSpeak) {
      _vovoAlreadySpokeInSession = true;
      TronoAudio.falarVovo(currentActiveGame.audioFile, () => {
        if (typeof window._arcadeUnlockGameAction === 'function') {
          window._arcadeUnlockGameAction();
        }
      });
    } else {
      // Avanço dinâmico nas fases seguintes da mesma sessão: delay suave de 300ms e já libera a ação!
      setTimeout(() => {
        if (typeof window._arcadeUnlockGameAction === 'function') {
          window._arcadeUnlockGameAction();
        }
      }, 300);
    }
  }

  
  // Modal de Pausa ao clicar no botão Voltar no topo
  window.confirmOrCloseArcadeStage = function() {
    TronoAudio.play("click");
    let modal = document.getElementById("arcade-pause-confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "arcade-pause-confirm-modal";
      modal.style.cssText = "position:fixed; inset:0; background:rgba(7,10,25,0.88); backdrop-filter:blur(10px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px;";
      modal.innerHTML = `
        <div style="background:linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border:3px solid #fde047; border-radius:24px; padding:22px; max-width:340px; width:90%; text-align:center; box-shadow:0 12px 36px rgba(0,0,0,0.8);">
          <div style="font-size:38px; margin-bottom:6px;">⏸️</div>
          <div style="font-size:18px; font-weight:900; color:#fde047; margin-bottom:6px;">JOGO EM PAUSA</div>
          <div style="font-size:13.5px; font-weight:700; color:#e2e8f0; margin-bottom:18px;">O que você deseja fazer?</div>
          <button onclick="window.resumeArcadeGame()" style="width:100%; padding:13px; border-radius:999px; background:linear-gradient(180deg, #22c55e 0%, #15803d 100%); border:2px solid #86efac; color:#ffffff; font-weight:900; font-size:14px; margin-bottom:10px; cursor:pointer; box-shadow:0 4px 14px rgba(34,197,94,0.4);">
            ▶️ CONTINUAR JOGANDO
          </button>
          <button onclick="window.forceCloseArcadeStage()" style="width:100%; padding:11px; border-radius:999px; background:transparent; border:2px solid #64748b; color:#94a3b8; font-weight:800; font-size:13px; cursor:pointer;">
            🚪 Sair para a Sala de Jogos
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
  };

  window.resumeArcadeGame = function() {
    TronoAudio.play("click");
    const modal = document.getElementById("arcade-pause-confirm-modal");
    if (modal) modal.style.display = "none";
  };

  window.forceCloseArcadeStage = function() {
    const modal = document.getElementById("arcade-pause-confirm-modal");
    if (modal) modal.style.display = "none";
    window.closeTronoArcadeStage();
  };

  window.closeTronoArcadeStage = function() {
    _vovoAlreadySpokeInSession = false;
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
    if (TronoAudio.vovoPlayer) { try { TronoAudio.vovoPlayer.pause(); } catch(e){} }
    if (celebrationClapAudio) { try { celebrationClapAudio.pause(); } catch(e){} }
    if (window._daviSpearTimer) { clearTimeout(window._daviSpearTimer); window._daviSpearTimer = null; }
    if (window._daviWindupTimer) { clearTimeout(window._daviWindupTimer); window._daviWindupTimer = null; }

    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) {
      stage.classList.remove("active");
      stage.style.display = "none";
    }
    const container = document.getElementById("arcade-game-stage-container");
    if (container) container.innerHTML = "";

    if (typeof openGamesHubScreen === "function") {
      openGamesHubScreen();
    } else if (typeof navigateTo === "function") {
      navigateTo("screen-home");
    }
  };

  window.retryCurrentArcadePhase = function() {
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
    loadPhase(currentPhase);
  };

  window.advanceArcadePhase = function() {
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
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

  window._arcadeAudioMuted = false;
  window.toggleArcadeSound = function() {
    window._arcadeAudioMuted = !window._arcadeAudioMuted;
    if (window._arcadeAudioMuted) {
      // 1. Pausa Web Audio API
      if (TronoAudio && TronoAudio.ctx && TronoAudio.ctx.state === "running") {
        try { TronoAudio.ctx.suspend(); } catch(e){}
      }
      // 2. Pausa voz do Vovô
      if (TronoAudio && TronoAudio.vovoPlayer) {
        try { TronoAudio.vovoPlayer.pause(); } catch(e){}
      }
      // 3. Pausa som ambiente / background
      if (typeof bgAudioPlayer !== 'undefined' && bgAudioPlayer && !bgAudioPlayer.paused) {
        try { bgAudioPlayer.pause(); } catch(e){}
      }
      if (typeof ambientPlaying !== 'undefined') ambientPlaying = false;
      // 4. Pausa qualquer outro áudio HTML5 da página
      if (celebrationClapAudio) {
        try { celebrationClapAudio.pause(); } catch(e){}
      }
      document.querySelectorAll("audio").forEach(a => {
        try { a.pause(); } catch(e){}
      });
    } else {
      // Retoma Web Audio API
      if (TronoAudio && TronoAudio.ctx && TronoAudio.ctx.state === "suspended") {
        try { TronoAudio.ctx.resume(); } catch(e){}
      }
      TronoAudio.play("click");
      if (typeof toggleAmbientSound === 'function') {
        try { toggleAmbientSound(); } catch(e){}
      }
    }
    if (typeof updateSoundButtonIcon === 'function') {
      try { updateSoundButtonIcon(); } catch(e){}
    }
    window.updateArcadeSoundIcon();
  };

  window.updateArcadeSoundIcon = function() {
    const btn = document.getElementById("arcade-btn-sound");
    const svg = document.getElementById("arcade-sound-icon-svg");
    if (!svg) return;
    if (window._arcadeAudioMuted) {
      if (btn) btn.style.background = "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)";
      svg.innerHTML = `
        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#ffffff"/>
        <path d="M22 9L16 15M16 9L22 15" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
      `;
    } else {
      if (btn) btn.style.background = "linear-gradient(180deg, #eab308 0%, #ca8a04 100%)";
      svg.innerHTML = `
        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M15.54 8.46C16.47 9.4 17 10.66 17 12C17 13.34 16.47 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
  };

  window.repeatVovoInstruction = function() {
    if (currentActiveGame && currentActiveGame.audioFile && !window._arcadeAudioMuted) {
      TronoAudio.falarVovo(currentActiveGame.audioFile);
    }
  };

  function unlockVictoryContinueButton() {
    const btn = document.getElementById("btn-canonical-continue");
    if (!btn) return;
    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const current = currentPhase || 1;

    if (!isVip && current >= 5) {
      btn.textContent = "🔓 LIBERAR +10 FASES VIP!";
      btn.style.background = "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)";
      btn.style.border = "2.5px solid #fde047";
      btn.style.boxShadow = "0 0 22px rgba(245,158,11,0.85), 0 6px 16px rgba(0,0,0,0.75)";
    } else {
      const btnText = (isVip && current >= 15) ? "🎉 FINALIZAR JOGUINHO!" : "CONTINUAR BRINCANDO";
      btn.textContent = btnText;
      btn.style.background = "linear-gradient(180deg, #00e676 0%, #00c853 100%)";
      btn.style.border = "2.5px solid #ffffff";
      btn.style.boxShadow = "0 0 22px rgba(0,230,118,0.85), 0 6px 16px rgba(0,0,0,0.75)";
    }
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
    btn.style.animation = "aliveBtnFloat 1.9s ease-in-out infinite";
    TronoAudio.play("pop");
  }

  let celebrationClapAudio = null;

  function triggerArcadeVictory() {
    // 0. Interrompe qualquer áudio anterior do Vovô para nunca haver atropelos!
    if (TronoAudio.vovoPlayer) {
      try {
        TronoAudio.vovoPlayer.pause();
        TronoAudio.vovoPlayer.currentTime = 0;
        TronoAudio.vovoPlayer.onended = null;
      } catch(e) {}
    }
    if (TronoAudio._vovoTimer) {
      clearTimeout(TronoAudio._vovoTimer);
      TronoAudio._vovoTimer = null;
    }

    // 1. Áudio oficial canônico: Palmas + Crianças Comemorando ("Êêê/Aê!") + Fanfarra
    try {
      if (typeof window.playSoundCelebrationClaps === 'function') {
        window.playSoundCelebrationClaps();
      } else {
        if (!celebrationClapAudio) {
          celebrationClapAudio = new Audio('./6_ASSETS_AUDIO/11_festa_comemoracao_aplausos.wav');
        }
        celebrationClapAudio.currentTime = 0;
        celebrationClapAudio.volume = 1.0;
        celebrationClapAudio.play().catch(() => {});
      }
    } catch(e) {
      console.warn("Celebration audio err:", e);
    }

    // 2. Monta e exibe o CARD CANÔNICO OFICIAL DO TRONO KIDS
    renderCanonicalVictoryModal();

    // 3. Chuva de confetes 3D e fogos de artifício estourando pela tela toda
    startArcadeCelebrationConfetti();

    // 4. Voz afetuosa do Vovô Nésio ("Parabéns! Muito bem!")
    // TIMING PERFEITO: Entra 1.4s após o estouro inicial de fanfarra e gritos das crianças,
    // e SOMENTE DEPOIS que o Vovô terminar a fala, o botão 'CONTINUAR BRINCANDO' é liberado!
    setTimeout(() => {
      TronoAudio.falarVovo("vovo_vitoria.mp3", () => {
        unlockVictoryContinueButton();
      });
    }, 1400);
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
        <button id="btn-canonical-continue" style="position:relative; z-index:2; width:100%; padding:15px; font-size:18px; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:all 0.35s ease; pointer-events:none;" onclick="if(typeof openModal === 'function') openModal('modal-subscribe');">
          ⭐ MUITO BEM!...
        </button>
        <div onclick="window.closeTronoArcadeStage()" style="margin-top:14px; color:#fef08a; font-weight:800; font-size:15px; cursor:pointer; text-decoration:underline;">
          Voltar à Sala de Jogos
        </div>
      `;
    } else {
      actionsHtml = `
        <button id="btn-canonical-continue" style="position:relative; z-index:2; width:100%; padding:15px; font-size:19px; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:all 0.35s ease; pointer-events:none;" onclick="window.advanceArcadePhase()">
          ⭐ MUITO BEM!...
        </button>
      `;
    }

    modal.innerHTML = `
      <div class="trono-victory-screen-content" style="width:100%; max-width:400px; display:flex; flex-direction:column; align-items:center; text-align:center; z-index:2; animation:vicCardPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <!-- 1. Único Ícone 3D Oficial do Jogo no Topo Flutuando Solto -->
        <div style="position:relative; z-index:2; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <img src="${game.icon}" style="width:96px; height:96px; object-fit:contain; border-radius:24px; border:3.5px solid #fde047; background:rgba(255,255,255,0.15); box-shadow:0 0 28px rgba(253,224,71,0.85), 0 8px 20px rgba(0,0,0,0.6); animation:aliveBtnFloat 2.0s ease-in-out infinite;" alt="${game.title}">
        </div>

        <!-- 2. Título Amarelo Dourado Brilhante Solto na Tela Roxa -->
        <div style="position:relative; z-index:2; font-size:30px; font-weight:900; color:#fde047; text-shadow:0 4px 12px rgba(0,0,0,0.9), 0 0 22px rgba(253,224,71,0.6); line-height:1.15; margin-bottom:22px; letter-spacing:0.6px; animation:titlePopBounce 1.4s ease-in-out infinite;">
          PARABÉNS!<br>MUITO BEM!
        </div>

        <!-- 3. Bolinhas de Progresso Soltas (1 a 5 + 🔒) -->
        <div style="position:relative; z-index:2; display:flex; justify-content:center; align-items:center; gap:9px; margin-bottom:28px; min-height:54px;">
          ${dotsHtml}
        </div>

        <!-- 4. Ações de Vitória Soltas na Tela Roxa -->
        <div style="position:relative; z-index:2; width:100%; max-width:330px;">
          ${actionsHtml}
        </div>
      </div>
    `;

    modal.style.display = "flex";
  }

  // ==========================================================================
  // MOTOR CANÔNICO DE CONFETES 3D, SERPENTINAS E FOGOS DE ARTIFÍCIO
  // ==========================================================================
  let arcadeConfettiAnimId = null;
  let arcadeConfettiParticles = [];
  let arcadeFireworkSparks = [];

  function spawnArcadeFireworkBurst(cx, cy) {
    const colors = ['#fde047', '#00e676', '#00e5ff', '#ff4081', '#e040fb', '#ff9100', '#ffffff'];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.15;
      const speed = 2.2 + Math.random() * 4.5;
      arcadeFireworkSparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 3.5 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.014 + Math.random() * 0.012
      });
    }
  }

  function startArcadeCelebrationConfetti() {
    const cvs = document.getElementById("arcade-confetti-canvas");
    if (!cvs) return;
    cvs.style.display = 'block';
    const ctx = cvs.getContext('2d');
    const W = (cvs.width = window.innerWidth);
    const H = (cvs.height = window.innerHeight);

    const colors = ['#fde047', '#00e676', '#00e5ff', '#ff4081', '#aa00ff', '#ff9100', '#ffffff'];
    arcadeConfettiParticles = [];
    arcadeFireworkSparks = [];

    for (let i = 0; i < 95; i++) {
      const fromLeft = i % 2 === 0;
      arcadeConfettiParticles.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.7,
        vx: (Math.random() - 0.5) * 3.4 + (fromLeft ? 0.6 : -0.6),
        vy: 2.2 + Math.random() * 3.8,
        w: 8 + Math.random() * 8,
        h: 12 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        tilt: Math.random() * Math.PI * 2,
        vTilt: 0.08 + Math.random() * 0.12,
        shape: i % 5 === 0 ? 'star' : 'ribbon'
      });
    }

    spawnArcadeFireworkBurst(W * 0.25, H * 0.22);
    spawnArcadeFireworkBurst(W * 0.75, H * 0.22);
    spawnArcadeFireworkBurst(W * 0.50, H * 0.16);

    let frameCount = 0;
    if (arcadeConfettiAnimId) cancelAnimationFrame(arcadeConfettiAnimId);

    function renderArcadeFrame() {
      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // Estouros periódicos de fogos com estrelinhas brilhantes ("aquele negocinho que estoura")
      if (frameCount % 36 === 0) {
        spawnArcadeFireworkBurst(W * (0.18 + Math.random() * 0.64), H * (0.14 + Math.random() * 0.28));
      }

      // 1. Desenha faíscas dos fogos
      for (let i = arcadeFireworkSparks.length - 1; i >= 0; i--) {
        const sp = arcadeFireworkSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.06;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0) {
          arcadeFireworkSparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Desenha confetes 3D voando (fitas e estrelas)
      arcadeConfettiParticles.forEach(p => {
        p.x += p.vx + Math.sin(p.tilt) * 0.9;
        p.y += p.vy;
        p.rot += p.vRot;
        p.tilt += p.vTilt;

        if (p.y > H + 25) {
          p.y = -18;
          p.x = Math.random() * W;
        }
        if (p.x < -20) p.x = W + 15;
        if (p.x > W + 20) p.x = -15;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(Math.cos(p.tilt), 1);
        ctx.fillStyle = p.color;
        if (p.shape === 'star') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      arcadeConfettiAnimId = requestAnimationFrame(renderArcadeFrame);
    }

    arcadeConfettiAnimId = requestAnimationFrame(renderArcadeFrame);
  }

  function stopArcadeCelebrationConfetti() {
    if (arcadeConfettiAnimId) {
      cancelAnimationFrame(arcadeConfettiAnimId);
      arcadeConfettiAnimId = null;
    }
    const cvs = document.getElementById("arcade-confetti-canvas");
    if (cvs) {
      cvs.style.display = 'none';
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, cvs.width, cvs.height);
    }
  }

  // --- JOGO 1: PESCA MARAVILHOSA (BARRA DE TIMING) ---
  function runPescaMaravilhosa(container, phase) {
    // Curva Suave Rigoberto: Fase 1 a 5 fáceis e amigáveis; Fase 15 nível mestre!
    const targetWidth = Math.max(46 - phase * 1.85, 18);
    const speed = 0.95 + phase * 0.115;

    // REGRA DE OURO RIGOBERTO: Fase 1 = 1 peixinho, Fase 2 = 2 peixinhos, Fase 3 = 3 peixinhos...
    const totalPeixes = Math.min(phase, 5);

    // Trava de Tempo / Segurança Pedagógica (Rigoberto UX):
    // O jogo inicia travado enquanto o Vovô Nésio fala a instrução!
    let isGameLocked = true;
    let isActionInProgress = false;

    // Peixes nadando no fundo das águas turquesas cristalinas da Galileia
    // Quase todos na mesma linha horizontal, bem lá no fundo (sem tocar o chão)
    const peixesPos = [
      { bottom: "50px", left: "calc(50% - 32px)", delay: "0s", dur: "3.0s", size: "58px", isBlue: false },
      { bottom: "60px", left: "calc(50% - 95px)", delay: "0.4s", dur: "3.3s", size: "54px", isBlue: true },
      { bottom: "46px", left: "calc(50% + 35px)", delay: "0.8s", dur: "2.8s", size: "56px", isBlue: false },
      { bottom: "58px", left: "calc(50% + 85px)", delay: "0.2s", dur: "3.5s", size: "52px", isBlue: true },
      { bottom: "52px", left: "calc(50% - 145px)", delay: "1.0s", dur: "3.1s", size: "55px", isBlue: false }
    ];

    const peixesHtml = peixesPos.slice(0, totalPeixes).map((p, idx) => {
      const src = p.isBlue ? "./2_ASSETS_UI_BOTOES/peixinho_pesca_azul.svg?v=95" : "./2_ASSETS_UI_BOTOES/peixinho_pesca.svg?v=95";
      return `
        <div class="peixe-rio-item" id="peixe-rio-${idx}" style="position:absolute; bottom:${p.bottom}; left:${p.left}; width:${p.size}; height:auto; animation:peixeNadoSuave ${p.dur} infinite ease-in-out ${p.delay}; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transition:all 0.4s ease;">
          <img src="${src}" style="width:100%; height:auto;" alt="Peixinho da Pesca">
        </div>
      `;
    }).join("");

    // Peixes capturados dentro da rede (EXATAMENTE a mesma quantidade da fase)
    const peixesNaRedeHtml = Array.from({ length: totalPeixes }).map((_, i) => {
      const isBlue = i % 2 === 1;
      const src = isBlue ? "./2_ASSETS_UI_BOTOES/peixinho_pesca_azul.svg?v=95" : "./2_ASSETS_UI_BOTOES/peixinho_pesca.svg?v=95";
      const rot = (i % 2 === 0 ? -12 : 16) + (i * 6);
      const size = Math.max(54 - i * 3, 40);
      return `<img src="${src}" style="width:${size}px; height:auto; transform:rotate(${rot}deg); margin:0 -6px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">`;
    }).join("");

    container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; overflow:hidden; user-select:none; touch-action:none; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 35%, #0369a1 70%, #0c4a6e 100%);">
        <!-- 0. IMAGEM OFICIAL 3D PIXAR COM CARREGAMENTO IMEDIATO E ALTA PRIORIDADE -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_pesca_maravilhosa_3d.jpg?v=95" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; z-index:0;" alt="Cenário 3D Pesca Maravilhosa" loading="eager" decoding="async">
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
            <img src="./2_ASSETS_UI_BOTOES/rede_pesca_maravilhosa.svg?v=95" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 4px 12px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 18px rgba(56, 189, 248, 0.7));" alt="Rede de Pesca">
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

          <!-- Botão com Trava de Segurança Pedagógica (Ouve o Vovô antes de liberar) -->
          <button id="btn-pescar-action" style="width:90%; max-width:360px; background:#1e293b; color:#94a3b8; font-weight:900; font-size:18px; padding:15px; border-radius:999px; border:2.5px solid #475569; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:all 0.35s ease; pointer-events:none;">
            🎯 PREPARE-SE...
          </button>
        </div>
      </div>
    `;

    const agulha = document.getElementById("agulha-timing");
    let pos = 50; // Começa centralizada na zona verde em espera
    let dir = 1;
    let animId = null;

    if (agulha) agulha.style.left = "50%";

    function loopTiming() {
      if (isGameLocked || isActionInProgress) return;
      pos += dir * speed;
      if (pos >= 96) { pos = 96; dir = -1; }
      else if (pos <= 0) { pos = 0; dir = 1; }
      if (agulha) agulha.style.left = pos + "%";
      animId = requestAnimationFrame(loopTiming);
    }

    // REGISTRA A FUNÇÃO OFICIAL DE DESTRAVAMENTO (Acionada quando o Vovô termina a instrução)
    window._arcadeUnlockGameAction = function() {
      if (!isGameLocked) return;
      isGameLocked = false;
      const b = document.getElementById("btn-pescar-action");
      if (b) {
        b.textContent = "🎣 LANÇAR A REDE!";
        b.style.background = "linear-gradient(180deg, #22c55e 0%, #15803d 100%)";
        b.style.color = "#ffffff";
        b.style.border = "3px solid #ffffff";
        b.style.boxShadow = "0 8px 22px rgba(34,197,94,0.6), inset 0 2px 4px rgba(255,255,255,0.4)";
        b.style.cursor = "pointer";
        b.style.opacity = "1";
        b.style.pointerEvents = "auto";
        b.style.animation = "aliveBtnFloat 1.8s ease-in-out infinite";
      }
      TronoAudio.play("pop");
      if (!animId && !isActionInProgress) {
        animId = requestAnimationFrame(loopTiming);
      }
    };

    const btn = document.getElementById("btn-pescar-action");
    if (btn) {
      btn.onclick = () => {
        if (isGameLocked || isActionInProgress) return;
        isActionInProgress = true;
        if (animId) cancelAnimationFrame(animId);

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
            rede.style.top = "42%";
          }
          if (corda) {
            corda.style.opacity = "1";
            corda.style.height = "60px";
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
              rede.style.top = "calc(100% - 150px)";
            }
            if (corda) {
              corda.style.height = "calc(100% - 165px)";
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
              rede.style.transform = "scale(1.05)";
            }
          }, 700);

          // 4. A rede sobe puxando os peixes cheia de glória de volta ao barco!
          setTimeout(() => {
            TronoAudio.play("success");
            TronoAudio.play("fanfare");
            if (rede) {
              rede.style.top = "36%";
              rede.style.transform = "scale(1.15)";
            }
            if (corda) {
              corda.style.height = "50px";
            }
          }, 1100);

          // 5. Vitória consagrada!
          setTimeout(() => {
            triggerArcadeVictory();
          }, 1700);

        } else {
          // === ERROU O TIMING: TENTE DE NOVO ===
          TronoAudio.play("splash");
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
              rede.style.top = "36%";
              rede.style.transform = "scale(0.2)";
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

  // --- JOGO 2: A DRACMA PERDIDA (LANTERNA NO ESCURO NA CASA BÍBLICA) ---
  function runDracmaPerdida(container, phase) {
    // 1. CURVA DE DIFICULDADE (RIGOBERTO GAME DESIGN):
    // Fase 1: 1 Moeda, Foco Grande (155px), Moeda no chão aberto bem fácil de achar.
    // Fase 2: 2 Moedas, Foco Médio-Grande (130px), Moeda perto do vaso.
    // Fase 3: 3 Moedas, Foco Médio (110px), Moedas nos cantos e tigela.
    // Fase 4: 4 Moedas, Foco Fechado (92px), Moedas semi-ocultas em cestos e cantos.
    // Fase 5+: 5 Moedas, Foco Estreito (72px), Moedas bem escondidas na sombra e atrás de objetos.
    const totalMoedas = Math.min(phase, 5);
    const raioLuz = phase === 1 ? 155 :
                    phase === 2 ? 130 :
                    phase === 3 ? 110 :
                    phase === 4 ? 92 :
                    Math.max(74 - (phase - 5) * 3, 58);

    let moedasAchadas = 0;
    let isInteractionLocked = true;

    // Catálogo de esconderijos ancorados organicamente nos elementos visuais do cenário 3D da casa:
    // (A mulher, os vasos de barro, a tigela, o cesto no alto, a parede de pedra e o chão rústico)
    const allHidingSpots = [
      // 0: Chão aberto iluminado em frente à mulher (Fácil - Fase 1)
      { id: "spot_floor_open", x: 44, y: 74, occlude: null },
      // 1: Perto da base do grande vaso de barro (Fase 2)
      { id: "spot_jar_base", x: 26, y: 70, occlude: "jar" },
      // 2: Atrás da tigela de azeite na direita (Fase 3)
      { id: "spot_bowl_side", x: 65, y: 84, occlude: "bowl" },
      // 3: Canto escuro de pedra abaixo da janela (Fase 3/4)
      { id: "spot_wall_shadow", x: 16, y: 56, occlude: "shadow" },
      // 4: No cesto de palha no alto da estante à direita (Fase 4/5)
      { id: "spot_basket_shelf", x: 84, y: 38, occlude: "straw" },
      // 5: Atrás do vaso inferior esquerdo (Fase 5)
      { id: "spot_bottom_pot", x: 15, y: 88, occlude: "jar" },
      // 6: Na dobra de sombra da túnica da mulher (Fase 5)
      { id: "spot_tunic_shadow", x: 42, y: 86, occlude: "shadow" },
      // 7: Parapeito de pedra da janela rústica (Fase 5+)
      { id: "spot_window_ledge", x: 24, y: 36, occlude: "stone" }
    ];

    // Seleciona os esconderijos de acordo com a fase
    let currentSpots = [];
    if (phase === 1) {
      currentSpots = [allHidingSpots[0]];
    } else if (phase === 2) {
      currentSpots = [allHidingSpots[0], allHidingSpots[1]];
    } else if (phase === 3) {
      currentSpots = [allHidingSpots[1], allHidingSpots[2], allHidingSpots[3]];
    } else if (phase === 4) {
      currentSpots = [allHidingSpots[2], allHidingSpots[3], allHidingSpots[4], allHidingSpots[5]];
    } else {
      currentSpots = [allHidingSpots[2], allHidingSpots[3], allHidingSpots[4], allHidingSpots[5], allHidingSpots[6]];
    }

    // HTML das Moedas e dos Objetos de Sobreposição (Tampando a Moeda)
    const coinsHtml = currentSpots.map((spot, idx) => {
      let occludeHtml = "";
      if (spot.occlude === "jar") {
        occludeHtml = `<div style="position:absolute; left:${spot.x - 3}%; top:${spot.y - 2}%; width:30px; height:34px; background:radial-gradient(circle at 40% 35%, #78350f, #271306); border-radius:50% 50% 40% 40%; box-shadow:0 3px 6px rgba(0,0,0,0.65); pointer-events:none; z-index:4;"></div>`;
      } else if (spot.occlude === "bowl") {
        occludeHtml = `<div style="position:absolute; left:${spot.x + 1}%; top:${spot.y + 1}%; width:28px; height:20px; background:radial-gradient(circle at 50% 30%, #92400e, #3e1602); border-radius:25% 25% 60% 60%; box-shadow:0 2px 5px rgba(0,0,0,0.65); pointer-events:none; z-index:4;"></div>`;
      } else if (spot.occlude === "straw") {
        occludeHtml = `<div style="position:absolute; left:${spot.x - 2}%; top:${spot.y - 2}%; width:34px; height:22px; background:repeating-linear-gradient(45deg, #d97706 0px, #b45309 3px, transparent 3px, transparent 7px); pointer-events:none; z-index:4;"></div>`;
      } else if (spot.occlude === "shadow") {
        occludeHtml = `<div style="position:absolute; left:${spot.x - 4}%; top:${spot.y - 3}%; width:36px; height:26px; background:radial-gradient(circle, rgba(15,10,6,0.85) 0%, transparent 80%); pointer-events:none; z-index:4;"></div>`;
      }

      return `
        <!-- Moeda Dracma Bíblica #${idx + 1} -->
        <div id="dracma-coin-${idx}" class="dracma-coin-item" data-idx="${idx}" data-x="${spot.x}" data-y="${spot.y}" style="position:absolute; left:${spot.x}%; top:${spot.y}%; transform:translate(-50%, -50%); width:46px; height:46px; cursor:pointer; z-index:3; display:flex; align-items:center; justify-content:center; touch-action:none;">
          <div class="dracma-coin-inner" style="width:100%; height:100%; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fffbeb 0%, #fde047 30%, #eab308 70%, #92400e 100%); border:2.5px solid #ffffff; box-shadow:0 0 16px rgba(253, 224, 71, 0.9), 0 4px 10px rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; color:#78350f; font-weight:900; font-size:22px; text-shadow:0 1px 2px rgba(255,255,255,0.8); user-select:none; transition:all 0.4s ease;">
            🪙
          </div>
          <!-- Partícula de Brilho Sutil -->
          <div class="dracma-sparkle" style="position:absolute; inset:-8px; border-radius:50%; background:radial-gradient(circle, rgba(253,224,71,0.5) 0%, transparent 70%); pointer-events:none; animation:alivePulseDracma 1.8s ease-in-out infinite;"></div>
        </div>
        <!-- Objeto de Sobreposição (Tampando Parcialmente a Moeda) -->
        ${occludeHtml}
      `;
    }).join("");

    container.innerHTML = `
      <style>
        @keyframes alivePulseDracma {
          0%, 100% { transform:scale(1); opacity:0.6; }
          50% { transform:scale(1.25); opacity:1; }
        }
        @keyframes dracmaFoundBurst {
          0% { transform:translate(-50%, -50%) scale(1); opacity:1; }
          40% { transform:translate(-50%, -80px) scale(1.8); opacity:1; filter:brightness(1.5); }
          100% { transform:translate(-50%, -130px) scale(2.2); opacity:0; }
        }
        @keyframes lampFlamePulse {
          0%, 100% { transform:scale(1); filter:drop-shadow(0 0 14px rgba(253,224,71,0.95)); }
          50% { transform:scale(1.12); filter:drop-shadow(0 0 22px rgba(245,158,11,1)); }
        }
      </style>
      <div style="position:relative; width:100%; height:100%; overflow:hidden; user-select:none; touch-action:none; background:#120b06;">
        <!-- 0. IMAGEM OFICIAL 3D PIXAR DO AMBIENTE BÍBLICO (A MULHER, A CASA E O CHÃO COM VASOS) -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_dracma_perdida_3d.jpg?v=105" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; z-index:1;" alt="Cenário 3D A Dracma Perdida" loading="eager" decoding="async">

        <!-- 1. CAMADA DE MOEDAS E OBJETOS DE SOBREPOSIÇÃO -->
        <div id="dracmas-layer" style="position:absolute; inset:0; z-index:3;">
          ${coinsHtml}
        </div>

        <!-- 2. CANVAS DE ESCURIDÃO COM RECORTE DA LUZ DA LAMPARINA -->
        <canvas id="dracma-canvas" style="position:absolute; inset:0; width:100%; height:100%; z-index:5; pointer-events:auto; transition:opacity 0.8s ease;"></canvas>

        <!-- 3. ÍCONE DA LAMPARINA BÍBLICA FLUTUANTE GUIADA PELO DEDINHO -->
        <div id="dracma-lamparina-glow" style="position:absolute; width:68px; height:68px; margin-left:-34px; margin-top:-34px; pointer-events:none; z-index:6; display:flex; align-items:center; justify-content:center; animation:lampFlamePulse 1.8s ease-in-out infinite; transition:transform 0.05s ease-out;">
          <span style="font-size:36px; transform:translateY(-4px);">🪔</span>
        </div>

        <!-- 4. CONTADOR OFICIAL DE DRACMAS ENCONTRADAS -->
        <div style="position:absolute; top:18px; left:18px; background:rgba(18, 11, 6, 0.88); border:2.5px solid #fde047; padding:8px 18px; border-radius:999px; color:#fde047; font-weight:900; font-size:18px; z-index:10; box-shadow:0 6px 16px rgba(0,0,0,0.75); display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">🪙</span> <span id="dracmas-count">0</span> / ${totalMoedas}
        </div>

        <!-- 5. CRACHÁ DE NÍVEL & FOCO DA LAMPARINA -->
        <div style="position:absolute; top:18px; right:18px; background:rgba(18, 11, 6, 0.88); border:2px solid #ca8a04; padding:6px 14px; border-radius:999px; color:#fef08a; font-weight:800; font-size:13px; z-index:10; box-shadow:0 4px 12px rgba(0,0,0,0.65);">
          💡 FOCO FASE ${phase}
        </div>

        <!-- 6. DICA VISUAL ANIMADA EM TELA (ORIENTAÇÃO DA CRIANÇA) -->
        <div id="dracma-instruction-tip" style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(18, 11, 6, 0.88); border:2px solid #ca8a04; padding:8px 20px; border-radius:999px; color:#ffffff; font-weight:800; font-size:14px; z-index:10; box-shadow:0 4px 14px rgba(0,0,0,0.7); pointer-events:none; transition:all 0.5s ease; white-space:nowrap;">
          🔍 Arraste a lamparina para iluminar o chão!
        </div>
      </div>
    `;

    const canvas = document.getElementById("dracma-canvas");
    const lampGlow = document.getElementById("dracma-lamparina-glow");
    const countEl = document.getElementById("dracmas-count");
    const ctx = canvas.getContext("2d");

    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 60);

    let lightX = canvas.width / 2;
    let lightY = canvas.height * 0.65;

    // Desenha a escuridão bíblica suave com máscara de luz de lamparina
    function renderDarkness(lx, ly) {
      lightX = lx;
      lightY = ly;

      // Move a lamparina guia
      if (lampGlow) {
        lampGlow.style.left = lx + "px";
        lampGlow.style.top = ly + "px";
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Escuridão suave de noite bíblica (mantém silhueta atmosférica)
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(14, 9, 6, 0.94)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Furo de Luz da Lamparina com recorte e transição orgânica
      ctx.globalCompositeOperation = "destination-out";
      const radG = ctx.createRadialGradient(lx, ly, raioLuz * 0.15, lx, ly, raioLuz);
      radG.addColorStop(0, "rgba(0,0,0,1)");
      radG.addColorStop(0.65, "rgba(0,0,0,0.95)");
      radG.addColorStop(0.85, "rgba(0,0,0,0.55)");
      radG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radG;
      ctx.beginPath();
      ctx.arc(lx, ly, raioLuz, 0, Math.PI * 2);
      ctx.fill();

      // 3. Auréola de luz âmbar dourada ao redor do foco da lamparina
      ctx.globalCompositeOperation = "source-over";
      const glowG = ctx.createRadialGradient(lx, ly, raioLuz * 0.45, lx, ly, raioLuz * 1.15);
      glowG.addColorStop(0, "rgba(253, 224, 71, 0.20)");
      glowG.addColorStop(0.65, "rgba(245, 158, 11, 0.08)");
      glowG.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.arc(lx, ly, raioLuz * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    renderDarkness(lightX, lightY);

    // FUNÇÃO QUE COLETA A MOEDA
    function collectCoin(coinEl, idx) {
      if (!coinEl || coinEl.dataset.found === "true") return;
      coinEl.dataset.found = "true";
      coinEl.style.zIndex = "25";
      coinEl.style.pointerEvents = "none";
      coinEl.style.animation = "dracmaFoundBurst 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) forwards";

      TronoAudio.play("coin");
      moedasAchadas++;

      if (countEl) {
        countEl.textContent = moedasAchadas;
        countEl.style.transform = "scale(1.4)";
        setTimeout(() => { if (countEl) countEl.style.transform = "scale(1)"; }, 250);
      }

      // Vitória quando encontrar todas as moedas da fase!
      if (moedasAchadas >= totalMoedas) {
        // Revela a casa toda iluminada por 1 segundo!
        setTimeout(() => {
          if (canvas) canvas.style.opacity = "0";
          if (lampGlow) lampGlow.style.display = "none";
          TronoAudio.play("success");
        }, 350);

        setTimeout(triggerArcadeVictory, 1100);
      }
    }

    // Clique direto nas moedas
    currentSpots.forEach((_, idx) => {
      const coin = document.getElementById(`dracma-coin-${idx}`);
      if (coin) {
        coin.addEventListener("click", (e) => {
          e.stopPropagation();
          collectCoin(coin, idx);
        });
      }
    });

    // MOVIMENTAÇÃO DA LUZ E TOQUE NA TELA (TOUCH / MOUSE)
    function handlePointer(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;

      renderDarkness(lx, ly);

      // Verificação de proximidade para coletar a moeda caso a criança toque na luz sobre ela
      currentSpots.forEach((spot, idx) => {
        const coin = document.getElementById(`dracma-coin-${idx}`);
        if (!coin || coin.dataset.found === "true") return;

        const coinPixelX = (spot.x / 100) * canvas.width;
        const coinPixelY = (spot.y / 100) * canvas.height;

        const dist = Math.hypot(lx - coinPixelX, ly - coinPixelY);
        // Se a luz passou por cima da moeda e a criança tocou ou está sobre ela
        if (dist <= Math.max(raioLuz * 0.75, 42)) {
          // Destaca o brilho da moeda quando a luz está em cima
          coin.style.filter = "brightness(1.4) drop-shadow(0 0 16px #fde047)";
        } else {
          coin.style.filter = "none";
        }
      });
    }

    canvas.addEventListener("mousemove", handlePointer);
    canvas.addEventListener("touchmove", handlePointer, { passive: true });
    canvas.addEventListener("pointermove", handlePointer);

    // Toque direto no canvas: verifica se tocou em cima de uma moeda revelada pela luz
    function handleCanvasTap(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.touches ? e.touches[0].clientX : e.clientX);
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : (e.touches ? e.touches[0].clientY : e.clientY);
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;

      currentSpots.forEach((spot, idx) => {
        const coin = document.getElementById(`dracma-coin-${idx}`);
        if (!coin || coin.dataset.found === "true") return;

        const coinPixelX = (spot.x / 100) * canvas.width;
        const coinPixelY = (spot.y / 100) * canvas.height;

        const distToTouch = Math.hypot(lx - coinPixelX, ly - coinPixelY);
        const distToLight = Math.hypot(lightX - coinPixelX, lightY - coinPixelY);

        // Se tocou perto da moeda E a moeda está dentro da área iluminada pela lamparina
        if (distToTouch <= 46 || (distToTouch <= raioLuz && distToLight <= raioLuz)) {
          collectCoin(coin, idx);
        }
      });
    }

    canvas.addEventListener("click", handleCanvasTap);
    canvas.addEventListener("touchend", handleCanvasTap, { passive: true });

    // TRAVA PEDAGÓGICA DO VOVÔ NÉSIO:
    window._arcadeUnlockGameAction = function() {
      if (!isInteractionLocked) return;
      isInteractionLocked = false;
      TronoAudio.play("pop");
      const tip = document.getElementById("dracma-instruction-tip");
      if (tip) {
        tip.textContent = "✨ Encontre as moedinhas com a lamparina!";
        tip.style.background = "rgba(34, 197, 94, 0.92)";
        tip.style.borderColor = "#ffffff";
        setTimeout(() => {
          if (tip) tip.style.opacity = "0";
        }, 2200);
      }
    };
  }

  // ==========================================================================
  // JOGO 3: O POMBO DA ARCA (LABIRINTO CANÔNICO v110.0 - RIGOBERTO)
  // - Caminho ÚNICO até a Arca de Noé
  // - Múltiplos becos sem saída falsos para explorar
  // - A Arca fica SEMPRE no final de um beco comprido
  // - Dificuldade progressiva real da Fase 1 até a Fase 15 (15x15 desafiador)
  // - Arca de Noé 100% inteira e visível no porto final, sem cortes
  // - D-Pad de videogame neutro centralizado com resposta direta
  // ==========================================================================
  const DEEP_POMBO_MAZES = [{"width": 9, "height": 9, "start": {"x": 1, "y": 7}, "goal": {"x": 7, "y": 1}, "solution_len": 25, "corridor_len": 8, "false_paths": 2, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 1}, {"width": 9, "height": 9, "start": {"x": 1, "y": 7}, "goal": {"x": 5, "y": 7}, "solution_len": 13, "corridor_len": 4, "false_paths": 3, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 2}, {"width": 9, "height": 9, "start": {"x": 1, "y": 7}, "goal": {"x": 1, "y": 3}, "solution_len": 13, "corridor_len": 4, "false_paths": 3, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 3}, {"width": 11, "height": 11, "start": {"x": 1, "y": 9}, "goal": {"x": 5, "y": 5}, "solution_len": 37, "corridor_len": 4, "false_paths": 4, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 4}, {"width": 11, "height": 11, "start": {"x": 1, "y": 9}, "goal": {"x": 5, "y": 3}, "solution_len": 39, "corridor_len": 4, "false_paths": 4, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 5}, {"width": 11, "height": 11, "start": {"x": 1, "y": 9}, "goal": {"x": 1, "y": 7}, "solution_len": 23, "corridor_len": 10, "false_paths": 2, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 6}, {"width": 11, "height": 11, "start": {"x": 1, "y": 9}, "goal": {"x": 5, "y": 9}, "solution_len": 17, "corridor_len": 6, "false_paths": 5, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 7}, {"width": 13, "height": 13, "start": {"x": 1, "y": 11}, "goal": {"x": 3, "y": 9}, "solution_len": 37, "corridor_len": 12, "false_paths": 6, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 8}, {"width": 13, "height": 13, "start": {"x": 1, "y": 11}, "goal": {"x": 5, "y": 3}, "solution_len": 49, "corridor_len": 6, "false_paths": 6, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 9}, {"width": 13, "height": 13, "start": {"x": 1, "y": 11}, "goal": {"x": 11, "y": 3}, "solution_len": 59, "corridor_len": 24, "false_paths": 3, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 10}, {"width": 13, "height": 13, "start": {"x": 1, "y": 11}, "goal": {"x": 7, "y": 1}, "solution_len": 57, "corridor_len": 12, "false_paths": 3, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 11}, {"width": 15, "height": 15, "start": {"x": 1, "y": 13}, "goal": {"x": 9, "y": 13}, "solution_len": 61, "corridor_len": 6, "false_paths": 8, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0], [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 12}, {"width": 15, "height": 15, "start": {"x": 1, "y": 13}, "goal": {"x": 11, "y": 3}, "solution_len": 77, "corridor_len": 10, "false_paths": 9, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 13}, {"width": 15, "height": 15, "start": {"x": 1, "y": 13}, "goal": {"x": 7, "y": 3}, "solution_len": 81, "corridor_len": 14, "false_paths": 2, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 14}, {"width": 15, "height": 15, "start": {"x": 1, "y": 13}, "goal": {"x": 1, "y": 7}, "solution_len": 71, "corridor_len": 16, "false_paths": 4, "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], "phase": 15}];

  function runPomboArca(container, phase) {
    const phaseIndex = Math.max(0, Math.min(DEEP_POMBO_MAZES.length - 1, (phase || 1) - 1));
    const mazeData = DEEP_POMBO_MAZES[phaseIndex];
    const width = mazeData.width;
    const height = mazeData.height;
    const grid = mazeData.grid;
    const goalX = mazeData.goal.x;
    const goalY = mazeData.goal.y;

    let currX = mazeData.start.x;
    let currY = mazeData.start.y;
    let isGameWon = false;
    let isUnlocked = true;

    window._arcadeUnlockGameAction = function() {
      isUnlocked = true;
    };

    // Medidas em TELA CHEIA TOTAL (Sem bloquinhos com margem):
    const totalW = container.clientWidth || window.innerWidth;
    const totalH = container.clientHeight || (window.innerHeight - 60);

    // Área útil para o labirinto: largura total com margem leve de 14px nas laterais;
    // Altura: do topo até acima do D-PAD flutuante (reserva ~145px no rodapé para os botões).
    const availW = Math.max(260, totalW - 24);
    const availH = Math.max(260, totalH - 145);

    // Célula quadrada proporcional que preenche a tela sem distorção:
    const cellSize = Math.floor(Math.min(availW / width, availH / height));
    const gridTotalW = cellSize * width;
    const gridTotalH = cellSize * height;

    // Offsets para centralizar o labirinto no céu:
    const offsetX = Math.round((totalW - gridTotalW) / 2);
    const offsetY = Math.round(14 + (availH - gridTotalH) / 2);

    const cloudSize = Math.round(cellSize * 1.25);
    const doveSize = Math.round(cellSize * 0.85);
    const arkSize = Math.round(cellSize * 1.48);

    container.innerHTML = `
      <div class="pombo-v110-wrapper">

        <!-- Palco do Labirinto de Nuvens em Tela Cheia -->
        <div class="pombo-v110-board" id="pombo-board">
          <!-- Camada de Céu de Fundo Contínuo -->
          <div class="pombo-v110-sky-bg"></div>

          <!-- Nuvens Atmosféricas Flutuantes de Fundo -->
          <div class="pombo-v110-sky-decor" style="position:absolute; inset:0; pointer-events:none; opacity:0.35;">
            <img src="./2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110" style="position:absolute; top:4%; left:8%; width:90px; filter:blur(1px);"/>
            <img src="./2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110" style="position:absolute; top:12%; right:6%; width:110px; filter:blur(1.5px);"/>
            <img src="./2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110" style="position:absolute; bottom:18%; left:4%; width:100px; filter:blur(1px);"/>
            <img src="./2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110" style="position:absolute; bottom:22%; right:8%; width:120px; filter:blur(1.5px);"/>
          </div>

          <!-- Paredes de Nuvenzinhas do Labirinto -->
          <div class="pombo-v110-walls-layer" id="pombo-walls-layer"></div>

          <!-- Arca de Noé (No final do beco comprido, 100% inteira sem cortes) -->
          <div class="pombo-v110-ark" id="pombo-ark" style="width:${arkSize}px; height:${arkSize}px;">
            <img src="./2_ASSETS_UI_BOTOES/arca_de_noe_labirinto.svg?v=110" alt="Arca de Noé" class="pombo-v110-ark-img"/>
          </div>

          <!-- Pombinha Branca da Promessa -->
          <div class="pombo-v110-dove" id="pombo-dove-el" style="width:${doveSize}px; height:${doveSize}px;">
            <img src="./2_ASSETS_UI_BOTOES/pombinha_branca_voando.svg?v=110" alt="Pombinha" id="pombo-dove-img" class="pombo-v110-dove-img"/>
          </div>
        </div>

        <!-- CONSOLE D-PAD FLUTUANTE SOBREPOSTO NO RODAPÉ (INSERIDO NA TELA) -->
        <div class="pombo-v110-controller-area">
          <div class="pombo-v110-dpad-disc">
            <button class="pombo-v110-btn btn-up" id="btn-pombo-up" data-dir="up" aria-label="Cima">
              <span class="dpad-arrow-sym">▲</span>
            </button>
            <div class="pombo-v110-mid-row">
              <button class="pombo-v110-btn btn-left" id="btn-pombo-left" data-dir="left" aria-label="Esquerda">
                <span class="dpad-arrow-sym">◀</span>
              </button>
              <div class="pombo-v110-center-core">
                <div class="dpad-hub-dot"></div>
              </div>
              <button class="pombo-v110-btn btn-right" id="btn-pombo-right" data-dir="right" aria-label="Direita">
                <span class="dpad-arrow-sym">▶</span>
              </button>
            </div>
            <button class="pombo-v110-btn btn-down" id="btn-pombo-down" data-dir="down" aria-label="Baixo">
              <span class="dpad-arrow-sym">▼</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Renderiza as nuvenzinhas que formam as paredes
    const wallsLayer = document.getElementById("pombo-walls-layer");
    let cloudsHtml = "";
    const cloudImgSrc = "./2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === 0) {
          const posX = Math.round(offsetX + x * cellSize + cellSize / 2);
          const posY = Math.round(offsetY + y * cellSize + cellSize / 2);
          cloudsHtml += `<img src="${cloudImgSrc}" class="pombo-uniform-cloud" style="left:${posX}px; top:${posY}px; width:${cloudSize}px; height:${cloudSize}px;"/>`;
        }
      }
    }
    wallsLayer.innerHTML = cloudsHtml;

    // Posiciona a Arca de Noé no fim do caminho
    const arkEl = document.getElementById("pombo-ark");
    const arkX = Math.round(offsetX + goalX * cellSize + cellSize / 2);
    const arkY = Math.round(offsetY + goalY * cellSize + cellSize / 2);
    arkEl.style.left = arkX + "px";
    arkEl.style.top = arkY + "px";

    // Posiciona a Pombinha no Início
    const doveEl = document.getElementById("pombo-dove-el");
    const doveImg = document.getElementById("pombo-dove-img");

    function renderDovePos() {
      const px = Math.round(offsetX + currX * cellSize + cellSize / 2);
      const py = Math.round(offsetY + currY * cellSize + cellSize / 2);
      doveEl.style.left = px + "px";
      doveEl.style.top = py + "px";
    }
    renderDovePos();

    // LÓGICA DE MOVIMENTO DIRETO (RIGOBERTO UX):
    // Apertou direita -> vai direita
    // Apertou esquerda -> vai esquerda
    // Apertou cima -> vai cima
    // Apertou baixo -> vai baixo
    // Se o caminho tiver nuvem -> trava e não anda
    const dirDeltas = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };

    function tryMove(dir) {
      if (isGameWon || !isUnlocked) return;
      const [dx, dy] = dirDeltas[dir];
      const nx = currX + dx;
      const ny = currY + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 1) {
        // Caminho livre
        currX = nx;
        currY = ny;

        if (dir === "left") doveImg.style.transform = "scaleX(-1)";
        else if (dir === "right") doveImg.style.transform = "scaleX(1)";

        renderDovePos();
        TronoAudio.play("click");

        // Chegou na Arca de Noé no fim do beco?
        if (currX === goalX && currY === goalY) {
          isGameWon = true;
          TronoAudio.play("success");
          TronoAudio.play("star");
          doveEl.style.transform = "translate(-50%, -50%) scale(1.35) rotate(-10deg)";
          setTimeout(triggerArcadeVictory, 600);
        }
      } else {
        // Caminho bloqueado: trava a pombinha
        TronoAudio.play("pop");
        doveEl.classList.add("dove-blocked-bump");
        setTimeout(() => doveEl.classList.remove("dove-blocked-bump"), 180);
      }
    }

    // VINCULAÇÃO DOS BOTÕES D-PAD (TOQUE E REPETIÇÃO AO SEGURAR)
    ["up", "down", "left", "right"].forEach(dir => {
      const btn = document.getElementById(`btn-pombo-${dir}`);
      if (!btn) return;

      let holdTimer = null;
      let repeatInterval = null;

      function startAction(e) {
        e.preventDefault();
        e.stopPropagation();
        tryMove(dir);

        clearInterval(repeatInterval);
        clearTimeout(holdTimer);

        // Se segurar, anda continuamente pelo carreirinho
        holdTimer = setTimeout(() => {
          repeatInterval = setInterval(() => {
            tryMove(dir);
          }, 120);
        }, 220);
      }

      function stopAction(e) {
        clearTimeout(holdTimer);
        clearInterval(repeatInterval);
      }

      btn.addEventListener("pointerdown", startAction);
      btn.addEventListener("pointerup", stopAction);
      btn.addEventListener("pointercancel", stopAction);
      btn.addEventListener("pointerleave", stopAction);
    });
  }

  // ==========================================================================
  // JOGO 4: DAVI E A LANÇA DE SAUL (v121.0 - PERSPECTIVA 3D TELA CHEIA)
  // - Saul de corpo inteiro em pé diante do trono monumental
  // - Davi em primeiro plano com esquiva ágil (Pular, Abaixar, Esquerda, Direita)
  // - Controles D-PAD flutuantes sobrepostos no rodapé (inseridos na cena)
  // - 15 Fases progressivas: Fase 1 = 1 lança suave, ritmo cinematográfico
  // ==========================================================================
  function runJonatasAlvo(container, phase) {
    const currentPhaseNum = phase || 1;
    // REGRA DE OURO RIGOBERTO: Fase 1 = 1 única lança suave! Fase 2 = 2 lanças...
    const totalSpears = Math.min(phase || 1, 5);
    let spearIndex = 0;
    let successfulDodges = 0;
    let isGameWon = false;
    let isShooting = false;
    let isUnlocked = true;

    // Posições de Davi no Primeiro Plano: "center", "left", "right"
    let daviPosition = "center";
    let isJumping = false;
    let isCrouching = false;

    // Catálogo das Lanças em Perspectiva 3D:
    // 1. "baixa" -> Lança rente ao chão -> Davi PULA (▲)
    // 2. "alta"  -> Lança alta no peito -> Davi ABAIXA (▼)
    // 3. "esquerda" -> Lança no flanco esquerdo -> Davi esquiva para a DIREITA (▶)
    // 4. "direita"  -> Lança no flanco direito -> Davi esquiva para a ESQUERDA (◀)
    let attackCatalog = [];
    if (currentPhaseNum === 1) {
      attackCatalog = ["baixa"]; // Fase 1: 1 única lança rasteira (Pular!)
    } else if (currentPhaseNum === 2) {
      attackCatalog = ["baixa", "alta"];
    } else if (currentPhaseNum === 3) {
      attackCatalog = ["esquerda", "baixa", "direita"];
    } else {
      const allAttacks = ["baixa", "alta", "esquerda", "direita"];
      for (let i = 0; i < totalSpears; i++) {
        attackCatalog.push(allAttacks[i % allAttacks.length]);
      }
      for (let i = attackCatalog.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [attackCatalog[i], attackCatalog[j]] = [attackCatalog[j], attackCatalog[i]];
      }
    }

    window._arcadeUnlockGameAction = function() {
      isUnlocked = true;
      scheduleNextSpear(900);
    };

    container.innerHTML = `
      <div class="davi-game-fullscreen">
        <!-- PALCO 3D EM TELA CHEIA (SALÃO DO TRONO) -->
        <div class="davi-palace-stage" id="davi-palace-stage">
          <!-- Fundo Real 3D Pixar do Palácio de Saul -->
          <img src="./2_ASSETS_UI_BOTOES/fundo_palacio_saul_3d.jpg?v=123" class="davi-palace-bg" alt="Palácio Real de Saul 3D"/>
          <div class="davi-palace-vignette"></div>

          <!-- REI SAUL DE CORPO INTEIRO DE FRENTE NO CHÃO DIANTE DO TRONO -->
          <div class="davi-saul-throne" id="davi-saul-throne">
            <img src="./2_ASSETS_UI_BOTOES/rei_saul_frontal_v123.png?v=123" alt="Rei Saul 3D" class="saul-throne-img" id="saul-throne-img"/>
          </div>

          <!-- A LANÇA REAL FRONTAL VOANDO EM DIREÇÃO A DAVI (PERSPECTIVA 3D) -->
          <div class="davi-spear-projectile" id="davi-spear-projectile">
            <img src="./2_ASSETS_UI_BOTOES/lanca_frontal_v123.png?v=123" alt="Lança em Voo 3D"/>
          </div>

          <!-- CAMADA DE LANÇAS CRAVADAS NO PISO / TAPETE -->
          <div class="davi-stuck-impact-layer" id="davi-stuck-layer"></div>

          <!-- DAVI JOVEM PASTOR NO PRIMEIRO PLANO (ACIMA DOS BOTÕES) -->
          <div class="davi-hero-box center-pos" id="davi-hero-box">
            <div class="davi-hero-shadow"></div>
            <img src="./2_ASSETS_UI_BOTOES/davi_costas_v123.png?v=123" alt="Davi Pastor 3D" class="davi-hero-img" id="davi-hero-img"/>
          </div>
        </div>

        <!-- CONSOLE D-PAD FLUTUANTE SOBREPOSTO NO RODAPÉ (INSERIDO NA CENA) -->
        <div class="davi-controls-bar">
          <div class="davi-dpad-disc">
            <button class="davi-dpad-btn" id="btn-davi-up" aria-label="Pular">
              <span class="dpad-arrow-sym">▲</span>
            </button>
            <div class="davi-mid-row">
              <button class="davi-dpad-btn" id="btn-davi-left" aria-label="Esquerda">
                <span class="dpad-arrow-sym">◀</span>
              </button>
              <div class="davi-center-core">
                <div class="dpad-hub-dot"></div>
              </div>
              <button class="davi-dpad-btn" id="btn-davi-right" aria-label="Direita">
                <span class="dpad-arrow-sym">▶</span>
              </button>
            </div>
            <button class="davi-dpad-btn" id="btn-davi-down" aria-label="Abaixar">
              <span class="dpad-arrow-sym">▼</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Atualiza badges de livramentos no topo se o elemento existir
    function updateBadges() {
      const badgesEl = document.getElementById("davi-spear-badges");
      if (!badgesEl) return;
      let h = "";
      for (let i = 0; i < totalSpears; i++) {
        if (i < successfulDodges) {
          h += `<span class="davi-badge done">⭐</span>`;
        } else if (i === spearIndex) {
          h += `<span class="davi-badge current">🗡️</span>`;
        } else {
          h += `<span class="davi-badge pending">⚪</span>`;
        }
      }
      badgesEl.innerHTML = h;
    }
    updateBadges();

    const heroBox = document.getElementById("davi-hero-box");
    const saulThrone = document.getElementById("davi-saul-throne");
    const spearProjectile = document.getElementById("davi-spear-projectile");
    const stuckLayer = document.getElementById("davi-stuck-layer");

    // =========================================================================
    // MOVIMENTOS NATURAIS DE DAVI
    // =========================================================================
    // 1. Pular (▲ Cima)
    let jumpTimer = null;
    function doHeroJump() {
      if (isGameWon || isJumping) return;
      isJumping = true;
      heroBox.classList.remove("crouching");
      heroBox.classList.add("jumping");
      TronoAudio.play("click");

      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(() => {
        heroBox.classList.remove("jumping");
        isJumping = false;
      }, 820);
    }

    // 2. Abaixar (▼ Baixo)
    let crouchTimer = null;
    function doHeroCrouch() {
      if (isGameWon || isJumping) return;
      isCrouching = true;
      heroBox.classList.add("crouching");
      TronoAudio.play("click");

      clearTimeout(crouchTimer);
      crouchTimer = setTimeout(() => {
        heroBox.classList.remove("crouching");
        isCrouching = false;
      }, 820);
    }

    // 3. Desviar para a Esquerda (◀ Esquerda)
    function doHeroLeft() {
      if (isGameWon) return;
      daviPosition = "left";
      heroBox.className = "davi-hero-box dodge-left" + (isJumping ? " jumping" : "") + (isCrouching ? " crouching" : "");
      TronoAudio.play("click");
    }

    // 4. Desviar para a Direita (▶ Direita)
    function doHeroRight() {
      if (isGameWon) return;
      daviPosition = "right";
      heroBox.className = "davi-hero-box dodge-right" + (isJumping ? " jumping" : "") + (isCrouching ? " crouching" : "");
      TronoAudio.play("click");
    }

    // Voltar para o Centro suavemente
    function doHeroCenter() {
      if (isGameWon) return;
      daviPosition = "center";
      heroBox.className = "davi-hero-box center-pos" + (isJumping ? " jumping" : "") + (isCrouching ? " crouching" : "");
    }

    // BINDINGS TOUCH POINTERDOWN
    document.getElementById("btn-davi-up").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroJump(); });
    document.getElementById("btn-davi-down").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroCrouch(); });
    document.getElementById("btn-davi-left").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroLeft(); });
    document.getElementById("btn-davi-right").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroRight(); });

    // SUPORTE AO TECLADO
    function handleKeyDown(e) {
      if (isGameWon) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
        e.preventDefault(); doHeroJump();
      } else if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault(); doHeroCrouch();
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault(); doHeroLeft();
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault(); doHeroRight();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    // =========================================================================
    // CICLO DA LANÇA EM PERSPECTIVA 3D REAL (VINDO DO TRONO DE SAUL)
    // =========================================================================
    function scheduleNextSpear(delay) {
      if (isGameWon) return;
      if (window._daviSpearTimer) clearTimeout(window._daviSpearTimer);
      window._daviSpearTimer = setTimeout(launchSpearFromThrone, delay || 1400);
    }

    function launchSpearFromThrone() {
      if (isGameWon || spearIndex >= totalSpears) return;
      isShooting = true;

      const attackType = attackCatalog[spearIndex] || "baixa";

      // 1. SAUL PREPARA O GOLPE (SUSPENSE SUAVE VISUAL)
      saulThrone.classList.add("windup");
      TronoAudio.play("click");

      // Tempo de preparação visual suave para a criança prestar atenção: 900ms
      if (window._daviWindupTimer) clearTimeout(window._daviWindupTimer);
      window._daviWindupTimer = setTimeout(() => {
        if (isGameWon) return;

        // 2. ARREMESSO FÍSICO DE SAUL DE FRENTE PARA DAVI NO CENTRO
        saulThrone.classList.remove("windup");
        saulThrone.classList.add("throw");

        // Configuração inicial da lança saindo da mão/lança de Saul na frente do trono (top: 44%, left: 48%)
        spearProjectile.style.display = "block";
        spearProjectile.style.transition = "none";
        spearProjectile.style.top = "44%";
        spearProjectile.style.left = "48%";
        spearProjectile.style.width = "62px";
        spearProjectile.style.height = "126px";
        spearProjectile.style.transform = "translate(-50%, -50%) scale(0.32)";

        // Força reflow para animação CSS fluida
        void spearProjectile.offsetWidth;

        // Cálculo dinâmico exato da altura de Davi no palco atual (qualquer tamanho de tela)
        const stageEl = document.getElementById("davi-palace-stage");
        const stageH = (stageEl && stageEl.clientHeight) ? stageEl.clientHeight : (window.innerHeight - 60);
        // heroBox tem bottom: 142px e height: 128px
        const heroBottomPx = stageH - 142;
        const heroTopPx = heroBottomPx - 128;
        const lowPct = Math.round(((heroBottomPx - 18) / stageH) * 100);
        const highPct = Math.round(((heroTopPx + 26) / stageH) * 100);
        const midPct = Math.round(((heroTopPx + 64) / stageH) * 100);

        let targetLeft = "50%";
        let targetTop = lowPct + "%";
        let targetScale = "1.22";
        const flyDurationMs = 1500; // Voo cinematográfico e suave (~1.5s)

        if (attackType === "baixa") {
          targetTop = lowPct + "%";
          targetLeft = "50%";
        } else if (attackType === "alta") {
          targetTop = highPct + "%";
          targetLeft = "50%";
        } else if (attackType === "esquerda") {
          targetTop = midPct + "%";
          targetLeft = "24%";
        } else if (attackType === "direita") {
          targetTop = midPct + "%";
          targetLeft = "76%";
        }

        // DISPARA O VOO EM PERSPECTIVA 3D CRESCENDO DO CENTRO DE SAUL ATÉ DAVI!
        spearProjectile.style.transition = `top ${flyDurationMs}ms cubic-bezier(0.2, 0.6, 0.4, 1), left ${flyDurationMs}ms ease-out, transform ${flyDurationMs}ms cubic-bezier(0.2, 0.6, 0.4, 1)`;
        spearProjectile.style.top = targetTop;
        spearProjectile.style.left = targetLeft;
        spearProjectile.style.transform = `translate(-50%, -50%) scale(${targetScale})`;

        TronoAudio.play("arrow");

        // 3. MOMENTO DO IMPACTO / CHECAGEM DE ESQUIVA (aos 1220ms)
        setTimeout(() => {
          if (isGameWon) return;

          let didDodge = false;
          if (attackType === "baixa") {
            // Lança rasteira nos pés: Davi precisa estar pulando!
            didDodge = isJumping;
          } else if (attackType === "alta") {
            // Lança alta na cabeça: Davi precisa estar agachado!
            didDodge = isCrouching;
          } else if (attackType === "esquerda") {
            // Lança na esquerda: Davi precisa ter saído da esquerda!
            didDodge = (daviPosition !== "left");
          } else if (attackType === "direita") {
            // Lança na direita: Davi precisa ter saído da direita!
            didDodge = (daviPosition !== "right");
          }

          if (didDodge) {
            // SUCESSO! LIVRAMENTO ABENÇOADO!
            successfulDodges++;
            spearIndex++;
            updateBadges();

            // Crava a lança no chão com faísca
            const stuck = document.createElement("div");
            stuck.className = "davi-stuck-impact-spear";
            stuck.style.left = targetLeft;
            stuck.style.top = targetTop;
            stuck.style.transform = `translate(-50%, -50%) scale(1.05)`;
            stuckLayer.appendChild(stuck);

            TronoAudio.play("star");
            spearProjectile.style.display = "none";
            saulThrone.classList.remove("throw");

            if (successfulDodges >= totalSpears) {
              // VITÓRIA DA FASE!
              isGameWon = true;
              window.removeEventListener("keydown", handleKeyDown);
              setTimeout(() => {
                triggerArcadeVictory();
              }, 550);
            } else {
              // Próxima lança com intervalo calmo e relaxado
              setTimeout(() => {
                doHeroCenter();
                scheduleNextSpear(1500);
              }, 700);
            }
          } else {
            // NÃO ESQUIVOU A TEMPO: FEEDBACK CARINHOSO SEM PUNIÇÃO
            heroBox.classList.add("hit-stumble");
            TronoAudio.play("pop");

            spearProjectile.style.display = "none";
            saulThrone.classList.remove("throw");

            setTimeout(() => {
              heroBox.classList.remove("hit-stumble");
              doHeroCenter();
              // Repete a mesma lança com calma
              scheduleNextSpear(1400);
            }, 900);
          }
        }, 1220);

      }, 900);
    }
  }

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
