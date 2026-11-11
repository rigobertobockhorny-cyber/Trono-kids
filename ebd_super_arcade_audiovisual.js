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
    vovoPlayer: null,
    vovoVictoryPlayer: null,
    _victoryAudioPrimed: false,
    _voicePrimed: false,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (!this.splashAudio) {
        try {
          this.splashAudio = new Audio('./6_ASSETS_AUDIO/jogos_vovo/som_splash_agua.mp3?v=104');
          this.splashAudio.volume = 1.0;
          this.splashAudio.preload = "auto";
        } catch(e) {}
      }
      if (!this.lambAudioPool) {
        try {
          const urls = [
            './6_ASSETS_AUDIO/jogos_vovo/som_ovelha_bee_01.mp3?v=136',
            './6_ASSETS_AUDIO/jogos_vovo/som_ovelha_bee_02.mp3?v=136'
          ];
          this._lambIdx = 0;
          this._lambBuffers = [];
          this.lambAudioPool = urls.map(u => {
            const a = new Audio(u);
            a.volume = 1.0;
            a.preload = "auto";
            return a;
          });
          if (this.ctx && typeof fetch === "function") {
            urls.forEach((u, idx) => {
              fetch(u)
                .then(r => r.ok ? r.arrayBuffer() : null)
                .then(buf => (buf && this.ctx) ? this.ctx.decodeAudioData(buf) : null)
                .then(decoded => { if (decoded) this._lambBuffers[idx] = decoded; })
                .catch(() => {});
            });
          }
        } catch(e) {}
      }
      if (!this.vovoPlayer) {
        try {
          this.vovoPlayer = new Audio();
          this.vovoPlayer.preload = "auto";
        } catch(e) {}
      }
      if (!this.vovoVictoryPlayer) {
        try {
          this.vovoVictoryPlayer = new Audio('./6_ASSETS_AUDIO/jogos_vovo/vovo_vitoria.mp3?v=126');
          this.vovoVictoryPlayer.preload = "auto";
        } catch(e) {}
      }
    },

    unlockGestureAudio() {
      this.init();
      // Destrava permanentemente o canal HTMLAudioElement do Vovô no celular (Android Chrome / iOS Safari)
      // para que falarVovo funcione 100% mesmo dentro de setTimeout no fim das fases!
      if (!this._victoryAudioPrimed && this.vovoVictoryPlayer) {
        this._victoryAudioPrimed = true;
        try {
          const v = this.vovoVictoryPlayer;
          v.muted = true;
          const p = v.play();
          if (p && typeof p.then === "function") {
            p.then(() => {
              v.pause();
              v.currentTime = 0;
              v.muted = false;
              v.volume = 1.0;
            }).catch(() => {
              v.muted = false;
              v.volume = 1.0;
              this._victoryAudioPrimed = false;
            });
          } else {
            v.pause();
            v.currentTime = 0;
            v.muted = false;
          }
        } catch (e) {
          this._victoryAudioPrimed = false;
        }
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
          // Gravação acústica 100% real de ovelhinha dando "BÉÉÉ!" ao ser encontrada!
          const idx = (this._lambIdx = ((this._lambIdx || 0) + 1) % 2);
          const buf = this._lambBuffers && (this._lambBuffers[idx] || this._lambBuffers[0]);
          if (buf && this.ctx) {
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            src.buffer = buf;
            // Leve variação natural de tom (0.97 a 1.05) para cada ovelhinha soar viva e única!
            src.playbackRate.value = 0.97 + Math.random() * 0.08;
            gain.gain.setValueAtTime(1.0, now);
            src.connect(gain);
            gain.connect(this.ctx.destination);
            src.start(now);
          } else if (this.lambAudioPool && this.lambAudioPool[idx]) {
            try {
              const el = this.lambAudioPool[idx];
              el.currentTime = 0;
              el.volume = 1.0;
              el.play().catch(() => {});
            } catch(e) {}
          }
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
        } else if (type === "hit") {
          // Som expressivo de Davi atingido ("bó-óim / poum" suave de arcade infantil)
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = "sawtooth";
          osc1.frequency.setValueAtTime(290, now);
          osc1.frequency.exponentialRampToValueAtTime(115, now + 0.28);
          gain1.gain.setValueAtTime(0.28, now);
          gain1.gain.exponentialRampToValueAtTime(0.008, now + 0.3);
          osc1.connect(gain1);
          gain1.connect(this.ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.3);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(190, now + 0.06);
          osc2.frequency.exponentialRampToValueAtTime(85, now + 0.32);
          gain2.gain.setValueAtTime(0.32, now + 0.06);
          gain2.gain.exponentialRampToValueAtTime(0.008, now + 0.34);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(now + 0.06);
          osc2.stop(now + 0.34);
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

    _vovoCallId: 0,
    _vovoExactDurationsMs: {
      "vovo_jogo_01.mp3": 5940,
      "vovo_jogo_02.mp3": 7290,
      "vovo_jogo_03.mp3": 5940,
      "vovo_jogo_04.mp3": 12590,
      "vovo_jogo_05.mp3": 11150,
      "vovo_jogo_05_v135.mp3": 11150,
      "vovo_jogo_06.mp3": 5760,
      "vovo_jogo_07.mp3": 10550,
      "vovo_jogo_07_v140.mp3": 10550,
      "vovo_jogo_08.mp3": 5570,
      "vovo_jogo_09.mp3": 5250,
      "vovo_jogo_10.mp3": 6460,
      "vovo_jogo_11.mp3": 5530,
      "vovo_jogo_12.mp3": 7060,
      "vovo_jogo_13.mp3": 4780,
      "vovo_jogo_14.mp3": 5900,
      "vovo_jogo_15.mp3": 6040,
      "vovo_jogo_16.mp3": 6460,
      "vovo_jogo_17.mp3": 6410,
      "vovo_vitoria.mp3": 4640
    },

    falarVovo(audioFile, onFinish) {
      if (window._arcadeAudioMuted) {
        if (typeof onFinish === 'function') onFinish();
        return;
      }
      this.init();
      const callId = ++this._vovoCallId;

      if (this.vovoPlayer) {
        try {
          this.vovoPlayer.onended = null;
          this.vovoPlayer.onerror = null;
          this.vovoPlayer.onloadedmetadata = null;
          this.vovoPlayer.onabort = null;
          this.vovoPlayer.onstalled = null;
          this.vovoPlayer.pause();
        } catch (e) {}
      }
      if (this.vovoVictoryPlayer) {
        try {
          this.vovoVictoryPlayer.onended = null;
          this.vovoVictoryPlayer.onerror = null;
          this.vovoVictoryPlayer.onloadedmetadata = null;
          this.vovoVictoryPlayer.onabort = null;
          this.vovoVictoryPlayer.onstalled = null;
          this.vovoVictoryPlayer.pause();
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
        const isVictory = audioFile === "vovo_vitoria.mp3";
        // Usa instância limpa por chamada nos áudios de jogo para NUNCA disparar abort/stalled de troca de src!
        const player = (isVictory && this.vovoVictoryPlayer) ? this.vovoVictoryPlayer : new Audio(`./6_ASSETS_AUDIO/jogos_vovo/${audioFile}?v=126`);
        if (!isVictory) {
          this.vovoPlayer = player;
        } else if (!player.src) {
          player.src = `./6_ASSETS_AUDIO/jogos_vovo/${audioFile}?v=126`;
        }
        player.muted = false;
        player.volume = 1.0;
        try { player.currentTime = 0; } catch (e) {}

        const exactDurationMs = this._vovoExactDurationsMs[audioFile] || (isVictory ? 4640 : 8000);
        let finished = false;

        const doFinish = (forceNow) => {
          if (finished || callId !== this._vovoCallId) return;
          // Se chamado por timer mas o áudio do Vovô ainda está tocando ativamente antes do fim real, aguarda terminar!
          if (!forceNow && !player.paused && !player.ended && player.currentTime > 0) {
            const totalMs = (player.duration && isFinite(player.duration) && player.duration > 0.5)
              ? Math.ceil(player.duration * 1000)
              : exactDurationMs;
            const playedMs = Math.floor(player.currentTime * 1000);
            if (playedMs < totalMs - 150) {
              this._vovoTimer = setTimeout(() => doFinish(true), (totalMs - playedMs) + 300);
              return;
            }
          }
          finished = true;
          this._pendingFinish = null;
          if (this._vovoTimer) clearTimeout(this._vovoTimer);
          this._vovoTimer = null;
          player.onended = null;
          player.onerror = null;
          player.onloadedmetadata = null;
          if (typeof onFinish === 'function') onFinish();
        };
        this._pendingFinish = () => doFinish(true);

        // Libera no EXATO instante em que o áudio termina de tocar até o fim!
        player.onended = () => doFinish(true);
        player.onerror = () => {
          if (player.error) setTimeout(() => doFinish(true), 500);
        };

        // Timer exato calibrado pela duração real medida via ffprobe + margem de rede (NUNCA corta o Vovô no meio!)
        const applyExactDurationTimer = () => {
          if (finished || callId !== this._vovoCallId) return;
          const durMs = (player.duration && isFinite(player.duration) && player.duration > 0.5)
            ? Math.ceil(player.duration * 1000)
            : exactDurationMs;
          if (this._vovoTimer) clearTimeout(this._vovoTimer);
          this._vovoTimer = setTimeout(() => doFinish(false), durMs + 850);
        };
        player.onloadedmetadata = applyExactDurationTimer;
        this._vovoTimer = setTimeout(() => doFinish(false), exactDurationMs + 1100);

        const playPromise = player.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(err => {
            console.warn("Audio play prevented:", err);
            setTimeout(() => doFinish(true), 600);
          });
        }
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

  // Destrava o áudio do Vovô no primeiro toque em qualquer lugar da tela (Android / iPhone)
  document.addEventListener("pointerdown", () => {
    try { TronoAudio.unlockGestureAudio(); } catch (e) {}
  }, { passive: true });

  // ==========================================================================
  // 2. CATÁLOGO DOS 17 JOGOS OFICIAIS DO TRONO KIDS
  // ==========================================================================
  const SUPER_ARCADE_GAMES = [
    {
      id: "pesca_maravilhosa",
      title: "PESCA MARAVILHOSA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_01_pesca_v130.png?v=130",
      audioFile: "vovo_jogo_01.mp3",
      vovoFala: "Vamos pescar com Pedro! Toque na tela quando a agulha estiver no verde!",
      run: (container, phase) => runPescaMaravilhosa(container, phase)
    },
    {
      id: "dracma_perdida",
      title: "ACHE A MOEDA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_02_moeda_v130.png?v=130",
      audioFile: "vovo_jogo_02.mp3",
      vovoFala: "A mulher perdeu a dracma! Mova a luz da lamparina e encontre as moedinhas!",
      run: (container, phase) => runDracmaPerdida(container, phase)
    },
    {
      id: "pombo_arca",
      title: "POMBINHA DA PAZ",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_03_pombo_v130.png?v=130",
      audioFile: "vovo_jogo_03.mp3",
      vovoFala: "Guie o pombinho pelas nuvens até pousar na janela da Arca de Noé!",
      run: (container, phase) => runPomboArca(container, phase)
    },
    {
      id: "jonatas_alvo",
      title: "DESVIE DA LANÇA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_04_lanca_v130.png?v=130",
      audioFile: "vovo_jogo_04.mp3",
      vovoFala: "O rei Saul atirou a lança, mas Deus protegeu Davi! Use o controle para pular, abaixar, avançar e recuar!",
      run: (container, phase) => runJonatasAlvo(container, phase)
    },
    {
      id: "ovelha_perdida",
      title: "CADÊ A OVELHA?",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_05_ovelha1_v130.png?v=130",
      audioFile: "vovo_jogo_05_v135.mp3",
      vovoFala: "As ovelhinhas se esconderam atrás das pedras do aprisco! Olhe bem cada cantinho e toque nas ovelhinhas para encontrá-las!",
      run: (container, phase) => runOvelhaPerdida(container, phase)
    },
    {
      id: "ovelha_fujona",
      title: "PEGA A OVELHA!",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_06_ovelha2_v130.png?v=130",
      audioFile: "vovo_jogo_06.mp3",
      vovoFala: "Arraste o pastorzinho pelo pasto até alcançar a ovelhinha fujona!",
      run: (container, phase) => runOvelhaFujona(container, phase)
    },
    {
      id: "animais_eden",
      title: "BICHINHOS DO ÉDEN",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_07_eden_v130.png?v=130",
      audioFile: "vovo_jogo_07_v140.mp3",
      vovoFala: "Olhe os bichinhos lá no Jardim do Éden! Arraste cada bichinho até encaixar na sua sombra certa!",
      run: (container, phase) => runAnimaisEden(container, phase)
    },
    {
      id: "quem_entrou_arca",
      title: "ARCA DE NOÉ",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_08_arca_v130.png?v=130",
      audioFile: "vovo_jogo_08.mp3",
      vovoFala: "Ouça com atenção o que o Vovô falar e toque no bichinho certo!",
      run: (container, phase) => runQuemEntrouArca(container, phase)
    },
    {
      id: "quiz_visual",
      title: "QUIZ DA BÍBLIA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_09_quiz_v130.png?v=130",
      audioFile: "vovo_jogo_09.mp3",
      vovoFala: "Escute a pergunta da Bíblia e toque na imagem da resposta certa!",
      run: (container, phase) => runQuizVisual(container, phase)
    },
    {
      id: "ligue_pontos",
      title: "LIGUE OS PONTOS",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_10_pontos_v130.png?v=130",
      audioFile: "vovo_jogo_10.mp3",
      vovoFala: "Ligue os pontinhos brilhantes na ordem dos números para revelar o desenho!",
      run: (container, phase) => runLiguePontos(container, phase)
    },
    {
      id: "seis_erros",
      title: "JOGO DOS ERROS",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_11_erros_v130.png?v=130",
      audioFile: "vovo_jogo_11.mp3",
      vovoFala: "Compare as duas imagens e toque nos detalhes que estão diferentes!",
      run: (container, phase) => runSeisErros(container, phase)
    },
    {
      id: "criacao_ordem",
      title: "CRIAÇÃO DO MUNDO",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_12_criacao_v130.png?v=130",
      audioFile: "vovo_jogo_12.mp3",
      vovoFala: "Coloque os quadros da Criação na ordem dos dias da semana!",
      run: (container, phase) => runCriacaoOrdem(container, phase)
    },
    {
      id: "memoria_sonoro",
      title: "JOGO DA MEMÓRIA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_13_memoria_v130.png?v=130",
      audioFile: "vovo_jogo_13.mp3",
      vovoFala: "Vire as cartas e descubra os pares dos animais criados por Deus!",
      run: (container, phase) => runMemoriaSonoro(container, phase)
    },
    {
      id: "mana_deserto",
      title: "PÃOZINHO DO CÉU",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_14_mana_v130.png?v=130",
      audioFile: "vovo_jogo_14.mp3",
      vovoFala: "Procure as cestinhas de maná fresquinho caídas no acampamento!",
      run: (container, phase) => runManaDeserto(container, phase)
    },
    {
      id: "tabernaculo_cesto",
      title: "BEBÊ MOISÉS",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_15_moises_v130.png?v=130",
      audioFile: "vovo_jogo_15.mp3",
      vovoFala: "Encaixe cada pecinha para montar o cestinho de juncos de Moisés!",
      run: (container, phase) => runTabernaculoCesto(container, phase)
    },
    {
      id: "puzzle_3d",
      title: "QUEBRA-CABEÇA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_16_puzzle_v130.png?v=130",
      audioFile: "vovo_jogo_16.mp3",
      vovoFala: "Vamos montar o quebra-cabeça! Arraste as peças para formar a cena linda!",
      run: (container, phase) => runQuebraCabecaArcade(container, phase)
    },
    {
      id: "pintura_magica",
      title: "PINTURA MÁGICA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_17_pintura_v130.png?v=130",
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
        height: 100dvh !important;
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
        position: relative;
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
        z-index: 160;
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
        height: calc(100dvh - 60px);
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
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: rgba(15, 23, 42, 0.72);
        border: 2px solid rgba(253, 224, 71, 0.65);
        border-radius: 999px;
        padding: 5px 14px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .davi-top-spear-tracker.tracker-reset-shake {
        animation: trackerShake 0.45s ease;
      }
      @keyframes trackerShake {
        0%, 100% { transform: translateX(-50%); }
        20% { transform: translateX(calc(-50% - 8px)); }
        40% { transform: translateX(calc(-50% + 8px)); }
        60% { transform: translateX(calc(-50% - 5px)); }
        80% { transform: translateX(calc(-50% + 5px)); }
      }
      .davi-check-slot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 41, 59, 0.85);
        border: 2px solid rgba(253, 224, 71, 0.45);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);
        transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s ease, border-color 0.2s ease;
      }
      .davi-check-slot.active-aim {
        border-color: #fde047;
        box-shadow: 0 0 10px rgba(253, 224, 71, 0.75);
        animation: spearPulse 0.65s ease-in-out infinite alternate;
      }
      .davi-check-slot.slot-green {
        background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.9), 0 3px 8px rgba(0,0,0,0.5);
        transform: scale(1.1);
      }
      .davi-check-slot.slot-red {
        background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px rgba(239, 68, 68, 0.9), 0 3px 8px rgba(0,0,0,0.5);
        transform: scale(1.06);
      }
      @keyframes spearPulse {
        from { transform: scale(0.96); }
        to { transform: scale(1.12); }
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
        width: 90px;
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
        animation: daviStumble 0.68s ease;
      }
      @keyframes daviStumble {
        0%, 100% { transform: translateX(-50%) rotate(0deg); }
        20% { transform: translateX(-62%) rotate(-12deg); }
        45% { transform: translateX(-38%) rotate(10deg); }
        70% { transform: translateX(-56%) rotate(-7deg); }
      }
      .davi-hero-img.hit-red-tint {
        filter: sepia(1) saturate(8) hue-rotate(-50deg) brightness(1.08) drop-shadow(0 0 18px #ef4444) !important;
      }
      .davi-hero-img.dodge-green-glow {
        filter: brightness(1.18) drop-shadow(0 0 14px #4ade80) !important;
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
        padding: 68px 20px 24px 20px;
        z-index: 130;
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
      @keyframes btnGlowPulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.1); }
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
        <div id="trono-victory-modal" style="display:none;"></div>
      `;
      document.body.appendChild(stage);

      // Eventos click limpos (sem pointerdown duplicado para NUNCA vazar ghost-click na tela de baixo!)
      const backBtn = document.getElementById("arcade-btn-back");
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.closeTronoArcadeStage();
        });
      }

      const soundBtn = document.getElementById("arcade-btn-sound");
      if (soundBtn) {
        soundBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.toggleArcadeSound();
        });
      }
    }
  }

  // ==========================================================================
  // 5. NAVEGAÇÃO E CONTROLE DO PALCO EM TELA CHEIA
  // ==========================================================================
  // Flag de sessão: o Vovô explica a instrução apenas na primeira fase da jogada.
  // Nas fases seguintes da mesma sessão contínua, o jogo entra direto sem repetições cansativas!
  let _vovoAlreadySpokeInSession = false;
  let _isVictoryActive = false;
  let _advancingPhaseLock = false;
  window._arcadeVictoryStartedAt = 0;
  window._arcadeClosingUntil = 0;

  window.openTronoArcadeGame = function(gameId) {
    // Escudo anti-ghost-click: bloqueia clique fantasma do celular nos 550ms após fechar um jogo!
    if (window._arcadeClosingUntil && Date.now() < window._arcadeClosingUntil) {
      return;
    }
    window._userEnteredModule = true;
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
    _isVictoryActive = false;
    _advancingPhaseLock = false;
    window._arcadeVictoryStartedAt = 0;

    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const phaseNumEl = document.getElementById("arcade-phase-num");
    if (phaseNumEl) phaseNumEl.textContent = phase;
    const phaseTotalEl = document.getElementById("arcade-phase-total");
    if (phaseTotalEl) phaseTotalEl.textContent = isVip ? "15" : "5";

    const modal = document.getElementById("trono-victory-modal");
    if (modal) {
      modal.style.display = "none";
      modal.innerHTML = "";
    }
    stopArcadeCelebrationConfetti();
    if (window._arcadeVictoryVoiceTimer) { clearTimeout(window._arcadeVictoryVoiceTimer); window._arcadeVictoryVoiceTimer = null; }
    if (window._arcadeVictorySafetyTimer) { clearTimeout(window._arcadeVictorySafetyTimer); window._arcadeVictorySafetyTimer = null; }
    if (TronoAudio.vovoVictoryPlayer) { try { TronoAudio.vovoVictoryPlayer.pause(); } catch(e){} }

    // Reseta trava de liberação
    window._arcadeUnlockGameAction = null;
    if (window._ovelhaFujonaTimer) { clearInterval(window._ovelhaFujonaTimer); window._ovelhaFujonaTimer = null; }
    if (window._ovelhaFujonaRaf) { cancelAnimationFrame(window._ovelhaFujonaRaf); window._ovelhaFujonaRaf = null; }
    if (window._ovelhaFujonaWinTimer) { clearTimeout(window._ovelhaFujonaWinTimer); window._ovelhaFujonaWinTimer = null; }
    if (window._ovelhaFujonaKeyDown) { window.removeEventListener("keydown", window._ovelhaFujonaKeyDown); window._ovelhaFujonaKeyDown = null; }
    if (window._ovelhaFujonaKeyUp) { window.removeEventListener("keyup", window._ovelhaFujonaKeyUp); window._ovelhaFujonaKeyUp = null; }

    const container = document.getElementById("arcade-game-stage-container");
    // TRAVA UNIVERSAL DOS 17 JOGOS ENQUANTO O VOVÔ EXPLICA:
    // Bloqueia 100% qualquer clique/arraste no palco até o Vovô terminar a fala!
    if (container) {
      container.style.pointerEvents = "none";
    }
    if (container && currentActiveGame) {
      container.innerHTML = "";
      currentActiveGame.run(container, phase);
    }

    const unlockStageAfterVovo = () => {
      if (container) {
        container.style.pointerEvents = "auto";
      }
      if (typeof window._arcadeUnlockGameAction === 'function') {
        window._arcadeUnlockGameAction();
      }
    };

    // REGRA DE SESSÃO INTELIGENTE (RIGOBERTO UX):
    // 1) Na primeira fase da sessão (quando entra no jogo), o Vovô explica tudo e a trava aguarda 100% da fala!
    // 2) Nas fases seguintes da mesma jogada contínua, o jogo entra direto e ágil sem cansar a criança!
    const shouldSpeak = !_vovoAlreadySpokeInSession && currentActiveGame && currentActiveGame.audioFile;

    if (shouldSpeak) {
      _vovoAlreadySpokeInSession = true;
      TronoAudio.falarVovo(currentActiveGame.audioFile, () => {
        unlockStageAfterVovo();
      });
    } else {
      // Avanço dinâmico nas fases seguintes da mesma sessão: delay suave de 280ms e já acende/libera a ação!
      setTimeout(() => {
        unlockStageAfterVovo();
      }, 280);
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
    window._arcadeClosingUntil = Date.now() + 550;
    _vovoAlreadySpokeInSession = false;
    _isVictoryActive = false;
    _advancingPhaseLock = false;
    window._arcadeVictoryStartedAt = 0;
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
    if (TronoAudio.vovoPlayer) { try { TronoAudio.vovoPlayer.pause(); } catch(e){} }
    if (TronoAudio.vovoVictoryPlayer) { try { TronoAudio.vovoVictoryPlayer.pause(); } catch(e){} }
    if (celebrationClapAudio) { try { celebrationClapAudio.pause(); } catch(e){} }
    if (window._arcadeVictoryVoiceTimer) { clearTimeout(window._arcadeVictoryVoiceTimer); window._arcadeVictoryVoiceTimer = null; }
    if (window._arcadeVictorySafetyTimer) { clearTimeout(window._arcadeVictorySafetyTimer); window._arcadeVictorySafetyTimer = null; }
    if (window._daviSpearTimer) { clearTimeout(window._daviSpearTimer); window._daviSpearTimer = null; }
    if (window._daviWindupTimer) { clearTimeout(window._daviWindupTimer); window._daviWindupTimer = null; }
    if (window._daviImpactTimer) { clearTimeout(window._daviImpactTimer); window._daviImpactTimer = null; }
    if (window._daviNextRoundTimer) { clearTimeout(window._daviNextRoundTimer); window._daviNextRoundTimer = null; }
    if (window._ovelhaFujonaTimer) { clearInterval(window._ovelhaFujonaTimer); window._ovelhaFujonaTimer = null; }
    if (window._ovelhaFujonaRaf) { cancelAnimationFrame(window._ovelhaFujonaRaf); window._ovelhaFujonaRaf = null; }
    if (window._ovelhaFujonaWinTimer) { clearTimeout(window._ovelhaFujonaWinTimer); window._ovelhaFujonaWinTimer = null; }
    if (window._ovelhaFujonaKeyDown) { window.removeEventListener("keydown", window._ovelhaFujonaKeyDown); window._ovelhaFujonaKeyDown = null; }
    if (window._ovelhaFujonaKeyUp) { window.removeEventListener("keyup", window._ovelhaFujonaKeyUp); window._ovelhaFujonaKeyUp = null; }
    if (window._daviKeyHandler) { window.removeEventListener("keydown", window._daviKeyHandler); window._daviKeyHandler = null; }

    const vicModal = document.getElementById("trono-victory-modal");
    if (vicModal) {
      vicModal.style.display = "none";
      vicModal.innerHTML = "";
    }

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

  window.openVipFromArcade = function() {
    window._arcadeClosingUntil = Date.now() + 700;
    window._returnToGamesHubAfterModal = true;
    window.closeTronoArcadeStage();
    setTimeout(() => {
      if (typeof openSubscribeModal === 'function') {
        openSubscribeModal(
          'Desbloquear Fases 6 a 15!',
          'Você concluiu as 5 fases grátis! Assine o Clube Trono da Promessa para liberar as 15 fases em todos os 17 joguinhos, lições e Super Cards:'
        );
      } else {
        const subModal = document.getElementById('modal-subscribe');
        if (subModal) subModal.classList.add('active');
      }
    }, 80);
  };

  window.restartArcadeFromPhaseOne = function() {
    if (_advancingPhaseLock) return;
    _advancingPhaseLock = true;
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
    currentPhase = 1;
    loadPhase(currentPhase);
  };

  window.retryCurrentArcadePhase = function() {
    TronoAudio.play("click");
    stopArcadeCelebrationConfetti();
    if (typeof window.stopCelebrationConfetti === 'function') window.stopCelebrationConfetti();
    loadPhase(currentPhase);
  };

  window.advanceArcadePhase = function() {
    if (_advancingPhaseLock) return;
    _advancingPhaseLock = true;
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
        currentPhase = 1;
        loadPhase(currentPhase);
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
      // 2. Pausa voz do Vovô (e se estava na introdução travada, já destrava o jogo na hora!)
      if (TronoAudio && TronoAudio.vovoPlayer) {
        try { TronoAudio.vovoPlayer.pause(); } catch(e){}
      }
      if (TronoAudio && typeof TronoAudio._pendingFinish === "function") {
        try { TronoAudio._pendingFinish(); } catch(e){}
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
    if (!btn || btn.dataset.unlocked === "1") return;
    btn.dataset.unlocked = "1";
    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const current = currentPhase || 1;

    if (!isVip && current >= 5) {
      // TELA PADRONIZADA DE FIM DAS 5 FASES GRÁTIS (IGUAL EM TODOS OS 17 JOGOS!):
      // 1) Botão Dourado Principal: Assinar o App (+10 Fases)
      btn.textContent = "🔓 ASSINAR O APP (+10 FASES)";
      btn.style.background = "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)";
      btn.style.border = "2.5px solid #fde047";
      btn.style.boxShadow = "0 0 22px rgba(245,158,11,0.85), 0 6px 16px rgba(0,0,0,0.75)";

      // 2) Botão Verde Secundário: Voltar à Sala de Jogos
      const hubBtn = document.getElementById("btn-canonical-hub");
      if (hubBtn) {
        hubBtn.dataset.unlocked = "1";
        hubBtn.style.opacity = "1";
        hubBtn.style.pointerEvents = "auto";
        hubBtn.style.cursor = "pointer";
      }
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
    // Hitbox 100% estática (sem translateY movendo o botão sob o dedo no Android!)
    btn.style.animation = "btnGlowPulse 1.8s ease-in-out infinite";
    TronoAudio.play("pop");
  }

  let celebrationClapAudio = null;

  function triggerArcadeVictory() {
    // Blindagem contra disparo duplo na mesma fase
    if (_isVictoryActive) return;
    _isVictoryActive = true;
    _advancingPhaseLock = false;
    window._arcadeVictoryStartedAt = Date.now();

    // 0. Limpa timers anteriores de jogo e áudios pendentes para zero travamento
    if (window._daviSpearTimer) { clearTimeout(window._daviSpearTimer); window._daviSpearTimer = null; }
    if (window._daviWindupTimer) { clearTimeout(window._daviWindupTimer); window._daviWindupTimer = null; }
    if (window._daviImpactTimer) { clearTimeout(window._daviImpactTimer); window._daviImpactTimer = null; }
    if (window._daviNextRoundTimer) { clearTimeout(window._daviNextRoundTimer); window._daviNextRoundTimer = null; }
    if (window._ovelhaFujonaTimer) { clearInterval(window._ovelhaFujonaTimer); window._ovelhaFujonaTimer = null; }
    if (window._ovelhaFujonaRaf) { cancelAnimationFrame(window._ovelhaFujonaRaf); window._ovelhaFujonaRaf = null; }
    if (window._ovelhaFujonaWinTimer) { clearTimeout(window._ovelhaFujonaWinTimer); window._ovelhaFujonaWinTimer = null; }
    if (window._ovelhaFujonaKeyDown) { window.removeEventListener("keydown", window._ovelhaFujonaKeyDown); window._ovelhaFujonaKeyDown = null; }
    if (window._ovelhaFujonaKeyUp) { window.removeEventListener("keyup", window._ovelhaFujonaKeyUp); window._ovelhaFujonaKeyUp = null; }
    if (window._arcadeVictoryVoiceTimer) { clearTimeout(window._arcadeVictoryVoiceTimer); window._arcadeVictoryVoiceTimer = null; }
    if (window._arcadeVictorySafetyTimer) { clearTimeout(window._arcadeVictorySafetyTimer); window._arcadeVictorySafetyTimer = null; }
    if (TronoAudio.vovoPlayer) {
      try {
        TronoAudio.vovoPlayer.pause();
        TronoAudio.vovoPlayer.onended = null;
      } catch(e) {}
    }
    if (TronoAudio.vovoVictoryPlayer) {
      try {
        TronoAudio.vovoVictoryPlayer.pause();
        TronoAudio.vovoVictoryPlayer.onended = null;
      } catch(e) {}
    }
    if (TronoAudio._vovoTimer) {
      clearTimeout(TronoAudio._vovoTimer);
      TronoAudio._vovoTimer = null;
    }

    // 1. Áudio oficial canônico: Palmas + Crianças Comemorando + Fanfarra
    try {
      TronoAudio.play("fanfare");
      if (!window._arcadeAudioMuted) {
        if (!celebrationClapAudio) {
          celebrationClapAudio = new Audio('./6_ASSETS_AUDIO/11_festa_comemoracao_aplausos.wav');
          celebrationClapAudio.preload = "auto";
        }
        celebrationClapAudio.currentTime = 0;
        celebrationClapAudio.volume = 0.55;
        celebrationClapAudio.play().catch(() => {});
      }
    } catch(e) {
      console.warn("Celebration audio err:", e);
    }

    // 2. Monta e exibe o CARD CANÔNICO OFICIAL DO TRONO KIDS
    renderCanonicalVictoryModal();

    // 3. Chuva leve e fluida de confetes 3D (com Watchdog acoplado ao modal e ao botão!)
    startArcadeCelebrationConfetti();

    // 4. Voz afetuosa do Vovô Nésio ("Parabéns! Muito bem!" = 4.64s)
    // REGRA RIGOBERTO: O botão CONTINUAR BRINCANDO SÓ LIBERA DEPOIS que o Vovô terminar 100% da frase!
    window._arcadeVictoryVoiceTimer = setTimeout(() => {
      if (!_isVictoryActive) return;
      if (celebrationClapAudio) {
        try { celebrationClapAudio.volume = 0.22; } catch(e) {}
      }
      TronoAudio.falarVovo("vovo_vitoria.mp3", () => {
        if (_isVictoryActive) unlockVictoryContinueButton();
      });
    }, 650);

    // 5. Fallback de segurança SOMENTE APÓS o tempo total da fala completa (~6.0s)
    // Nunca atropela a fala do Vovô, mas garante que nunca trave se o navegador falhar o evento onended!
    window._arcadeVictorySafetyTimer = setTimeout(() => {
      if (_isVictoryActive) unlockVictoryContinueButton();
    }, 6000);
  }

  function renderCanonicalVictoryModal() {
    ensureArcadeStageInDOM();
    const modal = document.getElementById("trono-victory-modal");
    if (!modal) return;

    try {
      const game = currentActiveGame || {
        title: "Desvie da Lança",
        sub: "Desvie no Salão Real",
        icon: "./2_ASSETS_UI_BOTOES/ico_jogo_04_davi_lanca_v130.png?v=130"
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

        // 6ª Bolinha com Cadeadinho Dourado (+10 Fases VIP — fecha o palco antes para abrir o modal visível!)
        dotsHtml += `
          <div onclick="window.openVipFromArcade()" style="position:relative; width:44px; height:44px; border-radius:50%; background:linear-gradient(180deg, #f59e0b 0%, #b45309 100%); border:2.5px solid #fde047; box-shadow:0 0 14px rgba(253,224,71,0.7), 0 4px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:20px; cursor:pointer;" title="Liberar +10 Fases VIP">
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

      let phase5NoticeHtml = "";
      let actionsHtml = "";
      if (!isVip && current >= 5) {
        phase5NoticeHtml = `
          <div style="position:relative; z-index:2; background:rgba(15, 23, 42, 0.55); border:2px solid rgba(253, 224, 71, 0.75); border-radius:18px; padding:10px 14px; margin-bottom:16px; max-width:330px; color:#ffffff; font-size:14.5px; font-weight:800; line-height:1.3;">
            <span style="color:#fde047; font-weight:900;">🎉 5 Fases Grátis Concluídas!</span><br>
            Assine o Clube para liberar as fases 6 a 15!
          </div>
        `;
        actionsHtml = `
          <button id="btn-canonical-continue" type="button" style="position:relative; z-index:2; width:100%; padding:14px 16px; font-size:17px; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; pointer-events:none; touch-action:manipulation;">
            ⭐ MUITO BEM!...
          </button>
          <button id="btn-canonical-hub" type="button" style="position:relative; z-index:2; width:100%; margin-top:11px; padding:13px 16px; font-size:16px; font-weight:900; color:#ffffff; background:linear-gradient(180deg, #00e676 0%, #00c853 100%); border:2.5px solid #ffffff; border-radius:999px; box-shadow:0 6px 14px rgba(0,0,0,0.55); opacity:0.45; pointer-events:none; touch-action:manipulation;">
            🏠 VOLTAR À SALA DE JOGOS
          </button>
          <div id="btn-canonical-replay" style="margin-top:13px; color:#fef08a; font-weight:800; font-size:14px; cursor:pointer; text-decoration:underline; padding:4px;">
            🔄 Jogar novamente desde a Fase 1
          </div>
        `;
      } else {
        actionsHtml = `
          <button id="btn-canonical-continue" type="button" style="position:relative; z-index:2; width:100%; padding:15px; font-size:19px; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; pointer-events:none; touch-action:manipulation;">
            ⭐ MUITO BEM!...
          </button>
          <div id="btn-canonical-hub-link" style="margin-top:14px; color:#e9d5ff; font-weight:800; font-size:14px; cursor:pointer; text-decoration:underline; opacity:0.9; padding:4px;">
            Voltar à Sala de Jogos
          </div>
        `;
      }

      modal.innerHTML = `
        <div class="trono-victory-screen-content" style="width:100%; max-width:400px; display:flex; flex-direction:column; align-items:center; text-align:center; z-index:2; animation:vicCardPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <!-- 1. Único Ícone 3D Oficial do Jogo no Topo Flutuando Solto -->
          <div style="position:relative; z-index:2; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
            <img src="${game.icon}" style="width:106px; height:106px; object-fit:contain; animation:aliveBtnFloat 2.0s ease-in-out infinite;" alt="${game.title}">
          </div>

          <!-- 2. Título Amarelo Dourado Brilhante Solto na Tela Roxa -->
          <div style="position:relative; z-index:2; font-size:28px; font-weight:900; color:#fde047; text-shadow:0 4px 12px rgba(0,0,0,0.9), 0 0 22px rgba(253,224,71,0.6); line-height:1.15; margin-bottom:16px; letter-spacing:0.6px; animation:titlePopBounce 1.4s ease-in-out infinite;">
            PARABÉNS!<br>MUITO BEM!
          </div>

          <!-- 3. Bolinhas de Progresso Soltas (1 a 5 + 🔒) -->
          <div style="position:relative; z-index:2; display:flex; justify-content:center; align-items:center; gap:9px; margin-bottom:16px; min-height:50px;">
            ${dotsHtml}
          </div>

          ${phase5NoticeHtml}

          <!-- 4. Ações Padronizadas de Vitória Soltas na Tela Roxa -->
          <div style="position:relative; z-index:2; width:100%; max-width:330px;">
            ${actionsHtml}
          </div>
        </div>
      `;

      // Eventos SOMENTE em 'click' (NUNCA 'pointerup' para zero clique fantasma nos ícones da Sala de Jogos!)
      const mainBtn = document.getElementById("btn-canonical-continue");
      if (mainBtn) {
        mainBtn.addEventListener("click", (ev) => {
          if (mainBtn.dataset.unlocked !== "1") return;
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          if (!isVip && current >= 5) {
            window.openVipFromArcade();
          } else {
            window.advanceArcadePhase();
          }
        });
      }

      const hubBtn = document.getElementById("btn-canonical-hub");
      if (hubBtn) {
        hubBtn.addEventListener("click", (ev) => {
          if (hubBtn.dataset.unlocked !== "1") return;
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          window.closeTronoArcadeStage();
        });
      }

      const replayLink = document.getElementById("btn-canonical-replay");
      if (replayLink) {
        replayLink.addEventListener("click", (ev) => {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          window.restartArcadeFromPhaseOne();
        });
      }

      const hubLink = document.getElementById("btn-canonical-hub-link");
      if (hubLink) {
        hubLink.addEventListener("click", (ev) => {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          window.closeTronoArcadeStage();
        });
      }
    } catch (err) {
      console.error("Victory modal render fallback:", err);
      modal.innerHTML = `
        <div style="text-align:center; padding:24px; max-width:340px;">
          <div style="font-size:28px; font-weight:900; color:#fde047; margin-bottom:20px;">PARABÉNS! MUITO BEM!</div>
          <button id="btn-canonical-continue" type="button" onclick="window.advanceArcadePhase()" style="width:100%; padding:15px; font-size:18px; font-weight:900; color:#ffffff; background:#00c853; border:2.5px solid #ffffff; border-radius:999px; cursor:pointer;">
            CONTINUAR BRINCANDO
          </button>
        </div>
      `;
    }

    modal.style.display = "flex";
  }

  // ==========================================================================
  // MOTOR CANÔNICO DE CONFETES 3D, SERPENTINAS E FOGOS DE ARTIFÍCIO
  // ==========================================================================
  let arcadeConfettiAnimId = null;
  let arcadeConfettiParticles = [];
  let arcadeFireworkSparks = [];

  function spawnArcadeFireworkBurst(cx, cy) {
    if (arcadeFireworkSparks.length > 36) return;
    const colors = ['#fde047', '#00e676', '#00e5ff', '#ff4081', '#e040fb', '#ff9100', '#ffffff'];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.15;
      const speed = 2.0 + Math.random() * 3.8;
      arcadeFireworkSparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.7,
        size: 3.2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.022 + Math.random() * 0.015
      });
    }
  }

  function startArcadeCelebrationConfetti() {
    const cvs = document.getElementById("arcade-confetti-canvas");
    if (!cvs) return;
    cvs.style.display = 'block';
    const ctx = cvs.getContext('2d');
    const W = (cvs.width = Math.min(window.innerWidth || 420, 480));
    const H = (cvs.height = Math.min(window.innerHeight || 800, 900));

    const colors = ['#fde047', '#00e676', '#00e5ff', '#ff4081', '#aa00ff', '#ff9100', '#ffffff'];
    arcadeConfettiParticles = [];
    arcadeFireworkSparks = [];

    for (let i = 0; i < 48; i++) {
      const fromLeft = i % 2 === 0;
      arcadeConfettiParticles.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.7,
        vx: (Math.random() - 0.5) * 2.8 + (fromLeft ? 0.5 : -0.5),
        vy: 2.2 + Math.random() * 3.2,
        w: 7 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.16,
        tilt: Math.random() * Math.PI * 2,
        vTilt: 0.08 + Math.random() * 0.10,
        shape: i % 5 === 0 ? 'star' : 'ribbon'
      });
    }

    spawnArcadeFireworkBurst(W * 0.28, H * 0.22);
    spawnArcadeFireworkBurst(W * 0.72, H * 0.22);

    let frameCount = 0;
    if (arcadeConfettiAnimId) cancelAnimationFrame(arcadeConfettiAnimId);

    function renderArcadeFrame() {
      // WATCHDOG SUPREMO ANTI-CONFETE ÓRFÃO:
      // 1) Se não estiver em vitória ativa, mata os confetes na hora!
      if (!_isVictoryActive) {
        stopArcadeCelebrationConfetti();
        return;
      }
      // 2) Garante que o modal roxo de vitória e o botão SEMPRE existam e estejam visíveis enquanto houver confete!
      const vicModal = document.getElementById("trono-victory-modal");
      if (!vicModal || vicModal.style.display !== "flex" || !document.getElementById("btn-canonical-continue")) {
        renderCanonicalVictoryModal();
      }
      // 3) Se já passaram 6.2s de comemoração (após a fala completa do Vovô), garante 100% que o botão destravou!
      if (window._arcadeVictoryStartedAt && (Date.now() - window._arcadeVictoryStartedAt >= 6200)) {
        unlockVictoryContinueButton();
      }

      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // Estouros leves sem shadowBlur pesado para rodar liso a 60 FPS em qualquer celular!
      if (frameCount % 55 === 0) {
        spawnArcadeFireworkBurst(W * (0.20 + Math.random() * 0.60), H * (0.14 + Math.random() * 0.26));
      }

      // 1. Desenha faíscas dos fogos (zero shadowBlur!)
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
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2. Desenha confetes 3D voando (fitas e estrelas)
      for (let j = 0; j < arcadeConfettiParticles.length; j++) {
        const p = arcadeConfettiParticles[j];
        p.x += p.vx + Math.sin(p.tilt) * 0.8;
        p.y += p.vy;
        p.rot += p.vRot;
        p.tilt += p.vTilt;

        if (p.y > H + 20) {
          p.y = -16;
          p.x = Math.random() * W;
        }
        if (p.x < -16) p.x = W + 12;
        if (p.x > W + 16) p.x = -12;

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
      }

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

        <!-- 3. ÍCONE DA LAMPARINA BÍBLICA FLUTUANTE (COMEÇA APAGADINHA ENQUANTO O VOVÔ EXPLICA!) -->
        <div id="dracma-lamparina-glow" style="position:absolute; width:68px; height:68px; margin-left:-34px; margin-top:-34px; pointer-events:none; z-index:6; display:flex; align-items:center; justify-content:center; opacity:0.42; filter:grayscale(0.9) brightness(0.6); transition:opacity 0.45s ease, filter 0.45s ease, transform 0.05s ease-out;">
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
        <div id="dracma-instruction-tip" style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(18, 11, 6, 0.88); border:2px solid #ca8a04; padding:8px 20px; border-radius:999px; color:#fde047; font-weight:800; font-size:14px; z-index:10; box-shadow:0 4px 14px rgba(0,0,0,0.7); pointer-events:none; transition:all 0.5s ease; white-space:nowrap;">
          🎙️ Ouça o Vovô explicar...
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

    // Casa na penumbra com a lamparina AINDA APAGADA (enquanto o Vovô fala!)
    function renderUnlitRoom(lx, ly) {
      if (lampGlow) {
        lampGlow.style.left = lx + "px";
        lampGlow.style.top = ly + "px";
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(14, 9, 6, 0.92)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Desenha a escuridão bíblica suave com máscara de luz da lamparina ACESA
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

    // Inicia com a lamparina APAGADA enquanto o Vovô fala!
    renderUnlitRoom(lightX, lightY);

    // FUNÇÃO QUE COLETA A MOEDA (BLOQUEADA ENQUANTO O VOVÔ FALA!)
    function collectCoin(coinEl, idx) {
      if (isInteractionLocked) return;
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

    // MOVIMENTAÇÃO DA LUZ E TOQUE NA TELA (TOUCH / MOUSE — SÓ DEPOIS QUE O VOVÔ TERMINAR DE FALAR!)
    function handlePointer(e) {
      if (isInteractionLocked) return;
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
      if (isInteractionLocked) return;
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

    // TRAVA PEDAGÓGICA DO VOVÔ NÉSIO: SÓ ACENDE A LAMPARINA E LIBERA O JOGO QUANDO O VOVÔ TERMINA DE FALAR!
    window._arcadeUnlockGameAction = function() {
      if (!isInteractionLocked) return;
      isInteractionLocked = false;
      TronoAudio.play("pop");
      TronoAudio.play("star");
      if (lampGlow) {
        lampGlow.style.opacity = "1";
        lampGlow.style.filter = "none";
        lampGlow.style.animation = "lampFlamePulse 1.8s ease-in-out infinite";
      }
      renderDarkness(lightX, lightY);
      const tip = document.getElementById("dracma-instruction-tip");
      if (tip) {
        tip.textContent = "✨ Arraste a lamparina para iluminar o chão!";
        tip.style.color = "#ffffff";
        tip.style.background = "rgba(34, 197, 94, 0.92)";
        tip.style.borderColor = "#ffffff";
        setTimeout(() => {
          if (tip) tip.style.opacity = "0";
        }, 2400);
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
    let isUnlocked = false;

    window._arcadeUnlockGameAction = function() {
      if (isUnlocked) return;
      isUnlocked = true;
      const ctrlArea = document.getElementById("pombo-controller-area");
      if (ctrlArea) {
        ctrlArea.style.opacity = "1";
        ctrlArea.style.pointerEvents = "auto";
        ctrlArea.style.filter = "none";
      }
      TronoAudio.play("pop");
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

        <!-- CONSOLE D-PAD FLUTUANTE SOBREPOSTO NO RODAPÉ (TRAVADO ENQUANTO O VOVÔ FALA!) -->
        <div class="pombo-v110-controller-area" id="pombo-controller-area" style="opacity:0.45; pointer-events:none; filter:grayscale(0.4); transition:opacity 0.25s ease, filter 0.25s ease;">
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
  // JOGO 4: DAVI E A LANÇA DE SAUL (v125.0 - 3 DIREÇÕES + 3 VERDINHOS P/ FASE)
  // - Saul de frente no centro arremessando em 3 direções (Centro, Diagonal Esq, Diagonal Dir)
  // - Davi caminha livremente pelas 3 faixas (Esquerda <-> Centro <-> Direita) + Pula/Abaixa
  // - Se atingir Davi: fica vermelhinho + som de impacto + marca X vermelho
  // - Se desviar: ponto + brilho + tique verdinho (✓)
  // - 3 Verdinhos seguidos na rodada (✓ ✓ ✓) = Confetes + Vovô Nésio + Passa de Fase!
  // ==========================================================================
  function runJonatasAlvo(container, phase) {
    // Limpa quaisquer timers ou listeners de fase anterior
    if (window._daviSpearTimer) { clearTimeout(window._daviSpearTimer); window._daviSpearTimer = null; }
    if (window._daviWindupTimer) { clearTimeout(window._daviWindupTimer); window._daviWindupTimer = null; }
    if (window._daviImpactTimer) { clearTimeout(window._daviImpactTimer); window._daviImpactTimer = null; }
    if (window._daviNextRoundTimer) { clearTimeout(window._daviNextRoundTimer); window._daviNextRoundTimer = null; }
    if (window._ovelhaFujonaTimer) { clearInterval(window._ovelhaFujonaTimer); window._ovelhaFujonaTimer = null; }
    if (window._ovelhaFujonaRaf) { cancelAnimationFrame(window._ovelhaFujonaRaf); window._ovelhaFujonaRaf = null; }
    if (window._ovelhaFujonaWinTimer) { clearTimeout(window._ovelhaFujonaWinTimer); window._ovelhaFujonaWinTimer = null; }
    if (window._ovelhaFujonaKeyDown) { window.removeEventListener("keydown", window._ovelhaFujonaKeyDown); window._ovelhaFujonaKeyDown = null; }
    if (window._ovelhaFujonaKeyUp) { window.removeEventListener("keyup", window._ovelhaFujonaKeyUp); window._ovelhaFujonaKeyUp = null; }
    if (window._daviKeyHandler) { window.removeEventListener("keydown", window._daviKeyHandler); window._daviKeyHandler = null; }

    const currentPhaseNum = Math.max(1, phase || 1);
    const SPEARS_PER_ROUND = 3;
    let spearIndex = 0;
    let roundResults = [null, null, null]; // "green" | "red" | null
    let isGameWon = false;
    // TRAVA OBRIGATÓRIA ENQUANTO O VOVÔ FALA A INTRODUÇÃO:
    // Nem os botões movem Davi nem saem lanças até o Vovô terminar 100% de falar!
    let isControlsUnlocked = false;

    // CURVA DE DIFICULDADE PROGRESSIVA REAL (RIGOBERTO GAME DESIGN):
    // Fase 1: bem devagarzinho (1.90s de voo) para a criança pegar o jeito fácil.
    // Fase 2: suave (1.42s) | Fase 3: média (1.05s) | Fase 4: rápida (0.78s)
    // Fase 5: BEM DIFÍCIL E RÁPIDA (0.58s — >3x mais veloz que a Fase 1 + Saul mira 90% em cima de Davi!)
    // Fases 6 a 15 (VIP): modo lenda acelerando até 0.44s!
    const PHASE_PRESETS = {
      1: { windup: 950, fly: 1900, gap: 1250, smartAim: 0.00 },
      2: { windup: 760, fly: 1420, gap: 1000, smartAim: 0.45 },
      3: { windup: 580, fly: 1050, gap: 780,  smartAim: 0.68 },
      4: { windup: 440, fly: 780,  gap: 600,  smartAim: 0.80 },
      5: { windup: 320, fly: 580,  gap: 460,  smartAim: 0.90 }
    };
    const preset = PHASE_PRESETS[currentPhaseNum] || {
      windup: Math.max(230, 320 - (currentPhaseNum - 5) * 10),
      fly: Math.max(440, 580 - (currentPhaseNum - 5) * 15),
      gap: Math.max(360, 460 - (currentPhaseNum - 5) * 11),
      smartAim: 0.92
    };
    const windupMs = preset.windup;
    const flyDurationMs = preset.fly;
    const impactCheckMs = Math.round(flyDurationMs * 0.84);
    const betweenSpearsMs = preset.gap;
    const smartAimProb = preset.smartAim;

    // Posições de Davi no Primeiro Plano: "left", "center", "right"
    let daviPosition = "center";
    let isJumping = false;
    let isCrouching = false;

    // Sorteia as 3 direções da rodada (sempre inclui Centro, Esquerda e Direita embaralhados!)
    function buildRoundLanes() {
      const lanes = ["center", "left", "right"];
      for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
      }
      return lanes;
    }

    let attackLanes = buildRoundLanes();

    window._arcadeUnlockGameAction = function() {
      if (isControlsUnlocked || isGameWon) return;
      isControlsUnlocked = true;
      const ctrlBar = document.getElementById("davi-controls-bar");
      if (ctrlBar) {
        ctrlBar.style.opacity = "1";
        ctrlBar.style.pointerEvents = "auto";
        ctrlBar.style.filter = "none";
      }
      updateBadges();
      TronoAudio.play("pop");
      scheduleNextSpear(750);
    };

    container.innerHTML = `
      <div class="davi-game-fullscreen">
        <!-- PALCO 3D EM TELA CHEIA (SALÃO DO TRONO) -->
        <div class="davi-palace-stage" id="davi-palace-stage">
          <!-- Fundo Real 3D Pixar do Palácio de Saul -->
          <img src="./2_ASSETS_UI_BOTOES/fundo_palacio_saul_3d.jpg?v=128" class="davi-palace-bg" alt="Palácio Real de Saul 3D"/>
          <div class="davi-palace-vignette"></div>

          <!-- PLACAR VISUAL DAS 3 LANÇAS DA FASE (3 VERDINHOS = PASSA DE FASE! ZERO TEXTO!) -->
          <div class="davi-top-spear-tracker" id="davi-top-spear-tracker">
            <div class="davi-check-slot" id="davi-slot-0"></div>
            <div class="davi-check-slot" id="davi-slot-1"></div>
            <div class="davi-check-slot" id="davi-slot-2"></div>
          </div>

          <!-- REI SAUL DE CORPO INTEIRO DE FRENTE NO CHÃO DIANTE DO TRONO -->
          <div class="davi-saul-throne" id="davi-saul-throne">
            <img src="./2_ASSETS_UI_BOTOES/rei_saul_centro_v124.png?v=124" alt="Rei Saul 3D" class="saul-throne-img" id="saul-throne-img"/>
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

        <!-- CONSOLE D-PAD FLUTUANTE SOBREPOSTO NO RODAPÉ (TRAVADO ENQUANTO O VOVÔ FALA!) -->
        <div class="davi-controls-bar" id="davi-controls-bar" style="opacity:0.45; pointer-events:none; filter:grayscale(0.4); transition:opacity 0.25s ease, filter 0.25s ease;">
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

    const SVG_CHECK_GREEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9.5 17.5L19 7" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_CROSS_RED = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/></svg>`;

    function updateBadges() {
      for (let i = 0; i < SPEARS_PER_ROUND; i++) {
        const slot = document.getElementById("davi-slot-" + i);
        if (!slot) continue;
        const res = roundResults[i];
        if (res === "green") {
          slot.className = "davi-check-slot slot-green";
          slot.innerHTML = SVG_CHECK_GREEN;
        } else if (res === "red") {
          slot.className = "davi-check-slot slot-red";
          slot.innerHTML = SVG_CROSS_RED;
        } else if (i === spearIndex && !isGameWon && isControlsUnlocked) {
          slot.className = "davi-check-slot active-aim";
          slot.innerHTML = "";
        } else {
          slot.className = "davi-check-slot";
          slot.innerHTML = "";
        }
      }
    }
    updateBadges();

    const heroBox = document.getElementById("davi-hero-box");
    const heroImg = document.getElementById("davi-hero-img");
    const saulThrone = document.getElementById("davi-saul-throne");
    const spearProjectile = document.getElementById("davi-spear-projectile");
    const stuckLayer = document.getElementById("davi-stuck-layer");
    const trackerEl = document.getElementById("davi-top-spear-tracker");

    function syncHeroClasses() {
      if (!heroBox) return;
      const laneClass = daviPosition === "left" ? "dodge-left" : (daviPosition === "right" ? "dodge-right" : "center-pos");
      heroBox.className = "davi-hero-box " + laneClass + (isJumping ? " jumping" : "") + (isCrouching ? " crouching" : "");
    }

    // =========================================================================
    // MOVIMENTOS NATURAIS DE DAVI PELAS 3 FAIXAS (ESQUERDA <-> CENTRO <-> DIREITA)
    // =========================================================================
    let jumpTimer = null;
    function doHeroJump() {
      if (!isControlsUnlocked || isGameWon || isJumping) return;
      isJumping = true;
      isCrouching = false;
      syncHeroClasses();
      TronoAudio.play("click");

      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(() => {
        isJumping = false;
        syncHeroClasses();
      }, 820);
    }

    let crouchTimer = null;
    function doHeroCrouch() {
      if (!isControlsUnlocked || isGameWon || isJumping) return;
      isCrouching = true;
      syncHeroClasses();
      TronoAudio.play("click");

      clearTimeout(crouchTimer);
      crouchTimer = setTimeout(() => {
        isCrouching = false;
        syncHeroClasses();
      }, 820);
    }

    // Passo para a Esquerda: Direita -> Centro -> Esquerda
    function doHeroLeft() {
      if (!isControlsUnlocked || isGameWon) return;
      if (daviPosition === "right") {
        daviPosition = "center";
      } else {
        daviPosition = "left";
      }
      syncHeroClasses();
      TronoAudio.play("click");
    }

    // Passo para a Direita: Esquerda -> Centro -> Direita
    function doHeroRight() {
      if (!isControlsUnlocked || isGameWon) return;
      if (daviPosition === "left") {
        daviPosition = "center";
      } else {
        daviPosition = "right";
      }
      syncHeroClasses();
      TronoAudio.play("click");
    }

    // BINDINGS TOUCH POINTERDOWN
    document.getElementById("btn-davi-up").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroJump(); });
    document.getElementById("btn-davi-down").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroCrouch(); });
    document.getElementById("btn-davi-left").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroLeft(); });
    document.getElementById("btn-davi-right").addEventListener("pointerdown", (e) => { e.preventDefault(); doHeroRight(); });

    // SUPORTE AO TECLADO
    function handleKeyDown(e) {
      if (!isControlsUnlocked || isGameWon) return;
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
    window._daviKeyHandler = handleKeyDown;
    window.addEventListener("keydown", handleKeyDown);

    // =========================================================================
    // CICLO DAS 3 LANÇAS EM 3 DIREÇÕES (CENTRO, DIAGONAL ESQ, DIAGONAL DIR)
    // =========================================================================
    function scheduleNextSpear(delay) {
      if (!isControlsUnlocked || isGameWon) return;
      if (window._daviSpearTimer) clearTimeout(window._daviSpearTimer);
      window._daviSpearTimer = setTimeout(launchSpearFromThrone, delay || 1000);
    }

    function checkEndOfRoundOrContinue() {
      if (isGameWon) return;
      if (spearIndex < SPEARS_PER_ROUND) {
        updateBadges();
        scheduleNextSpear(betweenSpearsMs);
        return;
      }

      // Fechou as 3 lanças da rodada! Verifica se conquistou os 3 VERDINHOS (✓ ✓ ✓):
      const allThreeGreen = roundResults.every(r => r === "green");
      if (allThreeGreen) {
        isGameWon = true;
        if (window._daviKeyHandler) {
          window.removeEventListener("keydown", window._daviKeyHandler);
          window._daviKeyHandler = null;
        }
        TronoAudio.play("success");
        window._daviNextRoundTimer = setTimeout(() => {
          triggerArcadeVictory();
        }, 550);
      } else {
        // Teve pelo menos 1 vermelho: mostra o resultado por 950ms, sacode o placar e reinicia nova rodada de 3 lanças!
        window._daviNextRoundTimer = setTimeout(() => {
          if (isGameWon) return;
          TronoAudio.play("error");
          if (trackerEl) {
            trackerEl.classList.remove("tracker-reset-shake");
            void trackerEl.offsetWidth;
            trackerEl.classList.add("tracker-reset-shake");
          }
          window._daviNextRoundTimer = setTimeout(() => {
            if (isGameWon) return;
            if (stuckLayer) stuckLayer.innerHTML = "";
            spearIndex = 0;
            roundResults = [null, null, null];
            attackLanes = buildRoundLanes();
            updateBadges();
            scheduleNextSpear(750);
          }, 520);
        }, 900);
      }
    }

    function launchSpearFromThrone() {
      if (!isControlsUnlocked || isGameWon || spearIndex >= SPEARS_PER_ROUND) return;
      if (!saulThrone || !spearProjectile) return;

      updateBadges();

      // 1. SAUL PREPARA O ARREMESSO NO CENTRO
      saulThrone.classList.add("windup");
      TronoAudio.play("click");

      if (window._daviWindupTimer) clearTimeout(window._daviWindupTimer);
      window._daviWindupTimer = setTimeout(() => {
        if (isGameWon || !saulThrone || !spearProjectile) return;

        // Mira inteligente no exato instante em que a lança sai da mão de Saul:
        // Na Fase 1 usa as 3 direções embaralhadas; até a Fase 5 sobe para 90% mirando direto onde Davi está!
        let lane = attackLanes[spearIndex] || "center";
        if (smartAimProb > 0 && Math.random() < smartAimProb) {
          lane = daviPosition;
        } else if (smartAimProb > 0) {
          const otherLanes = ["left", "center", "right"].filter(l => l !== daviPosition);
          lane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        }

        // 2. ARREMESSO SAINDO DA PONTA CENTRAL DA LANÇA DE SAUL (top: 46%, left: 50%)
        saulThrone.classList.remove("windup");
        saulThrone.classList.add("throw");

        const stageEl = document.getElementById("davi-palace-stage");
        const stageH = (stageEl && stageEl.clientHeight) ? stageEl.clientHeight : (window.innerHeight - 60);
        const stageW = (stageEl && stageEl.clientWidth) ? stageEl.clientWidth : Math.min(window.innerWidth, 450);

        // Posição vertical do corpo de Davi no palco atual (heroBox: bottom 142px, height 128px)
        const heroBottomPx = stageH - 142;
        const heroTopPx = heroBottomPx - 128;
        const targetYpx = heroTopPx + 66;
        const midPct = Math.round((targetYpx / stageH) * 100);

        // Ângulo geométrico exato da diagonal saindo de (50%, 46%) até (24% ou 76%, midPct)
        const startYpx = stageH * 0.46;
        const dy = Math.max(110, targetYpx - startYpx);
        const dx = stageW * 0.26;
        const diagDeg = Math.max(18, Math.min(28, Math.round(Math.atan2(dx, dy) * (180 / Math.PI))));

        let targetLeft = "50%";
        let angleDeg = 0;
        if (lane === "left") {
          targetLeft = "24%";
          angleDeg = diagDeg; // Ponta aponta na diagonal inferior-esquerda (↙)
        } else if (lane === "right") {
          targetLeft = "76%";
          angleDeg = -diagDeg; // Ponta aponta na diagonal inferior-direita (↘)
        }

        const targetTop = midPct + "%";

        // Nasce na ponta da lança de Saul já alinhada com a trajetória (reta ou diagonal!)
        spearProjectile.style.display = "block";
        spearProjectile.style.transition = "none";
        spearProjectile.style.top = "46%";
        spearProjectile.style.left = "50%";
        spearProjectile.style.width = "62px";
        spearProjectile.style.height = "126px";
        spearProjectile.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(0.28)`;

        void spearProjectile.offsetWidth;

        // Voo em perspectiva 3D até a faixa alvo (Centro 50%, Esquerda 24% ou Direita 76%)
        spearProjectile.style.transition = `top ${flyDurationMs}ms cubic-bezier(0.2, 0.6, 0.4, 1), left ${flyDurationMs}ms cubic-bezier(0.2, 0.6, 0.4, 1), transform ${flyDurationMs}ms cubic-bezier(0.2, 0.6, 0.4, 1)`;
        spearProjectile.style.top = targetTop;
        spearProjectile.style.left = targetLeft;
        spearProjectile.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(1.22)`;

        TronoAudio.play("arrow");

        // 3. MOMENTO DO IMPACTO NA LINHA DE DAVI
        if (window._daviImpactTimer) clearTimeout(window._daviImpactTimer);
        window._daviImpactTimer = setTimeout(() => {
          if (isGameWon) return;

          // Atinge Davi se ele estiver na mesma faixa da lança sem pular nem agachar
          const hitDavi = (daviPosition === lane) && !isJumping && !isCrouching;

          // REGRA RIGOBERTO: A lança SEMPRE some limpa assim que passa por Davi (zero lança parada no chão!)
          spearProjectile.style.transition = "none";
          spearProjectile.style.display = "none";
          if (stuckLayer) stuckLayer.innerHTML = "";
          saulThrone.classList.remove("throw");

          if (!hitDavi) {
            // DESVIOU! PONTO + VERDINHO (✓) + LANÇA JÁ SUMIU!
            roundResults[spearIndex] = "green";
            spearIndex++;
            updateBadges();

            if (heroImg) {
              heroImg.classList.add("dodge-green-glow");
              setTimeout(() => { if (heroImg) heroImg.classList.remove("dodge-green-glow"); }, 420);
            }

            TronoAudio.play("coin");
            checkEndOfRoundOrContinue();
          } else {
            // ATINGIDO! DAVIZINHO FICA VERMELHINHO + SOM DE IMPACTO + MARCA VERMELHA (✕)!
            roundResults[spearIndex] = "red";
            spearIndex++;
            updateBadges();

            if (heroBox) heroBox.classList.add("hit-stumble");
            if (heroImg) heroImg.classList.add("hit-red-tint");
            TronoAudio.play("hit");

            setTimeout(() => {
              if (heroBox) heroBox.classList.remove("hit-stumble");
              if (heroImg) heroImg.classList.remove("hit-red-tint");
            }, 680);

            checkEndOfRoundOrContinue();
          }
        }, impactCheckMs);

      }, windupMs);
    }
  }

  // --- JOGO 5: CADÊ A OVELHA? (APRISCO 3D EM 3 CAMADAS • CURVA HÍBRIDA FASES 1 A 15 + "BÉÉÉ!" REAL v136.0) ---
  function runOvelhaPerdida(container, phase) {
    const pNum = Math.max(1, Math.min(15, phase || 1));

    // CURVA HÍBRIDA DE 15 FASES (MESCLA QUANTIDADE DE OVELHAS + NÍVEL DE ESCONDERIJO ATRÁS DA PEDRA):
    // - Fase 1: 2 ovelhas quase com o corpinho todo visível ao lado da pedra (hide: 0.00)
    // - Fase 2: 3 ovelhas meio escondidinhas na pedra (hide: 0.24)
    // - Fase 3: 3 ovelhas aparecendo um pedacinho menor (hide: 0.44)
    // - Fase 4: 4 ovelhas escondendo o rostinho (hide: 0.60)
    // - Fase 5: 5 ovelhas bem escondidinhas atrás da rocha (hide: 0.72)
    // - Fases 6 a 14 (VIP): sobe de 5 até 9 ovelhas entrando cada vez mais fundo atrás das pedras!
    // - Fase 15 (VIP Mestre): 10 ovelhas nas 10 rochas mostrando SÓ uma pontinha de orelhinha, rabinho ou patinha (hide: 1.00)!
    const PHASE_CURVE = {
      1:  { sheep: 2,  rocks: 5,  hide: 0.00, hitPx: 78 },
      2:  { sheep: 3,  rocks: 6,  hide: 0.24, hitPx: 70 },
      3:  { sheep: 3,  rocks: 7,  hide: 0.44, hitPx: 64 },
      4:  { sheep: 4,  rocks: 7,  hide: 0.60, hitPx: 58 },
      5:  { sheep: 5,  rocks: 8,  hide: 0.72, hitPx: 54 },
      6:  { sheep: 5,  rocks: 8,  hide: 0.78, hitPx: 52 },
      7:  { sheep: 6,  rocks: 8,  hide: 0.82, hitPx: 50 },
      8:  { sheep: 6,  rocks: 9,  hide: 0.86, hitPx: 50 },
      9:  { sheep: 7,  rocks: 9,  hide: 0.89, hitPx: 48 },
      10: { sheep: 7,  rocks: 9,  hide: 0.92, hitPx: 48 },
      11: { sheep: 8,  rocks: 10, hide: 0.94, hitPx: 47 },
      12: { sheep: 8,  rocks: 10, hide: 0.96, hitPx: 46 },
      13: { sheep: 9,  rocks: 10, hide: 0.98, hitPx: 45 },
      14: { sheep: 9,  rocks: 10, hide: 0.99, hitPx: 45 },
      15: { sheep: 10, rocks: 10, hide: 1.00, hitPx: 44 }
    };
    const cfg = PHASE_CURVE[pNum] || PHASE_CURVE[15];
    const totalOvelhas = cfg.sheep;
    const totalRochasCena = cfg.rocks;
    const hideProgress = cfg.hide;
    const hitSizePx = cfg.hitPx;

    let achadas = 0;
    let isGameUnlocked = false;
    let isVictoryTriggered = false;

    // 10 Esconderijos Naturais em 3 Camadas no Aprisco de Pedras (9:16):
    // openDx/openDy = Fase 1 (ovelhinha quase toda visível ao lado da rocha)
    // deepDx/deepDy = Fase 15 (ovelhinha super escondida mostrando só orelhinha, rabinho ou patinha!)
    // deepPeekDx/deepPeekDy = centro exato da pontinha que fica de fora na Fase 15
    const ALL_APRISCO_SPOTS = [
      // 0: Terraço médio-esquerdo — na Fase 15 mostra só a patinha dianteira esquerda!
      {
        id: 0, x: 24, y: 67,
        back:  { img: "pedra_aprisco_02_v135.png", w: 86,  dx: -14, dy: -14, flip: false },
        sheep: { img: "ovelha_3d_01_v135.png",     w: 68,  flip: false, openDx: -58, openDy: -10, deepDx: -29, deepDy: 5,  deepPeekDx: -56, deepPeekDy: 2 },
        front: { img: "pedra_aprisco_01_v135.png", w: 118, dx: 8,   dy: 2,   flip: false }
      },
      // 1: Pedras inferiores à direita — na Fase 15 mostra só patinhas traseiras + pontinha do rabinho!
      {
        id: 1, x: 75, y: 85,
        back:  { img: "pedra_aprisco_03_v135.png", w: 96,  dx: 12,  dy: -14, flip: true },
        sheep: { img: "ovelha_3d_05_v135.png",     w: 84,  flip: false, openDx: 58,  openDy: 8,   deepDx: 22,  deepDy: 13, deepPeekDx: 52,  deepPeekDy: 14 },
        front: { img: "pedra_aprisco_04_v135.png", w: 116, dx: -12, dy: 0,   flip: false }
      },
      // 2: Entrada da gruta à direita — na Fase 15 mostra só o rabinho fofinho de algodão!
      {
        id: 2, x: 76, y: 49,
        back:  { img: "pedra_aprisco_05_v135.png", w: 86,  dx: -12, dy: -12, flip: false },
        sheep: { img: "ovelha_3d_02_v135.png",     w: 68,  flip: false, openDx: -56, openDy: -8,  deepDx: -27, deepDy: 3,  deepPeekDx: -53, deepPeekDy: 0 },
        front: { img: "pedra_aprisco_04_v135.png", w: 116, dx: 6,   dy: 2,   flip: true }
      },
      // 3: Degraus médio-superiores à esquerda — na Fase 15 mostra só o casquinho da patinha direita!
      {
        id: 3, x: 22, y: 45,
        back:  { img: "pedra_aprisco_03_v135.png", w: 88,  dx: 12,  dy: -12, flip: false },
        sheep: { img: "ovelha_3d_04_v135.png",     w: 68,  flip: false, openDx: 56,  openDy: -8,  deepDx: 24,  deepDy: 7,  deepPeekDx: 48,  deepPeekDy: 4 },
        front: { img: "pedra_aprisco_05_v135.png", w: 118, dx: -8,  dy: -2,  flip: true }
      },
      // 4: Rochas inferiores à esquerda — na Fase 15 mostra só a pontinha rosada da orelhinha!
      {
        id: 4, x: 24, y: 85,
        back:  { img: "pedra_aprisco_02_v135.png", w: 88,  dx: 6,   dy: -16, flip: false },
        sheep: { img: "ovelha_3d_03_v135.png",     w: 72,  flip: false, openDx: 42,  openDy: -28, deepDx: 19,  deepDy: -4, deepPeekDx: 42,  deepPeekDy: -18 },
        front: { img: "pedra_aprisco_03_v135.png", w: 124, dx: -6,  dy: 6,   flip: false }
      },
      // 5: Borda superior direita junto ao curral — na Fase 15 mostra só pontinha de orelha + lã!
      {
        id: 5, x: 77, y: 25,
        back:  { img: "pedra_aprisco_04_v135.png", w: 82,  dx: 8,   dy: -10, flip: true },
        sheep: { img: "ovelha_3d_06_v135.png",     w: 64,  flip: false, openDx: 44,  openDy: -28, deepDx: 18,  deepDy: -4, deepPeekDx: 36,  deepPeekDy: -30 },
        front: { img: "pedra_aprisco_01_v135.png", w: 114, dx: -4,  dy: 4,   flip: true }
      },
      // 6: Borda superior esquerda junto à cerca — na Fase 15 mostra só rabinho + patinha traseira!
      {
        id: 6, x: 22, y: 25,
        back:  { img: "pedra_aprisco_01_v135.png", w: 84,  dx: -10, dy: -10, flip: false },
        sheep: { img: "ovelha_3d_05_v135.png",     w: 80,  flip: true,  openDx: -54, openDy: 6,   deepDx: -21, deepDy: 14, deepPeekDx: -48, deepPeekDy: 12 },
        front: { img: "pedra_aprisco_02_v135.png", w: 110, dx: 10,  dy: 0,   flip: false }
      },
      // 7: Degraus médios à direita — na Fase 15 mostra só o rabinho fofinho à direita!
      {
        id: 7, x: 77, y: 67,
        back:  { img: "pedra_aprisco_01_v135.png", w: 86,  dx: 12,  dy: -12, flip: false },
        sheep: { img: "ovelha_3d_02_v135.png",     w: 68,  flip: true,  openDx: 54,  openDy: -6,  deepDx: 25,  deepDy: 5,  deepPeekDx: 49,  deepPeekDy: 2 },
        front: { img: "pedra_aprisco_05_v135.png", w: 116, dx: -8,  dy: 0,   flip: true }
      },
      // 8: Centro superior diante da porteira — na Fase 15 mostra só uma orelhinha rosada à esquerda!
      {
        id: 8, x: 50, y: 33,
        back:  { img: "pedra_aprisco_04_v135.png", w: 82,  dx: -8,  dy: -12, flip: false },
        sheep: { img: "ovelha_3d_03_v135.png",     w: 68,  flip: true,  openDx: -40, openDy: -26, deepDx: -18, deepDy: -3, deepPeekDx: -40, deepPeekDy: -16 },
        front: { img: "pedra_aprisco_03_v135.png", w: 116, dx: 6,   dy: 5,   flip: true }
      },
      // 9: Trilha central de pedra — na Fase 15 mostra só uma orelhinha no topo esquerdo da rocha!
      {
        id: 9, x: 50, y: 58,
        back:  { img: "pedra_aprisco_05_v135.png", w: 84,  dx: -10, dy: -12, flip: true },
        sheep: { img: "ovelha_3d_06_v135.png",     w: 64,  flip: true,  openDx: -44, openDy: -26, deepDx: -18, deepDy: -4, deepPeekDx: -36, deepPeekDy: -28 },
        front: { img: "pedra_aprisco_01_v135.png", w: 114, dx: 4,   dy: 4,   flip: false }
      }
    ];

    // Embaralha os esconderijos a cada partida para nunca repetir os mesmos lugares!
    const allIds = pNum === 1 ? [0, 1, 2, 3, 4, 7] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = allIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = allIds[i];
      allIds[i] = allIds[j];
      allIds[j] = tmp;
    }

    const activeSheepSet = new Set(allIds.slice(0, totalOvelhas));
    // Seleciona também pedras vazias da cena até completar totalRochasCena
    const visibleRockSet = new Set(allIds.slice(0, Math.min(allIds.length, Math.max(totalOvelhas, totalRochasCena))));
    if (visibleRockSet.size < totalRochasCena) {
      for (let k = 0; k < 10 && visibleRockSet.size < totalRochasCena; k++) {
        visibleRockSet.add(k);
      }
    }

    // Escala responsiva proporcional para manter o encaixe milimétrico pedra-ovelha em qualquer celular
    const stgW = container.clientWidth || Math.min(window.innerWidth, 450);
    const stgH = container.clientHeight || (window.innerHeight - 60);
    const spotScale = Math.min(1.05, Math.max(0.76, Math.min(stgW / 390, stgH / 750))).toFixed(3);

    // Ordena de cima para baixo (menor Y primeiro) para perspectiva natural de profundidade
    const orderedSpots = ALL_APRISCO_SPOTS
      .filter(sp => visibleRockSet.has(sp.id))
      .sort((a, b) => a.y - b.y);

    const spotsHtml = orderedSpots.map((spot, depthOrder) => {
      const hasSheep = activeSheepSet.has(spot.id);
      const baseZ = 4 + depthOrder * 2;
      const bFlip = spot.back.flip ? "scaleX(-1)" : "scaleX(1)";
      const fFlip = spot.front.flip ? "scaleX(-1)" : "scaleX(1)";
      const sh = spot.sheep;
      const sFlip = sh.flip ? -1 : 1;

      // Interpola suavemente a posição da ovelhinha desde Fase 1 (corpinho aberto) até Fase 15 (só orelhinha/rabinho/patinha!)
      const sdx = Math.round(sh.openDx + (sh.deepDx - sh.openDx) * hideProgress);
      const sdy = Math.round(sh.openDy + (sh.deepDy - sh.openDy) * hideProgress);

      // Centro de toque acompanha exatamente a parte visível da ovelhinha (corpo aberto na Fase 1 -> pontinha na Fase 15)
      const pkx = Math.round(sh.openDx + (sh.deepPeekDx - sh.openDx) * hideProgress);
      const pky = Math.round(sh.openDy + (sh.deepPeekDy - sh.openDy) * hideProgress);

      const sheepLayerHtml = hasSheep ? `
        <!-- CAMADA DO MEIO: OVELHINHA 3D ENTRE A PEDRA DE TRÁS E A PEDRA DA FRENTE -->
        <div id="aprisco-sheep-wrap-${spot.id}" class="aprisco-sheep-wrap" data-flip="${sFlip}" style="position:absolute; left:50%; top:50%; width:${sh.w}px; transform:translate(-50%, -50%) translate(${sdx}px, ${sdy}px) scaleX(${sFlip}); z-index:3; pointer-events:none; transition:transform 0.46s cubic-bezier(0.22, 1.35, 0.36, 1);">
          <img src="./2_ASSETS_UI_BOTOES/${sh.img}?v=135" class="aprisco-sheep-img" style="width:100%; height:auto; display:block;" alt="Ovelhinha 3D" draggable="false">
        </div>
        <!-- ZONA DE TOQUE NA PARTE VISÍVEL DA OVELHINHA (CORPINHO / ORELHINHA / RABINHO / PATINHA) -->
        <div class="aprisco-peek-hit" data-spot="${spot.id}" style="position:absolute; left:50%; top:50%; width:${hitSizePx}px; height:${hitSizePx}px; transform:translate(-50%, -50%) translate(${pkx}px, ${pky}px); z-index:9; cursor:pointer; border-radius:50%;"></div>
      ` : "";

      return `
        <div id="aprisco-spot-${spot.id}" class="aprisco-spot-group" data-spot="${spot.id}" style="position:absolute; left:${spot.x}%; top:${spot.y}%; width:146px; height:126px; transform:translate(-50%, -50%) scale(${spotScale}); z-index:${baseZ};">
          <!-- 1. PEDRA TRASEIRA (ATRÁS DA OVELHA — CRIA FENDA ROCHOSA) -->
          <img src="./2_ASSETS_UI_BOTOES/${spot.back.img}?v=135" style="position:absolute; left:50%; top:50%; width:${spot.back.w}px; height:auto; transform:translate(-50%, -50%) translate(${spot.back.dx}px, ${spot.back.dy}px) ${bFlip}; z-index:2; pointer-events:none;" alt="" draggable="false">

          ${sheepLayerHtml}

          <!-- 3. PEDRA FRONTAL MAIOR (NA FRENTE DA OVELHA — ESCONDE O CORPINHO!) -->
          <div id="aprisco-front-rock-${spot.id}" style="position:absolute; left:50%; top:50%; width:${spot.front.w}px; transform:translate(-50%, -50%) translate(${spot.front.dx}px, ${spot.front.dy}px) ${fFlip}; z-index:5; pointer-events:none; transition:transform 0.35s ease;">
            <img src="./2_ASSETS_UI_BOTOES/${spot.front.img}?v=135" style="width:100%; height:auto; display:block;" alt="" draggable="false">
          </div>

          <!-- TOQUE NA PEDRA SÓLIDA (BALANÇA A PEDRA SE NÃO TOCOU NA OVELHINHA ESPIANDO!) -->
          <div class="aprisco-rock-hit" data-spot="${spot.id}" style="position:absolute; left:50%; top:50%; width:${Math.max(96, spot.front.w - 14)}px; height:84px; transform:translate(-50%, -50%) translate(${spot.front.dx}px, ${spot.front.dy}px); z-index:6; cursor:pointer; border-radius:26px;"></div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <style>
        @keyframes ovelhaPeekTwitch {
          0%, 84%, 100% { transform: rotate(0deg) translateY(0px); }
          88% { transform: rotate(-4deg) translateY(-2px); }
          93% { transform: rotate(3.5deg) translateY(-1px); }
        }
        @keyframes ovelhaEmptyStoneTap {
          0%, 100% { margin-left: 0px; }
          25% { margin-left: -4px; }
          65% { margin-left: 4px; }
        }
        @keyframes ovelhaHeartFloat {
          0% { transform: translate(-50%, 0px) scale(0.5); opacity: 0; }
          25% { transform: translate(-50%, -18px) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -56px) scale(1.3); opacity: 0; }
        }
        .aprisco-unlocked .aprisco-sheep-wrap:not(.rescued) .aprisco-sheep-img {
          animation: ovelhaPeekTwitch 3.4s ease-in-out infinite;
        }
      </style>
      <div id="ovelha-aprisco-stage" style="position:relative; width:100%; height:100%; overflow:hidden; user-select:none; -webkit-user-select:none; touch-action:manipulation; background:#1c140d;">
        <!-- CAMADA 1 (FUNDO): CENÁRIO 3D PIXAR DO APRISCO MONTANHOSO COM GRUTA (9:16) -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_ovelha_aprisco_v135.jpg?v=135" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center center; pointer-events:none; z-index:1;" alt="Aprisco nas Rochas 3D" loading="eager" decoding="async" draggable="false">

        <!-- CAMADAS 2 E 3: PEDRAS DE TRÁS + OVELHINHAS NO MEIO + PEDRAS GRANDES NA FRENTE -->
        <div id="aprisco-spots-layer" style="position:absolute; inset:0; z-index:3;">
          ${spotsHtml}
        </div>

        <!-- PLACAR VISUAL 3D DE OVELHINHAS ENCONTRADAS (ZERO TEXTO DE LEITURA) -->
        <div style="position:absolute; top:12px; left:50%; transform:translateX(-50%); background:rgba(24, 15, 9, 0.84); border:2.5px solid #fde047; padding:5px 18px 5px 10px; border-radius:999px; color:#fde047; font-weight:900; font-size:20px; z-index:40; box-shadow:0 6px 18px rgba(0,0,0,0.65); display:flex; align-items:center; gap:8px; pointer-events:none;">
          <img src="./2_ASSETS_UI_BOTOES/ovelha_3d_06_v135.png?v=135" style="width:34px; height:34px; object-fit:contain;" alt="Ovelhinha">
          <span id="ovelha-aprisco-count" style="color:#ffffff; transition:transform 0.22s ease;">0</span>
          <span style="color:#fde047; opacity:0.85;">/</span>
          <span style="color:#fde047;">${totalOvelhas}</span>
        </div>
      </div>
    `;

    const stageRoot = document.getElementById("ovelha-aprisco-stage");
    const countEl = document.getElementById("ovelha-aprisco-count");

    // REGRA SUPREMA RIGOBERTO: Só libera o toque nas ovelhinhas DEPOIS que o Vovô terminar 100% da explicação! (Zero texto/pílula na tela)
    window._arcadeUnlockGameAction = function() {
      if (isGameUnlocked) return;
      isGameUnlocked = true;
      if (stageRoot) stageRoot.classList.add("aprisco-unlocked");
      TronoAudio.play("pop");
    };

    function wobbleRockOnly(spotId) {
      if (!isGameUnlocked || isVictoryTriggered) return;
      const groupEl = document.getElementById(`aprisco-spot-${spotId}`);
      if (!groupEl || groupEl.dataset.rescued === "1") return;
      const frontRock = document.getElementById(`aprisco-front-rock-${spotId}`);
      if (frontRock) {
        frontRock.style.animation = "none";
        void frontRock.offsetWidth;
        frontRock.style.animation = "ovelhaEmptyStoneTap 0.28s ease";
      }
      TronoAudio.play("click");
    }

    function rescueSheep(spotId) {
      if (!isGameUnlocked || isVictoryTriggered) return;
      const groupEl = document.getElementById(`aprisco-spot-${spotId}`);
      if (!groupEl || groupEl.dataset.rescued === "1") return;
      groupEl.dataset.rescued = "1";

      const sheepWrap = document.getElementById(`aprisco-sheep-wrap-${spotId}`);
      if (sheepWrap) {
        const flipDir = Number(sheepWrap.dataset.flip || "1");
        sheepWrap.classList.add("rescued");
        // Fica 100% visível pulando alegre para a frente/topo da pedra!
        sheepWrap.style.zIndex = "18";
        sheepWrap.style.transform = `translate(-50%, -50%) translate(0px, -40px) scaleX(${flipDir * 1.2}) scaleY(1.2)`;
        groupEl.style.zIndex = "32";

        const burst = document.createElement("div");
        burst.textContent = "💖✨";
        burst.style.cssText = "position:absolute; left:50%; top:10%; font-size:24px; pointer-events:none; z-index:25; animation:ovelhaHeartFloat 0.85s ease-out forwards;";
        groupEl.appendChild(burst);
        setTimeout(() => { try { burst.remove(); } catch(e){} }, 900);
      }

      // 1º: A OVELHINHA DÁ O GRITINHO REAL "BÉÉÉ!" EM DESTAQUE ABSOLUTO!
      TronoAudio.play("baa");
      // 2º: Brilho sonoro suave só depois do "BÉÉÉ!" começar, sem abafar a ovelhinha!
      setTimeout(() => {
        if (!isVictoryTriggered) TronoAudio.play("coin");
      }, 320);

      achadas++;
      if (countEl) {
        countEl.textContent = String(achadas);
        countEl.style.transform = "scale(1.42)";
        setTimeout(() => { if (countEl) countEl.style.transform = "scale(1)"; }, 240);
      }

      if (achadas >= totalOvelhas) {
        isVictoryTriggered = true;
        // Deixa o "BÉÉÉ!" da última ovelhinha tocar limpo antes de entrar a comemoração!
        setTimeout(() => {
          TronoAudio.play("success");
        }, 550);
        setTimeout(triggerArcadeVictory, 1050);
      }
    }

    container.querySelectorAll(".aprisco-peek-hit").forEach((hitEl) => {
      hitEl.addEventListener("click", (e) => {
        e.stopPropagation();
        rescueSheep(Number(hitEl.dataset.spot));
      });
    });

    container.querySelectorAll(".aprisco-rock-hit").forEach((rockEl) => {
      rockEl.addEventListener("click", (e) => {
        e.stopPropagation();
        wobbleRockOnly(Number(rockEl.dataset.spot));
      });
    });
  }

  // --- JOGO 6: PEGA A OVELHA! (CAMPINA 3D PIXAR — PASTORZINHO COM INÉRCIA + PEDRAS NO CAMINHO + OVELHINHA COM DISPARADINHAS + CORAÇÃO 3D TRAVADO) ---
  function runOvelhaFujona(container, phase) {
    if (window._ovelhaFujonaTimer) { clearInterval(window._ovelhaFujonaTimer); window._ovelhaFujonaTimer = null; }
    if (window._ovelhaFujonaRaf) { cancelAnimationFrame(window._ovelhaFujonaRaf); window._ovelhaFujonaRaf = null; }
    if (window._ovelhaFujonaWinTimer) { clearTimeout(window._ovelhaFujonaWinTimer); window._ovelhaFujonaWinTimer = null; }
    if (window._ovelhaFujonaKeyDown) { window.removeEventListener("keydown", window._ovelhaFujonaKeyDown); window._ovelhaFujonaKeyDown = null; }
    if (window._ovelhaFujonaKeyUp) { window.removeEventListener("keyup", window._ovelhaFujonaKeyUp); window._ovelhaFujonaKeyUp = null; }

    const pNum = Math.min(15, Math.max(1, Number(phase) || 1));
    const diffT = (pNum - 1) / 14; // 0.0 na Fase 1 -> 1.0 na Fase 15

    // Quantidade progressiva de Pedras 3D no caminho (1 na Fase 1 -> 6 na Fase 15)
    const rockCount = pNum === 1 ? 1 : (pNum <= 3 ? 2 : (pNum <= 5 ? 3 : (pNum <= 8 ? 4 : (pNum <= 11 ? 5 : 6))));
    const ROCK_PRESETS = {
      1: [
        { rxPct: 0.50, ryPct: 0.57, img: 1, w: 58 }
      ],
      2: [
        { rxPct: 0.36, ryPct: 0.49, img: 1, w: 58 },
        { rxPct: 0.65, ryPct: 0.67, img: 2, w: 60 }
      ],
      3: [
        { rxPct: 0.33, ryPct: 0.46, img: 1, w: 56 },
        { rxPct: 0.68, ryPct: 0.53, img: 2, w: 58 },
        { rxPct: 0.46, ryPct: 0.72, img: 3, w: 58 }
      ],
      4: [
        { rxPct: 0.31, ryPct: 0.44, img: 1, w: 56 },
        { rxPct: 0.69, ryPct: 0.46, img: 2, w: 58 },
        { rxPct: 0.34, ryPct: 0.70, img: 3, w: 58 },
        { rxPct: 0.67, ryPct: 0.73, img: 1, w: 56 }
      ],
      5: [
        { rxPct: 0.30, ryPct: 0.42, img: 1, w: 54 },
        { rxPct: 0.70, ryPct: 0.43, img: 2, w: 56 },
        { rxPct: 0.50, ryPct: 0.58, img: 3, w: 58 },
        { rxPct: 0.31, ryPct: 0.74, img: 2, w: 54 },
        { rxPct: 0.69, ryPct: 0.75, img: 1, w: 56 }
      ],
      6: [
        { rxPct: 0.29, ryPct: 0.40, img: 1, w: 52 },
        { rxPct: 0.71, ryPct: 0.41, img: 2, w: 54 },
        { rxPct: 0.42, ryPct: 0.56, img: 3, w: 54 },
        { rxPct: 0.62, ryPct: 0.61, img: 1, w: 52 },
        { rxPct: 0.31, ryPct: 0.75, img: 2, w: 54 },
        { rxPct: 0.69, ryPct: 0.77, img: 3, w: 54 }
      ]
    };

    const mirrorHoriz = (pNum % 2 === 0);
    const chosenPreset = ROCK_PRESETS[rockCount] || ROCK_PRESETS[1];

    container.innerHTML = `
      <style>
        @keyframes fujonaHeartPopIn {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.18) rotate(-10deg); }
          55%  { opacity: 1; transform: translate(-50%, -58%) scale(1.18) rotate(4deg); }
          80%  { opacity: 1; transform: translate(-50%, -52%) scale(0.95) rotate(-2deg); }
          100% { opacity: 1; transform: translate(-50%, -54%) scale(1.04) rotate(0deg); }
        }
        @keyframes fujonaHeartBeat {
          0%, 100% { transform: translate(-50%, -54%) scale(1.0); }
          50%      { transform: translate(-50%, -58%) scale(1.13); }
        }
      </style>
      <div id="pastor-arena" style="position:relative; width:100%; height:100%; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; background:#2e6f1e;">
        <!-- Cenário 3D Pixar Campina / Pampa Verdinho -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_ovelha_fujona_pampa_v138.jpg?v=138"
             alt=""
             draggable="false"
             style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center center; pointer-events:none; user-select:none; z-index:1;" />

        <!-- Vinheta suave de luz solar dourada no topo -->
        <div style="position:absolute; inset:0; background:radial-gradient(circle at 75% 8%, rgba(255,248,205,0.22) 0%, rgba(0,0,0,0) 48%); pointer-events:none; z-index:2;"></div>

        <!-- Camada de Pedras 3D no Caminho -->
        <div id="fujona-rocks-layer" style="position:absolute; inset:0; pointer-events:none;"></div>

        <!-- Pastorzinho 3D (~33% menor para dar bastante espaço tático na campina!) -->
        <div id="pastorzinho-wrap" style="position:absolute; left:0; top:0; width:0; height:0; pointer-events:none; z-index:300; will-change:transform;">
          <div id="pastor-shadow" style="position:absolute; left:-19px; top:-5px; width:38px; height:10px; border-radius:50%; background:radial-gradient(ellipse, rgba(12,42,10,0.54) 0%, rgba(12,42,10,0) 74%);"></div>
          <img id="pastor-sprite"
               src="./2_ASSETS_UI_BOTOES/pastorzinho_3d_v138.png?v=138"
               alt=""
               draggable="false"
               style="position:absolute; left:0; top:0; height:82px; width:auto; max-width:none; transform-origin:50% 94%; transform:translate(-50%, -95%) scaleX(1); filter:drop-shadow(0 3px 5px rgba(0,0,0,0.28)); user-select:none;" />
        </div>

        <!-- Ovelhinha Fujona 3D (~34% menor, Pulandinho e dando Disparadinhas!) -->
        <div id="ovelha-fujona-wrap" style="position:absolute; left:0; top:0; width:0; height:0; pointer-events:none; z-index:290; will-change:transform;">
          <div id="ovelha-shadow" style="position:absolute; left:-20px; top:-5px; width:40px; height:10px; border-radius:50%; background:radial-gradient(ellipse, rgba(12,42,10,0.50) 0%, rgba(12,42,10,0) 74%);"></div>
          <img id="ovelha-sprite"
               src="./2_ASSETS_UI_BOTOES/ovelha_fujona_3d_v138.png?v=138"
               alt=""
               draggable="false"
               style="position:absolute; left:0; top:0; width:54px; height:auto; max-width:none; transform-origin:50% 90%; transform:translate(-50%, -92%) scaleX(-1); filter:drop-shadow(0 3px 5px rgba(0,0,0,0.26)); user-select:none;" />
        </div>

        <!-- Coração 3D (Aparece quando o pastorzinho encosta e TRAVA os dois juntinhos!) -->
        <img id="fujona-heart-3d"
             src="./2_ASSETS_UI_BOTOES/coracao_3d_v138.png?v=138"
             alt=""
             draggable="false"
             style="opacity:0; visibility:hidden; position:absolute; left:0; top:0; width:60px; height:auto; max-width:none; pointer-events:none; z-index:960; filter:drop-shadow(0 5px 12px rgba(244,63,94,0.58)); user-select:none;" />
      </div>
    `;

    const arena = document.getElementById("pastor-arena");
    const rocksLayer = document.getElementById("fujona-rocks-layer");
    const pastorWrap = document.getElementById("pastorzinho-wrap");
    const pastorSprite = document.getElementById("pastor-sprite");
    const pastorShadow = document.getElementById("pastor-shadow");
    const ovelhaWrap = document.getElementById("ovelha-fujona-wrap");
    const ovelhaSprite = document.getElementById("ovelha-sprite");
    const ovelhaShadow = document.getElementById("ovelha-shadow");
    const heartEl = document.getElementById("fujona-heart-3d");

    let isOvelhaUnlocked = false;
    let isCaught = false;

    function getBounds() {
      const W = Math.max(280, arena ? arena.clientWidth : 360);
      const H = Math.max(420, arena ? arena.clientHeight : 640);
      return {
        W,
        H,
        minX: Math.max(34, W * 0.09),
        maxX: Math.min(W - 34, W * 0.91),
        minY: Math.max(126, H * 0.29),
        maxY: Math.min(H - 32, H * 0.90)
      };
    }

    function clamp(v, lo, hi) {
      return v < lo ? lo : (v > hi ? hi : v);
    }

    const initB = getBounds();

    // Monta as Pedras 3D no pasto com colisão física real e ordenação de profundidade 2.5D
    const rocks = chosenPreset.map((rp, idx) => {
      const normX = mirrorHoriz ? (1 - rp.rxPct) : rp.rxPct;
      const rx = Math.round(initB.W * normX);
      const ry = Math.round(initB.H * rp.ryPct);
      const flipImg = ((idx + pNum) % 2 === 1) ? -1 : 1;
      const el = document.createElement("div");
      el.style.cssText = `position:absolute; left:${rx}px; top:${ry}px; width:0; height:0; pointer-events:none; z-index:${100 + ry};`;
      el.innerHTML = `
        <div style="position:absolute; left:${-Math.round(rp.w * 0.52)}px; top:-7px; width:${Math.round(rp.w * 1.04)}px; height:14px; border-radius:50%; background:radial-gradient(ellipse, rgba(8,32,8,0.58) 0%, rgba(8,32,8,0) 74%);"></div>
        <img src="./2_ASSETS_UI_BOTOES/pedra_pampa_0${rp.img}_v141.png?v=141"
             alt=""
             draggable="false"
             style="position:absolute; left:0; top:0; width:${rp.w}px; height:auto; max-width:none; transform:translate(-50%, -84%) scaleX(${flipImg}); filter:drop-shadow(0 3px 5px rgba(0,0,0,0.28)); user-select:none;" />
      `;
      if (rocksLayer) rocksLayer.appendChild(el);
      return {
        x: rx,
        y: ry,
        w: rp.w,
        radX: rp.w * 0.46,
        radY: rp.w * 0.28,
        el
      };
    });

    function refreshRockPositions(b) {
      chosenPreset.forEach((rp, idx) => {
        const rk = rocks[idx];
        if (!rk) return;
        const normX = mirrorHoriz ? (1 - rp.rxPct) : rp.rxPct;
        rk.x = Math.round(b.W * normX);
        rk.y = Math.round(b.H * rp.ryPct);
        if (rk.el) {
          rk.el.style.left = `${rk.x}px`;
          rk.el.style.top = `${rk.y}px`;
          rk.el.style.zIndex = String(100 + rk.y);
        }
      });
    }

    // Empurra suavemente personagem/ovelha para fora das pedras (deslizando pela lateral!)
    function resolveRockCollision(ent, entRx, entRy) {
      let hitAny = false;
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        const sumRx = rk.radX + entRx;
        const sumRy = rk.radY + entRy;
        const dx = ent.x - rk.x;
        const dy = ent.y - rk.y;
        const nx = dx / sumRx;
        const ny = dy / sumRy;
        const nd = Math.hypot(nx, ny);
        if (nd < 1.0) {
          hitAny = true;
          const safeNd = nd > 0.001 ? nd : 0.001;
          const ux = nx / safeNd;
          const uy = ny / safeNd;
          ent.x = rk.x + ux * sumRx * 1.01;
          ent.y = rk.y + uy * sumRy * 1.01;
          // Remove componente de velocidade que entra na pedra para deslizar suave ao redor dela
          const wLen = Math.hypot(ux / sumRx, uy / sumRy) || 1;
          const nrmX = (ux / sumRx) / wLen;
          const nrmY = (uy / sumRy) / wLen;
          const vn = ent.vx * nrmX + ent.vy * nrmY;
          if (vn < 0) {
            ent.vx -= vn * nrmX;
            ent.vy -= vn * nrmY;
          }
        }
      }
      return hitAny;
    }

    function isPointNearRock(tx, ty, pad) {
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        const nx = (tx - rk.x) / (rk.radX + pad);
        const ny = (ty - rk.y) / (rk.radY + pad * 0.72);
        if (nx * nx + ny * ny < 1.0) return true;
      }
      return false;
    }

    // Posições iniciais opostas na campina: Pastorzinho no canto inferior, Ovelhinha no canto superior oposto
    let px = clamp(initB.W * (mirrorHoriz ? 0.81 : 0.19), initB.minX, initB.maxX);
    let py = clamp(initB.H * 0.82, initB.minY, initB.maxY);
    let pvx = 0;
    let pvy = 0;
    let pastorFacing = mirrorHoriz ? -1 : 1;
    let walkPhase = 0;

    let ox = clamp(initB.W * (mirrorHoriz ? 0.20 : 0.80), initB.minX, initB.maxX);
    let oy = clamp(initB.H * 0.35, initB.minY, initB.maxY);
    let sheepFacing = mirrorHoriz ? 1 : -1;
    let hopPhase = 0;

    // --- CALIBRAGEM DE JOGABILIDADE E DIFICULDADE (FASE 1 A FASE 15) ---
    // Pastorzinho mais cadenciado e com inércia ("delayzinho"): não dá para jogar de uma vez em cima da ovelha!
    const pastorMaxSpeed = 98 + diffT * 18;      // 98 px/s (Fase 1) -> 116 px/s (Fase 15)
    const pastorInertia = 3.1 + diffT * 0.4;     // Suavidade / delayzinho ao acelerar e mudar de direção

    // Ovelhinha: passeio + Disparadinhas espertas (fintas rápidas) + Janela de cansaço
    const roamSpeed = 76 + diffT * 36;           // Velocidade normal pulandinho
    const dashSpeed = pastorMaxSpeed * (1.42 + diffT * 0.38); // Disparadinha mais rápida que o pastorzinho!
    const tiredSpeed = pastorMaxSpeed * (0.72 + diffT * 0.08); // Cansadinha (mais lenta que o pastorzinho -> hora de cercar e pegar!)
    const maxDashes = pNum === 1 ? 1 : (pNum <= 3 ? 2 : (pNum <= 5 ? 3 : (pNum <= 8 ? 4 : (pNum <= 11 ? 5 : (pNum <= 14 ? 6 : 7)))));
    const dashDuration = 0.64 + diffT * 0.22;
    const tiredDuration = 2.50 - diffT * 1.45;   // 2.50s na Fase 1 -> 1.05s na Fase 15!
    const dashTriggerDist = 78 + diffT * 28;     // Distância em que ela assusta e dá a disparadinha
    const alertDist = 132 + diffT * 30;
    const baseHopFreq = 6.6 + diffT * 2.4;

    let dashesLeft = maxDashes;
    let dashTimer = 0;
    let dashCooldown = 0;
    let tiredTimer = 0;

    let svx = (mirrorHoriz ? 1 : -1) * roamSpeed * 0.92;
    let svy = roamSpeed * 0.34;
    let wanderTimer = 1.0;
    let lastDodgeBaaAt = 0;

    let targetX = px;
    let targetY = py;
    let hasPointerTarget = false;
    let isPointerDown = false;
    const keysDown = { left: false, right: false, up: false, down: false };

    // Escolhe o corredor mais livre (longe do Pastorzinho, longe das bordas e desviando das Pedras!)
    function pickBestEscapeDir(b, curSpeed) {
      let bestAngle = Math.atan2(oy - py, ox - px);
      let bestScore = -1e9;
      const curAngle = Math.atan2(svy, svx);

      for (let k = 0; k < 16; k++) {
        const ang = (k * Math.PI * 2) / 16;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);

        const midTestX = ox + ca * 46;
        const midTestY = oy + sa * 46;
        const farTestX = ox + ca * 92;
        const farTestY = oy + sa * 92;

        let score = 0;
        // 1. Penaliza forte se sair dos limites do gramado
        if (farTestX < b.minX + 14 || farTestX > b.maxX - 14 || farTestY < b.minY + 14 || farTestY > b.maxY - 14) {
          score -= 360;
        }
        if (midTestX < b.minX + 6 || midTestX > b.maxX - 6 || midTestY < b.minY + 6 || midTestY > b.maxY - 6) {
          score -= 600;
        }

        // 2. Penaliza se bater em alguma pedra no caminho da fuga
        if (isPointNearRock(midTestX, midTestY, 22)) score -= 520;
        if (isPointNearRock(farTestX, farTestY, 18)) score -= 240;

        // 3. Premia afastar-se da posição futura do Pastorzinho (finta lateral inteligente!)
        const predPx = px + pvx * 0.45;
        const predPy = py + pvy * 0.45;
        const distFromPastor = Math.hypot(farTestX - predPx, farTestY - predPy);
        score += distFromPastor * 2.2;

        // 4. Leve preferência por manter fluidez e puxar suavemente para áreas amplas da campina
        const centerDist = Math.hypot(farTestX - b.W * 0.5, farTestY - (b.minY + b.maxY) * 0.5);
        score -= centerDist * 0.28;
        score += Math.cos(ang - curAngle) * 18;

        if (score > bestScore) {
          bestScore = score;
          bestAngle = ang;
        }
      }

      return {
        vx: Math.cos(bestAngle) * curSpeed,
        vy: Math.sin(bestAngle) * curSpeed
      };
    }

    function renderCharacters(pLift, pTilt, sLift, sTilt, sShadowScale) {
      if (!pastorWrap || !ovelhaWrap) return;
      pastorWrap.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      ovelhaWrap.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`;

      // Profundidade 2.5D real entre Pastorzinho, Ovelhinha e todas as Pedras!
      pastorWrap.style.zIndex = String(100 + Math.round(py));
      ovelhaWrap.style.zIndex = String(100 + Math.round(oy));

      if (pastorSprite) {
        pastorSprite.style.transform = `translate(-50%, calc(-95% + ${pLift.toFixed(1)}px)) scaleX(${pastorFacing}) rotate(${pTilt.toFixed(1)}deg)`;
      }
      if (pastorShadow) {
        const pScale = clamp(1 + pLift * 0.018, 0.84, 1.02);
        pastorShadow.style.transform = `scale(${pScale.toFixed(2)})`;
      }
      if (ovelhaSprite) {
        ovelhaSprite.style.transform = `translate(-50%, calc(-92% + ${sLift.toFixed(1)}px)) scaleX(${sheepFacing}) rotate(${sTilt.toFixed(1)}deg)`;
      }
      if (ovelhaShadow) {
        ovelhaShadow.style.transform = `scale(${sShadowScale.toFixed(2)})`;
      }
    }

    // Renderiza ambos paradinhos no pasto enquanto o Vovô Nésio explica a regra
    renderCharacters(0, 0, 0, 0, 1);

    function freezeAndCelebrateCatch() {
      if (isCaught) return;
      isCaught = true;
      hasPointerTarget = false;
      isPointerDown = false;
      pvx = 0;
      pvy = 0;

      // 1. PARA IMEDIATAMENTE QUALQUER MOVIMENTO DOS DOIS!
      if (window._ovelhaFujonaRaf) {
        cancelAnimationFrame(window._ovelhaFujonaRaf);
        window._ovelhaFujonaRaf = null;
      }

      // 2. TRAVA O PASTORZINHO E A OVELHINHA JUNTINHOS OLHANDO UM PARA O OUTRO NA GRAMA LIVRE!
      const b = getBounds();
      let midX = clamp((px + ox) * 0.5, b.minX + 26, b.maxX - 26);
      let midY = clamp((py + oy) * 0.5, b.minY + 12, b.maxY - 12);

      // Se o encontro ocorreu encostado numa pedra, afasta suavemente o par para não sobrepor a pedra
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        const dx = midX - rk.x;
        const dy = midY - rk.y;
        const minRx = rk.radX + 30;
        const minRy = rk.radY + 16;
        const nd = Math.hypot(dx / minRx, dy / minRy);
        if (nd < 1.0) {
          const safe = nd > 0.01 ? nd : 0.01;
          midX = clamp(rk.x + (dx / safe), b.minX + 26, b.maxX - 26);
          midY = clamp(rk.y + (dy / safe), b.minY + 12, b.maxY - 12);
        }
      }

      const pastorOnLeft = px <= ox;
      px = midX + (pastorOnLeft ? -20 : 20);
      py = midY;
      ox = midX + (pastorOnLeft ? 20 : -20);
      oy = midY + 2;
      pastorFacing = pastorOnLeft ? 1 : -1;
      sheepFacing = pastorOnLeft ? -1 : 1;

      renderCharacters(0, 0, 0, 0, 1);

      // 3. EXIBE O CORAÇÃO 3D PULSANDO BEM NO MEIO ACIMA DOS DOIS TRAVADOS!
      if (heartEl) {
        heartEl.style.left = `${midX.toFixed(1)}px`;
        heartEl.style.top = `${(midY - 76).toFixed(1)}px`;
        heartEl.style.visibility = "visible";
        heartEl.style.opacity = "1";
        heartEl.style.animation = "fujonaHeartPopIn 0.42s cubic-bezier(0.22, 1.35, 0.42, 1) forwards, fujonaHeartBeat 0.75s ease-in-out 0.42s infinite";
      }

      // 4. OVELHINHA DÁ O "BÉÉÉ!" FELIZ + BRILHO DE VITÓRIA + PASSA DE FASE!
      TronoAudio.play("baa");
      setTimeout(() => {
        TronoAudio.play("success");
      }, 340);

      window._ovelhaFujonaWinTimer = setTimeout(() => {
        window._ovelhaFujonaWinTimer = null;
        triggerArcadeVictory();
      }, 1250);
    }

    let lastTs = 0;
    function stepLoop(ts) {
      if (isCaught || !isOvelhaUnlocked) return;
      if (!arena || !arena.isConnected) return;

      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0.004, (ts - lastTs) / 1000));
      lastTs = ts;

      const b = getBounds();
      refreshRockPositions(b);

      // --- 1. MOVIMENTO DO PASTORZINHO COM INÉRCIA ("DELAYZINHO" SUAVE E CADENCIADO) ---
      let wantVx = 0;
      let wantVy = 0;
      const keyDx = (keysDown.right ? 1 : 0) - (keysDown.left ? 1 : 0);
      const keyDy = (keysDown.down ? 1 : 0) - (keysDown.up ? 1 : 0);

      if (keyDx !== 0 || keyDy !== 0) {
        const kLen = Math.hypot(keyDx, keyDy) || 1;
        wantVx = (keyDx / kLen) * pastorMaxSpeed;
        wantVy = (keyDy / kLen) * pastorMaxSpeed;
        hasPointerTarget = false;
      } else if (hasPointerTarget) {
        const dxT = targetX - px;
        const dyT = targetY - py;
        const distT = Math.hypot(dxT, dyT);
        if (distT > 5) {
          // Desacelera suavemente quando chega pertinho do dedo
          const throttle = clamp(distT / 38, 0.28, 1.0);
          wantVx = (dxT / distT) * pastorMaxSpeed * throttle;
          wantVy = (dyT / distT) * pastorMaxSpeed * throttle;
        } else if (!isPointerDown) {
          hasPointerTarget = false;
        }
      }

      // Aplica inércia suave (delayzinho realista ao sair do lugar e ao fazer curva!)
      const lerpAlpha = Math.min(1, dt * pastorInertia);
      pvx += (wantVx - pvx) * lerpAlpha;
      pvy += (wantVy - pvy) * lerpAlpha;

      // Freio natural quando solta o dedo
      if (wantVx === 0 && wantVy === 0) {
        const damp = Math.pow(0.06, dt);
        pvx *= damp;
        pvy *= damp;
      }

      const pastorEnt = {
        x: clamp(px + pvx * dt, b.minX, b.maxX),
        y: clamp(py + pvy * dt, b.minY, b.maxY),
        vx: pvx,
        vy: pvy
      };
      resolveRockCollision(pastorEnt, 13, 9);
      px = clamp(pastorEnt.x, b.minX, b.maxX);
      py = clamp(pastorEnt.y, b.minY, b.maxY);
      pvx = pastorEnt.vx;
      pvy = pastorEnt.vy;

      const curPastorSpd = Math.hypot(pvx, pvy);
      const pastorMoving = curPastorSpd > 8;
      if (pastorMoving) {
        if (pvx > 6) pastorFacing = 1;
        else if (pvx < -6) pastorFacing = -1;
        walkPhase += dt * (8.5 + (curPastorSpd / pastorMaxSpeed) * 5.0);
      } else {
        walkPhase = 0;
      }

      // --- 2. IA DA OVELHINHA FUJONA (PASSEIO + DISPARADINHAS EM ZIGUE-ZAGUE + FÔLEGO) ---
      if (dashCooldown > 0) dashCooldown = Math.max(0, dashCooldown - dt);
      const distToPastor = Math.hypot(ox - px, oy - py) || 1;

      if (dashTimer > 0) {
        // Em plena DISPARADINHA!
        dashTimer -= dt;
        const curSpd = Math.hypot(svx, svy) || 1;
        svx = (svx / curSpd) * dashSpeed;
        svy = (svy / curSpd) * dashSpeed;
        if (dashTimer <= 0 && dashesLeft <= 0) {
          tiredTimer = tiredDuration;
        }
      } else if (tiredTimer > 0) {
        // Cansadinha recuperando o fôlego (anda mais devagar que o Pastorzinho -> janela para cercar e pegar!)
        tiredTimer -= dt;
        const esc = pickBestEscapeDir(b, tiredSpeed);
        const blend = Math.min(1, dt * 3.8);
        svx = svx * (1 - blend) + esc.vx * blend;
        svy = svy * (1 - blend) + esc.vy * blend;
        const curSpd = Math.hypot(svx, svy) || 1;
        svx = (svx / curSpd) * tiredSpeed;
        svy = (svy / curSpd) * tiredSpeed;

        if (tiredTimer <= 0) {
          // Recuperou parte do fôlego se o jogador ainda não alcançou!
          dashesLeft = Math.max(1, Math.ceil(maxDashes * 0.65));
        }
      } else {
        // Verifica se o Pastorzinho chegou perto para disparar uma FINTA / DISPARADINHA!
        if (distToPastor < dashTriggerDist && dashesLeft > 0 && dashCooldown <= 0) {
          dashesLeft--;
          dashTimer = dashDuration;
          dashCooldown = 0.25;
          const esc = pickBestEscapeDir(b, dashSpeed);
          svx = esc.vx;
          svy = esc.vy;
          const nowMs = Date.now();
          if (nowMs - lastDodgeBaaAt > 1800) {
            lastDodgeBaaAt = nowMs;
            TronoAudio.play("baa");
          }
        } else if (distToPastor < alertDist) {
          // Alerta: já começa a contornar para o corredor aberto antes da disparadinha
          const esc = pickBestEscapeDir(b, roamSpeed * 1.08);
          const blend = Math.min(1, dt * 4.2);
          svx = svx * (1 - blend) + esc.vx * blend;
          svy = svy * (1 - blend) + esc.vy * blend;
        } else {
          // Passeio alegre de um lado para o outro na campina
          wanderTimer -= dt;
          if (wanderTimer <= 0) {
            wanderTimer = 0.9 + Math.random() * 1.1;
            const dirSign = Math.abs(svx) > 8 ? Math.sign(svx) : (Math.random() < 0.5 ? 1 : -1);
            const flipSign = Math.random() < 0.25 ? -1 : 1;
            const horizRatio = 0.78 + Math.random() * 0.16;
            const vertSign = Math.random() < 0.5 ? -1 : 1;
            const vertRatio = Math.sqrt(Math.max(0.05, 1 - horizRatio * horizRatio));
            svx = dirSign * flipSign * roamSpeed * horizRatio;
            svy = vertSign * roamSpeed * vertRatio;
          }
        }
      }

      const sheepEnt = {
        x: ox + svx * dt,
        y: oy + svy * dt,
        vx: svx,
        vy: svy
      };
      const sheepHitRock = resolveRockCollision(sheepEnt, 14, 9);
      ox = sheepEnt.x;
      oy = sheepEnt.y;
      svx = sheepEnt.vx;
      svy = sheepEnt.vy;

      // Se encostou numa pedra durante o passeio/fuga, escolhe imediatamente rota livre ao redor!
      if (sheepHitRock) {
        const targetSpd = dashTimer > 0 ? dashSpeed : (tiredTimer > 0 ? tiredSpeed : roamSpeed);
        const esc = pickBestEscapeDir(b, targetSpd);
        svx = esc.vx;
        svy = esc.vy;
      }

      // Rebate suave nas bordas verdinhas do pampa
      if (ox <= b.minX) { ox = b.minX; svx = Math.abs(svx); }
      else if (ox >= b.maxX) { ox = b.maxX; svx = -Math.abs(svx); }
      if (oy <= b.minY) { oy = b.minY; svy = Math.abs(svy); }
      else if (oy >= b.maxY) { oy = b.maxY; svy = -Math.abs(svy); }

      if (svx > 4) sheepFacing = 1;
      else if (svx < -4) sheepFacing = -1;

      // Ritmo do "pulandinho" acompanha se ela está em disparadinha, normal ou cansadinha
      const hopMult = dashTimer > 0 ? 1.52 : (tiredTimer > 0 ? 0.78 : 1.0);
      hopPhase += dt * baseHopFreq * hopMult;
      const hopSin = Math.abs(Math.sin(hopPhase));
      const hopHeight = dashTimer > 0 ? 13.5 : (tiredTimer > 0 ? 7.5 : 10.5);
      const sLift = -hopSin * hopHeight;
      const sTilt = Math.cos(hopPhase) * (dashTimer > 0 ? 7.5 : 5.2) * sheepFacing;
      const sShadowScale = 1.0 - hopSin * 0.22;

      const pLift = pastorMoving ? -Math.abs(Math.sin(walkPhase)) * 4.2 : 0;
      const pTilt = pastorMoving ? Math.sin(walkPhase) * 2.4 : 0;

      // --- 3. VERIFICA ENCONTRO PASTORZINHO + OVELHINHA (RAIO JUSTO DE 31px) ---
      const catchDist = Math.hypot(px - ox, (py - oy) * 1.08);
      if (catchDist <= 31) {
        freezeAndCelebrateCatch();
        return;
      }

      renderCharacters(pLift, pTilt, sLift, sTilt, sShadowScale);
      window._ovelhaFujonaRaf = requestAnimationFrame(stepLoop);
    }

    function updateTargetFromEvent(e) {
      if (!isOvelhaUnlocked || isCaught || !arena) return;
      const rect = arena.getBoundingClientRect();
      const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
      if (!pt || typeof pt.clientX !== "number") return;
      const b = getBounds();
      targetX = clamp(pt.clientX - rect.left, b.minX, b.maxX);
      targetY = clamp(pt.clientY - rect.top, b.minY, b.maxY);
      hasPointerTarget = true;
    }

    arena.addEventListener("pointerdown", (e) => {
      if (!isOvelhaUnlocked || isCaught) return;
      isPointerDown = true;
      try { arena.setPointerCapture(e.pointerId); } catch(err) {}
      updateTargetFromEvent(e);
    });
    arena.addEventListener("pointermove", (e) => {
      if (!isPointerDown || !isOvelhaUnlocked || isCaught) return;
      updateTargetFromEvent(e);
    });
    const endPointer = () => { isPointerDown = false; };
    arena.addEventListener("pointerup", endPointer);
    arena.addEventListener("pointercancel", endPointer);

    arena.addEventListener("touchstart", (e) => {
      if (!isOvelhaUnlocked || isCaught) return;
      isPointerDown = true;
      updateTargetFromEvent(e);
    }, { passive: true });
    arena.addEventListener("touchmove", (e) => {
      if (!isOvelhaUnlocked || isCaught) return;
      updateTargetFromEvent(e);
    }, { passive: true });
    arena.addEventListener("touchend", endPointer, { passive: true });

    window._ovelhaFujonaKeyDown = function(e) {
      if (!isOvelhaUnlocked || isCaught) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysDown.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysDown.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysDown.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keysDown.down = true;
    };
    window._ovelhaFujonaKeyUp = function(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysDown.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysDown.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysDown.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keysDown.down = false;
    };
    window.addEventListener("keydown", window._ovelhaFujonaKeyDown);
    window.addEventListener("keyup", window._ovelhaFujonaKeyUp);

    // LIBERAÇÃO SOMENTE DEPOIS QUE O VOVÔ TERMINAR DE EXPLICAR!
    window._arcadeUnlockGameAction = function() {
      if (isOvelhaUnlocked || isCaught) return;
      isOvelhaUnlocked = true;
      lastDodgeBaaAt = Date.now();
      TronoAudio.play("baa");
      lastTs = 0;
      window._ovelhaFujonaRaf = requestAnimationFrame(stepLoop);
    };
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
  // 7. INJEÇÃO DOS 17 JOGOS NA SALA DE JOGOS (#screen-games-hub) — VISUAL LIMPO 3D PIXAR (ZERO BLOCOS!)
  // ==========================================================================
  window.renderAll17ArcadeGamesInHub = function() {
    const filterBar = document.getElementById("games-hub-filter-bar");
    if (filterBar) {
      filterBar.style.display = "none";
    }

    const gridEl = document.getElementById("games-hub-grid");
    if (!gridEl) return;

    gridEl.innerHTML = `
      <style id="arcade-hub-clean-styles">
        .arcade-hub-clean-grid {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 14px;
          row-gap: 20px;
          padding: 4px 6px 38px 6px;
          justify-items: center;
          box-sizing: border-box;
        }
        .arcade-hub-item {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          padding: 4px 2px;
          width: 100%;
          transition: transform 0.14s ease;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .arcade-hub-item:active {
          transform: scale(0.90);
        }
        .arcade-hub-item:last-child:nth-child(odd) {
          grid-column: 1 / -1;
          max-width: 52%;
        }
        .arcade-hub-icon-3d {
          width: 116px;
          height: 116px;
          max-width: 31vw;
          object-fit: contain;
          pointer-events: none;
        }
        .arcade-hub-title {
          margin-top: 3px;
          font-family: 'Fredoka', sans-serif;
          font-weight: 800;
          font-size: 15.5px;
          line-height: 1.12;
          color: #fde047;
          text-shadow: 0 2px 0 #3b1704, 0 0 3px #3b1704, 0 4px 8px rgba(0, 0, 0, 0.96);
          text-align: center;
          letter-spacing: 0.25px;
          pointer-events: none;
        }
      </style>
      <div class="arcade-hub-clean-grid">
        ${SUPER_ARCADE_GAMES.map(g => `
          <div class="arcade-hub-item" onclick="window.openTronoArcadeGame('${g.id}')">
            <img src="${g.icon}" alt="${g.title}" class="arcade-hub-icon-3d" decoding="async">
            <div class="arcade-hub-title">${g.title}</div>
          </div>
        `).join("")}
      </div>
    `;
  };

  // Sobrescreve a abertura do Hub de Jogos para carregar os 17 jogos oficiais com fundo Jardim Real
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
    window._userEnteredModule = true;
    TronoAudio.play("click");
    showParentalGate(() => {
      if (typeof showScreen === "function") showScreen("screen-teacher-portal");
      if (typeof renderTeacherPortalScreen === "function") renderTeacherPortalScreen();
    });
  };

})();
