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
      "vovo_jogo_08.mp3": 10820,
      "vovo_jogo_08_v142.mp3": 10820,
      "vovo_jogo_09.mp3": 5250,
      "vovo_jogo_10.mp3": 6460,
      "vovo_jogo_11.mp3": 5530,
      "vovo_jogo_12.mp3": 7060,
      "vovo_jogo_12_v159.mp3": 13450,
      "vovo_jogo_13.mp3": 4780,
      "vovo_jogo_14.mp3": 5900,
      "vovo_jogo_15.mp3": 6040,
      "vovo_jogo_16.mp3": 6460,
      "vovo_jogo_16_v161.mp3": 10280,
      "vovo_jogo_17.mp3": 6410,
      "vovo_jogo_17_v161.mp3": 16000,
      "vovo_jogo_17_v162.mp3": 17324,
      "vovo_jogo_19_v161.mp3": 11020,
      "vovo_jogo_20_v161.mp3": 11910,
      "vovo_jogo_21_v161.mp3": 9000,
      "vovo_jogo_22_v161.mp3": 11401,
      "vovo_vitoria.mp3": 4640,
      "quiz_vovo_q01.mp3": 10180,
      "quiz_vovo_q02.mp3": 11600,
      "quiz_vovo_q03.mp3": 11600,
      "quiz_vovo_q04.mp3": 9720,
      "quiz_vovo_q05.mp3": 8370,
      "quiz_vovo_q06.mp3": 7870,
      "quiz_vovo_q07.mp3": 8640,
      "quiz_vovo_q08.mp3": 7660,
      "quiz_vovo_q09.mp3": 7110,
      "quiz_vovo_q10.mp3": 8880,
      "quiz_vovo_q11.mp3": 13490,
      "quiz_vovo_q12.mp3": 12320,
      "quiz_vovo_q13.mp3": 9650,
      "quiz_vovo_q14.mp3": 10190,
      "quiz_vovo_q15.mp3": 14360,
      "versiculo_vovo_01.mp3": 13050,
      "versiculo_vovo_02.mp3": 12820,
      "versiculo_vovo_03.mp3": 10900,
      "versiculo_vovo_04.mp3": 12320,
      "versiculo_vovo_05.mp3": 13020,
      "versiculo_vovo_06.mp3": 11210,
      "versiculo_vovo_07.mp3": 11620,
      "versiculo_vovo_08.mp3": 11620,
      "versiculo_vovo_09.mp3": 13290,
      "versiculo_vovo_10.mp3": 11160,
      "versiculo_vovo_11.mp3": 13390,
      "versiculo_vovo_12.mp3": 13530,
      "versiculo_vovo_13.mp3": 12970,
      "versiculo_vovo_14.mp3": 11860,
      "versiculo_vovo_15.mp3": 12370,
      "versiculo_vovo_16.mp3": 12510,
      "versiculo_vovo_17.mp3": 12090,
      "versiculo_vovo_18.mp3": 12320,
      "versiculo_vovo_19.mp3": 13250,
      "versiculo_vovo_20.mp3": 13020,
      "versiculo_vovo_21.mp3": 11620,
      "versiculo_vovo_22.mp3": 11220,
      "palavra_secreta_vovo_01.mp3": 22478,
      "palavra_secreta_vovo_02.mp3": 21039,
      "palavra_secreta_vovo_03.mp3": 21318,
      "palavra_secreta_vovo_04.mp3": 21272,
      "palavra_secreta_vovo_05.mp3": 20854,
      "palavra_secreta_vovo_06.mp3": 19739,
      "palavra_secreta_vovo_07.mp3": 19228,
      "palavra_secreta_vovo_08.mp3": 19878,
      "palavra_secreta_vovo_09.mp3": 20621,
      "palavra_secreta_vovo_10.mp3": 20482,
      "palavra_secreta_vovo_11.mp3": 18717,
      "palavra_secreta_vovo_12.mp3": 20157,
      "palavra_secreta_vovo_13.mp3": 19646,
      "palavra_secreta_vovo_14.mp3": 19460,
      "palavra_secreta_vovo_15.mp3": 19739,
      "palavra_secreta_vovo_16.mp3": 20807,
      "palavra_secreta_vovo_17.mp3": 19739,
      "palavra_secreta_vovo_18.mp3": 24104,
      "palavra_secreta_vovo_19.mp3": 20018,
      "palavra_secreta_vovo_20.mp3": 19414,
      "palavra_secreta_vovo_21.mp3": 20807,
      "palavra_secreta_vovo_22.mp3": 20811
    },

    attachVoicePresenceBoost(player) {
      try {
        if (!player || player._voiceBoostAttached) return;
        const proto = String((window.location && window.location.protocol) || "");
        if (proto !== "http:" && proto !== "https:") return;
        if (!this.ctx) this.init();
        if (!this.ctx || this.ctx.state !== "running") return;
        if (!this._voiceBoostChain) {
          const comp = this.ctx.createDynamicsCompressor();
          comp.threshold.setValueAtTime(-20, this.ctx.currentTime);
          comp.knee.setValueAtTime(16, this.ctx.currentTime);
          comp.ratio.setValueAtTime(3.2, this.ctx.currentTime);
          comp.attack.setValueAtTime(0.005, this.ctx.currentTime);
          comp.release.setValueAtTime(0.18, this.ctx.currentTime);
          const vGain = this.ctx.createGain();
          vGain.gain.setValueAtTime(1.42, this.ctx.currentTime);
          comp.connect(vGain);
          vGain.connect(this.ctx.destination);
          this._voiceBoostChain = comp;
        }
        const srcNode = this.ctx.createMediaElementSource(player);
        srcNode.connect(this._voiceBoostChain);
        player._voiceBoostAttached = true;
      } catch (e) {}
    },

    falarVovo(audioFile, onFinish) {
      if (window._arcadeAudioMuted) {
        if (typeof window.setVovoVoiceDucking === "function") window.setVovoVoiceDucking(false);
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
        const rawPath = String(audioFile);
        const resolvedUrl = rawPath.startsWith("./")
          ? `${rawPath}${rawPath.includes("?") ? "" : "?v=162"}`
          : `./6_ASSETS_AUDIO/jogos_vovo/${rawPath}?v=162`;
        const durKey = rawPath.split("/").pop().split("?")[0];
        const replayBtnEl = document.getElementById("arcade-btn-replay-vovo");
        if (replayBtnEl && !isVictory) replayBtnEl.classList.add("vovo-speaking");
        // Usa instância limpa por chamada nos áudios de jogo para NUNCA disparar abort/stalled de troca de src!
        const player = (isVictory && this.vovoVictoryPlayer) ? this.vovoVictoryPlayer : new Audio(resolvedUrl);
        if (!isVictory) {
          this.vovoPlayer = player;
        } else if (!player.src) {
          player.src = resolvedUrl;
        }
        player.muted = false;
        player.volume = 1.0;
        try { player.currentTime = 0; } catch (e) {}
        this.attachVoicePresenceBoost(player);
        if (typeof window.setVovoVoiceDucking === "function") {
          window.setVovoVoiceDucking(true);
        }

        const exactDurationMs = this._vovoExactDurationsMs[durKey] || (isVictory ? 4640 : 8000);
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
          if (typeof window.setVovoVoiceDucking === "function") {
            window.setVovoVoiceDucking(false);
          }
          const rbDone = document.getElementById("arcade-btn-replay-vovo");
          if (rbDone) rbDone.classList.remove("vovo-speaking");
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
        if (typeof window.setVovoVoiceDucking === "function") {
          window.setVovoVoiceDucking(false);
        }
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
  // 2. CATÁLOGO DOS 16 JOGOS OFICIAIS DO TRONO KIDS (GRADE PAR 8x2)
  // (Nota: ico_jogo_07_eden_v130.png permanece preservado em disco conforme diretriz!)
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
      id: "quem_entrou_arca",
      title: "ARCA DE NOÉ",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_08_arca_v130.png?v=130",
      audioFile: "vovo_jogo_08_v142.mp3",
      vovoFala: "Olhe a grande Arca de Noé! Arraste cada bichinho lá de baixo até encaixar na janelinha com a sua sombra certa!",
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
      title: "ORDEM CRONOLÓGICA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_12_criacao_v130.png?v=130",
      audioFile: "vovo_jogo_12_v159.mp3",
      vovoFala: "Vamos colocar a história da Bíblia na ordem certa! Pegue as imagens lá embaixo com o dedinho e coloque na ordem correta nos quadradinhos aqui em cima!",
      run: (container, phase) => runCriacaoOrdem(container, phase)
    },
    {
      id: "versiculo_secreto",
      title: "VERSÍCULO SECRETO",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ui_icon_06.png?v=160",
      audioFile: "./6_ASSETS_AUDIO/versiculo_vovo/versiculo_vovo_01.mp3?v=160",
      vovoFala: "Escute o versículo e coloque as palavras na ordem certa aqui em cima!",
      run: (container, phase) => runVersiculoSecretoArcade(container, phase)
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
      audioFile: "vovo_jogo_16_v161.mp3",
      vovoFala: "Vamos montar o quebra-cabeça! Pegue as pecinhas lá embaixo na bandeja azul e encaixe no lugar certinho aqui no quadro de cima!",
      run: (container, phase) => runQuebraCabecaArcade(container, phase)
    },
    {
      id: "pintura_magica",
      title: "PINTURA MÁGICA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ico_jogo_17_pintura_v130.png?v=130",
      audioFile: "vovo_jogo_17_v162.mp3",
      vovoFala: "Vamos colorir esse desenho lindo! Escolha uma cor lá embaixo, leve a pontinha do lápis até o lugar certinho e depois aperte com o dedinho na tela para pintar! Quando terminar, aperte em pronto!",
      run: (container, phase) => runPinturaMagicaArcade(container, phase)
    },
    {
      id: "caca_palavras",
      title: "CAÇA-PALAVRAS",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ebd_icon_bau_jogos.png?v=161",
      audioFile: "vovo_jogo_19_v161.mp3",
      vovoFala: "Hora do caça-palavras da Bíblia! Procure no quadro aqui em cima as palavras que estão escritas lá embaixo e passe o dedinho sobre as letras!",
      run: (container, phase) => runCacaPalavrasArcade(container, phase)
    },
    {
      id: "palavra_secreta",
      title: "PALAVRA SECRETA",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ebd_icon_licao.png?v=161",
      audioFile: "vovo_jogo_20_v161.mp3",
      vovoFala: "Qual é a palavra secreta da Bíblia? Olhe a pista lá em cima e toque nas letrinhas aqui embaixo para descobrir a palavra escondida!",
      run: (container, phase) => runPalavraSecretaArcade(container, phase)
    },
    {
      id: "quem_sou_eu",
      title: "QUEM SOU EU?",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ui_icon_04.png?v=161",
      audioFile: "vovo_jogo_21_v161.mp3",
      vovoFala: "Quem sou eu na Bíblia? Veja as pistas aqui em cima e toque no nome do personagem certo lá embaixo!",
      run: (container, phase) => runQuemSouEuArcade(container, phase)
    },
    {
      id: "verdadeiro_mito",
      title: "VERDADEIRO OU MITO",
      sub: "",
      icon: "./2_ASSETS_UI_BOTOES/ui_icon_05.png?v=161",
      audioFile: "vovo_jogo_22_v161.mp3",
      vovoFala: "Verdadeiro ou mito? Leia a frase da Bíblia no cartão roxo aqui em cima e toque em verdadeiro ou em mito lá embaixo!",
      run: (container, phase) => runVerdadeiroOuMitoArcade(container, phase)
    }
  ];

  // ==========================================================================
  // 2B. BANCO OFICIAL DE 32 CARDS EXCLUSIVOS 16:9 (ZERO REPETIÇÃO!)
  // Regra Escalável: Fase 5 (Grátis) + Fase 15 (Assinante) + de 10 em 10 (25, 35...)
  // Nenhuma imagem abaixo se repete na Cronologia Bíblica, Devocional ou Álbum!
  // ==========================================================================
  const ARCADE_CARDS_STORAGE_KEY = "trono_arcade_cards_won_v1";

  const ARCADE_REWARD_CARDS_DB = {
    pesca_maravilhosa: {
      gameNum: 1,
      gameTitle: "PESCA MARAVILHOSA",
      milestones: {
        5:  { code: "CARD_01_F05", num: 1,  phase: 5,  tier: "GRÁTIS",   title: "As Redes Cheias na Galileia",      img: "./5_ASSETS_CARDS_JOGOS/card_01_pesca_f05.jpg?v=147" },
        15: { code: "CARD_02_F15", num: 2,  phase: 15, tier: "CAMPEÃO",  title: "Encontro na Praia com Jesus",      img: "./5_ASSETS_CARDS_JOGOS/card_02_pesca_f15.jpg?v=147" }
      }
    },
    dracma_perdida: {
      gameNum: 2,
      gameTitle: "ACHE A MOEDA",
      milestones: {
        5:  { code: "CARD_03_F05", num: 3,  phase: 5,  tier: "GRÁTIS",   title: "A Moeda de Prata Encontrada",      img: "./5_ASSETS_CARDS_JOGOS/card_03_moeda_f05.jpg?v=147" },
        15: { code: "CARD_04_F15", num: 4,  phase: 15, tier: "CAMPEÃO",  title: "Festa com as Vizinhas",            img: "./5_ASSETS_CARDS_JOGOS/card_04_moeda_f15.jpg?v=147" }
      }
    },
    pombo_arca: {
      gameNum: 3,
      gameTitle: "POMBINHA DA PAZ",
      milestones: {
        5:  { code: "CARD_05_F05", num: 5,  phase: 5,  tier: "GRÁTIS",   title: "O Raminho de Oliveira",            img: "./5_ASSETS_CARDS_JOGOS/card_05_pombo_f05.jpg?v=147" },
        15: { code: "CARD_06_F15", num: 6,  phase: 15, tier: "CAMPEÃO",  title: "A Pombinha Pousa nas Mãos de Noé", img: "./5_ASSETS_CARDS_JOGOS/card_06_pombo_f15.jpg?v=147" }
      }
    },
    jonatas_alvo: {
      gameNum: 4,
      gameTitle: "DESVIE DA LANÇA",
      milestones: {
        5:  { code: "CARD_07_F05", num: 7,  phase: 5,  tier: "GRÁTIS",   title: "A Amizade de Davi e Jônatas",      img: "./5_ASSETS_CARDS_JOGOS/card_07_davi_f05.jpg?v=147" },
        15: { code: "CARD_08_F15", num: 8,  phase: 15, tier: "CAMPEÃO",  title: "A Harpa de Paz de Davi",           img: "./5_ASSETS_CARDS_JOGOS/card_08_davi_f15.jpg?v=147" }
      }
    },
    ovelha_perdida: {
      gameNum: 5,
      gameTitle: "CADÊ A OVELHA?",
      milestones: {
        5:  { code: "CARD_09_F05", num: 9,  phase: 5,  tier: "GRÁTIS",   title: "Achando a Ovelhinha nas Pedras",   img: "./5_ASSETS_CARDS_JOGOS/card_09_ovelha1_f05.jpg?v=147" },
        15: { code: "CARD_10_F15", num: 10, phase: 15, tier: "CAMPEÃO",  title: "De Volta ao Aprisco nos Ombros",   img: "./5_ASSETS_CARDS_JOGOS/card_10_ovelha1_f15.jpg?v=147" }
      }
    },
    ovelha_fujona: {
      gameNum: 6,
      gameTitle: "PEGA A OVELHA!",
      milestones: {
        5:  { code: "CARD_11_F05", num: 11, phase: 5,  tier: "GRÁTIS",   title: "Alegria nos Campos de Belém",      img: "./5_ASSETS_CARDS_JOGOS/card_11_ovelha2_f05.jpg?v=147" },
        15: { code: "CARD_12_F15", num: 12, phase: 15, tier: "CAMPEÃO",  title: "Pastos Verdes e Águas Tranquilas", img: "./5_ASSETS_CARDS_JOGOS/card_12_ovelha2_f15.jpg?v=147" }
      }
    },
    quem_entrou_arca: {
      gameNum: 7,
      gameTitle: "ARCA DE NOÉ",
      milestones: {
        5:  { code: "CARD_13_F05", num: 13, phase: 5,  tier: "GRÁTIS",   title: "Os Bichinhos Entrando na Arca",    img: "./5_ASSETS_CARDS_JOGOS/card_13_arca_f05.jpg?v=147" },
        15: { code: "CARD_14_F15", num: 14, phase: 15, tier: "CAMPEÃO",  title: "A Aliança do Arco-Íris",           img: "./5_ASSETS_CARDS_JOGOS/card_14_arca_f15.jpg?v=147" }
      }
    },
    quiz_visual: {
      gameNum: 8,
      gameTitle: "QUIZ DA BÍBLIA",
      milestones: {
        5:  { code: "CARD_15_F05", num: 15, phase: 5,  tier: "GRÁTIS",   title: "Os Reis Magos e a Estrela Guia",   img: "./5_ASSETS_CARDS_JOGOS/card_15_quiz_f05.jpg?v=147" },
        15: { code: "CARD_16_F15", num: 16, phase: 15, tier: "CAMPEÃO",  title: "O Menino Jesus no Templo",         img: "./5_ASSETS_CARDS_JOGOS/card_16_quiz_f15.jpg?v=147" }
      }
    },
    ligue_pontos: {
      gameNum: 9,
      gameTitle: "LIGUE OS PONTOS",
      milestones: {
        5:  { code: "CARD_17_F05", num: 17, phase: 5,  tier: "GRÁTIS",   title: "Abraão e o Céu de Estrelas",       img: "./5_ASSETS_CARDS_JOGOS/card_17_pontos_f05.jpg?v=147" },
        15: { code: "CARD_18_F15", num: 18, phase: 15, tier: "CAMPEÃO",  title: "A Escada Iluminada de Jacó",       img: "./5_ASSETS_CARDS_JOGOS/card_18_pontos_f15.jpg?v=147" }
      }
    },
    seis_erros: {
      gameNum: 10,
      gameTitle: "JOGO DOS ERROS",
      milestones: {
        5:  { code: "CARD_19_F05", num: 19, phase: 5,  tier: "GRÁTIS",   title: "O Jardim Florido da Criação",      img: "./5_ASSETS_CARDS_JOGOS/card_19_erros_f05.jpg?v=147" },
        15: { code: "CARD_20_F15", num: 20, phase: 15, tier: "CAMPEÃO",  title: "Daniel na Cova dos Leões",         img: "./5_ASSETS_CARDS_JOGOS/card_20_erros_f15.jpg?v=147" }
      }
    },
    criacao_ordem: {
      gameNum: 11,
      gameTitle: "ORDEM CRONOLÓGICA",
      milestones: {
        5:  { code: "CARD_21_F05", num: 21, phase: 5,  tier: "GRÁTIS",   title: "O Sol, a Lua e as Estrelinhas",    img: "./5_ASSETS_CARDS_JOGOS/card_21_criacao_f05.jpg?v=147" },
        15: { code: "CARD_22_F15", num: 22, phase: 15, tier: "CAMPEÃO",  title: "A Grande Festa da Criação",        img: "./5_ASSETS_CARDS_JOGOS/card_22_criacao_f15.jpg?v=147" }
      }
    },
    memoria_sonoro: {
      gameNum: 12,
      gameTitle: "JOGO DA MEMÓRIA",
      milestones: {
        5:  { code: "CARD_23_F05", num: 23, phase: 5,  tier: "GRÁTIS",   title: "Amiguinhos da Natureza de Deus",   img: "./5_ASSETS_CARDS_JOGOS/card_23_memoria_f05.jpg?v=147" },
        15: { code: "CARD_24_F15", num: 24, phase: 15, tier: "CAMPEÃO",  title: "Jonas e a Grande Baleia Azul",     img: "./5_ASSETS_CARDS_JOGOS/card_24_memoria_f15.jpg?v=147" }
      }
    },
    mana_deserto: {
      gameNum: 13,
      gameTitle: "PÃOZINHO DO CÉU",
      milestones: {
        5:  { code: "CARD_25_F05", num: 25, phase: 5,  tier: "GRÁTIS",   title: "Colhendo o Maná ao Amanhecer",     img: "./5_ASSETS_CARDS_JOGOS/card_25_mana_f05.jpg?v=147" },
        15: { code: "CARD_26_F15", num: 26, phase: 15, tier: "CAMPEÃO",  title: "Água Viva da Rocha de Horebe",     img: "./5_ASSETS_CARDS_JOGOS/card_26_mana_f15.jpg?v=147" }
      }
    },
    tabernaculo_cesto: {
      gameNum: 14,
      gameTitle: "BEBÊ MOISÉS",
      milestones: {
        5:  { code: "CARD_27_F05", num: 27, phase: 5,  tier: "GRÁTIS",   title: "O Cestinho do Bebê Moisés no Nilo",img: "./5_ASSETS_CARDS_JOGOS/card_27_moises_f05.jpg?v=147" },
        15: { code: "CARD_28_F15", num: 28, phase: 15, tier: "CAMPEÃO",  title: "A Travessia do Mar Vermelho",      img: "./5_ASSETS_CARDS_JOGOS/card_28_moises_f15.jpg?v=147" }
      }
    },
    puzzle_3d: {
      gameNum: 15,
      gameTitle: "QUEBRA-CABEÇA",
      milestones: {
        5:  { code: "CARD_29_F05", num: 29, phase: 5,  tier: "GRÁTIS",   title: "Cinco Pães e Dois Peixinhos",      img: "./5_ASSETS_CARDS_JOGOS/card_29_puzzle_f05.jpg?v=147" },
        15: { code: "CARD_30_F15", num: 30, phase: 15, tier: "CAMPEÃO",  title: "Jesus Acalma a Tempestade",        img: "./5_ASSETS_CARDS_JOGOS/card_30_puzzle_f15.jpg?v=147" }
      }
    },
    pintura_magica: {
      gameNum: 16,
      gameTitle: "PINTURA MÁGICA",
      milestones: {
        5:  { code: "CARD_31_F05", num: 31, phase: 5,  tier: "GRÁTIS",   title: "A Túnica Colorida de José",        img: "./5_ASSETS_CARDS_JOGOS/card_31_pintura_f05.jpg?v=147" },
        15: { code: "CARD_32_F15", num: 32, phase: 15, tier: "CAMPEÃO",  title: "Jesus Abençoando as Crianças",     img: "./5_ASSETS_CARDS_JOGOS/card_32_pintura_f15.jpg?v=147" }
      }
    }
  };

  window.ARCADE_REWARD_CARDS_DB = ARCADE_REWARD_CARDS_DB;

  // Regra escalável: Fase 5 (Grátis) e de 10 em 10 fases a partir da 15 (15, 25, 35, 45...)
  window.isArcadeRewardMilestonePhase = function(phase) {
    const p = Number(phase) || 0;
    return p === 5 || (p >= 15 && (p - 5) % 10 === 0);
  };

  window.getWonArcadeCardsMap = function() {
    try {
      return JSON.parse(localStorage.getItem(ARCADE_CARDS_STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  };

  window.getArcadeCardByCode = function(cardCode) {
    for (const gId of Object.keys(ARCADE_REWARD_CARDS_DB)) {
      const entry = ARCADE_REWARD_CARDS_DB[gId];
      for (const phKey of Object.keys(entry.milestones)) {
        const c = entry.milestones[phKey];
        if (c && c.code === cardCode) {
          return Object.assign({ gameId: gId, gameTitle: entry.gameTitle, gameNum: entry.gameNum }, c);
        }
      }
    }
    return null;
  };

  window.getArcadeMilestoneCard = function(gameId, phase) {
    const entry = ARCADE_REWARD_CARDS_DB[gameId];
    if (!entry || !entry.milestones) return null;
    const c = entry.milestones[phase];
    if (!c) return null;
    return Object.assign({ gameId: gameId, gameTitle: entry.gameTitle, gameNum: entry.gameNum }, c);
  };

  window.getAllArcadeRewardCardsList = function() {
    const wonMap = window.getWonArcadeCardsMap();
    const list = [];
    SUPER_ARCADE_GAMES.forEach(g => {
      const entry = ARCADE_REWARD_CARDS_DB[g.id];
      if (!entry || !entry.milestones) return;
      Object.keys(entry.milestones).map(Number).sort((a, b) => a - b).forEach(ph => {
        const c = entry.milestones[ph];
        if (!c) return;
        list.push({
          code: c.code,
          cardNum: c.num,
          phase: c.phase,
          tier: c.tier,
          shortTitle: c.title,
          title: `${g.title} • ${c.title}`,
          superCardImg: c.img,
          img: c.img,
          gameId: g.id,
          gameTitle: g.title,
          gameIcon: g.icon,
          free: c.phase <= 5,
          is16x9Card: true,
          wonAt: Number(wonMap[c.code]) || 0,
          conquered: !!wonMap[c.code]
        });
      });
    });
    return list;
  };

  window.unlockArcadeMilestoneCard = function(gameId, phase) {
    if (!window.isArcadeRewardMilestonePhase(phase)) return null;
    const card = window.getArcadeMilestoneCard(gameId, phase);
    if (!card) return null;
    try {
      const map = window.getWonArcadeCardsMap();
      if (!map[card.code]) {
        map[card.code] = Date.now();
        localStorage.setItem(ARCADE_CARDS_STORAGE_KEY, JSON.stringify(map));
        if (typeof updateTopCounters === "function") {
          try { updateTopCounters(); } catch (e) {}
        }
      }
    } catch (e) {}
    return card;
  };

  // Download DIRETO na memória do celular/tablet (SEM abrir WhatsApp nem menu externo!)
  window.shareOrDownloadArcadeRewardCard = async function(cardCode, btnFeedbackEl) {
    TronoAudio.play("success");
    const card = window.getArcadeCardByCode(cardCode);
    if (!card) return;
    const wonMap = window.getWonArcadeCardsMap();
    const isDevVip = (typeof isVipUnlocked !== "undefined" && isVipUnlocked && localStorage.getItem("trono_dev_all_cards") === "1");
    if (!wonMap[card.code] && !isDevVip) {
      return;
    }
    const cleanUrl = String(card.img || "").split("?")[0];
    const safeSlug = String(card.title || "super_card_trono_kids")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const fileName = `trono_kids_super_card_${String(card.num).padStart(2, "0")}_${safeSlug}.jpg`;

    const showSavedFeedback = () => {
      const targetBtn = btnFeedbackEl || document.getElementById("btn-canonical-reward-card");
      if (targetBtn) {
        const prevText = targetBtn.dataset.origLabel || targetBtn.textContent;
        targetBtn.dataset.origLabel = prevText;
        targetBtn.textContent = "SUPER CARD BAIXADO!";
        setTimeout(() => {
          if (targetBtn) targetBtn.textContent = prevText;
        }, 2200);
      }
    };

    try {
      const resp = await fetch(card.img || cleanUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      showSavedFeedback();
      return;
    } catch (err) {}

    const a = document.createElement("a");
    a.href = cleanUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSavedFeedback();
  };

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
        overscroll-behavior: none !important;
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
      .arcade-phase-nav-group {
        display: flex;
        align-items: center;
        gap: 6px;
        z-index: 99;
      }
      .arcade-phase-arrow-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
        border: 2px solid #fde047;
        color: #ffffff;
        font-size: 13px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.5);
        transition: transform 0.12s ease, opacity 0.2s ease, background 0.15s ease;
        padding: 0;
        user-select: none;
        touch-action: manipulation;
      }
      .arcade-phase-arrow-btn:active {
        transform: scale(0.90);
      }
      .arcade-phase-badge {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        padding: 5px 13px;
        border-radius: 999px;
        border: 2px solid #fde047;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 5px;
        letter-spacing: 0.4px;
        white-space: nowrap;
        transition: transform 0.12s ease;
      }
      .arcade-phase-badge:active {
        transform: scale(0.95);
      }
      @keyframes vovoReplayBorderFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes vovoReplaySpeakingPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(253,224,71,0.55); }
        50% { transform: scale(1.06); box-shadow: 0 6px 16px rgba(0,0,0,0.72), 0 0 22px rgba(253,224,71,0.95); }
      }
      .arcade-btn-replay-vovo {
        position: absolute;
        top: 64px;
        right: 10px;
        z-index: 155;
        height: 34px;
        padding: 0 11px 0 9px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(180deg, rgba(126, 34, 206, 0.92) 0%, rgba(76, 29, 149, 0.96) 100%);
        color: #ffffff;
        font-family: 'Fredoka', sans-serif;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.4px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.65);
        pointer-events: auto;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition: transform 0.14s ease, filter 0.14s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .arcade-btn-replay-vovo::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2.5px;
        background: linear-gradient(125deg, #38bdf8, #a855f7, #fde047, #34d399, #ec4899, #38bdf8);
        background-size: 250% 250%;
        animation: vovoReplayBorderFlow 4s ease infinite;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .arcade-btn-replay-vovo:active {
        transform: scale(0.93);
      }
      .arcade-btn-replay-vovo.vovo-speaking {
        animation: vovoReplaySpeakingPulse 1.15s ease-in-out infinite;
        color: #fde047;
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
        z-index: 1;
        isolation: isolate;
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
        justify-content: safe center;
        padding: 52px 14px 16px 14px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
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
  const ARCADE_PROGRESS_STORAGE_KEY = "trono_arcade_progress_v1";

  function getGameTotalPhases(gameId) {
    if (gameId === "criacao_ordem") {
      return (window.CHRONOLOGY_LEVELS && window.CHRONOLOGY_LEVELS.length) ? window.CHRONOLOGY_LEVELS.length : 22;
    }
    if (gameId === "versiculo_secreto") {
      return (window.VERSE_BUILDER_BANK && window.VERSE_BUILDER_BANK.length) ? window.VERSE_BUILDER_BANK.length : 22;
    }
    if (gameId === "puzzle_3d" || gameId === "pintura_magica") {
      return (window.EBD_LESSONS_CURRICULUM && window.EBD_LESSONS_CURRICULUM.length) ? window.EBD_LESSONS_CURRICULUM.length : 22;
    }
    if (gameId === "caca_palavras") {
      return (window.WORD_SEARCH_LEVELS && window.WORD_SEARCH_LEVELS.length) ? window.WORD_SEARCH_LEVELS.length : 22;
    }
    if (gameId === "palavra_secreta") {
      return (window.SECRET_WORD_BANK && window.SECRET_WORD_BANK.length) ? window.SECRET_WORD_BANK.length : 22;
    }
    if (gameId === "quem_sou_eu") {
      return (window.WHO_AM_I_BANK && window.WHO_AM_I_BANK.length) ? window.WHO_AM_I_BANK.length : 22;
    }
    if (gameId === "verdadeiro_mito") {
      return (window.TRUE_OR_MYTH_BANK && window.TRUE_OR_MYTH_BANK.length) ? window.TRUE_OR_MYTH_BANK.length : 22;
    }
    return TOTAL_PHASES;
  }

  function isArcadeVipActive() {
    return (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
  }

  function readAllArcadeProgressMap() {
    try {
      const raw = localStorage.getItem(ARCADE_PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    return {};
  }

  function writeAllArcadeProgressMap(map) {
    try {
      localStorage.setItem(ARCADE_PROGRESS_STORAGE_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  window.getArcadeGameProgress = function(gameId) {
    const totPh = getGameTotalPhases(gameId);
    const map = readAllArcadeProgressMap();
    const saved = map[gameId];
    if (saved && typeof saved === "object") {
      const mc = Math.max(0, Math.min(totPh, Math.floor(Number(saved.maxCompleted) || 0)));
      const lp = Math.max(1, Math.min(totPh, Math.floor(Number(saved.lastPhase) || 1)));
      return { maxCompleted: mc, lastPhase: lp };
    }
    // Migração automática caso o jogador já tenha conquistado Super Cards (Fase 5 ou Fase 15) antes do motor de save
    let migratedMax = 0;
    try {
      const entry = ARCADE_REWARD_CARDS_DB[gameId];
      const wonCards = (typeof window.getWonArcadeCardsMap === "function") ? window.getWonArcadeCardsMap() : {};
      if (entry && entry.milestones) {
        if (entry.milestones[15] && wonCards[entry.milestones[15].code]) migratedMax = 15;
        else if (entry.milestones[5] && wonCards[entry.milestones[5].code]) migratedMax = 5;
      }
    } catch (e) {}
    const isVip = isArcadeVipActive();
    const cap = isVip ? totPh : FREE_PHASES;
    const migratedLast = migratedMax > 0 ? Math.min(cap, migratedMax + 1) : 1;
    return { maxCompleted: migratedMax, lastPhase: Math.max(1, migratedLast) };
  };

  // REGRA OFICIAL DE DESBLOQUEIO:
  // Fases 1 a 5 são 100% GRATUITAS e SEMPRE ABERTAS sem cadeado em todos os 16 jogos!
  // Cadeados começam ESTRITAMENTE a partir da Fase 6 (6 a 15/22 para Assinantes, liberando 6 -> 7 -> 8... conforme vence)!
  window.getArcadeGameMaxUnlocked = function(gameId) {
    if (!isArcadeVipActive()) return FREE_PHASES;
    const totPh = getGameTotalPhases(gameId);
    const prog = window.getArcadeGameProgress(gameId);
    if (prog.maxCompleted < FREE_PHASES) return FREE_PHASES;
    return Math.min(totPh, prog.maxCompleted + 1);
  };

  window.saveArcadeLastPhase = function(gameId, phase) {
    if (!gameId) return;
    const map = readAllArcadeProgressMap();
    const prog = window.getArcadeGameProgress(gameId);
    const maxUnl = window.getArcadeGameMaxUnlocked(gameId);
    const clamped = Math.max(1, Math.min(maxUnl, Math.floor(Number(phase) || 1)));
    map[gameId] = {
      maxCompleted: prog.maxCompleted,
      lastPhase: clamped
    };
    writeAllArcadeProgressMap(map);
  };

  window.recordArcadePhaseVictory = function(gameId, phaseWon) {
    if (!gameId) return;
    const totPh = getGameTotalPhases(gameId);
    const map = readAllArcadeProgressMap();
    const prog = window.getArcadeGameProgress(gameId);
    const pWon = Math.max(1, Math.min(totPh, Math.floor(Number(phaseWon) || 1)));
    const newMaxCompleted = Math.max(prog.maxCompleted, pWon);
    const isVip = isArcadeVipActive();
    const newMaxUnlocked = !isVip
      ? FREE_PHASES
      : (newMaxCompleted < FREE_PHASES ? FREE_PHASES : Math.min(totPh, newMaxCompleted + 1));
    const nextResumePhase = (pWon < newMaxUnlocked) ? (pWon + 1) : pWon;
    map[gameId] = {
      maxCompleted: newMaxCompleted,
      lastPhase: Math.max(1, Math.min(newMaxUnlocked, nextResumePhase))
    };
    writeAllArcadeProgressMap(map);
  };

  window.refreshArcadeUiAfterDevChange = function() {
    if (currentActiveGame && currentActiveGame.id) {
      const maxUnl = window.getArcadeGameMaxUnlocked(currentActiveGame.id);
      const stageEl = document.getElementById("screen-trono-arcade-stage");
      if (currentPhase > maxUnl && stageEl && stageEl.classList.contains("active")) {
        currentPhase = maxUnl;
        loadPhase(currentPhase);
      }
    }
    updateArcadeTopPhaseNavState();
  };

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
          <button class="arcade-btn-circle" id="arcade-btn-back" type="button" title="Voltar" style="pointer-events:auto; z-index:99;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="pointer-events:none;"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="arcade-phase-nav-group">
            <button class="arcade-phase-arrow-btn" id="arcade-phase-prev" type="button" title="Fase anterior">◀</button>
            <div class="arcade-phase-badge" id="arcade-phase-display" onclick="window.handleArcadeDevTap()">
              FASE <span id="arcade-phase-num">1</span> / <span id="arcade-phase-total">5</span>
            </div>
            <button class="arcade-phase-arrow-btn" id="arcade-phase-next" type="button" title="Próxima fase desbloqueada">▶</button>
          </div>
          <button class="arcade-btn-circle" id="arcade-btn-sound" type="button" title="Cortar / Ligar Som" style="background:linear-gradient(180deg, #eab308 0%, #ca8a04 100%); pointer-events:auto; z-index:99;">
            <svg id="arcade-sound-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style="pointer-events:none;">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M15.54 8.46C16.47 9.4 17 10.66 17 12C17 13.34 16.47 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Botão Universal "OUVIR" Dentro da Imagem de Todos os Jogos (Repete a Fala do Vovô!) -->
        <button class="arcade-btn-replay-vovo" id="arcade-btn-replay-vovo" type="button" title="Ouvir o Vovô novamente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="pointer-events:none; flex-shrink:0;">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#fde047"/>
            <path d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5M18.8 5.4C20.6 7.1 21.6 9.5 21.6 12C21.6 14.5 20.6 16.9 18.8 18.6" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/>
          </svg>
          <span style="pointer-events:none;">OUVIR</span>
        </button>

        <!-- Área de Jogo Limpa em Tela Cheia (Sem balões de texto bloqueando a tela) -->
        <div class="arcade-game-canvas-area" id="arcade-game-stage-container"></div>

        <canvas id="arcade-confetti-canvas" class="confetti-canvas"></canvas>

        <!-- MODAL CANÔNICO DE VITÓRIA (IDENTIDADE VISUAL PADRÃO TRONO KIDS) -->
        <div id="trono-victory-modal" style="display:none;"></div>
      `;
      document.body.appendChild(stage);

      // Botão Voltar: salva automaticamente a fase atual e vai DIRETO para a Sala de Jogos (sem modal de pausa!)
      const backBtn = document.getElementById("arcade-btn-back");
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.closeTronoArcadeStage();
        });
      }

      const prevPhaseBtn = document.getElementById("arcade-phase-prev");
      if (prevPhaseBtn) {
        prevPhaseBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.stepArcadeUnlockedPhase(-1);
        });
      }

      const nextPhaseBtn = document.getElementById("arcade-phase-next");
      if (nextPhaseBtn) {
        nextPhaseBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.stepArcadeUnlockedPhase(1);
        });
      }

      const soundBtn = document.getElementById("arcade-btn-sound");
      if (soundBtn) {
        soundBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.toggleArcadeSound();
        });
      }

      const replayVovoBtn = document.getElementById("arcade-btn-replay-vovo");
      if (replayVovoBtn) {
        replayVovoBtn.addEventListener("click", (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          window.repeatVovoInstruction();
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
  let _arcadeLessonSingleMode = false;
  let _arcadeLessonWeekNum = 1;
  let _arcadeLessonGameKey = "";
  let _arcadeCustomBackScreen = "";
  window._arcadeDirectStoryOverride = null;
  window._arcadeActivePaintStory = null;
  window._arcadeVictoryStartedAt = 0;
  window._arcadeClosingUntil = 0;

  function cleanupChronoDragArtifacts() {
    if (window._chronoDragGhostEl && window._chronoDragGhostEl.parentNode) {
      try { window._chronoDragGhostEl.parentNode.removeChild(window._chronoDragGhostEl); } catch (e) {}
    }
    window._chronoDragGhostEl = null;
    if (window._chronoWinTimer) {
      clearTimeout(window._chronoWinTimer);
      window._chronoWinTimer = null;
    }
    if (window._verseDragGhostEl && window._verseDragGhostEl.parentNode) {
      try { window._verseDragGhostEl.parentNode.removeChild(window._verseDragGhostEl); } catch (e) {}
    }
    window._verseDragGhostEl = null;
    if (window._verseWinTimer) {
      clearTimeout(window._verseWinTimer);
      window._verseWinTimer = null;
    }
    if (window._arcadePuzzleRaf) {
      cancelAnimationFrame(window._arcadePuzzleRaf);
      window._arcadePuzzleRaf = null;
    }
    if (window._arcadePuzzleWinTimer) {
      clearTimeout(window._arcadePuzzleWinTimer);
      window._arcadePuzzleWinTimer = null;
    }
    if (window._arcadeWordSearchWinTimer) {
      clearTimeout(window._arcadeWordSearchWinTimer);
      window._arcadeWordSearchWinTimer = null;
    }
    if (window._arcadeSecretWordWinTimer) {
      clearTimeout(window._arcadeSecretWordWinTimer);
      window._arcadeSecretWordWinTimer = null;
    }
    if (window._arcadeWhoAmIWinTimer) {
      clearTimeout(window._arcadeWhoAmIWinTimer);
      window._arcadeWhoAmIWinTimer = null;
    }
    if (window._arcadeTrueMythWinTimer) {
      clearTimeout(window._arcadeTrueMythWinTimer);
      window._arcadeTrueMythWinTimer = null;
    }
    if (window._arcadePaintKeyHandler) {
      window.removeEventListener("keydown", window._arcadePaintKeyHandler);
      window._arcadePaintKeyHandler = null;
    }
    if (window._arcadePaintResizeHandler) {
      window.removeEventListener("resize", window._arcadePaintResizeHandler);
      window._arcadePaintResizeHandler = null;
    }
    window._arcadePhaseLoadToken = (window._arcadePhaseLoadToken || 0) + 1;
    if (window._arcadeVisualReadySafetyTimer) {
      clearTimeout(window._arcadeVisualReadySafetyTimer);
      window._arcadeVisualReadySafetyTimer = null;
    }
    window._onArcadeVisualReady = null;
    window._arcadeWaitVisualBeforeVovo = false;
    window._arcadeVisualAlreadyReady = false;
  }

  window.openTronoArcadeGame = function(gameId) {
    if (gameId === "animais_eden") gameId = "quem_entrou_arca";
    // Escudo anti-ghost-click: bloqueia clique fantasma do celular nos 550ms após fechar um jogo!
    if (window._arcadeClosingUntil && Date.now() < window._arcadeClosingUntil) {
      return;
    }
    _arcadeLessonSingleMode = false;
    _arcadeLessonGameKey = "";
    _arcadeCustomBackScreen = "";
    window._arcadeDirectStoryOverride = null;
    window._userEnteredModule = true;
    try { history.pushState({ screen: "arcade-stage", gameId: gameId }, ""); } catch(e){}
    TronoAudio.init();
    TronoAudio.play("click");
    ensureArcadeStageInDOM();

    const game = SUPER_ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;

    currentActiveGame = game;
    // RETOMA SEMPRE NA ÚLTIMA FASE JOGADA (ou inicia na Fase 1 se novo, mantendo 1 a 5 sempre abertas sem cadeado!)
    const maxUnl = window.getArcadeGameMaxUnlocked(game.id);
    const prog = window.getArcadeGameProgress(game.id);
    currentPhase = Math.max(1, Math.min(maxUnl, prog.lastPhase || 1));
    _vovoAlreadySpokeInSession = false; // Reset da sessão: ao entrar no jogo, o Vovô falará na primeira fase!

    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) {
      stage.classList.add("active");
      stage.style.display = "flex";
    }

    loadPhase(currentPhase);
  };

  // Abre o mesmo palco de jogo em tela cheia para "Jogos da Lição" (1 única fase correspondente à lição atual!)
  window.openLessonArcadeGame = function(gameId, lessonWeek, lessonGameKey) {
    if (window._arcadeClosingUntil && Date.now() < window._arcadeClosingUntil) {
      return;
    }
    const wk = Math.max(1, Math.floor(Number(lessonWeek) || 1));
    _arcadeLessonSingleMode = true;
    _arcadeLessonWeekNum = wk;
    _arcadeLessonGameKey = lessonGameKey || "chronology";
    _arcadeCustomBackScreen = "";
    window._arcadeDirectStoryOverride = null;
    window._userEnteredModule = true;
    TronoAudio.init();
    TronoAudio.play("click");
    ensureArcadeStageInDOM();

    const game = SUPER_ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;

    currentActiveGame = game;
    currentPhase = wk;
    _vovoAlreadySpokeInSession = false;

    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) {
      stage.classList.add("active");
      stage.style.display = "flex";
    }

    loadPhase(currentPhase);
  };

  // Abre Pintura Mágica ou Quebra-Cabeça direto de uma arte escolhida na Galeria (#screen-gallery)
  window.openTronoArcadeStoryDirect = function(gameId, storyObj, backScreenId) {
    if (window._arcadeClosingUntil && Date.now() < window._arcadeClosingUntil) {
      return;
    }
    _arcadeLessonSingleMode = false;
    _arcadeLessonGameKey = "";
    _arcadeCustomBackScreen = backScreenId || "screen-gallery";
    window._arcadeDirectStoryOverride = storyObj || null;
    window._userEnteredModule = true;
    TronoAudio.init();
    TronoAudio.play("click");
    ensureArcadeStageInDOM();

    const game = SUPER_ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;

    currentActiveGame = game;
    currentPhase = Math.max(1, Math.floor(Number(storyObj && storyObj.id) || 1));
    _vovoAlreadySpokeInSession = false;

    const stage = document.getElementById("screen-trono-arcade-stage");
    if (stage) {
      stage.classList.add("active");
      stage.style.display = "flex";
    }

    loadPhase(currentPhase);
  };

  function updateArcadeTopPhaseNavState() {
    if (!currentActiveGame) return;
    const prevBtn = document.getElementById("arcade-phase-prev");
    const nextBtn = document.getElementById("arcade-phase-next");
    const displayEl = document.getElementById("arcade-phase-display");

    if (_arcadeLessonSingleMode) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (displayEl) {
        displayEl.innerHTML = `LIÇÃO <span>${_arcadeLessonWeekNum}</span>`;
      }
      return;
    }

    if (_arcadeCustomBackScreen && window._arcadeDirectStoryOverride) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (displayEl) {
        const sid = Number(window._arcadeDirectStoryOverride.id) || currentPhase || 1;
        displayEl.innerHTML = `${currentActiveGame.id === "pintura_magica" ? "DESENHO" : "CENA"} <span>${sid}</span>`;
      }
      return;
    }

    const isVip = isArcadeVipActive();
    const totPh = getGameTotalPhases(currentActiveGame.id);
    const maxUnl = window.getArcadeGameMaxUnlocked(currentActiveGame.id);
    if (displayEl) {
      displayEl.innerHTML = `FASE <span id="arcade-phase-num">${currentPhase}</span> / <span id="arcade-phase-total">${isVip ? totPh : 5}</span>`;
    }
    if (prevBtn) {
      prevBtn.style.display = "flex";
      const canPrev = currentPhase > 1;
      prevBtn.style.opacity = canPrev ? "1" : "0.35";
      prevBtn.style.borderColor = canPrev ? "#fde047" : "#64748b";
    }
    if (nextBtn) {
      nextBtn.style.display = "flex";
      const canNext = currentPhase < maxUnl;
      nextBtn.style.opacity = canNext ? "1" : "0.42";
      nextBtn.style.borderColor = canNext ? "#fde047" : "#64748b";
    }
  }

  window.stepArcadeUnlockedPhase = function(delta) {
    if (!currentActiveGame) return;
    const maxUnl = window.getArcadeGameMaxUnlocked(currentActiveGame.id);
    const isVip = isArcadeVipActive();
    const target = currentPhase + delta;
    if (delta < 0) {
      if (target >= 1) {
        TronoAudio.play("click");
        currentPhase = target;
        loadPhase(currentPhase);
      } else {
        TronoAudio.play("error");
      }
      return;
    }
    if (delta > 0) {
      if (target <= maxUnl) {
        TronoAudio.play("click");
        currentPhase = target;
        loadPhase(currentPhase);
      } else if (!isVip && target > FREE_PHASES) {
        window.openVipFromArcade();
      } else {
        TronoAudio.play("error");
      }
    }
  };

  window.jumpToArcadeUnlockedPhase = function(phaseNum) {
    if (!currentActiveGame) return;
    const p = Math.floor(Number(phaseNum) || 1);
    const isVip = isArcadeVipActive();
    const maxUnl = window.getArcadeGameMaxUnlocked(currentActiveGame.id);

    if (p >= 1 && p <= maxUnl) {
      TronoAudio.play("click");
      currentPhase = p;
      loadPhase(currentPhase);
      return;
    }

    if (!isVip && p > FREE_PHASES) {
      window.openVipFromArcade();
      return;
    }

    TronoAudio.play("error");
  };

  function loadPhase(phase) {
    _isVictoryActive = false;
    _advancingPhaseLock = false;
    window._arcadeVictoryStartedAt = 0;
    cleanupChronoDragArtifacts();

    if (_arcadeLessonSingleMode) {
      currentPhase = Math.max(1, Math.floor(Number(phase) || _arcadeLessonWeekNum || 1));
    } else if (_arcadeCustomBackScreen && window._arcadeDirectStoryOverride) {
      currentPhase = Math.max(1, Math.floor(Number(phase) || Number(window._arcadeDirectStoryOverride.id) || 1));
    } else if (currentActiveGame && currentActiveGame.id) {
      const maxUnl = window.getArcadeGameMaxUnlocked(currentActiveGame.id);
      phase = Math.max(1, Math.min(maxUnl, Math.floor(Number(phase) || 1)));
      currentPhase = phase;
      window.saveArcadeLastPhase(currentActiveGame.id, currentPhase);
    }
    window._arcadeCurrentPhaseNum = currentPhase;
    updateArcadeTopPhaseNavState();

    const modal = document.getElementById("trono-victory-modal");
    if (modal) {
      modal.style.display = "none";
      modal.innerHTML = "";
    }
    const replayBtnEl = document.getElementById("arcade-btn-replay-vovo");
    if (replayBtnEl) {
      replayBtnEl.style.display = "inline-flex";
      replayBtnEl.classList.remove("vovo-speaking");
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
    if (window._arcaWinTimer) { clearTimeout(window._arcaWinTimer); window._arcaWinTimer = null; }
    if (window._arcaResizeHandler) { window.removeEventListener("resize", window._arcaResizeHandler); window._arcaResizeHandler = null; }
    if (window._arcaBichoPlayer) { try { window._arcaBichoPlayer.pause(); } catch(e){} window._arcaBichoPlayer = null; }
    if (window._dracmaCheckInterval) { clearInterval(window._dracmaCheckInterval); window._dracmaCheckInterval = null; }

    const container = document.getElementById("arcade-game-stage-container");
    // TRAVA UNIVERSAL EM TODOS OS JOGOS ENQUANTO O VOVÔ EXPLICA:
    // Bloqueia 100% qualquer clique/arraste no palco até o Vovô terminar a fala!
    window._arcadeStageLockedForVovo = true;
    const phaseLoadToken = (window._arcadePhaseLoadToken = (window._arcadePhaseLoadToken || 0) + 1);
    if (window._arcadeVisualReadySafetyTimer) {
      clearTimeout(window._arcadeVisualReadySafetyTimer);
      window._arcadeVisualReadySafetyTimer = null;
    }
    window._arcadeWaitVisualBeforeVovo = false;
    window._arcadeVisualAlreadyReady = false;
    window._onArcadeVisualReady = null;
    window._notifyArcadeVisualReady = function() {
      if (window._arcadePhaseLoadToken !== phaseLoadToken) return;
      if (window._arcadeVisualAlreadyReady) return;
      window._arcadeVisualAlreadyReady = true;
      if (window._arcadeVisualReadySafetyTimer) {
        clearTimeout(window._arcadeVisualReadySafetyTimer);
        window._arcadeVisualReadySafetyTimer = null;
      }
      if (typeof window._onArcadeVisualReady === "function") {
        const readyCb = window._onArcadeVisualReady;
        window._onArcadeVisualReady = null;
        readyCb();
      }
    };

    if (container) {
      container.style.visibility = "visible";
      container.style.opacity = "1";
      container.style.pointerEvents = "none";
    }
    if (container && currentActiveGame) {
      container.innerHTML = "";
      currentActiveGame.run(container, currentPhase);
    }

    const unlockStageAfterVovo = () => {
      if (window._arcadePhaseLoadToken !== phaseLoadToken) return;
      window._arcadeStageLockedForVovo = false;
      if (container) {
        container.style.pointerEvents = "auto";
      }
      if (typeof window._arcadeUnlockGameAction === 'function') {
        window._arcadeUnlockGameAction();
      }
    };
    window._currentUnlockStageAfterVovo = unlockStageAfterVovo;

    const startPhaseVovoOrUnlock = () => {
      if (window._arcadePhaseLoadToken !== phaseLoadToken) return;
      const stgEl = document.getElementById("screen-trono-arcade-stage");
      if (!stgEl || !stgEl.classList.contains("active")) return;

      // QUIZ DA BÍBLIA: Em todas as 15 fases o Vovô faz a pergunta e diz as 3 alternativas (com trava até terminar de falar!)
      if (currentActiveGame && currentActiveGame.id === "quiz_visual") {
        _vovoAlreadySpokeInSession = true;
        const qNum = Math.max(1, Math.min(15, Math.floor(Number(currentPhase) || 1)));
        const qAudio = `./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q${String(qNum).padStart(2, "0")}.mp3?v=154`;
        TronoAudio.falarVovo(qAudio, () => {
          unlockStageAfterVovo();
        });
        return;
      }

      // VERSÍCULO SECRETO: Em cada uma das 22 fases o Vovô LÊ o versículo da lição e pede para montar (com trava até terminar!)
      if (currentActiveGame && currentActiveGame.id === "versiculo_secreto") {
        _vovoAlreadySpokeInSession = true;
        const vBankLen = (window.VERSE_BUILDER_BANK && window.VERSE_BUILDER_BANK.length) ? window.VERSE_BUILDER_BANK.length : 22;
        const vNum = ((Math.max(1, Math.floor(Number(currentPhase) || 1)) - 1) % vBankLen) + 1;
        const vAudio = `./6_ASSETS_AUDIO/versiculo_vovo/versiculo_vovo_${String(vNum).padStart(2, "0")}.mp3?v=160`;
        TronoAudio.falarVovo(vAudio, () => {
          unlockStageAfterVovo();
        });
        return;
      }

      // PALAVRA SECRETA: Em cada uma das 22 fases o Vovô convida para brincar, narra a pista da palavra e trava até terminar!
      if (currentActiveGame && currentActiveGame.id === "palavra_secreta") {
        _vovoAlreadySpokeInSession = true;
        const swBankLen = (window.SECRET_WORD_BANK && window.SECRET_WORD_BANK.length) ? window.SECRET_WORD_BANK.length : 22;
        const swNum = ((Math.max(1, Math.floor(Number(currentPhase) || 1)) - 1) % swBankLen) + 1;
        const swAudio = `./6_ASSETS_AUDIO/palavra_secreta_vovo/palavra_secreta_vovo_${String(swNum).padStart(2, "0")}.mp3?v=165`;
        TronoAudio.falarVovo(swAudio, () => {
          unlockStageAfterVovo();
        });
        return;
      }

      // REGRA DE SESSÃO INTELIGENTE (TRAVA UNIVERSAL RIGOBERTO UX):
      // 1) Na primeira fase da sessão (quando entra no jogo, incluindo Ordem Cronológica!), o Vovô explica tudo e a trava aguarda 100% da fala!
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
    };

    // SINCRONIA VISUAL v164: Em jogos com desenho/imagem pesada (Pintura Mágica e Quebra-Cabeça),
    // aguarda a imagem terminar de carregar e aparecer na tela ANTES do Vovô começar a falar!
    if (window._arcadeWaitVisualBeforeVovo && !window._arcadeVisualAlreadyReady) {
      window._onArcadeVisualReady = startPhaseVovoOrUnlock;
      window._arcadeVisualReadySafetyTimer = setTimeout(() => {
        if (typeof window._notifyArcadeVisualReady === "function") {
          window._notifyArcadeVisualReady();
        }
      }, 6500);
    } else {
      startPhaseVovoOrUnlock();
    }
  }

  window.closeTronoArcadeStage = function(skipHubRedirect) {
    const wasLessonSingleMode = _arcadeLessonSingleMode;
    const wasCustomBackScreen = _arcadeCustomBackScreen;
    // Se a criança saiu no meio da partida na Sala de Jogos (sem estar na tela de vitória), salva imediatamente a fase atual!
    if (!wasLessonSingleMode && !wasCustomBackScreen && !_isVictoryActive && currentActiveGame && currentActiveGame.id) {
      window.saveArcadeLastPhase(currentActiveGame.id, currentPhase);
    }
    _arcadeLessonSingleMode = false;
    _arcadeCustomBackScreen = "";
    window._arcadeDirectStoryOverride = null;
    window._arcadeActivePaintStory = null;
    cleanupChronoDragArtifacts();
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
    if (typeof window.setVovoVoiceDucking === "function") {
      window.setVovoVoiceDucking(false);
    }
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
    if (window._arcaWinTimer) { clearTimeout(window._arcaWinTimer); window._arcaWinTimer = null; }
    if (window._arcaResizeHandler) { window.removeEventListener("resize", window._arcaResizeHandler); window._arcaResizeHandler = null; }
    if (window._arcaBichoPlayer) { try { window._arcaBichoPlayer.pause(); } catch(e){} window._arcaBichoPlayer = null; }
    if (window._dracmaCheckInterval) { clearInterval(window._dracmaCheckInterval); window._dracmaCheckInterval = null; }
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

    if (skipHubRedirect) return;

    if (wasLessonSingleMode && typeof window.openLessonModule === "function") {
      window.openLessonModule("jogos_licao");
    } else if (wasCustomBackScreen) {
      if (wasCustomBackScreen === "screen-gallery" && typeof window.renderGalleryPage === "function") {
        try { window.renderGalleryPage(); } catch (e) {}
      }
      if (typeof showScreen === "function") {
        showScreen(wasCustomBackScreen);
      }
    } else if (typeof openGamesHubScreen === "function") {
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
        openSubscribeModal();
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
    if (_arcadeCustomBackScreen) {
      window.closeTronoArcadeStage();
      return;
    }
    const isVip = isArcadeVipActive();
    const totPh = currentActiveGame ? getGameTotalPhases(currentActiveGame.id) : TOTAL_PHASES;

    if (currentPhase < FREE_PHASES) {
      currentPhase++;
      loadPhase(currentPhase);
    } else if (currentPhase === FREE_PHASES) {
      if (isVip) {
        currentPhase++;
        loadPhase(currentPhase);
      } else {
        window.closeTronoArcadeStage();
      }
    } else if (currentPhase < totPh) {
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
    if (_isVictoryActive || !currentActiveGame) return;
    if (window._arcadeAudioMuted && typeof window.toggleArcadeSound === "function") {
      window.toggleArcadeSound();
    }
    let audioTarget = currentActiveGame.audioFile;
    if (currentActiveGame.id === "quiz_visual") {
      const qNum = Math.max(1, Math.min(15, Math.floor(Number(currentPhase) || 1)));
      audioTarget = `./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q${String(qNum).padStart(2, "0")}.mp3?v=154`;
    } else if (currentActiveGame.id === "versiculo_secreto") {
      const vBankLen = (window.VERSE_BUILDER_BANK && window.VERSE_BUILDER_BANK.length) ? window.VERSE_BUILDER_BANK.length : 22;
      const vNum = ((Math.max(1, Math.floor(Number(currentPhase) || 1)) - 1) % vBankLen) + 1;
      audioTarget = `./6_ASSETS_AUDIO/versiculo_vovo/versiculo_vovo_${String(vNum).padStart(2, "0")}.mp3?v=160`;
    } else if (currentActiveGame.id === "palavra_secreta") {
      const swBankLen = (window.SECRET_WORD_BANK && window.SECRET_WORD_BANK.length) ? window.SECRET_WORD_BANK.length : 22;
      const swNum = ((Math.max(1, Math.floor(Number(currentPhase) || 1)) - 1) % swBankLen) + 1;
      audioTarget = `./6_ASSETS_AUDIO/palavra_secreta_vovo/palavra_secreta_vovo_${String(swNum).padStart(2, "0")}.mp3?v=165`;
    }
    if (!audioTarget) return;
    TronoAudio.play("click");
    const keepUnlockCb = (window._arcadeStageLockedForVovo && typeof window._currentUnlockStageAfterVovo === "function")
      ? window._currentUnlockStageAfterVovo
      : undefined;
    TronoAudio.falarVovo(audioTarget, keepUnlockCb);
  };

  function unlockVictoryContinueButton() {
    const btn = document.getElementById("btn-canonical-continue");
    if (!btn || btn.dataset.unlocked === "1") return;
    btn.dataset.unlocked = "1";
    const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
    const current = currentPhase || 1;

    // Destaca o pulso suave do botão de Baixar Super Card
    const rewardBtn = document.getElementById("btn-canonical-reward-card");
    if (rewardBtn) {
      rewardBtn.dataset.unlocked = "1";
      rewardBtn.style.opacity = "1";
      rewardBtn.style.pointerEvents = "auto";
      rewardBtn.style.cursor = "pointer";
      rewardBtn.style.animation = "btnGlowPulse 1.8s ease-in-out infinite";
    }

    const subBtn = document.getElementById("btn-canonical-subscribe");
    if (subBtn) {
      subBtn.dataset.unlocked = "1";
      subBtn.style.opacity = "1";
      subBtn.style.pointerEvents = "auto";
      subBtn.style.cursor = "pointer";
      subBtn.style.animation = "btnGlowPulse 1.8s ease-in-out infinite";
    }

    btn.textContent = "CONTINUAR BRINCANDO";
    btn.style.background = "linear-gradient(180deg, #00e676 0%, #00c853 100%)";
    btn.style.border = "2.5px solid #ffffff";
    btn.style.boxShadow = "0 0 22px rgba(0,230,118,0.85), 0 6px 16px rgba(0,0,0,0.75)";
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
    btn.style.animation = "btnGlowPulse 1.8s ease-in-out infinite";
    TronoAudio.play("pop");
  }

  let celebrationClapAudio = null;

  function triggerArcadeVictory() {
    // Blindagem contra disparo duplo na mesma fase
    if (_isVictoryActive) return;
    cleanupChronoDragArtifacts();

    // Quando jogado a partir de "Jogos da Lição" (1 única fase da lição):
    // fecha o palco do jogo e abre o Card Roxo Oficial dos Jogos da Lição ("VOLTAR AOS JOGOS DA LIÇÃO")!
    if (_arcadeLessonSingleMode) {
      const wonGameKey = _arcadeLessonGameKey || "chronology";
      const wonWeek = _arcadeLessonWeekNum || 1;
      if (typeof window.markLessonGameCompleted === "function") {
        window.markLessonGameCompleted(wonWeek, wonGameKey);
      }
      window.closeTronoArcadeStage(true);
      if (typeof window.openLessonModule === "function") {
        window.openLessonModule("jogos_licao");
      }
      if (typeof window.showLessonGameVictoryModal === "function") {
        window.showLessonGameVictoryModal(wonGameKey);
      }
      return;
    }

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
    if (window._arcaWinTimer) { clearTimeout(window._arcaWinTimer); window._arcaWinTimer = null; }
    if (window._arcaResizeHandler) { window.removeEventListener("resize", window._arcaResizeHandler); window._arcaResizeHandler = null; }
    if (window._arcaBichoPlayer) { try { window._arcaBichoPlayer.pause(); } catch(e){} window._arcaBichoPlayer = null; }
    if (window._dracmaCheckInterval) { clearInterval(window._dracmaCheckInterval); window._dracmaCheckInterval = null; }
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
        celebrationClapAudio.volume = 0.36;
        celebrationClapAudio.play().catch(() => {});
      }
    } catch(e) {
      console.warn("Celebration audio err:", e);
    }

    // 2. Registra vitória permanente da fase no localStorage (libera a próxima fase!) e monta o CARD CANÔNICO OFICIAL
    if (!_arcadeCustomBackScreen && currentActiveGame && currentActiveGame.id && typeof window.recordArcadePhaseVictory === "function") {
      window.recordArcadePhaseVictory(currentActiveGame.id, currentPhase);
      updateArcadeTopPhaseNavState();
    }
    renderCanonicalVictoryModal();

    // 3. Chuva leve e fluida de confetes 3D (com Watchdog acoplado ao modal e ao botão!)
    startArcadeCelebrationConfetti();

    // 4. Voz afetuosa do Vovô Nésio ("Parabéns! Muito bem!" = 4.64s)
    // REGRA RIGOBERTO: O botão CONTINUAR BRINCANDO SÓ LIBERA DEPOIS que o Vovô terminar 100% da frase!
    window._arcadeVictoryVoiceTimer = setTimeout(() => {
      if (!_isVictoryActive) return;
      if (celebrationClapAudio) {
        try { celebrationClapAudio.volume = 0.12; } catch(e) {}
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

    // Oculta e limpa 100% o palco do jogo atrás da tela de Parabéns para NUNCA vazar pastorzinho, ovelhinha, coração ou pedras!
    const stageContainer = document.getElementById("arcade-game-stage-container");
    if (stageContainer) {
      stageContainer.style.pointerEvents = "none";
      stageContainer.style.visibility = "hidden";
      stageContainer.style.opacity = "0";
      stageContainer.innerHTML = "";
    }
    const replayBtnEl = document.getElementById("arcade-btn-replay-vovo");
    if (replayBtnEl) {
      replayBtnEl.style.display = "none";
      replayBtnEl.classList.remove("vovo-speaking");
    }

    try {
      const game = currentActiveGame || {
        title: "Desvie da Lança",
        sub: "Desvie no Salão Real",
        icon: "./2_ASSETS_UI_BOTOES/ico_jogo_04_davi_lanca_v130.png?v=130"
      };

      const isVip = (typeof isVipUnlocked !== 'undefined' && isVipUnlocked) || localStorage.getItem('trono_vip_active_v4') === '1';
      const current = currentPhase || 1;

      // Verifica se esta fase desbloqueia um Card Exclusivo 16:9 (Fase 5 Grátis, Fase 15 Assinante, Fase 25, 35...)
      const milestoneCard = (game && game.id && typeof window.unlockArcadeMilestoneCard === "function")
        ? window.unlockArcadeMilestoneCard(game.id, current)
        : null;

      const prog = (game && game.id && typeof window.getArcadeGameProgress === "function")
        ? window.getArcadeGameProgress(game.id)
        : { maxCompleted: current, lastPhase: current };
      const maxUnl = (game && game.id && typeof window.getArcadeGameMaxUnlocked === "function")
        ? window.getArcadeGameMaxUnlocked(game.id)
        : current;

      const dotSizePx = milestoneCard ? 38 : 42;
      const dotFontPx = milestoneCard ? 15.5 : 17;

      let dotsHtml = "";
      const totGamePhases = getGameTotalPhases(game.id);
      if (!isVip) {
        // 5 Bolinhas Gratuitas SEMPRE ABERTAS (1 a 5 sem cadeado!) + 6ª Bolinha com Cadeadinho Oficial VIP
        for (let i = 1; i <= 5; i++) {
          const isJustWon = i === current;
          const isDone = i <= prog.maxCompleted;
          const bg = (isJustWon || isDone)
            ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)"
            : "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)";
          const border = isJustWon ? "3px solid #fde047" : "2px solid #ffffff";
          const shadow = isJustWon
            ? "box-shadow: 0 0 16px rgba(253,224,71,0.95), 0 4px 10px rgba(0,0,0,0.5);"
            : "box-shadow: 0 4px 8px rgba(0,0,0,0.4);";
          const starIcon = (isJustWon || (prog.maxCompleted >= 5 && i === 5))
            ? `<img src="./2_ASSETS_UI_BOTOES/ui_icon_06.png" style="position:absolute; top:-13px; right:-7px; width:20px; height:20px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));" alt="Estrela">`
            : "";

          dotsHtml += `
            <div onclick="window.jumpToArcadeUnlockedPhase(${i})" style="position:relative; width:${dotSizePx}px; height:${dotSizePx}px; border-radius:50%; background:${bg}; border:${border}; ${shadow} display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:${dotFontPx}px; cursor:pointer;">
              <span>${i}</span>
              ${starIcon}
            </div>
          `;
        }

        // 6ª Bolinha com Cadeado Oficial 3D (+10 Fases VIP — sem emoji!)
        dotsHtml += `
          <div onclick="window.openVipFromArcade()" style="position:relative; width:${dotSizePx}px; height:${dotSizePx}px; border-radius:50%; background:linear-gradient(180deg, #f59e0b 0%, #b45309 100%); border:2.5px solid #fde047; box-shadow:0 0 14px rgba(253,224,71,0.7), 0 4px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#ffffff; cursor:pointer;" title="Liberar +10 Fases VIP">
            <img src="./2_ASSETS_UI_BOTOES/ui_icon_08.png" alt="Bloqueado" style="width:18px; height:18px; object-fit:contain;">
          </div>
        `;
      } else {
        // Jogador VIP: mostra o bloco de 5 fases correspondente à fase atual (1..5 abertas; 6..15 com cadeado progressivo)
        const batchStart = Math.floor((current - 1) / 5) * 5 + 1;
        for (let i = batchStart; i < batchStart + 5 && i <= totGamePhases; i++) {
          const isJustWon = i === current;
          const isDone = i <= prog.maxCompleted;
          const isUnl = i <= maxUnl;
          const bg = (isJustWon || isDone)
            ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)"
            : (isUnl ? "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)" : "linear-gradient(180deg, #334155 0%, #1e293b 100%)");
          const border = isJustWon ? "3px solid #fde047" : (isUnl ? "2px solid #ffffff" : "2px solid #64748b");
          const clickAttr = isUnl ? `onclick="window.jumpToArcadeUnlockedPhase(${i})"` : "";
          const cursorCss = isUnl ? "cursor:pointer;" : "opacity:0.75;";
          dotsHtml += `
            <div ${clickAttr} style="position:relative; width:${dotSizePx}px; height:${dotSizePx}px; border-radius:50%; background:${bg}; border:${border}; display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:${dotFontPx}px; ${cursorCss}">
              ${isUnl ? `<span>${i}</span>` : `<img src="./2_ASSETS_UI_BOTOES/ui_icon_08.png" alt="Bloqueado" style="width:17px; height:17px; object-fit:contain;">`}
            </div>
          `;
        }
      }

      // SUPER CARD SOLTO DIRETO NO FUNDO ROXO (ZERO BLOCO AZUL, ZERO BORDA BRANCA, ZERO TÍTULO INTERNO, ZERO EMOJI!)
      // Moldura colorida girando (.frame-3d-alive) idêntica aos outros módulos do app + botão direto BAIXAR SUPER CARD!
      let rewardCardShowcaseHtml = "";
      if (milestoneCard) {
        rewardCardShowcaseHtml = `
          <div style="position:relative; z-index:2; font-size:14.5px; font-weight:900; color:#fde047; text-shadow:0 2px 8px rgba(0,0,0,0.88); margin-bottom:6px; letter-spacing:0.3px;">
            VOCÊ GANHOU UM SUPER CARD!
          </div>
          <div class="frame-3d-alive" style="position:relative; z-index:2; width:90%; max-width:276px; aspect-ratio:16/9; padding:5px; border-radius:18px; margin:0 auto 9px auto; box-sizing:border-box;">
            <img src="${milestoneCard.img}" alt="Super Card" style="width:100%; height:100%; object-fit:cover; border-radius:13px; display:block; border:none;">
          </div>
          <button id="btn-canonical-reward-card" type="button" data-unlocked="1" data-card-code="${milestoneCard.code}" style="position:relative; z-index:2; width:100%; max-width:316px; padding:11px 14px; font-size:15px; font-weight:900; color:#ffffff; background:linear-gradient(180deg, #00b0ff 0%, #0066ff 100%); border:2.5px solid #b3e5fc; border-radius:999px; box-shadow:0 5px 14px rgba(0,0,0,0.6), 0 0 16px rgba(0,176,255,0.5); margin-bottom:8px; opacity:1; cursor:pointer; pointer-events:auto; touch-action:manipulation; animation:btnGlowPulse 1.8s ease-in-out infinite;">
            BAIXAR SUPER CARD
          </button>
        `;
      }

      let actionsHtml = "";
      if (!isVip && current >= 5) {
        // FASE 5 NO MODO GRÁTIS: Botão de Assinar (+10 Fases) + Botão Continuar Brincando (soltos no roxo, sem bloco extra!)
        actionsHtml = `
          <button id="btn-canonical-subscribe" type="button" data-unlocked="1" style="position:relative; z-index:2; width:100%; padding:11px 14px; font-size:15px; font-weight:900; color:#ffffff; background:linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border:2.5px solid #fde047; border-radius:999px; box-shadow:0 0 18px rgba(245,158,11,0.7), 0 5px 14px rgba(0,0,0,0.65); margin-bottom:8px; cursor:pointer; pointer-events:auto; touch-action:manipulation; animation:btnGlowPulse 1.8s ease-in-out infinite;">
            ASSINAR O APP (+10 FASES)
          </button>
          <button id="btn-canonical-continue" type="button" style="position:relative; z-index:2; width:100%; padding:12px 14px; font-size:15.5px; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; pointer-events:none; touch-action:manipulation;">
            MUITO BEM!...
          </button>
        `;
      } else {
        const contPad = milestoneCard ? "12px 14px" : "15px";
        const contFont = milestoneCard ? "16.5px" : "18.5px";
        actionsHtml = `
          <button id="btn-canonical-continue" type="button" style="position:relative; z-index:2; width:100%; padding:${contPad}; font-size:${contFont}; font-weight:900; color:#94a3b8; background:#1e293b; border:2.5px solid #475569; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.5); cursor:not-allowed; opacity:0.85; transition:background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; pointer-events:none; touch-action:manipulation;">
            MUITO BEM!...
          </button>
        `;
      }

      const iconSizePx = milestoneCard ? 58 : 104;
      const titleFontPx = milestoneCard ? 21 : 28;
      const spacingPx = milestoneCard ? 7 : 16;

      modal.innerHTML = `
        <div class="trono-victory-screen-content" style="width:100%; max-width:380px; display:flex; flex-direction:column; align-items:center; text-align:center; z-index:2; animation:vicCardPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <!-- 1. Único Ícone 3D Oficial do Jogo no Topo Flutuando Solto -->
          <div style="position:relative; z-index:2; display:flex; align-items:center; justify-content:center; margin-bottom:4px;">
            <img src="${game.icon}" style="width:${iconSizePx}px; height:${iconSizePx}px; object-fit:contain; animation:aliveBtnFloat 2.0s ease-in-out infinite;" alt="${game.title}">
          </div>

          <!-- 2. Título Amarelo Dourado Brilhante Solto na Tela Roxa -->
          <div style="position:relative; z-index:2; font-size:${titleFontPx}px; font-weight:900; color:#fde047; text-shadow:0 4px 12px rgba(0,0,0,0.9), 0 0 22px rgba(253,224,71,0.6); line-height:1.1; margin-bottom:${spacingPx}px; letter-spacing:0.5px; animation:titlePopBounce 1.4s ease-in-out infinite;">
            PARABÉNS!<br>MUITO BEM!
          </div>

          <!-- 3. Bolinhas de Progresso Soltas (1 a 5 + Cadeado Oficial) -->
          <div style="position:relative; z-index:2; display:flex; justify-content:center; align-items:center; gap:7px; margin-bottom:${spacingPx}px; min-height:${dotSizePx + 4}px;">
            ${dotsHtml}
          </div>

          ${rewardCardShowcaseHtml}

          <!-- 4. Ações Padronizadas de Vitória Soltas na Tela Roxa -->
          <div style="position:relative; z-index:2; width:100%; max-width:316px;">
            ${actionsHtml}
          </div>
        </div>
      `;

      // Eventos SOMENTE em 'click' (NUNCA 'pointerup' para zero clique fantasma nos ícones da Sala de Jogos!)
      const rewardBtn = document.getElementById("btn-canonical-reward-card");
      if (rewardBtn) {
        rewardBtn.addEventListener("click", (ev) => {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          const code = rewardBtn.getAttribute("data-card-code");
          if (code && typeof window.shareOrDownloadArcadeRewardCard === "function") {
            window.shareOrDownloadArcadeRewardCard(code, rewardBtn);
          }
        });
      }

      const subBtn = document.getElementById("btn-canonical-subscribe");
      if (subBtn) {
        subBtn.addEventListener("click", (ev) => {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          window.openVipFromArcade();
        });
      }

      const mainBtn = document.getElementById("btn-canonical-continue");
      if (mainBtn) {
        mainBtn.addEventListener("click", (ev) => {
          if (mainBtn.dataset.unlocked !== "1") return;
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          if ((!isVip && current >= FREE_PHASES) || (isVip && current >= totGamePhases)) {
            window.closeTronoArcadeStage();
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
            PREPARE-SE...
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
        b.textContent = "LANÇAR A REDE!";
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
          btn.textContent = "LANÇOU A REDE!";
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
            btn.textContent = "LANÇAR A REDE!";
            btn.style.background = "linear-gradient(180deg, #22c55e 0%, #15803d 100%)";
            isActionInProgress = false;
            animId = requestAnimationFrame(loopTiming);
          }, 1000);
        }
      };
    }
  }

  // --- JOGO 2: A DRACMA PERDIDA (LANTERNA NO ESCURO COM FOCO AO LADO DO DEDO + TOQUE/CLIQUEZINHO PARA CAPTURAR) ---
  function runDracmaPerdida(container, phase) {
    if (window._dracmaCheckInterval) {
      clearInterval(window._dracmaCheckInterval);
      window._dracmaCheckInterval = null;
    }

    const pNum = Math.max(1, Math.min(15, Math.floor(Number(phase) || 1)));
    // Progressão real de 1 a 15 fases: Fase 1 = 1 dracma ... Fase 5 = 5 ... Fase 10 = 10 ... Fase 15 = 15 dracmas!
    const totalMoedas = pNum;

    // Foco da lamparina diminui gradualmente da Fase 1 (136px) até a Fase 15 (52px)
    const raioLuz = Math.round(Math.max(52, 142 - (pNum - 1) * 6.4));

    // Tamanho da dracma diminui levemente nas fases avançadas para ficar mais desafiador sem sobrepor
    const coinSizePx = pNum <= 4 ? 44 : (pNum <= 9 ? 38 : 34);

    let moedasAchadas = 0;
    let isInteractionLocked = true;
    let hasPlayerMovedLamp = false;
    let activeCapturePointer = false;

    // 24 lugares 100% naturais no cenário (ZERO moedas dentro/na boca dos jarros e ZERO pedrinhas falsas na frente!):
    const allHidingSpots = [
      { id: "s01_acima_janela_esq",   x: 14, y: 13.0 },
      { id: "s02_acima_janela_dir",   x: 27, y: 12.5 },
      { id: "s03_parapeito_janela",   x:  9, y: 28.5 },
      { id: "s04_batente_janela",     x:  8, y: 19.5 },
      { id: "s05_parede_abaixo_esq",  x:  9, y: 38.0 },
      { id: "s06_parede_abaixo_dir",  x: 23, y: 35.5 },
      { id: "s07_parede_veu_esq",     x: 35, y: 28.5 },
      { id: "s08_alto_janela_dir",    x: 39, y: 17.5 },
      { id: "s09_pedra_alta_centro",  x: 50, y: 10.0 },
      { id: "s10_pedra_alta_dir",     x: 68, y: 13.5 },
      { id: "s11_parede_fundo_dir",   x: 70, y: 26.5 },
      { id: "s12_cesto_redondo_topo", x: 89, y: 15.0 },
      { id: "s13_cesto_redondo_base", x: 81, y: 23.0 },
      { id: "s14_cesto_vime_dir",     x: 92, y: 33.5 },
      { id: "s15_bancada_cesto",      x: 80, y: 39.0 },
      { id: "s16_dobra_ajoelhada",    x: 52, y: 72.5 },
      { id: "s17_chao_joelho_esq",    x: 47, y: 83.5 },
      { id: "s18_barra_tunica_chao",  x: 60, y: 82.0 },
      { id: "s19_atras_vasos_costas", x: 74, y: 65.5 },
      { id: "s20_pe_sandalia_mulher", x: 86, y: 73.5 },
      { id: "s21_canto_parede_esq",   x:  7, y: 52.0 },
      { id: "s22_chao_baixo_esq",     x:  9, y: 94.0 },
      { id: "s23_chao_baixo_meio",    x: 23, y: 94.5 },
      { id: "s24_chao_baixo_dir",     x: 36, y: 93.5 }
    ];

    const pool = allHidingSpots.map((sp) => ({ id: sp.id, x: sp.x, y: sp.y }));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    const currentSpots = pool.slice(0, totalMoedas);

    const dracmaCoinSvg = `
      <svg viewBox="0 0 36 36" width="100%" height="100%" style="display:block; pointer-events:none;">
        <defs>
          <radialGradient id="dracmaGoldGrad" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stop-color="#fffef2"/>
            <stop offset="32%" stop-color="#fde047"/>
            <stop offset="72%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#92400e"/>
          </radialGradient>
        </defs>
        <circle cx="18" cy="18" r="16" fill="url(#dracmaGoldGrad)" stroke="#ffffff" stroke-width="2"/>
        <circle cx="18" cy="18" r="11.5" fill="none" stroke="#92400e" stroke-width="1.3" stroke-dasharray="2.5 1.8" opacity="0.75"/>
        <path d="M18 10.5L20.1 15.1L25 15.7L21.3 19.1L22.3 24L18 21.5L13.7 24L14.7 19.1L11 15.7L15.9 15.1Z" fill="#fffbeb" stroke="#92400e" stroke-width="1"/>
      </svg>
    `;

    const oilLampSvg = `
      <svg viewBox="0 0 44 44" width="44" height="44" style="display:block; pointer-events:none;">
        <path d="M31 18C31 12.5 34.5 9 34.5 9C34.5 9 38 12.5 38 18C38 20.6 36.4 22.5 34.5 22.5C32.6 22.5 31 20.6 31 18Z" fill="#fde047" stroke="#ffffff" stroke-width="1.2"/>
        <path d="M33 18.2C33 15.2 34.5 13 34.5 13C34.5 13 36 15.2 36 18.2C36 19.6 35.3 20.6 34.5 20.6C33.7 20.6 33 19.6 33 18.2Z" fill="#f97316"/>
        <path d="M9 24C9 20 14 18 21 18C27 18 31 20.5 35 22.5L33 26.5C29.5 29.5 25 31.5 19.5 31.5C13.5 31.5 9 28.2 9 24Z" fill="#d97706" stroke="#fde047" stroke-width="1.8"/>
        <path d="M9.5 23C6.2 22.5 4.5 20 5.5 17.8C6.5 15.8 9.2 16.5 11 19" fill="none" stroke="#fde047" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="20" cy="32.5" rx="7.5" ry="2.2" fill="#92400e" stroke="#fde047" stroke-width="1.2"/>
      </svg>
    `;

    const coinsHtml = currentSpots.map((spot, idx) => `
      <div id="dracma-coin-${idx}" class="dracma-coin-item" data-idx="${idx}" data-x="${spot.x}" data-y="${spot.y}" style="position:absolute; left:${spot.x}%; top:${spot.y}%; transform:translate(-50%, -50%); width:${coinSizePx}px; height:${coinSizePx}px; cursor:pointer; z-index:3; display:flex; align-items:center; justify-content:center; touch-action:none; transition:transform 0.14s ease, filter 0.14s ease;">
        <div class="dracma-coin-inner" style="width:100%; height:100%; border-radius:50%; box-shadow:0 0 12px rgba(253, 224, 71, 0.85), 0 3px 8px rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; user-select:none;">
          ${dracmaCoinSvg}
        </div>
      </div>
    `).join("");

    container.innerHTML = `
      <style>
        @keyframes dracmaFoundBurst {
          0% { transform:translate(-50%, -50%) scale(1); opacity:1; }
          40% { transform:translate(-50%, -76px) scale(1.75); opacity:1; filter:brightness(1.5); }
          100% { transform:translate(-50%, -125px) scale(2.1); opacity:0; }
        }
        @keyframes lampFlamePulse {
          0%, 100% { transform:scale(1); filter:drop-shadow(0 0 12px rgba(253,224,71,0.95)); }
          50% { transform:scale(1.10); filter:drop-shadow(0 0 20px rgba(245,158,11,1)); }
        }
      </style>
      <div style="position:relative; width:100%; height:100%; overflow:hidden; user-select:none; touch-action:none; background:#120b06;">
        <!-- 0. IMAGEM OFICIAL 3D PIXAR DO AMBIENTE BÍBLICO -->
        <img src="./2_ASSETS_UI_BOTOES/fundo_dracma_perdida_3d.jpg?v=105" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; z-index:1;" alt="Cenário 3D A Dracma Perdida" loading="eager" decoding="async">

        <!-- 1. CAMADA DE DRACMAS LIMPAS (SEM PEDRAS NA FRENTE) -->
        <div id="dracmas-layer" style="position:absolute; inset:0; z-index:3; pointer-events:none;">
          ${coinsHtml}
        </div>

        <!-- 2. CANVAS DE ESCURIDÃO COM FOCO DE LUZ ABERTO AO LADO DO DEDINHO -->
        <canvas id="dracma-canvas" style="position:absolute; inset:0; width:100%; height:100%; z-index:5; pointer-events:auto; touch-action:none; transition:opacity 0.8s ease;"></canvas>

        <!-- 3. ANEL DE APOIO DO DEDINHO (ONDE A CRIANÇA ENCOSTA) -->
        <div id="dracma-finger-ring" style="position:absolute; width:38px; height:38px; margin-left:-19px; margin-top:-19px; border-radius:50%; border:2px dashed rgba(253,224,71,0.55); background:rgba(253,224,71,0.10); pointer-events:none; z-index:6; opacity:0; transition:opacity 0.25s ease;"></div>

        <!-- 4. LAMPARINA VETORIAL ENTRE O DEDO E O FOCO (SEM TAMPAR O CENTRO DO FOCO DE LUZ!) -->
        <div id="dracma-lamparina-glow" style="position:absolute; width:50px; height:50px; margin-left:-25px; margin-top:-25px; pointer-events:none; z-index:7; display:flex; align-items:center; justify-content:center; opacity:0.42; filter:grayscale(0.9) brightness(0.6); transition:opacity 0.45s ease, filter 0.45s ease;">
          ${oilLampSvg}
        </div>

        <!-- 5. CONTADOR OFICIAL DE DRACMAS ENCONTRADAS (ZERO EMOJI / ZERO DUPLICIDADE) -->
        <div style="position:absolute; top:14px; left:14px; background:rgba(18, 11, 6, 0.88); border:2.5px solid #fde047; padding:6px 14px; border-radius:999px; color:#fde047; font-weight:900; font-size:17px; z-index:10; box-shadow:0 6px 16px rgba(0,0,0,0.75); display:flex; align-items:center; gap:7px; pointer-events:none;">
          <span style="width:22px; height:22px; display:inline-flex;">${dracmaCoinSvg}</span>
          <span><span id="dracmas-count">0</span> / ${totalMoedas}</span>
        </div>
      </div>
    `;

    const canvas = document.getElementById("dracma-canvas");
    const lampGlow = document.getElementById("dracma-lamparina-glow");
    const fingerRing = document.getElementById("dracma-finger-ring");
    const countEl = document.getElementById("dracmas-count");
    const ctx = canvas.getContext("2d");

    function syncCanvasDimensions() {
      const w = container.clientWidth || window.innerWidth || 360;
      const h = container.clientHeight || (window.innerHeight - 60) || 640;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncCanvasDimensions();

    let fingerX = canvas.width * 0.62;
    let fingerY = canvas.height * 0.68;
    let lightX = canvas.width * 0.44;
    let lightY = canvas.height * 0.60;

    // Calcula a posição do FOCO DE LUZ AO LADO DO DEDINHO (sem o dedo/mão tampar o foco e alcançando 100% dos cantos!)
    function computeLightOffsetFromFinger(fx, fy) {
      const W = canvas.width || 360;
      const H = canvas.height || 640;
      const tRight = Math.max(0, Math.min(1, (fx - W * 0.66) / (W * 0.27)));
      const tBot = Math.max(0, Math.min(1, (fy - H * 0.80) / (H * 0.16)));

      let dx = -70 * (1 - tRight) + 8 * tRight;
      const dyBase = -44 * (1 - tRight) + (-72) * tRight;
      let dy = dyBase * (1 - tBot) + (-12) * tBot;

      const dist = Math.hypot(dx, dy);
      if (dist < 66) {
        const scale = 66 / Math.max(1, dist);
        dx *= scale;
        dy *= scale;
      }

      const lx = Math.max(14, Math.min(W - 14, fx + dx));
      const ly = Math.max(14, Math.min(H - 14, fy + dy));
      return { lx, ly };
    }

    function updateLampIcons(fx, fy, lx, ly) {
      if (fingerRing) {
        fingerRing.style.left = fx + "px";
        fingerRing.style.top = fy + "px";
      }
      if (lampGlow) {
        const iconX = fx + (lx - fx) * 0.34;
        const iconY = fy + (ly - fy) * 0.34;
        lampGlow.style.left = iconX + "px";
        lampGlow.style.top = iconY + "px";
      }
    }

    function renderUnlitRoom() {
      syncCanvasDimensions();
      const pos = computeLightOffsetFromFinger(fingerX, fingerY);
      lightX = pos.lx;
      lightY = pos.ly;
      updateLampIcons(fingerX, fingerY, lightX, lightY);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(12, 8, 5, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function renderDarkness(fx, fy) {
      syncCanvasDimensions();
      fingerX = fx;
      fingerY = fy;
      const pos = computeLightOffsetFromFinger(fx, fy);
      lightX = pos.lx;
      lightY = pos.ly;
      updateLampIcons(fx, fy, lightX, lightY);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(12, 8, 5, 0.965)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "destination-out";
      const radG = ctx.createRadialGradient(lightX, lightY, raioLuz * 0.22, lightX, lightY, raioLuz);
      radG.addColorStop(0, "rgba(0,0,0,1)");
      radG.addColorStop(0.70, "rgba(0,0,0,0.96)");
      radG.addColorStop(0.88, "rgba(0,0,0,0.55)");
      radG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radG;
      ctx.beginPath();
      ctx.arc(lightX, lightY, raioLuz, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      const glowG = ctx.createRadialGradient(lightX, lightY, raioLuz * 0.45, lightX, lightY, raioLuz * 1.16);
      glowG.addColorStop(0, "rgba(253, 224, 71, 0.16)");
      glowG.addColorStop(0.65, "rgba(245, 158, 11, 0.08)");
      glowG.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.arc(lightX, lightY, raioLuz * 1.16, 0, Math.PI * 2);
      ctx.fill();
    }

    renderUnlitRoom();

    function collectCoin(coinEl) {
      if (isInteractionLocked) return;
      if (!coinEl || coinEl.dataset.found === "true") return;
      coinEl.dataset.found = "true";
      coinEl.style.zIndex = "25";
      coinEl.style.animation = "dracmaFoundBurst 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) forwards";

      TronoAudio.play("coin");
      moedasAchadas++;

      if (countEl) {
        countEl.textContent = moedasAchadas;
        countEl.style.transform = "scale(1.38)";
        setTimeout(() => { if (countEl) countEl.style.transform = "scale(1)"; }, 240);
      }

      if (moedasAchadas >= totalMoedas) {
        setTimeout(() => {
          if (canvas) canvas.style.opacity = "0";
          if (lampGlow) lampGlow.style.display = "none";
          if (fingerRing) fingerRing.style.display = "none";
          TronoAudio.play("success");
        }, 320);

        setTimeout(triggerArcadeVictory, 1050);
      }
    }

    // Apenas faz a moeda BRILHAR quando a luz passa por cima (NUNCA captura sozinha arrastando!)
    function highlightCoinsInBeam() {
      if (isInteractionLocked) return;
      const innerBeam = Math.max(32, raioLuz * 0.72);
      const outerBeam = Math.max(42, raioLuz * 0.98);

      currentSpots.forEach((spot, idx) => {
        const coin = document.getElementById(`dracma-coin-${idx}`);
        if (!coin || coin.dataset.found === "true") return;

        const coinPixelX = (spot.x / 100) * canvas.width;
        const coinPixelY = (spot.y / 100) * canvas.height;
        const distToLight = Math.hypot(lightX - coinPixelX, lightY - coinPixelY);

        if (distToLight <= innerBeam) {
          coin.style.filter = "brightness(1.48) drop-shadow(0 0 15px #fde047)";
          coin.style.transform = "translate(-50%, -50%) scale(1.18)";
        } else if (distToLight <= outerBeam) {
          coin.style.filter = "brightness(1.24) drop-shadow(0 0 10px #fde047)";
          coin.style.transform = "translate(-50%, -50%) scale(1.06)";
        } else {
          coin.style.filter = "none";
          coin.style.transform = "translate(-50%, -50%) scale(1)";
        }
      });
    }

    // CAPTURA POR CLIQUEZINHO: Quando a moeda já está iluminada pela lamparina, a criança dá um toque na moeda para pegar!
    function tryCaptureIlluminatedCoinAtTap(tapX, tapY) {
      if (isInteractionLocked) return false;
      const illuminatedRadius = Math.max(44, raioLuz * 1.06);
      const tapHitRadius = Math.max(44, coinSizePx * 1.18);

      for (let idx = 0; idx < currentSpots.length; idx++) {
        const coin = document.getElementById(`dracma-coin-${idx}`);
        if (!coin || coin.dataset.found === "true") continue;

        const spot = currentSpots[idx];
        const coinPixelX = (spot.x / 100) * canvas.width;
        const coinPixelY = (spot.y / 100) * canvas.height;

        const isCoinIlluminated = Math.hypot(lightX - coinPixelX, lightY - coinPixelY) <= illuminatedRadius;
        const didTapCoin = Math.hypot(tapX - coinPixelX, tapY - coinPixelY) <= tapHitRadius;

        if (isCoinIlluminated && didTapCoin) {
          collectCoin(coin);
          return true;
        }
      }
      return false;
    }

    function markFirstLampMove() {
      if (!hasPlayerMovedLamp) {
        hasPlayerMovedLamp = true;
        if (fingerRing) fingerRing.style.opacity = "0.85";
      }
    }

    function extractCanvasPoint(e, preferChangedTouch) {
      const rect = canvas.getBoundingClientRect();
      let pt = e;
      if (preferChangedTouch && e.changedTouches && e.changedTouches.length > 0) {
        pt = e.changedTouches[0];
      } else if (e.touches && e.touches.length > 0) {
        pt = e.touches[0];
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        pt = e.changedTouches[0];
      }
      return {
        fx: pt.clientX - rect.left,
        fy: pt.clientY - rect.top
      };
    }

    function onDownOrTouchStart(e) {
      if (isInteractionLocked) return;
      const { fx, fy } = extractCanvasPoint(e, true);
      // Se tocou direto numa moeda que JÁ está iluminada no foco, captura na hora sem afastar a luz!
      if (tryCaptureIlluminatedCoinAtTap(fx, fy)) {
        activeCapturePointer = true;
        return;
      }
      activeCapturePointer = false;
      markFirstLampMove();
      renderDarkness(fx, fy);
      highlightCoinsInBeam();
    }

    function onMove(e) {
      if (isInteractionLocked) return;
      if (activeCapturePointer) return;
      // No computador (mouse sem botão pressionado), também permite guiar a luz suavemente
      markFirstLampMove();
      const { fx, fy } = extractCanvasPoint(e, false);
      renderDarkness(fx, fy);
      highlightCoinsInBeam();
    }

    function onUpOrEnd() {
      activeCapturePointer = false;
    }

    function onDesktopClick(e) {
      if (isInteractionLocked) return;
      const { fx, fy } = extractCanvasPoint(e, true);
      tryCaptureIlluminatedCoinAtTap(fx, fy);
    }

    canvas.addEventListener("pointerdown", onDownOrTouchStart);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUpOrEnd);
    canvas.addEventListener("pointercancel", onUpOrEnd);
    canvas.addEventListener("touchstart", onDownOrTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("touchend", onUpOrEnd, { passive: true });
    canvas.addEventListener("click", onDesktopClick);

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
      if (fingerRing) {
        fingerRing.style.opacity = "0.75";
      }
      renderDarkness(fingerX, fingerY);
      highlightCoinsInBeam();
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
    if (window._arcaWinTimer) { clearTimeout(window._arcaWinTimer); window._arcaWinTimer = null; }
    if (window._arcaResizeHandler) { window.removeEventListener("resize", window._arcaResizeHandler); window._arcaResizeHandler = null; }
    if (window._arcaBichoPlayer) { try { window._arcaBichoPlayer.pause(); } catch(e){} window._arcaBichoPlayer = null; }
    if (window._dracmaCheckInterval) { clearInterval(window._dracmaCheckInterval); window._dracmaCheckInterval = null; }
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
        burst.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 2px 6px rgba(250,204,21,0.75));"><path d="M12 2L14.8 8.5L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.5L12 2Z" fill="#fde047" stroke="#f59e0b" stroke-width="1.5"/></svg>`;
        burst.style.cssText = "position:absolute; left:50%; top:10%; pointer-events:none; z-index:25; animation:ovelhaHeartFloat 0.85s ease-out forwards;";
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
    if (window._arcaWinTimer) { clearTimeout(window._arcaWinTimer); window._arcaWinTimer = null; }
    if (window._arcaResizeHandler) { window.removeEventListener("resize", window._arcaResizeHandler); window._arcaResizeHandler = null; }
    if (window._arcaBichoPlayer) { try { window._arcaBichoPlayer.pause(); } catch(e){} window._arcaBichoPlayer = null; }
    if (window._dracmaCheckInterval) { clearInterval(window._dracmaCheckInterval); window._dracmaCheckInterval = null; }

    const pNum = Math.min(15, Math.max(1, Number(phase) || 1));
    const diffT = (pNum - 1) / 14; // 0.0 na Fase 1 -> 1.0 na Fase 15

    // Quantidade progressiva de Pedras 3D no caminho: 1 na Fase 1 até 15 pedras na Fase 15!
    // Todas espaçadas com corredores largos (>= 70px) e sem árvores para zero sobreposição estranha!
    const rockBaseW = pNum <= 3 ? 56 : (pNum <= 7 ? 50 : (pNum <= 11 ? 46 : 42));
    const MASTER_ROCK_SLOTS = [
      { rxPct: 0.50, ryPct: 0.57, img: 1 },
      { rxPct: 0.34, ryPct: 0.45, img: 2 },
      { rxPct: 0.66, ryPct: 0.68, img: 3 },
      { rxPct: 0.63, ryPct: 0.45, img: 1 },
      { rxPct: 0.36, ryPct: 0.69, img: 2 },
      { rxPct: 0.19, ryPct: 0.56, img: 3 },
      { rxPct: 0.81, ryPct: 0.57, img: 1 },
      { rxPct: 0.46, ryPct: 0.33, img: 2 },
      { rxPct: 0.55, ryPct: 0.82, img: 3 },
      { rxPct: 0.21, ryPct: 0.35, img: 1 },
      { rxPct: 0.79, ryPct: 0.81, img: 2 },
      { rxPct: 0.18, ryPct: 0.72, img: 3 },
      { rxPct: 0.83, ryPct: 0.43, img: 1 },
      { rxPct: 0.35, ryPct: 0.84, img: 2 },
      { rxPct: 0.66, ryPct: 0.32, img: 3 }
    ];

    const mirrorHoriz = (pNum % 2 === 0);
    const chosenPreset = MASTER_ROCK_SLOTS.slice(0, pNum).map((s, idx) => ({
      rxPct: s.rxPct,
      ryPct: s.ryPct,
      img: s.img,
      w: rockBaseW + ((idx % 2 === 0) ? 2 : 0)
    }));

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
        radX: rp.w * 0.38,
        radY: rp.w * 0.22,
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

    // Posições iniciais opostas e livres das pedras na campina: Pastorzinho embaixo, Ovelhinha no topo oposto
    let px = clamp(initB.W * (mirrorHoriz ? 0.83 : 0.17), initB.minX, initB.maxX);
    let py = clamp(initB.H * 0.86, initB.minY, initB.maxY);
    let pvx = 0;
    let pvy = 0;
    let pastorFacing = mirrorHoriz ? -1 : 1;
    let walkPhase = 0;

    let ox = clamp(initB.W * (mirrorHoriz ? 0.17 : 0.83), initB.minX, initB.maxX);
    let oy = clamp(initB.H * 0.30, initB.minY, initB.maxY);
    let sheepFacing = mirrorHoriz ? 1 : -1;
    let hopPhase = 0;

    // --- CALIBRAGEM DE JOGABILIDADE SUAVE E AMIGÁVEL PARA CRIANÇAS (FASE 1 A FASE 15) ---
    // Delayzinho leve e gostoso no início (Fases 1 a 4), e teto máximo na Fase 15 equivalente à antiga Fase 2/3!
    // O desafio principal das fases vem do labirinto de pedrinhas no caminho (1 a 15 pedras), nunca de travar o boneco!
    const pastorMaxSpeed = 148 - diffT * 22;     // 148 px/s (Fase 1) -> 126 px/s (Fase 15): sempre mais rápido que a ovelha!
    const pastorInertia = 6.8 - diffT * 2.3;     // 6.8 (leve nas Fases 1-4) -> 4.5 no máximo na Fase 15!

    // Ovelhinha: passeio alegre + poucas fintas curtas + fôlego amplo para a criança alcançar sem frustração!
    const roamSpeed = 62 + diffT * 24;           // 62 px/s (Fase 1) -> 86 px/s (Fase 15)
    const dashSpeed = pastorMaxSpeed * (1.14 + diffT * 0.10); // Disparadinha curta, nunca exagerada
    const tiredSpeed = 52 + diffT * 12;          // 52..64 px/s (bem mais devagar que o Pastorzinho -> hora fácil de pegar!)
    const maxDashes = pNum === 1 ? 0 : (pNum <= 5 ? 1 : (pNum <= 11 ? 2 : 3));
    const dashDuration = 0.38 + diffT * 0.10;    // Finta curtinha (~0.4s)
    const tiredDuration = 3.80 - diffT * 1.00;   // 3.8s a 2.8s cansadinha para a criança alcançar com folga!
    const dashTriggerDist = 66 + diffT * 14;
    const alertDist = 108 + diffT * 18;
    const baseHopFreq = 6.4 + diffT * 1.8;

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
        if (distT > 4) {
          // Mantém velocidade firme enquanto o dedo guia o Pastorzinho, desacelerando só nos últimos 16px
          const throttle = clamp(distT / 16, 0.45, 1.0);
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
          // Recupera no máximo 1 finta curta se o jogador demorar bastante
          dashesLeft = maxDashes > 0 ? 1 : 0;
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

      // --- 3. VERIFICA ENCONTRO PASTORZINHO + OVELHINHA (RAIO GENEROSO DE 34px) ---
      const catchDist = Math.hypot(px - ox, (py - oy) * 1.06);
      if (catchDist <= 34) {
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

  // --- JOGO 8: ARCA DE NOÉ 3D PIXAR (15 FASES / 15 JANELAS DE SILHUETA + VOZ DO VOVÔ EM CADA BICHINHO) ---
  function runQuemEntrouArca(container, phase) {
    const pNum = Math.max(1, Math.min(15, parseInt(phase, 10) || 1));

    const ARCA_ANIMALS_DB = [
      { id: "leao",      img: "./2_ASSETS_UI_BOTOES/arca_bicho_01_leao_v142.png?v=142",      audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_01_leao_v142.mp3?v=142",      durMs: 1580 },
      { id: "girafa",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_03_girafa_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_03_girafa_v142.mp3?v=142",    durMs: 1570 },
      { id: "elefante",  img: "./2_ASSETS_UI_BOTOES/arca_bicho_02_elefante_v142.png?v=142",  audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_02_elefante_v142.mp3?v=142",  durMs: 1690 },
      { id: "ovelha",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_04_ovelha_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_04_ovelha_v142.mp3?v=142",    durMs: 1570 },
      { id: "macaco",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_05_macaco_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_05_macaco_v142.mp3?v=142",    durMs: 1640 },
      { id: "coelho",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_07_coelho_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_07_coelho_v142.mp3?v=142",    durMs: 1590 },
      { id: "tartaruga", img: "./2_ASSETS_UI_BOTOES/arca_bicho_08_tartaruga_v142.png?v=142", audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_08_tartaruga_v142.mp3?v=142", durMs: 1720 },
      { id: "zebra",     img: "./2_ASSETS_UI_BOTOES/arca_bicho_06_zebra_v142.png?v=142",     audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_06_zebra_v142.mp3?v=142",     durMs: 1570 },
      { id: "pomba",     img: "./2_ASSETS_UI_BOTOES/arca_bicho_11_pomba_v142.png?v=142",     audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_11_pomba_v142.mp3?v=142",     durMs: 1530 },
      { id: "camelo",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_10_camelo_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_10_camelo_v142.mp3?v=142",    durMs: 1620 },
      { id: "urso",      img: "./2_ASSETS_UI_BOTOES/arca_bicho_09_urso_v142.png?v=142",      audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_09_urso_v142.mp3?v=142",      durMs: 1670 },
      { id: "tucano",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_14_tucano_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_14_tucano_v142.mp3?v=142",    durMs: 1500 },
      { id: "cervo",     img: "./2_ASSETS_UI_BOTOES/arca_bicho_13_cervo_v142.png?v=142",     audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_13_cervo_v142.mp3?v=142",     durMs: 1450 },
      { id: "canguru",   img: "./2_ASSETS_UI_BOTOES/arca_bicho_12_canguru_v142.png?v=142",   audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_12_canguru_v142.mp3?v=142",   durMs: 1540 },
      { id: "coruja",    img: "./2_ASSETS_UI_BOTOES/arca_bicho_15_coruja_v142.png?v=142",    audio: "./6_ASSETS_AUDIO/arca_bichos/bicho_15_coruja_v142.mp3?v=142",    durMs: 1960 }
    ];

    // Padrões simétricos e harmônicos das 15 janelinhas (grade 5 colunas x 3 fileiras: índices 0..14)
    const WINDOW_SLOT_PATTERNS = {
      1:  [7],
      2:  [6, 8],
      3:  [1, 7, 13],
      4:  [1, 3, 11, 13],
      5:  [1, 3, 7, 11, 13],
      6:  [1, 3, 5, 9, 11, 13],
      7:  [1, 3, 5, 7, 9, 11, 13],
      8:  [0, 2, 4, 6, 8, 10, 12, 14],
      9:  [1, 2, 3, 6, 7, 8, 11, 12, 13],
      10: [0, 1, 3, 4, 5, 6, 8, 9, 11, 13],
      11: [0, 1, 2, 3, 4, 6, 7, 8, 11, 12, 13],
      12: [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13],
      13: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13],
      14: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14],
      15: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    };

    function shuffleCopy(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a;
    }

    // Na Fase N entram exatamente N animais (1 na Fase 1 ... 15 na Fase 15!)
    const phaseAnimals = ARCA_ANIMALS_DB.slice(0, pNum);
    const activeWindowIndices = WINDOW_SLOT_PATTERNS[pNum] || WINDOW_SLOT_PATTERNS[15];
    const windowOrderAnimals = shuffleCopy(phaseAnimals);

    // Embaralha a ordem no gramado garantindo que com 2+ animais não fique igual à ordem das janelas
    let grassAnimals = shuffleCopy(phaseAnimals);
    if (pNum >= 2) {
      let guard = 0;
      while (guard < 6 && grassAnimals.every((a, idx) => a.id === windowOrderAnimals[idx].id)) {
        grassAnimals = shuffleCopy(phaseAnimals);
        guard++;
      }
      if (grassAnimals.every((a, idx) => a.id === windowOrderAnimals[idx].id)) {
        const first = grassAnimals.shift();
        grassAnimals.push(first);
      }
    }

    // Pré-carrega áudios dos animais desta fase para disparo instantâneo no encaixe
    const audioCache = {};
    phaseAnimals.forEach(anim => {
      try {
        const a = new Audio(anim.audio);
        a.preload = "auto";
        audioCache[anim.id] = a;
      } catch (e) {}
    });

    const OPEN_WIN_SRC = "./2_ASSETS_UI_BOTOES/janela_arca_aberta_v142.png?v=142";
    const CLOSED_WIN_SRC = "./2_ASSETS_UI_BOTOES/janela_arca_fechada_v142.png?v=142";
    const BG_ARCA_SRC = "./2_ASSETS_UI_BOTOES/fundo_arca_noe_3d_v142.jpg?v=142";

    container.innerHTML = `
      <style id="arca-noe-v142-styles">
        @keyframes arcaAnimalIdle {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -53%) scale(1.03) rotate(1.5deg); }
        }
        @keyframes arcaWindowPopIn {
          0% { transform: translate(-50%, -44%) scale(0.45); opacity: 0.4; }
          65% { transform: translate(-50%, -48%) scale(1.18); opacity: 1; }
          100% { transform: translate(-50%, -46%) scale(1); opacity: 1; }
        }
        @keyframes arcaWindowWrongShake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) translateX(-5px) rotate(-4deg); }
          75% { transform: translate(-50%, -50%) translateX(5px) rotate(4deg); }
        }
        @keyframes arcaStarBurst {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
          100% { transform: translate(-50%, -95%) scale(1.35); opacity: 0; }
        }
        .arca-win-slot {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          transition: transform 0.16s ease, filter 0.16s ease;
        }
        .arca-win-slot.hover-target {
          transform: translate(-50%, -50%) scale(1.10);
          filter: drop-shadow(0 0 10px #fde047);
        }
        .arca-win-slot.wrong-shake {
          animation: arcaWindowWrongShake 0.32s ease;
        }
        .arca-grass-piece {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: grab;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          z-index: 30;
          filter: drop-shadow(0 5px 7px rgba(0, 0, 0, 0.42));
          animation: arcaAnimalIdle 2.6s ease-in-out infinite;
          will-change: left, top, transform;
        }
        .arca-grass-piece.returning {
          transition: left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.22s ease;
        }
        .arca-grass-piece.dragging {
          animation: none !important;
          transition: none !important;
          z-index: 95 !important;
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.24) !important;
          filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.52)) drop-shadow(0 0 10px rgba(253, 224, 71, 0.85)) !important;
        }
      </style>
      <div id="arca-noe-arena" style="position:relative; width:100%; height:100%; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; background:#14532d;">
        <img src="${BG_ARCA_SRC}" alt="" draggable="false" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center center; pointer-events:none; z-index:1;">
        <div id="arca-windows-layer" style="position:absolute; inset:0; z-index:10; pointer-events:none;"></div>
        <div id="arca-pieces-layer" style="position:absolute; inset:0; z-index:25; pointer-events:auto;"></div>
      </div>
    `;

    const arena = document.getElementById("arca-noe-arena");
    const winLayer = document.getElementById("arca-windows-layer");
    const piecesLayer = document.getElementById("arca-pieces-layer");
    if (!arena || !winLayer || !piecesLayer) return;

    // Estado do jogo (100% travado enquanto o Vovô explica, sem pílula de texto na tela!)
    let isArcaUnlocked = false;
    let isPhaseDone = false;
    let placedCount = 0;

    // Monta as 15 janelinhas da Arca (N abertas com silhueta + (15-N) fechadas com tramelinha)
    const activeMap = {};
    activeWindowIndices.forEach((slotIdx, k) => {
      activeMap[slotIdx] = windowOrderAnimals[k];
    });

    const windowSlots = [];
    for (let i = 0; i < 15; i++) {
      const assignedAnimal = activeMap[i] || null;
      const slotEl = document.createElement("div");
      slotEl.className = "arca-win-slot";

      const frameImg = document.createElement("img");
      frameImg.src = assignedAnimal ? OPEN_WIN_SRC : CLOSED_WIN_SRC;
      frameImg.alt = "";
      frameImg.draggable = false;
      frameImg.style.cssText = "width:100%; height:100%; object-fit:contain; display:block; pointer-events:none; filter:drop-shadow(0 3px 5px rgba(0,0,0,0.35));";
      slotEl.appendChild(frameImg);

      let innerAnimalImg = null;
      if (assignedAnimal) {
        innerAnimalImg = document.createElement("img");
        innerAnimalImg.src = assignedAnimal.img;
        innerAnimalImg.alt = "";
        innerAnimalImg.draggable = false;
        // Silhueta escura super nítida sobre o interior iluminado da janelinha da Arca
        innerAnimalImg.style.cssText = "position:absolute; left:50%; top:50%; transform:translate(-50%, -46%); width:60%; height:64%; object-fit:contain; pointer-events:none; filter:brightness(0) opacity(0.88);";
        slotEl.appendChild(innerAnimalImg);
      }

      winLayer.appendChild(slotEl);
      windowSlots.push({
        index: i,
        row: Math.floor(i / 5),
        col: i % 5,
        isOpen: !!assignedAnimal,
        animalId: assignedAnimal ? assignedAnimal.id : null,
        animalObj: assignedAnimal,
        filled: false,
        el: slotEl,
        innerImg: innerAnimalImg,
        cx: 0,
        cy: 0
      });
    }

    // Monta os N bichinhos 3D soltos sobre o gramado verde embaixo (sem blocos ou caixas!)
    const pieceItems = grassAnimals.map((anim, idx) => {
      const el = document.createElement("div");
      el.className = "arca-grass-piece";
      el.style.animationDelay = `${(idx % 5) * 0.28}s`;

      const img = document.createElement("img");
      img.src = anim.img;
      img.alt = "";
      img.draggable = false;
      img.style.cssText = "width:100%; height:100%; object-fit:contain; display:block; pointer-events:none;";
      el.appendChild(img);

      piecesLayer.appendChild(el);
      return {
        id: anim.id,
        animObj: anim,
        el: el,
        placed: false,
        homeX: 0,
        homeY: 0,
        curX: 0,
        curY: 0,
        size: 64
      };
    });

    let currentHitRadius = 44;

    // Geometria responsiva exata: alinha as 15 janelas dentro do casco de madeira da Arca
    // e acomoda de 1 até 15 bichinhos soltos no gramado sem sobreposição em qualquer celular!
    function layoutArcaStage() {
      const rect = arena.getBoundingClientRect();
      const W = rect.width || window.innerWidth || 360;
      const H = rect.height || (window.innerHeight - 60) || 580;

      // Calcula retângulo real da imagem 750x1334 com object-fit: cover
      const BG_W = 750;
      const BG_H = 1334;
      const covScale = Math.max(W / BG_W, H / BG_H);
      const dispW = BG_W * covScale;
      const dispH = BG_H * covScale;
      const imgOx = (W - dispW) * 0.5;
      const imgOy = (H - dispH) * 0.5;

      // Parede de tábuas da Arca fica entre u=[0.11..0.89] e v=[0.275..0.645] da arte 3D
      const maxStageW = Math.min(W - 14, H * 0.66);
      const stageLeftLimit = (W - maxStageW) * 0.5;
      const stageRightLimit = W - stageLeftLimit;

      const wallLeft = Math.max(stageLeftLimit + 8, imgOx + dispW * 0.115);
      const wallRight = Math.min(stageRightLimit - 8, imgOx + dispW * 0.885);
      const wallSpanW = Math.max(220, wallRight - wallLeft);

      const rawWallTop = imgOy + dispH * 0.272;
      const rawWallBot = imgOy + dispH * 0.648;
      const wallTop = Math.max(H * 0.20, Math.min(H * 0.30, rawWallTop));
      const wallBot = Math.max(wallTop + 150, Math.min(H * 0.655, rawWallBot));
      const wallSpanH = wallBot - wallTop;

      const colStep = wallSpanW / 5;
      const rowStep = wallSpanH / 3;
      const winH = Math.max(44, Math.min(78, rowStep * 0.90, colStep * 1.12));
      const openW = winH * (176 / 168);
      const closedW = winH * (157 / 168);
      currentHitRadius = Math.max(38, winH * 0.66);

      windowSlots.forEach(slot => {
        const cx = wallLeft + (slot.col + 0.5) * colStep;
        const cy = wallTop + (slot.row + 0.5) * rowStep;
        slot.cx = cx;
        slot.cy = cy;
        const wPx = slot.isOpen ? openW : closedW;
        slot.el.style.width = `${wPx.toFixed(1)}px`;
        slot.el.style.height = `${winH.toFixed(1)}px`;
        slot.el.style.left = `${cx.toFixed(1)}px`;
        slot.el.style.top = `${cy.toFixed(1)}px`;
      });

      // Zona do gramado embaixo: de wallBot + 10px até H - 8px
      const grassTop = Math.max(wallBot + 10, Math.min(H * 0.685, imgOy + dispH * 0.69));
      const grassBot = H - 8;
      const grassH = Math.max(110, grassBot - grassTop);
      const grassLeft = Math.max(stageLeftLimit + 6, W * 0.05);
      const grassRight = Math.min(stageRightLimit - 6, W * 0.95);
      const grassW = Math.max(240, grassRight - grassLeft);

      const n = pieceItems.length;
      let gRows = 1;
      if (n >= 11) gRows = 3;
      else if (n >= 4) gRows = 2;

      const baseMaxCols = Math.ceil(n / gRows);
      const cellW = grassW / Math.max(1, baseMaxCols);
      const cellH = grassH / gRows;

      let targetSize;
      if (n === 1) targetSize = Math.min(96, grassH * 0.72, grassW * 0.34);
      else if (n <= 3) targetSize = Math.min(84, cellW * 0.80, grassH * 0.68);
      else if (n <= 6) targetSize = Math.min(72, cellW * 0.82, cellH * 0.88);
      else if (n <= 10) targetSize = Math.min(62, cellW * 0.88, cellH * 0.88);
      else targetSize = Math.min(56, cellW * 0.90, cellH * 0.92);
      targetSize = Math.max(42, targetSize);

      let idx = 0;
      for (let r = 0; r < gRows; r++) {
        const remaining = n - idx;
        const rowsLeft = gRows - r;
        const colsInRow = Math.ceil(remaining / rowsLeft);
        const rowSpanW = Math.min(grassW, colsInRow * Math.max(targetSize * 1.12, grassW / Math.max(colsInRow, baseMaxCols)));
        const rowStartX = (W - rowSpanW) * 0.5;
        const stepX = rowSpanW / colsInRow;
        const cy = grassTop + (r + 0.5) * (grassH / gRows);

        for (let c = 0; c < colsInRow && idx < n; c++) {
          const item = pieceItems[idx++];
          item.size = targetSize;
          item.homeX = rowStartX + (c + 0.5) * stepX;
          item.homeY = cy;
          item.el.style.width = `${targetSize.toFixed(1)}px`;
          item.el.style.height = `${targetSize.toFixed(1)}px`;
          if (!item.placed && activeDragItem !== item) {
            item.curX = item.homeX;
            item.curY = item.homeY;
            item.el.style.left = `${item.homeX.toFixed(1)}px`;
            item.el.style.top = `${item.homeY.toFixed(1)}px`;
          }
        }
      }
    }

    function playArcaAnimalVoice(animObj) {
      if (window._arcadeAudioMuted || !animObj) return;
      try {
        if (window._arcaBichoPlayer) {
          try { window._arcaBichoPlayer.pause(); } catch (e) {}
        }
        const player = audioCache[animObj.id] || new Audio(animObj.audio);
        window._arcaBichoPlayer = player;
        player.muted = false;
        player.volume = 1.0;
        try { player.currentTime = 0; } catch (e) {}
        TronoAudio.attachVoicePresenceBoost(player);
        const p = player.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (e) {}
    }

    function spawnWindowSparkle(cx, cy) {
      const sp = document.createElement("div");
      sp.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 2px 6px rgba(250,204,21,0.8));"><path d="M12 2L14.8 8.5L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.5L12 2Z" fill="#fde047" stroke="#f59e0b" stroke-width="1.5"/></svg>`;
      sp.style.cssText = `position:absolute; left:${cx.toFixed(1)}px; top:${cy.toFixed(1)}px; pointer-events:none; z-index:90; animation: arcaStarBurst 0.65s ease-out forwards;`;
      winLayer.appendChild(sp);
      setTimeout(() => { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
    }

    let activeDragItem = null;
    let activePointerId = null;
    let dragLiftY = 0;
    let hoveredSlot = null;

    function clearHoveredSlot() {
      if (hoveredSlot) {
        hoveredSlot.el.classList.remove("hover-target");
        hoveredSlot = null;
      }
    }

    function findNearestOpenSlot(vx, vy) {
      let best = null;
      let bestDist = currentHitRadius;
      for (let i = 0; i < windowSlots.length; i++) {
        const s = windowSlots[i];
        if (!s.isOpen || s.filled) continue;
        const d = Math.hypot(vx - s.cx, vy - s.cy);
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
      return best;
    }

    function getArenaCoords(clientX, clientY) {
      const rect = arena.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        W: rect.width || 360,
        H: rect.height || 580
      };
    }

    function startDragPiece(item, clientX, clientY, isTouch, pointerId) {
      if (!isArcaUnlocked || isPhaseDone || item.placed) return;
      TronoAudio.unlockGestureAudio();
      TronoAudio.play("click");

      activeDragItem = item;
      activePointerId = pointerId;
      dragLiftY = isTouch ? 26 : 0;

      item.el.classList.remove("returning");
      item.el.classList.add("dragging");

      const pt = getArenaCoords(clientX, clientY);
      const nx = Math.max(20, Math.min(pt.W - 20, pt.x));
      const ny = Math.max(24, Math.min(pt.H - 20, pt.y - dragLiftY));
      item.curX = nx;
      item.curY = ny;
      item.el.style.left = `${nx.toFixed(1)}px`;
      item.el.style.top = `${ny.toFixed(1)}px`;
    }

    function moveDragPiece(clientX, clientY) {
      if (!activeDragItem || !isArcaUnlocked || isPhaseDone) return;
      const pt = getArenaCoords(clientX, clientY);
      const nx = Math.max(18, Math.min(pt.W - 18, pt.x));
      const ny = Math.max(20, Math.min(pt.H - 18, pt.y - dragLiftY));
      activeDragItem.curX = nx;
      activeDragItem.curY = ny;
      activeDragItem.el.style.left = `${nx.toFixed(1)}px`;
      activeDragItem.el.style.top = `${ny.toFixed(1)}px`;

      const near = findNearestOpenSlot(nx, ny);
      if (near !== hoveredSlot) {
        clearHoveredSlot();
        if (near) {
          hoveredSlot = near;
          hoveredSlot.el.classList.add("hover-target");
        }
      }
    }

    function finishDragPiece() {
      if (!activeDragItem) return;
      const item = activeDragItem;
      activeDragItem = null;
      activePointerId = null;
      clearHoveredSlot();

      item.el.classList.remove("dragging");

      const targetSlot = findNearestOpenSlot(item.curX, item.curY);
      if (targetSlot && targetSlot.animalId === item.id) {
        // ENCAIXE PERFEITO NA SILHUETA DA JANELINHA DA ARCA!
        targetSlot.filled = true;
        item.placed = true;
        item.el.style.opacity = "0";
        item.el.style.pointerEvents = "none";

        if (targetSlot.innerImg) {
          targetSlot.innerImg.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.38))";
          targetSlot.innerImg.style.width = "64%";
          targetSlot.innerImg.style.height = "68%";
          targetSlot.innerImg.style.animation = "arcaWindowPopIn 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
        }
        spawnWindowSparkle(targetSlot.cx, targetSlot.cy);
        TronoAudio.play("star");
        playArcaAnimalVoice(item.animObj);

        placedCount++;
        if (placedCount >= phaseAnimals.length) {
          isPhaseDone = true;
          // Espera o Vovô terminar de falar o nome do último bichinho antes de abrir a tela de vitória!
          const waitMs = (item.animObj && item.animObj.durMs ? item.animObj.durMs : 1550) + 320;
          window._arcaWinTimer = setTimeout(() => {
            triggerArcadeVictory();
          }, waitMs);
        }
      } else {
        // Janelinha errada ou soltou fora: desliza suavemente de volta para o gramado
        if (targetSlot) {
          TronoAudio.play("error");
          targetSlot.el.classList.remove("wrong-shake");
          void targetSlot.el.offsetWidth;
          targetSlot.el.classList.add("wrong-shake");
        }
        item.el.classList.add("returning");
        item.curX = item.homeX;
        item.curY = item.homeY;
        item.el.style.left = `${item.homeX.toFixed(1)}px`;
        item.el.style.top = `${item.homeY.toFixed(1)}px`;
      }
    }

    pieceItems.forEach(item => {
      item.el.addEventListener("pointerdown", (e) => {
        if (!isArcaUnlocked || isPhaseDone || item.placed || activeDragItem) return;
        e.preventDefault();
        e.stopPropagation();
        try { item.el.setPointerCapture(e.pointerId); } catch (err) {}
        startDragPiece(item, e.clientX, e.clientY, e.pointerType === "touch", e.pointerId);
      });
    });

    arena.addEventListener("pointermove", (e) => {
      if (!activeDragItem) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      e.preventDefault();
      moveDragPiece(e.clientX, e.clientY);
    });

    const onPointerEnd = (e) => {
      if (!activeDragItem) return;
      if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
      finishDragPiece();
    };
    arena.addEventListener("pointerup", onPointerEnd);
    arena.addEventListener("pointercancel", onPointerEnd);

    layoutArcaStage();
    setTimeout(layoutArcaStage, 60);
    window._arcaResizeHandler = () => layoutArcaStage();
    window.addEventListener("resize", window._arcaResizeHandler);

    // Libera o toque somente após o Vovô concluir a explicação inicial!
    window._arcadeUnlockGameAction = function() {
      isArcaUnlocked = true;
    };
  }

  // --- JOGO 9: QUIZ DA BÍBLIA / QUIZ DO VOVÔ (15 FASES VISUAIS COM OBJETOS/ANIMAIS 3D LIMPOS + VOZ DO VOVÔ • ZERO EMOJIS) ---
  const QUIZ_VISUAL_15_PHASES = [
    {
      q: "O QUE DEUS PEDIU PARA NOÉ CONSTRUIR PARA SALVAR OS ANIMAIS?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q01.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f01_opt1_arca.jpg?v=154", label: "ARCA DE MADEIRA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f01_opt2_tenda.jpg?v=154", label: "TENDA NO DESERTO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f01_opt3_carroca.jpg?v=154", label: "CARROÇA DE MADEIRA", ok: false }
      ]
    },
    {
      q: "DEUS PROMETEU A ABRAÃO QUE A SUA DESCENDÊNCIA SERIA TÃO NUMEROSA COMO AS ESTRELAS DO CÉU, COMO OS PEIXES DO MAR OU COMO AS ÁRVORES DAS FLORESTAS?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q02.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f02_opt1_estrelas.jpg?v=154", label: "ESTRELAS DO CÉU", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f02_opt2_peixes.jpg?v=154", label: "PEIXES DO MAR", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f02_opt3_arvores.jpg?v=154", label: "ÁRVORES DAS FLORESTAS", ok: false }
      ]
    },
    {
      q: "QUAL PRESENTE ESPECIAL JACÓ DEU PARA SEU FILHO JOSÉ?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q03.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f03_opt1_tunica.jpg?v=154", label: "TÚNICA COLORIDA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f03_opt2_coroa.jpg?v=154", label: "COROA DE OURO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f03_opt3_armadura.jpg?v=154", label: "ARMADURA DE SOLDADO", ok: false }
      ]
    },
    {
      q: "ONDE A MAMÃE DE MOISÉS COLOCOU O BEBÊ LÁ NO RIO PARA PROTEGÊ-LO?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q04.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f04_opt1_cestinho.jpg?v=154", label: "CESTINHO DE PALHA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f04_opt2_caverna.jpg?v=154", label: "CAVERNA", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f04_opt3_casinha.jpg?v=154", label: "CASINHA", ok: false }
      ]
    },
    {
      q: "O QUE MOISÉS LEVANTOU NA MÃO PARA ABRIR O MAR VERMELHO?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q05.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f05_opt1_cajado.jpg?v=154", label: "CAJADO", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f05_opt2_vassoura.jpg?v=154", label: "VASSOURA", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f05_opt3_guardasol.jpg?v=154", label: "GUARDA-SOL", ok: false }
      ]
    },
    {
      q: "O QUE OS SACERDOTES TOCARAM PARA DERRUBAR AS MURALHAS DE JERICÓ?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q06.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f06_opt1_trombetas.jpg?v=154", label: "TROMBETAS", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f06_opt2_violao.jpg?v=154", label: "VIOLÃO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f06_opt3_piano.jpg?v=154", label: "PIANO", ok: false }
      ]
    },
    {
      q: "O QUE DAVI USOU NA SUA FUNDA PARA DERRUBAR O GIGANTE GOLIAS?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q07.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f07_opt1_pedrinhas.jpg?v=154", label: "PEDRINHAS LISAS", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f07_opt2_diamantes.jpg?v=154", label: "DIAMANTES", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f07_opt3_bolinhas_gude.jpg?v=154", label: "BOLINHAS DE GUDE", ok: false }
      ]
    },
    {
      q: "DEUS PROTEGEU DANIEL FECHANDO A BOCA DE QUAIS ANIMAIS LÁ NA COVA?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q08.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f08_opt1_leoes.jpg?v=154", label: "LEÕES", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f08_opt2_ursos.jpg?v=154", label: "URSOS", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f08_opt3_jacares.jpg?v=154", label: "JACARÉS", ok: false }
      ]
    },
    {
      q: "QUAL ANIMAL DO MAR ENGOLIU O PROFETA JONAS?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q09.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f09_opt1_grande_peixe.jpg?v=154", label: "GRANDE PEIXE", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f09_opt2_polvo.jpg?v=154", label: "POLVO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f09_opt3_tartaruga.jpg?v=154", label: "TARTARUGA", ok: false }
      ]
    },
    {
      q: "ONDE MARIA DEITOU O MENINO JESUS QUANDO ELE NASCEU EM BELÉM?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q10.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f10_opt1_manjedoura.jpg?v=154", label: "MANJEDOURA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f10_opt2_berco.jpg?v=154", label: "BERÇO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f10_opt3_rede.jpg?v=154", label: "REDE", ok: false }
      ]
    },
    {
      q: "QUANDO JESUS FOI BATIZADO NO RIO JORDÃO, O ESPÍRITO SANTO DESCEU DO CÉU PARECIDO COM QUAL AVE?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q11.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f11_opt1_pomba.jpg?v=154", label: "POMBA BRANCA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f11_opt2_aguia.jpg?v=154", label: "ÁGUIA", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f11_opt3_papagaio.jpg?v=154", label: "PAPAGAIO", ok: false }
      ]
    },
    {
      q: "O QUE O MENINO ENTREGOU PARA JESUS MULTIPLICAR E ALIMENTAR A MULTIDÃO?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q12.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f12_opt1_paes_peixinhos.jpg?v=154", label: "CINCO PÃES E DOIS PEIXINHOS", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f12_opt2_bolo_salgadinhos.jpg?v=154", label: "BOLO E SALGADINHOS", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f12_opt3_bananas_uvas.jpg?v=154", label: "BANANAS E UVAS", ok: false }
      ]
    },
    {
      q: "QUAL ANIMALZINHO SE PERDEU E O BOM PASTOR FOI PROCURAR NA HISTÓRIA DE JESUS?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q13.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f13_opt1_ovelhinha.jpg?v=154", label: "OVELHINHA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f13_opt2_gatinho.jpg?v=154", label: "GATINHO", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f13_opt3_coelhinho.jpg?v=154", label: "COELHINHO", ok: false }
      ]
    },
    {
      q: "EM QUAL ANIMAL MANSINHO JESUS MONTOU PARA ENTRAR NA CIDADE DE JERUSALÉM?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q14.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f14_opt1_jumentinho.jpg?v=154", label: "JUMENTINHO", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f14_opt2_elefante.jpg?v=154", label: "ELEFANTE", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f14_opt3_girafa.jpg?v=154", label: "GIRAFA", ok: false }
      ]
    },
    {
      q: "O QUE JESUS CARREGOU POR AMOR A TODOS NÓS ANTES DE RESSUSCITAR AO TERCEIRO DIA?",
      audio: "./6_ASSETS_AUDIO/quiz_vovo/quiz_vovo_q15.mp3?v=154",
      opts: [
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f15_opt1_cruz.jpg?v=154", label: "CRUZ DE MADEIRA", ok: true },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f15_opt2_escada.jpg?v=154", label: "ESCADA DE MADEIRA", ok: false },
        { img: "./3_ASSETS_QUIZ_ARCADE/quiz_f15_opt3_cadeira.jpg?v=154", label: "CADEIRA DE MADEIRA", ok: false }
      ]
    }
  ];

  function runQuizVisual(container, phase) {
    const pIdx = Math.max(0, Math.min(QUIZ_VISUAL_15_PHASES.length - 1, (Number(phase) || 1) - 1));
    const qData = QUIZ_VISUAL_15_PHASES[pIdx];
    const shuffled = qData.opts.map(o => Object.assign({}, o)).sort(() => Math.random() - 0.5);
    const qFontSize = qData.q.length > 95 ? "14.5px" : (qData.q.length > 72 ? "15.5px" : "16.5px");
    let answered = false;

    container.innerHTML = `
      <style>
        @keyframes quizMagicFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .quiz-vis-question-btn {
          position: relative;
          width: 100%;
          max-width: 362px;
          background: linear-gradient(180deg, rgba(147, 51, 234, 0.78) 0%, rgba(88, 28, 135, 0.88) 100%);
          border: none;
          border-radius: 20px;
          padding: 13px 16px;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-sizing: border-box;
          cursor: pointer;
          display: block;
          text-align: center;
          transition: transform 0.14s ease, box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .quiz-vis-question-btn:active {
          transform: scale(0.97);
        }
        .quiz-vis-question-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 3.5px;
          background: linear-gradient(125deg, #38bdf8, #a855f7, #facc15, #34d399, #ec4899, #38bdf8);
          background-size: 250% 250%;
          animation: quizMagicFlow 4s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 3;
        }
        .quiz-vis-opt-card {
          position: relative;
          width: min(64vw, 228px);
          aspect-ratio: 16 / 9;
          padding: 3.5px;
          border: none;
          border-radius: 17px;
          background: linear-gradient(125deg, #38bdf8, #a855f7, #facc15, #34d399, #ec4899, #38bdf8);
          background-size: 250% 250%;
          animation: quizMagicFlow 4s ease infinite;
          box-shadow: 0 7px 18px rgba(0, 0, 0, 0.72);
          overflow: hidden;
          cursor: pointer;
          display: block;
          box-sizing: border-box;
          transition: transform 0.14s ease, box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .quiz-vis-opt-card:active {
          transform: scale(0.97);
        }
        .quiz-vis-opt-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 13.5px;
          pointer-events: none;
        }
        .quiz-vis-opt-card.quiz-opt-correct {
          animation: none !important;
          background: #00e676 !important;
          box-shadow: 0 0 24px rgba(0, 230, 118, 0.95), 0 8px 20px rgba(0, 0, 0, 0.82) !important;
          transform: scale(1.05) !important;
        }
        .quiz-vis-opt-card.quiz-opt-wrong {
          animation: none !important;
          background: #ef4444 !important;
          box-shadow: 0 0 18px rgba(239, 68, 68, 0.92), 0 6px 16px rgba(0, 0, 0, 0.78) !important;
          transform: translateX(-6px);
        }
      </style>
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; background:linear-gradient(180deg, rgba(10,18,42,0.18) 0%, rgba(10,18,42,0.34) 100%), url('./3_ASSETS_QUIZ_ARCADE/quiz_bg_monte_sinai_v154.jpg?v=154') center/cover no-repeat; padding:66px 14px 14px 14px; box-sizing:border-box;">
        <button type="button" id="quiz-vis-question-card" class="quiz-vis-question-btn" onclick="window._quizReplayVovo()" title="Toque para ouvir a pergunta novamente" aria-label="Toque para ouvir a pergunta novamente">
          <span style="display:block; font-family:'Fredoka',sans-serif; color:#ffffff; font-size:${qFontSize}; font-weight:800; line-height:1.23; text-align:center; text-shadow:0 2px 5px rgba(0,0,0,0.92); pointer-events:none;">
            ${qData.q}
          </span>
        </button>

        <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:10px;">
          ${shuffled.map((opt, idx) => `
            <button type="button" id="quiz-vis-opt-${idx}" class="quiz-vis-opt-card" onclick="window._quizVisualTap(${idx})" aria-label="Alternativa ${idx + 1}">
              <img src="${opt.img}" alt="" decoding="async">
            </button>
          `).join("")}
        </div>
      </div>
    `;

    window._quizReplayVovo = function() {
      if (answered) return;
      const qBtn = document.getElementById("quiz-vis-question-card");
      if (qBtn) {
        qBtn.style.transform = "scale(0.96)";
        setTimeout(() => { if (qBtn) qBtn.style.transform = ""; }, 150);
      }
      TronoAudio.unlockGestureAudio();
      TronoAudio.falarVovo(qData.audio);
    };

    window._quizVisualTap = function(idx) {
      if (answered) return;
      const chosen = shuffled[idx];
      const btn = document.getElementById(`quiz-vis-opt-${idx}`);
      if (!chosen || !btn) return;

      if (chosen.ok) {
        answered = true;
        TronoAudio.falarVovo(null);
        btn.classList.remove("quiz-opt-wrong");
        btn.classList.add("quiz-opt-correct");
        TronoAudio.play("success");
        setTimeout(triggerArcadeVictory, 650);
      } else {
        btn.classList.add("quiz-opt-wrong");
        setTimeout(() => {
          if (!answered && btn) {
            btn.classList.remove("quiz-opt-wrong");
          }
        }, 420);
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

  // --- JOGO 12: ORDEM CRONOLÓGICA DA BÍBLIA (22 FASES = 22 LIÇÕES • LINHA DO TEMPO TRACEJADA 1º ➔ 2º ➔ 3º ➔ 4º + LEGENDAS NAS FIGURINHAS!) ---
  function cleanChronoCaptionText(raw) {
    return String(raw || "")
      .replace(/\s*\(Dias?\s*[^)]*\)/gi, "")
      .trim();
  }

  function runCriacaoOrdem(container, phase) {
    cleanupChronoDragArtifacts();

    const bank = (Array.isArray(window.CHRONOLOGY_LEVELS) && window.CHRONOLOGY_LEVELS.length > 0)
      ? window.CHRONOLOGY_LEVELS
      : [
          {
            level: 1, lessonWeek: 1,
            cards: [
              { id: "c1", order: 1, title: "Haja Luz e Céu Iluminado!", img: "./3_ASSETS_QUEBRA_CABECA/crono_16x9_102.jpg?v=78" },
              { id: "c2", order: 2, title: "Terra Seca, Árvores e Flores", img: "./3_ASSETS_QUEBRA_CABECA/crono_16x9_103.jpg?v=78" },
              { id: "c3", order: 3, title: "Grandes Baleias no Mar e Aves", img: "./3_ASSETS_QUEBRA_CABECA/crono_16x9_101.jpg?v=78" },
              { id: "c4", order: 4, title: "Animais Terrestres, Adão e Eva", img: "./3_ASSETS_QUEBRA_CABECA/crono_16x9_29.jpg?v=78" }
            ]
          }
        ];

    const idx = Math.max(0, ((Math.floor(Number(phase) || 1) - 1) % bank.length));
    const levelObj = bank[idx] || bank[0];
    const shuffled = [...levelObj.cards].sort(() => Math.random() - 0.5);
    if (shuffled.length === 4 && shuffled.every((c, i) => Number(c.order) === i + 1)) {
      const tmp = shuffled[0];
      shuffled[0] = shuffled[2];
      shuffled[2] = tmp;
    }

    container.innerHTML = `
      <style id="chrono-arcade-v160-styles">
        @keyframes chronoBorderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes chronoSlotPop {
          0% { transform: scale(0.86); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes chronoSlotShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .chrono-stage-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 48px 8px clamp(12px, 2.5vh, 22px) 8px;
          box-sizing: border-box;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .chrono-top-slots-row {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 590px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          gap: clamp(2px, 0.8vw, 6px);
          align-items: center;
        }
        .chrono-timeline-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fde047;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85));
          pointer-events: none;
        }
        .chrono-white-slot {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          border-radius: 13px;
          background: linear-gradient(180deg, rgba(88, 28, 135, 0.84) 0%, rgba(46, 16, 101, 0.90) 100%);
          border: 2.5px dashed #fde047;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.52), inset 0 1px 4px rgba(255, 255, 255, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-sizing: border-box;
        }
        .chrono-white-slot-num {
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(20px, 5.2vw, 30px);
          font-weight: 900;
          color: #fde047;
          line-height: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
          pointer-events: none;
        }
        .chrono-white-slot.drag-hover {
          transform: scale(1.08);
          border: 2.5px solid #38bdf8 !important;
          background: rgba(14, 116, 144, 0.88) !important;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.95), 0 8px 18px rgba(0, 0, 0, 0.55) !important;
        }
        .chrono-white-slot.slot-filled {
          border: 2.5px solid #00e676 !important;
          background: #052e16 !important;
          box-shadow: 0 0 18px rgba(0, 230, 118, 0.9), 0 6px 16px rgba(0, 0, 0, 0.65) !important;
          animation: chronoSlotPop 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .chrono-white-slot.slot-wrong {
          border: 2.5px solid #ef4444 !important;
          background: rgba(127, 29, 29, 0.90) !important;
          animation: chronoSlotShake 0.32s ease;
        }
        .chrono-bottom-cards-grid {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 560px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(8px, 2.2vw, 14px);
        }
        .chrono-drag-source {
          position: relative;
          width: 100%;
          border-radius: 16px;
          padding: 3.5px;
          background: linear-gradient(125deg, #38bdf8, #a855f7, #fde047, #34d399, #ec4899, #38bdf8);
          background-size: 260% 260%;
          animation: chronoBorderFlow 4s ease infinite;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.72);
          cursor: grab;
          touch-action: none;
          box-sizing: border-box;
          transition: opacity 0.2s ease, transform 0.15s ease;
          display: flex;
          flex-direction: column;
        }
        .chrono-drag-source-inner {
          width: 100%;
          border-radius: 12.5px;
          overflow: hidden;
          background: linear-gradient(180deg, #4c1d95 0%, #2e1065 100%);
          display: flex;
          flex-direction: column;
          pointer-events: none;
        }
        .chrono-drag-source-photo {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        .chrono-drag-source-caption {
          min-height: 32px;
          padding: 4px 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(10.5px, 2.7vw, 12.5px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.14;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          border-top: 1.5px solid rgba(253, 224, 71, 0.45);
          pointer-events: none;
        }
        .chrono-drag-source.placed-done {
          opacity: 0.14 !important;
          pointer-events: none !important;
          filter: grayscale(40%);
        }
      </style>

      <div class="chrono-stage-root" id="chrono-stage-arena">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_12_cronologia_v159.jpg?v=159" alt="" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center center; pointer-events:none; z-index:0;">

        <!-- 4 MOLDURAS TRACEJADAS EM LINHA DO TEMPO COM SETINHAS (1º ➔ 2º ➔ 3º ➔ 4º) -->
        <div class="chrono-top-slots-row" id="chrono-top-slots-row">
          ${[1, 2, 3, 4].map((num, idxSlot) => `
            <div class="chrono-white-slot" id="chrono-drop-slot-${num}" data-slot-num="${num}">
              <span class="chrono-white-slot-num">${num}º</span>
            </div>
            ${idxSlot < 3 ? `
              <div class="chrono-timeline-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#fde047" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            ` : ""}
          `).join("")}
        </div>

        <!-- 4 FIGURINHAS EMBARALHADAS EMBAIXO (2×2 COM LEGENDA CURTINHA NA BASE) -->
        <div class="chrono-bottom-cards-grid" id="chrono-bottom-cards-grid">
          ${shuffled.map((card, i) => {
            const cap = cleanChronoCaptionText(card.title || "");
            const safeCapAttr = cap.replace(/"/g, "&quot;");
            return `
              <div class="chrono-drag-source" id="chrono-src-card-${i}" data-card-order="${card.order}" data-card-img="${card.img}" data-card-cap="${safeCapAttr}">
                <div class="chrono-drag-source-inner">
                  <img class="chrono-drag-source-photo" src="${card.img}" alt="" decoding="async">
                  <div class="chrono-drag-source-caption">${cap}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    const arena = document.getElementById("chrono-stage-arena");
    if (!arena) return;

    const filledSlots = { 1: false, 2: false, 3: false, 4: false };
    let filledCount = 0;
    let activeDrag = null;
    let activePointerId = null;

    function getHoveredSlotNum(cx, cy) {
      let bestNum = 0;
      let bestDist = Infinity;
      const pad = 22;
      for (let n = 1; n <= 4; n++) {
        if (filledSlots[n]) continue;
        const el = document.getElementById(`chrono-drop-slot-${n}`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (cx >= r.left - pad && cx <= r.right + pad && cy >= r.top - pad && cy <= r.bottom + pad) {
          const midX = (r.left + r.right) / 2;
          const midY = (r.top + r.bottom) / 2;
          const dist = Math.hypot(cx - midX, cy - midY);
          if (dist < bestDist) {
            bestDist = dist;
            bestNum = n;
          }
        }
      }
      return bestNum;
    }

    function clearSlotHoverHighlights() {
      for (let n = 1; n <= 4; n++) {
        const el = document.getElementById(`chrono-drop-slot-${n}`);
        if (el) el.classList.remove("drag-hover");
      }
    }

    const sourceEls = arena.querySelectorAll(".chrono-drag-source");
    sourceEls.forEach((srcEl) => {
      srcEl.addEventListener("pointerdown", (e) => {
        if (window._arcadeStageLockedForVovo || activeDrag || _isVictoryActive) return;
        if (srcEl.classList.contains("placed-done")) return;
        e.preventDefault();
        e.stopPropagation();

        activePointerId = e.pointerId !== undefined ? e.pointerId : null;
        try { arena.setPointerCapture(e.pointerId); } catch (err) {}

        TronoAudio.play("click");

        const rect = srcEl.getBoundingClientRect();
        const imgUrl = srcEl.getAttribute("data-card-img") || "";
        const cardCap = srcEl.getAttribute("data-card-cap") || "";
        const cardOrder = Number(srcEl.getAttribute("data-card-order") || 0);

        const ghost = document.createElement("div");
        ghost.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border-radius: 16px;
          padding: 3.5px;
          background: linear-gradient(125deg, #fde047, #38bdf8, #00e676);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85), 0 0 22px rgba(253, 224, 71, 0.75);
          pointer-events: none;
          z-index: 10000050;
          box-sizing: border-box;
          transform: scale(1.05);
          transition: transform 0.1s ease;
          display: flex;
          flex-direction: column;
        `;
        ghost.innerHTML = `
          <div style="width:100%; height:100%; border-radius:12.5px; overflow:hidden; background:linear-gradient(180deg, #4c1d95 0%, #2e1065 100%); display:flex; flex-direction:column;">
            <img src="${imgUrl}" alt="" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
            <div style="flex:1; padding:3px 5px; display:flex; align-items:center; justify-content:center; text-align:center; font-family:'Fredoka',sans-serif; font-size:11px; font-weight:800; color:#ffffff; line-height:1.12;">${cardCap}</div>
          </div>
        `;
        document.body.appendChild(ghost);
        window._chronoDragGhostEl = ghost;

        srcEl.style.opacity = "0.28";

        activeDrag = {
          srcEl,
          ghost,
          imgUrl,
          cardOrder,
          homeLeft: rect.left,
          homeTop: rect.top,
          width: rect.width,
          height: rect.height,
          grabOffsetX: e.clientX - rect.left,
          grabOffsetY: e.clientY - rect.top
        };
      });
    });

    arena.addEventListener("pointermove", (e) => {
      if (!activeDrag) return;
      if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
      e.preventDefault();

      const nextLeft = e.clientX - activeDrag.grabOffsetX;
      const nextTop = e.clientY - activeDrag.grabOffsetY;
      activeDrag.ghost.style.left = `${nextLeft}px`;
      activeDrag.ghost.style.top = `${nextTop}px`;

      const centerX = nextLeft + activeDrag.width / 2;
      const centerY = nextTop + activeDrag.height / 2;
      const hov = getHoveredSlotNum(e.clientX, e.clientY) || getHoveredSlotNum(centerX, centerY);

      clearSlotHoverHighlights();
      if (hov > 0) {
        const slotEl = document.getElementById(`chrono-drop-slot-${hov}`);
        if (slotEl) slotEl.classList.add("drag-hover");
      }
    });

    function endChronoDrag(e) {
      if (!activeDrag) return;
      if (activePointerId !== null && e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

      const drag = activeDrag;
      activeDrag = null;
      activePointerId = null;
      clearSlotHoverHighlights();

      const ghostRect = drag.ghost.getBoundingClientRect();
      const centerX = ghostRect.left + ghostRect.width / 2;
      const centerY = ghostRect.top + ghostRect.height / 2;
      const clientX = (e && typeof e.clientX === "number") ? e.clientX : centerX;
      const clientY = (e && typeof e.clientY === "number") ? e.clientY : centerY;

      const targetSlotNum = getHoveredSlotNum(clientX, clientY) || getHoveredSlotNum(centerX, centerY);

      if (targetSlotNum > 0 && targetSlotNum === drag.cardOrder && !filledSlots[targetSlotNum]) {
        filledSlots[targetSlotNum] = true;
        filledCount++;
        TronoAudio.play("star");

        if (drag.ghost && drag.ghost.parentNode) {
          drag.ghost.parentNode.removeChild(drag.ghost);
        }
        window._chronoDragGhostEl = null;

        drag.srcEl.classList.add("placed-done");

        const slotEl = document.getElementById(`chrono-drop-slot-${targetSlotNum}`);
        if (slotEl) {
          slotEl.classList.add("slot-filled");
          slotEl.innerHTML = `
            <img src="${drag.imgUrl}" alt="" style="width:100%; height:100%; object-fit:cover; display:block;">
            <div style="position:absolute; top:3px; left:3px; padding:1px 6px; border-radius:999px; background:linear-gradient(180deg, #00e676, #00c853); border:1.8px solid #ffffff; color:#ffffff; font-family:'Fredoka',sans-serif; font-size:10.5px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.75);">
              ${targetSlotNum}º
            </div>
          `;
        }

        if (filledCount >= 4) {
          TronoAudio.play("success");
          window._chronoWinTimer = setTimeout(() => {
            triggerArcadeVictory();
          }, 620);
        }
        return;
      }

      if (targetSlotNum > 0 && targetSlotNum !== drag.cardOrder) {
        TronoAudio.play("error");
        const wrongSlotEl = document.getElementById(`chrono-drop-slot-${targetSlotNum}`);
        if (wrongSlotEl) {
          wrongSlotEl.classList.remove("slot-wrong");
          void wrongSlotEl.offsetWidth;
          wrongSlotEl.classList.add("slot-wrong");
          setTimeout(() => { if (wrongSlotEl) wrongSlotEl.classList.remove("slot-wrong"); }, 360);
        }
      }

      const homeRect = drag.srcEl.getBoundingClientRect();
      drag.ghost.style.transition = "left 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.22s ease";
      drag.ghost.style.left = `${homeRect.left}px`;
      drag.ghost.style.top = `${homeRect.top}px`;
      drag.ghost.style.transform = "scale(1)";

      setTimeout(() => {
        if (drag.ghost && drag.ghost.parentNode) {
          drag.ghost.parentNode.removeChild(drag.ghost);
        }
        if (window._chronoDragGhostEl === drag.ghost) {
          window._chronoDragGhostEl = null;
        }
        if (!drag.srcEl.classList.contains("placed-done")) {
          drag.srcEl.style.opacity = "1";
        }
      }, 230);
    }

    arena.addEventListener("pointerup", endChronoDrag);
    arena.addEventListener("pointercancel", endChronoDrag);
  }

  // --- JOGO NOVO UNIFICADO: VERSÍCULO SECRETO (22 FASES = 22 LIÇÕES • O VOVÔ LÊ O VERSÍCULO E A CRIANÇA MONTA NAS MOLDURAS TRACEJADAS!) ---
  function runVersiculoSecretoArcade(container, phase) {
    cleanupChronoDragArtifacts();

    const bank = (Array.isArray(window.VERSE_BUILDER_BANK) && window.VERSE_BUILDER_BANK.length > 0)
      ? window.VERSE_BUILDER_BANK
      : [
          { level: 1, lessonWeek: 1, ref: "Gênesis 1:1 (Lição 1)", words: ["No", "princípio", "criou", "Deus", "os", "céus", "e", "a", "terra."] }
        ];

    const idx = Math.max(0, ((Math.floor(Number(phase) || 1) - 1) % bank.length));
    const verseObj = bank[idx] || bank[0];
    const words = Array.isArray(verseObj.words) ? verseObj.words.slice() : ["Deus", "é", "amor."];
    const cleanRef = String(verseObj.ref || "")
      .replace(/\s*\(Lição\s*\d+\)/gi, "")
      .trim()
      .toUpperCase();

    const shuffled = words.map((w, origIdx) => ({ word: w, origIdx })).sort(() => Math.random() - 0.5);
    if (shuffled.length > 2 && shuffled.every((item, i) => item.word === words[i])) {
      const t = shuffled[0];
      shuffled[0] = shuffled[shuffled.length - 1];
      shuffled[shuffled.length - 1] = t;
    }

    container.innerHTML = `
      <style id="verse-arcade-v160-styles">
        @keyframes verseMagicFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes verseWordPop {
          0% { transform: scale(0.82); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes verseSlotShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .verse-stage-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 50px 12px clamp(20px, 4.5vh, 38px) 12px;
          box-sizing: border-box;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .verse-top-board {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 520px;
          background: linear-gradient(180deg, rgba(126, 34, 206, 0.88) 0%, rgba(59, 7, 100, 0.94) 100%);
          border-radius: 22px;
          padding: 14px 12px 16px 12px;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .verse-top-board::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 3.5px;
          background: linear-gradient(125deg, #38bdf8, #a855f7, #fde047, #34d399, #ec4899, #38bdf8);
          background-size: 250% 250%;
          animation: verseMagicFlow 4s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .verse-top-board.drop-ready {
          transform: scale(1.02);
          box-shadow: 0 0 26px rgba(56, 189, 248, 0.92), 0 10px 26px rgba(0, 0, 0, 0.75);
        }
        .verse-ref-pill {
          background: linear-gradient(180deg, #fde047 0%, #f59e0b 100%);
          color: #1e1b4b;
          font-family: 'Fredoka', sans-serif;
          font-size: 12.5px;
          font-weight: 900;
          letter-spacing: 0.5px;
          padding: 3px 14px;
          border-radius: 999px;
          border: 2px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
        }
        .verse-slots-wrap {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 7px;
        }
        .verse-dashed-slot {
          min-width: 56px;
          min-height: 38px;
          padding: 5px 11px;
          border-radius: 13px;
          border: 2px dashed rgba(253, 224, 71, 0.72);
          background: rgba(15, 23, 42, 0.42);
          color: rgba(253, 224, 71, 0.82);
          font-family: 'Fredoka', sans-serif;
          font-size: 13px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          transition: all 0.16s ease;
        }
        .verse-dashed-slot.next-active {
          border: 2.5px dashed #38bdf8;
          background: rgba(56, 189, 248, 0.20);
          color: #fde047;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.65);
        }
        .verse-dashed-slot.slot-filled {
          border: 2px solid #ffffff !important;
          background: linear-gradient(180deg, #00e676 0%, #00c853 100%) !important;
          color: #ffffff !important;
          font-size: clamp(14px, 3.8vw, 17px);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45), 0 0 12px rgba(0, 230, 118, 0.65) !important;
          animation: verseWordPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .verse-dashed-slot.slot-wrong {
          border: 2.5px solid #ef4444 !important;
          background: rgba(239, 68, 68, 0.32) !important;
          animation: verseSlotShake 0.32s ease;
        }
        .verse-bottom-words-pool {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: clamp(9px, 2.4vw, 13px);
          padding: 6px 2px;
        }
        .verse-word-pill {
          position: relative;
          border-radius: 999px;
          padding: 3px;
          background: linear-gradient(125deg, #38bdf8, #a855f7, #fde047, #34d399, #ec4899, #38bdf8);
          background-size: 250% 250%;
          animation: verseMagicFlow 4s ease infinite;
          box-shadow: 0 7px 18px rgba(0, 0, 0, 0.72);
          cursor: grab;
          touch-action: none;
          box-sizing: border-box;
          transition: transform 0.14s ease, opacity 0.2s ease;
        }
        .verse-word-pill-inner {
          border-radius: 999px;
          padding: 9px 17px;
          background: linear-gradient(180deg, #581c87 0%, #3b0764 100%);
          color: #ffffff;
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(15.5px, 4.3vw, 19px);
          font-weight: 900;
          line-height: 1.1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
          pointer-events: none;
          white-space: nowrap;
        }
        .verse-word-pill.used-word {
          opacity: 0.14 !important;
          pointer-events: none !important;
          transform: scale(0.92);
        }
        .verse-word-pill.wrong-tap {
          animation: verseSlotShake 0.32s ease !important;
        }
      </style>

      <div class="verse-stage-root" id="verse-stage-arena">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_18_versiculo_v160.jpg?v=160" alt="" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center center; pointer-events:none; z-index:0;">

        <!-- QUADRO SUPERIOR ROXO COM MOLDURAS TRACEJADAS DAS PALAVRAS DO VERSÍCULO -->
        <div class="verse-top-board" id="verse-top-board">
          <div class="verse-ref-pill">${cleanRef}</div>
          <div class="verse-slots-wrap" id="verse-slots-wrap">
            ${words.map((_, sIdx) => `
              <div class="verse-dashed-slot ${sIdx === 0 ? "next-active" : ""}" id="verse-slot-${sIdx}" data-slot-idx="${sIdx}">
                ${sIdx + 1}º
              </div>
            `).join("")}
          </div>
        </div>

        <!-- PALAVRAS SOLTAS EMBARALHADAS EMBAIXO (ARRASTAR COM O DEDINHO OU TOCAR!) -->
        <div class="verse-bottom-words-pool" id="verse-bottom-words-pool">
          ${shuffled.map((item, pIdx) => `
            <div class="verse-word-pill" id="verse-pill-${pIdx}" data-word-val="${item.word.replace(/"/g, "&quot;")}">
              <div class="verse-word-pill-inner">${item.word}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const arena = document.getElementById("verse-stage-arena");
    const topBoard = document.getElementById("verse-top-board");
    if (!arena || !topBoard) return;

    let currentWordStep = 0;
    let activeDrag = null;
    let activePointerId = null;

    function highlightNextSlot() {
      for (let i = 0; i < words.length; i++) {
        const el = document.getElementById(`verse-slot-${i}`);
        if (!el) continue;
        if (i === currentWordStep) el.classList.add("next-active");
        else el.classList.remove("next-active");
      }
    }

    function commitWordPlacement(pillEl, wordVal) {
      if (currentWordStep >= words.length) return;
      const expected = words[currentWordStep];
      const nextSlotEl = document.getElementById(`verse-slot-${currentWordStep}`);

      if (wordVal === expected) {
        TronoAudio.play("star");
        pillEl.classList.add("used-word");
        pillEl.style.opacity = "";
        if (nextSlotEl) {
          nextSlotEl.classList.remove("next-active", "slot-wrong");
          nextSlotEl.classList.add("slot-filled");
          nextSlotEl.textContent = wordVal;
        }
        currentWordStep++;
        highlightNextSlot();

        if (currentWordStep >= words.length) {
          TronoAudio.play("success");
          window._verseWinTimer = setTimeout(() => {
            triggerArcadeVictory();
          }, 680);
        }
        return true;
      } else {
        TronoAudio.play("error");
        if (nextSlotEl) {
          nextSlotEl.classList.remove("slot-wrong");
          void nextSlotEl.offsetWidth;
          nextSlotEl.classList.add("slot-wrong");
          setTimeout(() => { if (nextSlotEl) nextSlotEl.classList.remove("slot-wrong"); }, 350);
        }
        pillEl.classList.remove("wrong-tap");
        void pillEl.offsetWidth;
        pillEl.classList.add("wrong-tap");
        setTimeout(() => { if (pillEl) pillEl.classList.remove("wrong-tap"); }, 350);
        return false;
      }
    }

    function isOverTopBoard(cx, cy) {
      const r = topBoard.getBoundingClientRect();
      const pad = 28;
      return cx >= r.left - pad && cx <= r.right + pad && cy >= r.top - pad && cy <= r.bottom + pad;
    }

    const pillEls = arena.querySelectorAll(".verse-word-pill");
    pillEls.forEach((pillEl) => {
      pillEl.addEventListener("pointerdown", (e) => {
        if (window._arcadeStageLockedForVovo || activeDrag || _isVictoryActive) return;
        if (pillEl.classList.contains("used-word") || currentWordStep >= words.length) return;
        e.preventDefault();
        e.stopPropagation();

        activePointerId = e.pointerId !== undefined ? e.pointerId : null;
        try { arena.setPointerCapture(e.pointerId); } catch (err) {}

        const rect = pillEl.getBoundingClientRect();
        const wordVal = pillEl.getAttribute("data-word-val") || "";

        const ghost = document.createElement("div");
        ghost.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border-radius: 999px;
          padding: 3px;
          background: linear-gradient(125deg, #fde047, #38bdf8, #00e676);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.85), 0 0 18px rgba(253, 224, 71, 0.8);
          pointer-events: none;
          z-index: 10000050;
          box-sizing: border-box;
          transform: scale(1.08);
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        ghost.innerHTML = `<div style="width:100%; height:100%; border-radius:999px; background:linear-gradient(180deg, #581c87 0%, #3b0764 100%); color:#ffffff; font-family:'Fredoka',sans-serif; font-size:17px; font-weight:900; display:flex; align-items:center; justify-content:center;">${wordVal}</div>`;
        document.body.appendChild(ghost);
        window._verseDragGhostEl = ghost;

        pillEl.style.opacity = "0.28";

        activeDrag = {
          pillEl,
          ghost,
          wordVal,
          startX: e.clientX,
          startY: e.clientY,
          movedDist: 0,
          width: rect.width,
          height: rect.height,
          grabOffsetX: e.clientX - rect.left,
          grabOffsetY: e.clientY - rect.top
        };
      });
    });

    arena.addEventListener("pointermove", (e) => {
      if (!activeDrag) return;
      if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
      e.preventDefault();

      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;
      activeDrag.movedDist = Math.max(activeDrag.movedDist, Math.hypot(dx, dy));

      const nextLeft = e.clientX - activeDrag.grabOffsetX;
      const nextTop = e.clientY - activeDrag.grabOffsetY;
      activeDrag.ghost.style.left = `${nextLeft}px`;
      activeDrag.ghost.style.top = `${nextTop}px`;

      const cx = nextLeft + activeDrag.width / 2;
      const cy = nextTop + activeDrag.height / 2;
      if (isOverTopBoard(e.clientX, e.clientY) || isOverTopBoard(cx, cy)) {
        topBoard.classList.add("drop-ready");
      } else {
        topBoard.classList.remove("drop-ready");
      }
    });

    function endVerseDrag(e) {
      if (!activeDrag) return;
      if (activePointerId !== null && e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

      const drag = activeDrag;
      activeDrag = null;
      activePointerId = null;
      topBoard.classList.remove("drop-ready");

      const ghostRect = drag.ghost.getBoundingClientRect();
      const cx = ghostRect.left + ghostRect.width / 2;
      const cy = ghostRect.top + ghostRect.height / 2;
      const clientX = (e && typeof e.clientX === "number") ? e.clientX : cx;
      const clientY = (e && typeof e.clientY === "number") ? e.clientY : cy;

      const wasQuickTap = drag.movedDist < 12;
      const droppedOnBoard = isOverTopBoard(clientX, clientY) || isOverTopBoard(cx, cy);

      if (wasQuickTap || droppedOnBoard) {
        const ok = commitWordPlacement(drag.pillEl, drag.wordVal);
        if (ok) {
          if (drag.ghost && drag.ghost.parentNode) {
            drag.ghost.parentNode.removeChild(drag.ghost);
          }
          window._verseDragGhostEl = null;
          return;
        }
      }

      const homeRect = drag.pillEl.getBoundingClientRect();
      drag.ghost.style.transition = "left 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.2s ease";
      drag.ghost.style.left = `${homeRect.left}px`;
      drag.ghost.style.top = `${homeRect.top}px`;
      drag.ghost.style.transform = "scale(1)";

      setTimeout(() => {
        if (drag.ghost && drag.ghost.parentNode) {
          drag.ghost.parentNode.removeChild(drag.ghost);
        }
        if (window._verseDragGhostEl === drag.ghost) {
          window._verseDragGhostEl = null;
        }
        if (!drag.pillEl.classList.contains("used-word")) {
          drag.pillEl.style.opacity = "1";
        }
      }, 210);
    }

    arena.addEventListener("pointerup", endVerseDrag);
    arena.addEventListener("pointercancel", endVerseDrag);
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

  // ==========================================================================
  // 6B. OS 6 JOGOS DA LIÇÃO E SALA DE JOGOS EM TELA CHEIA (PADRÃO v161.0)
  // (Quebra-Cabeça 3D, Pintura Mágica c/ Lapizinho Flutuante, Caça-Palavras,
  //  Palavra Secreta, Quem Sou Eu? e Verdadeiro ou Mito — 22 Fases cada!)
  // ==========================================================================
  function injectLessonArcadeV161Styles() {
    if (document.getElementById("arcade-lesson6-v161-styles")) return;
    const st = document.createElement("style");
    st.id = "arcade-lesson6-v161-styles";
    st.textContent = `
      .arc-v161-stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
      }
      .arc-v161-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        pointer-events: none;
        z-index: 0;
      }
      .arc-v161-vignette {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(15, 12, 41, 0.34) 0%, rgba(15, 12, 41, 0.14) 48%, rgba(15, 12, 41, 0.44) 100%);
        pointer-events: none;
        z-index: 1;
      }
      .arc-v161-rainbow-card {
        position: relative;
        background: linear-gradient(180deg, rgba(126, 34, 206, 0.94) 0%, rgba(59, 7, 100, 0.97) 100%);
        border-radius: 20px;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.72);
        box-sizing: border-box;
      }
      .arc-v161-rainbow-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 3px;
        background: linear-gradient(125deg, #38bdf8, #a855f7, #fde047, #34d399, #ec4899, #38bdf8);
        background-size: 260% 260%;
        animation: vovoReplayBorderFlow 4s ease infinite;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .arc-v161-top-strip {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 520px;
        height: 40px;
        min-height: 40px;
        padding: 4px 104px 2px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-sizing: border-box;
      }
      .arc-v161-diff-btn {
        height: 32px;
        padding: 0 11px;
        border-radius: 999px;
        border: 2px solid rgba(253, 224, 71, 0.78);
        background: linear-gradient(180deg, rgba(88, 28, 135, 0.92) 0%, rgba(46, 16, 101, 0.96) 100%);
        color: #ffffff;
        font-family: 'Fredoka', sans-serif;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.3px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.55);
        transition: transform 0.12s ease, background 0.15s ease;
        white-space: nowrap;
      }
      .arc-v161-diff-btn.active {
        background: linear-gradient(180deg, #00e676 0%, #00c853 100%);
        border-color: #ffffff;
        box-shadow: 0 0 14px rgba(0, 230, 118, 0.8), 0 4px 10px rgba(0,0,0,0.6);
      }
      .arc-v161-diff-btn:active {
        transform: scale(0.93);
      }
      /* LAPIZINHO MÁGICO FLUTUANTE 3D NA PINTURA MÁGICA (POSICIONAR + CLICAR PARA PINTAR!) */
      #arcade-paint-floating-pencil {
        position: fixed;
        left: 0;
        top: 0;
        width: 56px;
        height: 56px;
        transform: translate(-5px, -47px);
        pointer-events: auto;
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        z-index: 10000120;
        opacity: 0;
        transition: opacity 0.14s ease;
        filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.65));
        will-change: left, top, transform;
      }
      #arcade-paint-floating-pencil.pencil-visible {
        opacity: 1;
      }
      #arcade-paint-floating-pencil.pencil-tap-pop {
        animation: arcadePencilTapPop 0.18s ease;
      }
      @keyframes arcadePencilTapPop {
        0%, 100% { transform: translate(-5px, -47px) scale(1); }
        50% { transform: translate(-5px, -47px) scale(0.90); }
      }
      .arc-paint-tool-btn {
        height: 32px;
        padding: 0 4px;
        border-radius: 10px;
        border: 1.8px solid rgba(253, 224, 71, 0.72);
        background: linear-gradient(180deg, rgba(76, 29, 149, 0.92) 0%, rgba(30, 27, 75, 0.96) 100%);
        color: #ffffff;
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(10px, 2.65vw, 11.8px);
        font-weight: 900;
        letter-spacing: 0.2px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.5);
        transition: transform 0.1s ease, background 0.14s ease;
        white-space: nowrap;
      }
      .arc-paint-tool-btn.active {
        background: linear-gradient(180deg, #00e676 0%, #00c853 100%);
        border-color: #ffffff;
        box-shadow: 0 0 12px rgba(0, 230, 118, 0.75);
      }
      .arc-paint-tool-btn:active {
        transform: scale(0.92);
      }
      .arc-paint-swatch {
        width: 100%;
        aspect-ratio: 1 / 1;
        max-width: 30px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.82);
        box-shadow: 0 2px 6px rgba(0,0,0,0.55);
        cursor: pointer;
        justify-self: center;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        box-sizing: border-box;
      }
      .arc-paint-swatch.active {
        transform: scale(1.22);
        border: 3px solid #ffffff;
        box-shadow: 0 0 12px #fde047, 0 3px 8px rgba(0,0,0,0.8);
        z-index: 2;
      }
      /* CAÇA-PALAVRAS E PALAVRA SECRETA 3D TILES */
      .arc-ws-cell {
        aspect-ratio: 1 / 1;
        border-radius: 10px;
        border: 2px solid rgba(56, 189, 248, 0.85);
        background: linear-gradient(180deg, rgba(107, 33, 168, 0.92) 0%, rgba(59, 7, 100, 0.96) 100%);
        color: #ffffff;
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(15px, 4.3vw, 20px);
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.58), inset 0 2px 3px rgba(255,255,255,0.22);
        cursor: pointer;
        user-select: none;
        touch-action: none;
        transition: transform 0.1s ease, background 0.14s ease, border-color 0.14s ease;
      }
      .arc-ws-cell.ws-tap-lit {
        background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
        border-color: #fde047;
        box-shadow: 0 0 12px rgba(253, 224, 71, 0.8);
      }
      .arc-ws-cell.ws-swipe-preview {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%) !important;
        border-color: #ffffff !important;
        transform: scale(1.06);
        z-index: 3;
      }
      .arc-ws-cell.ws-found {
        background: linear-gradient(180deg, #00e676 0%, #00c853 100%) !important;
        border-color: #ffffff !important;
        box-shadow: 0 0 14px rgba(0, 230, 118, 0.8), 0 4px 10px rgba(0,0,0,0.55);
      }
      @keyframes arcGentleShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .arc-shake-err {
        animation: arcGentleShake 0.26s ease;
      }
    `;
    document.head.appendChild(st);
  }

  function stripLessonPrefixText(raw) {
    return String(raw || "").replace(/^Lição\s*\d+\s*[•\-:]\s*/i, "").trim();
  }

  function getLessonStoryForPhase(phase) {
    if (window._arcadeDirectStoryOverride && window._arcadeDirectStoryOverride.seqColor) {
      return window._arcadeDirectStoryOverride;
    }
    const wk = ((Math.max(1, Math.floor(Number(phase) || 1)) - 1) % 22) + 1;
    const curriculum = window.EBD_LESSONS_CURRICULUM || [];
    const lesson = curriculum.find(l => Number(l.week) === wk);
    const stories = window.STORIES || [];
    if (lesson && lesson.storyIdUnlock) {
      const found = stories.find(s => Number(s.id) === Number(lesson.storyIdUnlock));
      if (found) return found;
    }
    if (stories.length > 0) {
      return stories[(wk - 1) % stories.length];
    }
    return { id: 11, seqColor: "29", seqPaint: "39", title: "Adão e Eva no Jardim do Éden" };
  }

  window._arcadePreloadedImages = window._arcadePreloadedImages || {};
  window._arcadePreloadedAudios = window._arcadePreloadedAudios || {};

  window.preloadArcadeImageUrl = function(url) {
    if (!url || typeof url !== "string" || url.indexOf("data:") === 0) return null;
    const existing = window._arcadePreloadedImages[url];
    if (existing) return existing;
    try {
      const im = new Image();
      im.decoding = "async";
      im.src = url;
      window._arcadePreloadedImages[url] = im;
      return im;
    } catch (e) {
      return null;
    }
  };

  window.preloadArcadeAudioUrl = function(url) {
    if (!url || typeof url !== "string") return;
    if (window._arcadePreloadedAudios[url]) return;
    try {
      const au = new Audio();
      au.preload = "auto";
      au.src = url;
      window._arcadePreloadedAudios[url] = au;
    } catch (e) {}
  };

  window.preloadArcadeLessonVisualAssets = function(phaseOrStory) {
    try {
      const st = (phaseOrStory && typeof phaseOrStory === "object" && (phaseOrStory.seqPaint || phaseOrStory.seqColor))
        ? phaseOrStory
        : getLessonStoryForPhase(phaseOrStory || 1);
      window.preloadArcadeImageUrl("./2_ASSETS_UI_BOTOES/bg_jogo_17_pintura_v161.jpg?v=161");
      window.preloadArcadeImageUrl("./2_ASSETS_UI_BOTOES/bg_jogo_16_puzzle_v161.jpg?v=161");
      if (st && st.seqPaint) {
        window.preloadArcadeImageUrl(`./4_ASSETS_PINTURA/pintura_contorno_${st.seqPaint}.jpg?v=164`);
      }
      if (st && st.seqColor) {
        window.preloadArcadeImageUrl(`./3_ASSETS_QUEBRA_CABECA/quebra_cabeca_${st.seqColor}.jpg?v=161`);
      }
      window.preloadArcadeAudioUrl("./6_ASSETS_AUDIO/jogos_vovo/vovo_jogo_17_v162.mp3?v=162");
      if (typeof phaseOrStory === "number" || typeof phaseOrStory === "string") {
        const wkNum = ((Math.max(1, Math.floor(Number(phaseOrStory) || 1)) - 1) % 22) + 1;
        window.preloadArcadeImageUrl("./2_ASSETS_UI_BOTOES/bg_jogo_20_palavrasecreta_v161.jpg?v=161");
        window.preloadArcadeAudioUrl(`./6_ASSETS_AUDIO/palavra_secreta_vovo/palavra_secreta_vovo_${String(wkNum).padStart(2, "0")}.mp3?v=165`);
      }
    } catch (e) {}
  };

  // --- JOGO 16: QUEBRA-CABEÇA 3D ARCADE (22 LIÇÕES + PRECISÃO TABLET v156 + VOZ DO VOVÔ) ---
  function runQuebraCabecaArcade(container, phase) {
    window._arcadeWaitVisualBeforeVovo = true;
    injectLessonArcadeV161Styles();
    const st = getLessonStoryForPhase(phase);
    let cols = 2, rows = 3;
    let pieces = [];
    let activePiece = null;
    let puzActivePointerId = null;
    let grabOffX = 0, grabOffY = 0;
    let puzSolved = false;
    let animHue = 0;

    const BOARD = { x: 75, y: 12, w: 390, h: 564 };
    const TRAY  = { x: 14, y: 590, w: 512, h: 258 };

    container.innerHTML = `
      <div class="arc-v161-stage">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_16_puzzle_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <div class="arc-v161-top-strip">
          <button type="button" class="arc-v161-diff-btn active" data-puz-diff="6">6 PEÇAS</button>
          <button type="button" class="arc-v161-diff-btn" data-puz-diff="9">9 PEÇAS</button>
          <button type="button" class="arc-v161-diff-btn" data-puz-diff="12">12 PEÇAS</button>
        </div>

        <div style="position:relative; z-index:5; flex:1; min-height:0; width:100%; display:flex; align-items:center; justify-content:center; padding:0 6px 8px 6px; box-sizing:border-box;">
          <canvas id="arcade-puzzle-canvas" width="540" height="860" style="width:100%; height:100%; max-width:520px; object-fit:contain; touch-action:none; display:block;"></canvas>
        </div>
      </div>
    `;

    const canvas = container.querySelector("#arcade-puzzle-canvas");
    const ctx = canvas.getContext("2d");
    let img = new Image();
    img.decoding = "async";
    img.fetchPriority = "high";

    function drawEdge(c2d, x1, y1, x2, y2, tabSign) {
      if (tabSign === 0) {
        c2d.lineTo(x2, y2);
        return;
      }
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len;
      const nx = -uy * tabSign, ny = ux * tabSign;
      const pt = (along, perp) => [
        x1 + ux * (along * len) + nx * (perp * len),
        y1 + uy * (along * len) + ny * (perp * len)
      ];
      const [p1x, p1y] = pt(0.36, 0.0);
      c2d.lineTo(p1x, p1y);
      const [c1x, c1y] = pt(0.31, 0.11);
      const [c2x, c2y] = pt(0.35, 0.25);
      const [topX, topY] = pt(0.50, 0.25);
      c2d.bezierCurveTo(c1x, c1y, c2x, c2y, topX, topY);
      const [c3x, c3y] = pt(0.65, 0.25);
      const [c4x, c4y] = pt(0.69, 0.11);
      const [p2x, p2y] = pt(0.64, 0.0);
      c2d.bezierCurveTo(c3x, c3y, c4x, c4y, p2x, p2y);
      c2d.lineTo(x2, y2);
    }

    function traceShape(c2d, x, y, w, h, edges) {
      c2d.beginPath();
      c2d.moveTo(x, y);
      drawEdge(c2d, x, y, x + w, y, edges.top);
      drawEdge(c2d, x + w, y, x + w, y + h, edges.right);
      drawEdge(c2d, x + w, y + h, x, y + h, edges.bottom);
      drawEdge(c2d, x, y + h, x, y, edges.left);
      c2d.closePath();
    }

    function drawFrame3D(x, y, w, h, radius, theme) {
      ctx.save();
      const rad = (animHue * Math.PI) / 180;
      const gx1 = x + w / 2 + Math.cos(rad) * (w / 2);
      const gy1 = y + h / 2 + Math.sin(rad) * (h / 2);
      const gx2 = x + w / 2 - Math.cos(rad) * (w / 2);
      const gy2 = y + h / 2 - Math.sin(rad) * (h / 2);
      const bGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      bGrad.addColorStop(0, "#00e676");
      bGrad.addColorStop(0.5, "#00e5ff");
      bGrad.addColorStop(1, "#fde047");
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(x - 5, y - 5, w + 10, h + 10, radius + 4);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      const iGrad = ctx.createLinearGradient(x, y, x, y + h);
      if (theme === "purple") {
        iGrad.addColorStop(0, "rgba(126, 34, 206, 0.92)");
        iGrad.addColorStop(1, "rgba(59, 7, 100, 0.96)");
      } else {
        iGrad.addColorStop(0, "rgba(2, 132, 199, 0.92)");
        iGrad.addColorStop(1, "rgba(30, 58, 138, 0.96)");
      }
      ctx.fillStyle = iGrad;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fill();
      ctx.restore();
    }

    function buildPieces() {
      pieces.forEach(oldP => {
        if (oldP && oldP._flashTimer) clearInterval(oldP._flashTimer);
      });
      pieces = [];
      activePiece = null;
      puzActivePointerId = null;
      puzSolved = false;

      const pw = BOARD.w / cols;
      const ph = BOARD.h / rows;
      const hTabs = Array.from({ length: rows + 1 }, () => Array(cols).fill(0));
      const vTabs = Array.from({ length: rows }, () => Array(cols + 1).fill(0));
      for (let r = 1; r < rows; r++) {
        for (let c = 0; c < cols; c++) hTabs[r][c] = Math.random() < 0.5 ? 1 : -1;
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 1; c < cols; c++) vTabs[r][c] = Math.random() < 0.5 ? 1 : -1;
      }

      const list = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          list.push({
            id: r * cols + c,
            row: r,
            col: c,
            w: pw,
            h: ph,
            edges: {
              top: r === 0 ? 0 : hTabs[r][c],
              right: c === cols - 1 ? 0 : vTabs[r][c + 1],
              bottom: r === rows - 1 ? 0 : -hTabs[r + 1][c],
              left: c === 0 ? 0 : -vTabs[r][c]
            },
            targetX: BOARD.x + c * pw,
            targetY: BOARD.y + r * ph,
            x: 0,
            y: 0,
            homeX: 0,
            homeY: 0,
            slotX: 0,
            slotY: 0,
            slotW: 0,
            slotH: 0,
            trayScale: 0.55,
            locked: false,
            flashState: null,
            flashAlpha: 0
          });
        }
      }
      list.sort(() => Math.random() - 0.5);

      const tot = list.length;
      const trayCols = tot === 6 ? 3 : (tot === 9 ? 5 : 6);
      const trayRows = 2;
      const padX = 8, padY = 8, gapX = 4, gapY = 4;
      const slotW = (TRAY.w - padX * 2 - gapX * (trayCols - 1)) / trayCols;
      const slotH = (TRAY.h - padY * 2 - gapY * (trayRows - 1)) / trayRows;
      const trayScale = Math.min(slotW / (pw * 1.18), slotH / (ph * 1.18), 0.85);

      list.forEach((p, idx) => {
        const sr = Math.floor(idx / trayCols);
        const sc = idx % trayCols;
        const inRow = (sr === trayRows - 1 && tot % trayCols !== 0) ? (tot % trayCols) : trayCols;
        const rowW = inRow * slotW + (inRow - 1) * gapX;
        const rowStartX = TRAY.x + (TRAY.w - rowW) / 2;
        const sx = rowStartX + sc * (slotW + gapX);
        const sy = TRAY.y + padY + sr * (slotH + gapY);
        p.slotX = sx;
        p.slotY = sy;
        p.slotW = slotW;
        p.slotH = slotH;
        p.trayScale = trayScale;
        p.homeX = sx + (slotW - pw) / 2;
        p.homeY = sy + (slotH - ph) / 2;
        p.x = p.homeX;
        p.y = p.homeY;
      });
      pieces = list;
      drawScene();
    }

    function flashPiece(piece, color, onDone) {
      if (piece._flashTimer) clearInterval(piece._flashTimer);
      piece.flashState = color;
      piece.flashAlpha = 1.0;
      piece._flashTimer = setInterval(() => {
        piece.flashAlpha -= 0.15;
        if (piece.flashAlpha <= 0) {
          piece.flashAlpha = 0;
          piece.flashState = null;
          clearInterval(piece._flashTimer);
          piece._flashTimer = null;
          if (onDone && piece !== activePiece) onDone();
        }
      }, 42);
    }

    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame3D(BOARD.x - 2, BOARD.y - 2, BOARD.w + 4, BOARD.h + 4, 14, "purple");
      drawFrame3D(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 16, "blue");
      if (!img.complete || !img.naturalWidth) {
        ctx.save();
        ctx.font = "800 22px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "rgba(0,0,0,0.85)";
        ctx.shadowBlur = 8;
        ctx.fillText("Preparando o quebra-cabeça...", canvas.width / 2, BOARD.y + BOARD.h / 2);
        ctx.restore();
        return;
      }

      const imgW = img.naturalWidth, imgH = img.naturalHeight;
      if (puzSolved) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
        ctx.clip();
        ctx.drawImage(img, 0, 0, imgW, imgH, BOARD.x, BOARD.y, BOARD.w, BOARD.h);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        const dy = Math.sin(animHue * 0.12) * 5;
        ctx.font = "900 29px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 8;
        ctx.fillText("IMAGEM COMPLETA! PARABÉNS!", canvas.width / 2, TRAY.y + 112 + dy);
        ctx.font = "800 21px Fredoka, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(st.title || "", canvas.width / 2, TRAY.y + 156 + dy);
        ctx.restore();
        return;
      }

      pieces.forEach(p => {
        ctx.save();
        traceShape(ctx, p.targetX, p.targetY, p.w, p.h, p.edges);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.restore();
      });

      const ordered = [
        ...pieces.filter(p => p.locked),
        ...pieces.filter(p => !p.locked && p !== activePiece),
        ...(activePiece ? [activePiece] : [])
      ];

      ordered.forEach(p => {
        const sc = (p.locked || p === activePiece) ? 1.0 : p.trayScale;
        const floatY = (!p.locked && p !== activePiece) ? Math.sin((animHue * 0.065) + p.id * 0.9) * 3.0 : 0;
        const dx = p.x, dy = p.y + floatY;
        const cx = dx + p.w / 2, cy = dy + p.h / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);
        if (!p.locked) {
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = p === activePiece ? 22 : 8;
          ctx.shadowOffsetY = p === activePiece ? 10 : 4;
        }
        traceShape(ctx, dx, dy, p.w, p.h, p.edges);
        ctx.clip();
        ctx.drawImage(img, 0, 0, imgW, imgH, dx - p.col * p.w, dy - p.row * p.h, BOARD.w, BOARD.h);

        if (p.flashState === "green" && p.flashAlpha > 0) {
          ctx.fillStyle = `rgba(34, 197, 94, ${p.flashAlpha * 0.55})`;
          ctx.fillRect(dx - p.w * 0.4, dy - p.h * 0.4, p.w * 1.8, p.h * 1.8);
        } else if (p.flashState === "red" && p.flashAlpha > 0) {
          ctx.fillStyle = `rgba(239, 68, 68, ${p.flashAlpha * 0.65})`;
          ctx.fillRect(dx - p.w * 0.4, dy - p.h * 0.4, p.w * 1.8, p.h * 1.8);
        }
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);
        traceShape(ctx, dx, dy, p.w, p.h, p.edges);
        if (p.flashState === "green" && p.flashAlpha > 0) {
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 6;
        } else if (p.flashState === "red" && p.flashAlpha > 0) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 6;
        } else if (p.locked) {
          ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = p === activePiece ? 3.8 : 2.8;
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    function startLoop() {
      if (window._arcadePuzzleRaf) cancelAnimationFrame(window._arcadePuzzleRaf);
      function tick() {
        const stageEl = document.getElementById("screen-trono-arcade-stage");
        if (!stageEl || !stageEl.classList.contains("active") || !canvas.isConnected) return;
        animHue = (animHue + 1.2) % 360;
        drawScene();
        window._arcadePuzzleRaf = requestAnimationFrame(tick);
      }
      window._arcadePuzzleRaf = requestAnimationFrame(tick);
    }

    function getCanvasPt(ev) {
      const rect = canvas.getBoundingClientRect();
      const cw = canvas.width, ch = canvas.height;
      let cx = ev.clientX, cy = ev.clientY;
      if (typeof cx !== "number" && ev.touches && ev.touches.length > 0) {
        cx = ev.touches[0].clientX;
        cy = ev.touches[0].clientY;
      } else if (typeof cx !== "number" && ev.changedTouches && ev.changedTouches.length > 0) {
        cx = ev.changedTouches[0].clientX;
        cy = ev.changedTouches[0].clientY;
      }
      const scale = Math.min(rect.width / cw, rect.height / ch) || 1;
      const offX = (rect.width - cw * scale) / 2;
      const offY = (rect.height - ch * scale) / 2;
      return {
        x: (cx - rect.left - offX) / scale,
        y: (cy - rect.top - offY) / scale
      };
    }

    function findPieceAt(pt) {
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (p.locked) continue;
        const sc = p.trayScale || 0.55;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        const hw = (p.w * sc) / 2 + 13;
        const hh = (p.h * sc) / 2 + 15;
        if (pt.x >= cx - hw && pt.x <= cx + hw && pt.y >= cy - hh && pt.y <= cy + hh) return i;
      }
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (p.locked) continue;
        if (pt.x >= p.slotX - 5 && pt.x <= p.slotX + p.slotW + 5 && pt.y >= p.slotY - 5 && pt.y <= p.slotY + p.slotH + 16) {
          return i;
        }
      }
      let bestIdx = -1, bestDist = 56;
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (p.locked) continue;
        const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
        const scx = p.slotX + p.slotW / 2, scy = p.slotY + p.slotH / 2;
        const d = Math.min(Math.hypot(pt.x - pcx, pt.y - pcy), Math.hypot(pt.x - scx, pt.y - scy));
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    canvas.addEventListener("touchstart", (ev) => {
      if (!puzSolved) ev.preventDefault();
    }, { passive: false });
    canvas.addEventListener("touchmove", (ev) => {
      if (activePiece) ev.preventDefault();
    }, { passive: false });

    canvas.addEventListener("pointerdown", (ev) => {
      if (window._arcadeStageLockedForVovo || puzSolved || _isVictoryActive) return;
      if (activePiece && puzActivePointerId !== null && ev.pointerId !== puzActivePointerId) return;
      ev.preventDefault();
      const pt = getCanvasPt(ev);
      const hitIdx = findPieceAt(pt);
      if (hitIdx >= 0) {
        const p = pieces[hitIdx];
        if (p._flashTimer) {
          clearInterval(p._flashTimer);
          p._flashTimer = null;
          p.flashState = null;
          p.flashAlpha = 0;
        }
        TronoAudio.play("click");
        activePiece = p;
        puzActivePointerId = ev.pointerId;
        grabOffX = p.w / 2;
        grabOffY = p.h / 2;
        p.x = pt.x - grabOffX;
        p.y = pt.y - grabOffY;
        pieces.splice(hitIdx, 1);
        pieces.push(p);
        try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
      }
    });

    canvas.addEventListener("pointermove", (ev) => {
      if (!activePiece) return;
      if (puzActivePointerId !== null && ev.pointerId !== puzActivePointerId) return;
      ev.preventDefault();
      const pt = getCanvasPt(ev);
      activePiece.x = pt.x - grabOffX;
      activePiece.y = pt.y - grabOffY;
    });

    function endPieceDrag(ev) {
      if (!activePiece) return;
      if (ev && puzActivePointerId !== null && typeof ev.pointerId === "number" && ev.pointerId !== puzActivePointerId) return;
      const p = activePiece;
      activePiece = null;
      puzActivePointerId = null;
      if (ev && typeof ev.pointerId === "number") {
        try { canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
      }

      const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      const inBoard = cx >= BOARD.x - 20 && cx <= BOARD.x + BOARD.w + 20 && cy >= BOARD.y - 20 && cy <= BOARD.y + BOARD.h + 20;

      if (dist < 68) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.locked = true;
        TronoAudio.play("success");
        flashPiece(p, "green", () => {
          if (pieces.every(it => it.locked) && !puzSolved) {
            puzSolved = true;
            if (_arcadeCustomBackScreen === "screen-gallery" && st && st.id && typeof completedPuzzles !== "undefined") {
              try {
                completedPuzzles.add(st.id);
                if (typeof saveGameProgressSets === "function") saveGameProgressSets();
              } catch (e) {}
            }
            if (window._arcadePuzzleWinTimer) clearTimeout(window._arcadePuzzleWinTimer);
            window._arcadePuzzleWinTimer = setTimeout(() => {
              window._arcadePuzzleWinTimer = null;
              triggerArcadeVictory();
            }, 1350);
          }
        });
      } else if (inBoard) {
        TronoAudio.play("error");
        flashPiece(p, "red", () => {
          if (p !== activePiece && !p.locked) {
            p.x = p.homeX;
            p.y = p.homeY;
          }
        });
      } else {
        p.x = p.homeX;
        p.y = p.homeY;
      }
    }

    canvas.addEventListener("pointerup", endPieceDrag);
    canvas.addEventListener("pointercancel", endPieceDrag);

    const diffBtns = container.querySelectorAll(".arc-v161-diff-btn");
    diffBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (window._arcadeStageLockedForVovo || puzSolved || _isVictoryActive) return;
        const val = Number(btn.getAttribute("data-puz-diff")) || 6;
        TronoAudio.play("click");
        if (val === 6) { cols = 2; rows = 3; }
        else if (val === 9) { cols = 3; rows = 3; }
        else { cols = 3; rows = 4; }
        diffBtns.forEach(b => b.classList.toggle("active", b === btn));
        buildPieces();
      });
    });

    drawScene();
    const puzUrl = `./3_ASSETS_QUEBRA_CABECA/quebra_cabeca_${st.seqColor}.jpg?v=161`;
    const cachedPuz = window._arcadePreloadedImages && window._arcadePreloadedImages[puzUrl];
    if (cachedPuz && cachedPuz.complete && cachedPuz.naturalWidth > 0) {
      img = cachedPuz;
      buildPieces();
      startLoop();
      if (typeof window._notifyArcadeVisualReady === "function") {
        window._notifyArcadeVisualReady();
      }
      setTimeout(() => {
        if (typeof window.preloadArcadeLessonVisualAssets === "function") {
          window.preloadArcadeLessonVisualAssets(Number(phase || 1) + 1);
        }
      }, 600);
    } else {
      img.onload = () => {
        window._arcadePreloadedImages = window._arcadePreloadedImages || {};
        window._arcadePreloadedImages[puzUrl] = img;
        buildPieces();
        startLoop();
        if (typeof window._notifyArcadeVisualReady === "function") {
          window._notifyArcadeVisualReady();
        }
        setTimeout(() => {
          if (typeof window.preloadArcadeLessonVisualAssets === "function") {
            window.preloadArcadeLessonVisualAssets(Number(phase || 1) + 1);
          }
        }, 600);
      };
      img.onerror = () => {
        startLoop();
        if (typeof window._notifyArcadeVisualReady === "function") {
          window._notifyArcadeVisualReady();
        }
      };
      img.src = puzUrl;
    }
  }

  // --- JOGO 17: PINTURA MÁGICA ARCADE (LAPIZINHO 3D FLUTUANTE VISÍVEL + BARRA ÚNICA EMBAIXO) ---
  function runPinturaMagicaArcade(container, phase) {
    window._arcadeWaitVisualBeforeVovo = true;
    injectLessonArcadeV161Styles();
    const st = getLessonStoryForPhase(phase);
    window._arcadeActivePaintStory = st;
    if (typeof currentStory !== "undefined") {
      try { currentStory = st; } catch (e) {}
    }

    const palette = (window.PALETTE_COLORS && window.PALETTE_COLORS.length) ? window.PALETTE_COLORS : [
      { name: "Verde Limão Vivo", hex: "#65e717", rgb: [101, 231, 23] },
      { name: "Verde Folha Vivo", hex: "#16c60c", rgb: [22, 198, 12] },
      { name: "Verde Esmeralda", hex: "#00b294", rgb: [0, 178, 148] },
      { name: "Azul Céu Vivo", hex: "#00b4ff", rgb: [0, 180, 255] },
      { name: "Azul Royal Vivo", hex: "#2563eb", rgb: [37, 99, 235] },
      { name: "Amarelo Sol Vivo", hex: "#ffe600", rgb: [255, 230, 0] },
      { name: "Laranja Vivo", hex: "#ff6d00", rgb: [255, 109, 0] },
      { name: "Vermelho Vivo", hex: "#ff1744", rgb: [255, 23, 68] },
      { name: "Rosa Choque Vivo", hex: "#ff2a85", rgb: [255, 42, 133] },
      { name: "Rosa Flor Suave", hex: "#ff80ab", rgb: [255, 128, 171] },
      { name: "Roxo Real Vivo", hex: "#9c27b0", rgb: [156, 39, 176] },
      { name: "Lilás Suave", hex: "#b388ff", rgb: [179, 136, 255] },
      { name: "Dourado Coroa", hex: "#ffb300", rgb: [255, 179, 0] },
      { name: "Pele Clara", hex: "#ffcc99", rgb: [255, 204, 153] },
      { name: "Pele Rosada", hex: "#ffab91", rgb: [255, 171, 145] },
      { name: "Pele Morena", hex: "#c68642", rgb: [198, 134, 66] },
      { name: "Marrom Tronco", hex: "#8d5524", rgb: [141, 85, 36] },
      { name: "Marrom Escuro", hex: "#4e342e", rgb: [78, 52, 46] },
      { name: "Branco Nuvem", hex: "#ffffff", rgb: [255, 255, 255] },
      { name: "Preto Cabelo", hex: "#1e293b", rgb: [30, 41, 59] }
    ];

    let curColor = palette[0];
    let curTool = "bucket"; // 'bucket' (TOQUE) | 'brush' (LÁPIS)
    let localOutlineMask = null;
    let undoStack = [];
    let activePaintPointerId = null;
    let isPointerDown = false;
    let lastTipCanvasPt = null;
    let pencilNormX = 0.52;
    let pencilNormY = 0.48;
    let downClientX = 0;
    let downClientY = 0;
    let prevMoveClientX = 0;
    let prevMoveClientY = 0;
    let didMovePencil = false;
    let activeDragGain = 1.0;
    let baseImg = new Image();
    baseImg.decoding = "async";
    baseImg.fetchPriority = "high";

    function buildPencilSvg(hex) {
      return `
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="47" r="4.5" fill="rgba(255,255,255,0.88)" stroke="#0f172a" stroke-width="1.3"/>
          <circle cx="5" cy="47" r="2.1" fill="${hex}"/>
          <path d="M5 47 L11 33 L19 41 Z" fill="#fde68a" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M5 47 L8.2 39.5 L12.5 43.8 Z" fill="${hex}" stroke="#0f172a" stroke-width="1.1" stroke-linejoin="round"/>
          <path d="M11 33 L35 9 L43 17 L19 41 Z" fill="${hex}" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M13.5 35.5 L37.5 11.5" stroke="rgba(255,255,255,0.48)" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M35 9 L38.5 5.5 L46.5 13.5 L43 17 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M38.5 5.5 L41.5 2.5 C43 1 45.5 1 47 2.5 L49.5 5 C51 6.5 51 9 49.5 10.5 L46.5 13.5 Z" fill="#f472b6" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      `;
    }

    container.innerHTML = `
      <div class="arc-v161-stage">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_17_pintura_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <!-- Faixa compacta superior (divide a linha com o botão OUVIR à direita) -->
        <div class="arc-v161-top-strip">
          <button type="button" id="arcade-btn-paint-finish" class="arc-v161-diff-btn active" style="padding:0 14px; display:inline-flex; align-items:center; gap:5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>PRONTO!</span>
          </button>
        </div>

        <!-- Área central maximizada da folha de pintura + margem tátil inferior para alcançar 100% da borda com o lapizinho -->
        <div id="arcade-paint-stage-wrap" style="position:relative; z-index:5; flex:1; min-height:0; width:100%; max-width:520px; display:flex; align-items:center; justify-content:center; padding:2px 8px 26px 8px; box-sizing:border-box; touch-action:none; cursor:none;">
          <div class="arc-v161-rainbow-card" style="height:100%; max-height:100%; aspect-ratio:9/16; padding:4px; border-radius:16px; display:flex; align-items:center; justify-content:center; background:#ffffff;">
            <canvas id="arcade-paint-canvas" width="540" height="960" style="width:100%; height:100%; border-radius:12px; background:#ffffff; object-fit:contain; display:block; touch-action:none; cursor:none;"></canvas>
          </div>
          <div id="arcade-paint-floating-pencil">${buildPencilSvg(curColor.hex)}</div>
        </div>

        <!-- BARRA ÚNICA DE EDIÇÃO EMBAIXO (6 Ferramentas + 20 Cores no mesmo bloco roxo com margem colorida!) -->
        <div id="arcade-paint-unified-dock" class="arc-v161-rainbow-card" style="z-index:12; width:calc(100% - 12px); max-width:520px; margin:0 6px max(6px, env(safe-area-inset-bottom, 6px)) 6px; padding:7px 8px 8px 8px; border-radius:18px; display:flex; flex-direction:column; gap:6px;">
          <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:4px; width:100%;">
            <button type="button" id="arc-ptool-bucket" class="arc-paint-tool-btn active">TOQUE</button>
            <button type="button" id="arc-ptool-brush" class="arc-paint-tool-btn">LÁPIS</button>
            <button type="button" id="arc-ptool-undo" class="arc-paint-tool-btn">VOLTAR</button>
            <button type="button" id="arc-ptool-auto" class="arc-paint-tool-btn">PINTAR</button>
            <button type="button" id="arc-ptool-clear" class="arc-paint-tool-btn">LIMPAR</button>
            <button type="button" id="arc-ptool-save" class="arc-paint-tool-btn" style="border-color:#38bdf8;">BAIXAR</button>
          </div>
          <div id="arcade-paint-swatches-grid" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; width:100%; align-items:center;">
            ${palette.map((c, i) => `
              <div class="arc-paint-swatch ${i === 0 ? "active" : ""}" data-swatch-idx="${i}" title="${c.name}" style="background:${c.hex};"></div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    const stageWrap = container.querySelector("#arcade-paint-stage-wrap");
    const paintCanvas = container.querySelector("#arcade-paint-canvas");
    const pCtx = paintCanvas.getContext("2d", { willReadFrequently: true });
    const pencilEl = container.querySelector("#arcade-paint-floating-pencil");
    const btnBucket = container.querySelector("#arc-ptool-bucket");
    const btnBrush = container.querySelector("#arc-ptool-brush");
    const btnUndo = container.querySelector("#arc-ptool-undo");
    const btnAuto = container.querySelector("#arc-ptool-auto");
    const btnClear = container.querySelector("#arc-ptool-clear");
    const btnSave = container.querySelector("#arc-ptool-save");
    const btnFinish = container.querySelector("#arcade-btn-paint-finish");

    function refreshPencilColor() {
      if (pencilEl) {
        pencilEl.innerHTML = buildPencilSvg(curColor.hex);
      }
    }

    function pushUndo() {
      if (undoStack.length >= 25) undoStack.shift();
      undoStack.push(pCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height));
    }

    function doUndo() {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      TronoAudio.play("click");
      if (undoStack.length === 0) return;
      const prev = undoStack.pop();
      pCtx.putImageData(prev, 0, 0);
    }

    function restoreCrispOutlines() {
      if (!localOutlineMask) return;
      const imgData = pCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
      const d = imgData.data;
      for (let p = 0, i = 0; p < localOutlineMask.length; p++, i += 4) {
        if (localOutlineMask[p] === 1) {
          d[i] = 18; d[i + 1] = 24; d[i + 2] = 38; d[i + 3] = 255;
        }
      }
      pCtx.putImageData(imgData, 0, 0);
    }

    function resetDrawing(recordHistory) {
      if (recordHistory) {
        TronoAudio.play("click");
        pushUndo();
      }
      pCtx.fillStyle = "#ffffff";
      pCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
      if (!baseImg.complete || !baseImg.naturalWidth) return;
      pCtx.drawImage(baseImg, 0, 0, paintCanvas.width, paintCanvas.height);

      const imgData = pCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
      const d = imgData.data;
      localOutlineMask = new Uint8Array(paintCanvas.width * paintCanvas.height);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        if (lum < 128) {
          localOutlineMask[p] = 1;
          d[i] = 18; d[i + 1] = 24; d[i + 2] = 38; d[i + 3] = 255;
        } else {
          localOutlineMask[p] = 0;
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = 255;
        }
      }
      pCtx.putImageData(imgData, 0, 0);

      // Posiciona o lapizinho visível estacionado no centro da folha (só pinta quando a criança der o cliquezinho/aperto!)
      setTimeout(() => {
        if (!paintCanvas.isConnected || !pencilEl) return;
        syncParkedPencilTip();
      }, 60);
    }

    function getPaperMetrics() {
      const rect = paintCanvas.getBoundingClientRect();
      const cw = paintCanvas.width, ch = paintCanvas.height;
      const scale = Math.min(rect.width / cw, rect.height / ch) || 1;
      const paperW = cw * scale;
      const paperH = ch * scale;
      const paperLeft = rect.left + (rect.width - paperW) / 2;
      const paperTop = rect.top + (rect.height - paperH) / 2;
      return { cw, ch, scale, paperW, paperH, paperLeft, paperTop };
    }

    function syncParkedPencilTip() {
      const m = getPaperMetrics();
      if (m.paperW <= 4 || m.paperH <= 4) {
        return {
          x: Math.max(0, Math.min(m.cw - 1, Math.floor(pencilNormX * m.cw))),
          y: Math.max(0, Math.min(m.ch - 1, Math.floor(pencilNormY * m.ch))),
          tipClientX: 0,
          tipClientY: 0,
          paperW: m.paperW,
          paperH: m.paperH
        };
      }
      pencilNormX = Math.max(0.004, Math.min(0.996, pencilNormX));
      pencilNormY = Math.max(0.004, Math.min(0.996, pencilNormY));
      const tipClientX = m.paperLeft + pencilNormX * m.paperW;
      const tipClientY = m.paperTop + pencilNormY * m.paperH;

      if (pencilEl) {
        pencilEl.style.left = `${tipClientX}px`;
        pencilEl.style.top = `${tipClientY}px`;
        pencilEl.classList.add("pencil-visible");
      }

      const cx = Math.max(0, Math.min(m.cw - 1, Math.floor(pencilNormX * m.cw)));
      const cy = Math.max(0, Math.min(m.ch - 1, Math.floor(pencilNormY * m.ch)));
      return { x: cx, y: cy, tipClientX, tipClientY, paperW: m.paperW, paperH: m.paperH };
    }

    // Calcula a coordenada exata da PONTINHA DO LÁPIS no modo LÁPIS livre ou hover de mouse desktop
    function computePencilTipCoords(ev) {
      const m = getPaperMetrics();
      const isTouchLike = ev.pointerType !== "mouse";
      const rawTipX = ev.clientX - (isTouchLike ? 6 : 0);
      const rawTipY = ev.clientY - (isTouchLike ? 34 : 0);

      const tipClientX = Math.max(m.paperLeft + 1, Math.min(m.paperLeft + m.paperW - 2, rawTipX));
      const tipClientY = Math.max(m.paperTop + 1, Math.min(m.paperTop + m.paperH - 2, rawTipY));

      if (m.paperW > 4 && m.paperH > 4) {
        pencilNormX = Math.max(0.004, Math.min(0.996, (tipClientX - m.paperLeft) / m.paperW));
        pencilNormY = Math.max(0.004, Math.min(0.996, (tipClientY - m.paperTop) / m.paperH));
      }

      if (pencilEl) {
        pencilEl.style.left = `${tipClientX}px`;
        pencilEl.style.top = `${tipClientY}px`;
        pencilEl.classList.add("pencil-visible");
      }

      const cx = Math.max(0, Math.min(m.cw - 1, Math.floor((tipClientX - m.paperLeft) / m.scale)));
      const cy = Math.max(0, Math.min(m.ch - 1, Math.floor((tipClientY - m.paperTop) / m.scale)));
      return { x: cx, y: cy };
    }

    function findExactTipSeed(tx, ty, w, h) {
      const directPos = ty * w + tx;
      if (!localOutlineMask || localOutlineMask[directPos] === 0) {
        return directPos;
      }
      let bestPos = directPos;
      let bestDist = 99;
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const nx = tx + dx, ny = ty + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const np = ny * w + nx;
          if (localOutlineMask[np] === 1) continue;
          const d = Math.hypot(dx, dy);
          if (d < bestDist) {
            bestDist = d;
            bestPos = np;
          }
        }
      }
      return bestPos;
    }

    function floodFillAtTip(tx, ty, fillRgb) {
      const w = paintCanvas.width, h = paintCanvas.height;
      const startPos = findExactTipSeed(tx, ty, w, h);
      if (localOutlineMask && localOutlineMask[startPos] === 1) return;

      const imgData = pCtx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const sIdx = startPos * 4;
      const tr = d[sIdx], tg = d[sIdx + 1], tb = d[sIdx + 2];
      if (tr === fillRgb[0] && tg === fillRgb[1] && tb === fillRgb[2]) return;

      pushUndo();
      const visited = new Uint8Array(w * h);
      const stack = [startPos];
      visited[startPos] = 1;

      while (stack.length > 0) {
        const p = stack.pop();
        const idx = p * 4;
        d[idx] = fillRgb[0];
        d[idx + 1] = fillRgb[1];
        d[idx + 2] = fillRgb[2];
        d[idx + 3] = 255;

        const x = p % w, y = (p - x) / w;
        if (x > 0) {
          const np = p - 1;
          if (!visited[np] && (!localOutlineMask || localOutlineMask[np] === 0)) {
            const ni = np * 4;
            if (Math.abs(d[ni] - tr) <= 28 && Math.abs(d[ni + 1] - tg) <= 28 && Math.abs(d[ni + 2] - tb) <= 28) {
              visited[np] = 1; stack.push(np);
            }
          }
        }
        if (x < w - 1) {
          const np = p + 1;
          if (!visited[np] && (!localOutlineMask || localOutlineMask[np] === 0)) {
            const ni = np * 4;
            if (Math.abs(d[ni] - tr) <= 28 && Math.abs(d[ni + 1] - tg) <= 28 && Math.abs(d[ni + 2] - tb) <= 28) {
              visited[np] = 1; stack.push(np);
            }
          }
        }
        if (y > 0) {
          const np = p - w;
          if (!visited[np] && (!localOutlineMask || localOutlineMask[np] === 0)) {
            const ni = np * 4;
            if (Math.abs(d[ni] - tr) <= 28 && Math.abs(d[ni + 1] - tg) <= 28 && Math.abs(d[ni + 2] - tb) <= 28) {
              visited[np] = 1; stack.push(np);
            }
          }
        }
        if (y < h - 1) {
          const np = p + w;
          if (!visited[np] && (!localOutlineMask || localOutlineMask[np] === 0)) {
            const ni = np * 4;
            if (Math.abs(d[ni] - tr) <= 28 && Math.abs(d[ni + 1] - tg) <= 28 && Math.abs(d[ni + 2] - tb) <= 28) {
              visited[np] = 1; stack.push(np);
            }
          }
        }
      }
      pCtx.putImageData(imgData, 0, 0);
    }

    function drawPencilStroke(p1, p2) {
      pCtx.strokeStyle = curColor.hex;
      pCtx.lineWidth = 4.5;
      pCtx.lineCap = "round";
      pCtx.lineJoin = "round";
      pCtx.beginPath();
      pCtx.moveTo(p1.x, p1.y);
      pCtx.lineTo(p2.x, p2.y);
      pCtx.stroke();
    }

    function autoPaintDrawing() {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      TronoAudio.play("success");
      pushUndo();
      const w = paintCanvas.width, h = paintCanvas.height;
      if (!localOutlineMask) resetDrawing(false);
      const imgData = pCtx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const visited = new Uint8Array(w * h);
      const flowerPalettes = [
        [244, 114, 182],
        [251, 113, 133],
        [56, 189, 248],
        [192, 132, 252],
        [250, 204, 21]
      ];
      const seqPaint = st ? String(st.seqPaint || "19") : "19";

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const startP = y * w + x;
          if (visited[startP] || localOutlineMask[startP] === 1) continue;
          const reg = [];
          const stack = [startP];
          visited[startP] = 1;
          let minX = x, maxX = x, minY = y, maxY = y;
          while (stack.length > 0) {
            const p = stack.pop();
            reg.push(p);
            const px = p % w, py = (p - px) / w;
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
            if (px > 0 && !visited[p - 1] && localOutlineMask[p - 1] === 0) { visited[p - 1] = 1; stack.push(p - 1); }
            if (px < w - 1 && !visited[p + 1] && localOutlineMask[p + 1] === 0) { visited[p + 1] = 1; stack.push(p + 1); }
            if (py > 0 && !visited[p - w] && localOutlineMask[p - w] === 0) { visited[p - w] = 1; stack.push(p - w); }
            if (py < h - 1 && !visited[p + w] && localOutlineMask[p + w] === 0) { visited[p + w] = 1; stack.push(p + w); }
          }
          const area = reg.length;
          const nx = ((minX + maxX) / 2) / w;
          const ny = ((minY + maxY) / 2) / h;
          const nrw = (maxX - minX) / w;
          const nrh = (maxY - minY) / h;
          const nMinY = minY / h;
          const nMaxY = maxY / h;
          let rgb;

          if (area < 55) {
            rgb = [255, 255, 255];
          } else if (nMinY < 0.03 && area > 12000) {
            rgb = [186, 230, 253];
          } else if (ny < 0.30 && area >= 70 && area < 14000 && ((seqPaint === "20" && nx < 0.46) || nx > 0.56)) {
            rgb = [253, 224, 71];
          } else if (ny < 0.36 && nrw > nrh * 1.15 && area > 650 && area < 18000 && nx < 0.75) {
            rgb = [248, 250, 252];
          } else if (nMaxY > 0.95 && area > 8000) {
            rgb = (seqPaint === "21" || seqPaint === "23") ? [56, 189, 248] : [134, 239, 172];
          } else if (ny > 0.80 && area < 900) {
            const cId = Math.floor(nx * 9) + Math.floor(ny * 9) * 3;
            rgb = flowerPalettes[Math.abs(cId) % flowerPalettes.length];
          } else if (ny > 0.22 && ny < 0.54 && nrw > nrh * 0.8 && area > 800 && area < 5500) {
            rgb = [120, 53, 15];
          } else if (ny > 0.25 && ny < 0.78 && area >= 95 && area < 4800 && Math.abs(nrw - nrh) < 0.09) {
            rgb = [255, 204, 153];
          } else {
            const tunicCols = [[56, 189, 248], [244, 114, 182], [250, 204, 21], [52, 211, 153], [192, 132, 252], [217, 155, 82]];
            const tIdx = Math.abs(Math.floor(nx * 5) + Math.floor(ny * 4)) % tunicCols.length;
            rgb = tunicCols[tIdx];
          }

          for (let i = 0; i < reg.length; i++) {
            const idx = reg[i] * 4;
            d[idx] = rgb[0]; d[idx + 1] = rgb[1]; d[idx + 2] = rgb[2]; d[idx + 3] = 255;
          }
        }
      }
      pCtx.putImageData(imgData, 0, 0);
    }

    stageWrap.addEventListener("touchstart", (ev) => {
      if (!window._arcadeStageLockedForVovo) ev.preventDefault();
    }, { passive: false });
    stageWrap.addEventListener("touchmove", (ev) => {
      if (isPointerDown) ev.preventDefault();
    }, { passive: false });

    stageWrap.addEventListener("pointerdown", (ev) => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      if (isPointerDown && activePaintPointerId !== null && ev.pointerId !== activePaintPointerId) return;
      ev.preventDefault();
      isPointerDown = true;
      activePaintPointerId = ev.pointerId;
      downClientX = ev.clientX;
      downClientY = ev.clientY;
      prevMoveClientX = ev.clientX;
      prevMoveClientY = ev.clientY;
      didMovePencil = false;
      try { stageWrap.setPointerCapture(ev.pointerId); } catch (e) {}

      if (curTool === "brush") {
        const pt = computePencilTipCoords(ev);
        lastTipCanvasPt = pt;
        pushUndo();
        drawPencilStroke(pt, pt);
      } else {
        // Modo TOQUE com Trava Pedagógica:
        // Se for mouse desktop, sincroniza onde o ponteiro está; no touch/tablet, NÃO move o lápis nem pinta no pointerdown!
        if (ev.pointerType === "mouse") {
          computePencilTipCoords(ev);
          activeDragGain = 1.0;
        } else {
          const cur = syncParkedPencilTip();
          const distToPencilBody = Math.hypot(ev.clientX - (cur.tipClientX + 18), ev.clientY - (cur.tipClientY - 20));
          activeDragGain = distToPencilBody <= 76 ? 1.0 : 1.22;
        }
      }
    });

    stageWrap.addEventListener("pointermove", (ev) => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      if (ev.pointerType === "mouse" && !isPointerDown) {
        computePencilTipCoords(ev);
        return;
      }
      if (!isPointerDown) return;
      if (activePaintPointerId !== null && ev.pointerId !== activePaintPointerId) return;
      ev.preventDefault();

      if (curTool === "brush") {
        const pt = computePencilTipCoords(ev);
        drawPencilStroke(lastTipCanvasPt || pt, pt);
        lastTipCanvasPt = pt;
        return;
      }

      // Modo TOQUE: arrastar (>= 7px) APENAS posiciona a pontinha do lápis sem pintar!
      const totalDist = Math.hypot(ev.clientX - downClientX, ev.clientY - downClientY);
      if (!didMovePencil) {
        if (totalDist < 7) {
          // Zona morta de aperto/cliquezinho: mantém a pontinha 100% parada no alvo!
          return;
        }
        didMovePencil = true;
        prevMoveClientX = ev.clientX;
        prevMoveClientY = ev.clientY;
      }

      const m = getPaperMetrics();
      if (m.paperW > 4 && m.paperH > 4) {
        const dx = (ev.clientX - prevMoveClientX) * activeDragGain;
        const dy = (ev.clientY - prevMoveClientY) * activeDragGain;
        prevMoveClientX = ev.clientX;
        prevMoveClientY = ev.clientY;
        pencilNormX = Math.max(0.004, Math.min(0.996, pencilNormX + dx / m.paperW));
        pencilNormY = Math.max(0.004, Math.min(0.996, pencilNormY + dy / m.paperH));
        syncParkedPencilTip();
      }
    });

    function finishPaintPointer(ev, cancelled) {
      if (!isPointerDown) return;
      if (ev && activePaintPointerId !== null && typeof ev.pointerId === "number" && ev.pointerId !== activePaintPointerId) return;
      isPointerDown = false;
      activePaintPointerId = null;
      if (ev && typeof ev.pointerId === "number") {
        try { stageWrap.releasePointerCapture(ev.pointerId); } catch (e) {}
      }

      if (curTool === "brush") {
        lastTipCanvasPt = null;
        restoreCrispOutlines();
        return;
      }

      // TRAVA SUPREMA DO LÁPIS NO MODO TOQUE:
      // 1) Se a criança ARRASTOU (didMovePencil === true), ela só posicionou o lápis -> NÃO PINTA AO PARAR!
      // 2) Só pinta quando a criança der um CLIQUEZINHO / APERTO (didMovePencil === false) em cima do lápis ou na tela!
      if (!cancelled && !didMovePencil) {
        const tipPt = syncParkedPencilTip();
        TronoAudio.play("click");
        floodFillAtTip(tipPt.x, tipPt.y, curColor.rgb);
        if (pencilEl) {
          pencilEl.classList.remove("pencil-tap-pop");
          void pencilEl.offsetWidth;
          pencilEl.classList.add("pencil-tap-pop");
        }
      }
      didMovePencil = false;
    }

    stageWrap.addEventListener("pointerup", (ev) => finishPaintPointer(ev, false));
    stageWrap.addEventListener("pointercancel", (ev) => finishPaintPointer(ev, true));

    btnBucket.addEventListener("click", () => {
      if (window._arcadeStageLockedForVovo) return;
      TronoAudio.play("click");
      curTool = "bucket";
      btnBucket.classList.add("active");
      btnBrush.classList.remove("active");
    });

    btnBrush.addEventListener("click", () => {
      if (window._arcadeStageLockedForVovo) return;
      TronoAudio.play("click");
      curTool = "brush";
      btnBrush.classList.add("active");
      btnBucket.classList.remove("active");
    });

    btnUndo.addEventListener("click", doUndo);
    btnAuto.addEventListener("click", autoPaintDrawing);
    btnClear.addEventListener("click", () => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      resetDrawing(true);
    });
    btnSave.addEventListener("click", () => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      if (typeof window.onPaintDownloadOrPrintClick === "function") {
        window.onPaintDownloadOrPrintClick();
      }
    });

    btnFinish.addEventListener("click", () => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive) return;
      if (_arcadeCustomBackScreen === "screen-gallery" && st && st.id && typeof completedPaints !== "undefined") {
        try {
          completedPaints.add(st.id);
          if (typeof saveGameProgressSets === "function") saveGameProgressSets();
        } catch (e) {}
      }
      triggerArcadeVictory();
    });

    const swatchEls = container.querySelectorAll(".arc-paint-swatch");
    swatchEls.forEach(sw => {
      sw.addEventListener("click", () => {
        if (window._arcadeStageLockedForVovo) return;
        const idx = Number(sw.getAttribute("data-swatch-idx")) || 0;
        curColor = palette[idx] || palette[0];
        TronoAudio.play("click");
        swatchEls.forEach(el => el.classList.toggle("active", el === sw));
        refreshPencilColor();
      });
    });

    if (window._arcadePaintKeyHandler) {
      window.removeEventListener("keydown", window._arcadePaintKeyHandler);
    }
    window._arcadePaintKeyHandler = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === "z" || ev.key === "Z")) {
        ev.preventDefault();
        doUndo();
      }
    };
    window.addEventListener("keydown", window._arcadePaintKeyHandler);

    if (window._arcadePaintResizeHandler) {
      window.removeEventListener("resize", window._arcadePaintResizeHandler);
    }
    window._arcadePaintResizeHandler = () => {
      if (paintCanvas && paintCanvas.isConnected) {
        syncParkedPencilTip();
      }
    };
    window.addEventListener("resize", window._arcadePaintResizeHandler);

    function drawPaintingLoadingPlaceholder() {
      if (pencilEl) {
        pencilEl.classList.remove("pencil-visible");
      }
      pCtx.fillStyle = "#ffffff";
      pCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
      pCtx.save();
      pCtx.fillStyle = "rgba(88, 28, 135, 0.92)";
      pCtx.strokeStyle = "#fde047";
      pCtx.lineWidth = 4;
      pCtx.beginPath();
      pCtx.roundRect(70, 420, 400, 120, 24);
      pCtx.fill();
      pCtx.stroke();
      pCtx.font = "900 24px Fredoka, sans-serif";
      pCtx.textAlign = "center";
      pCtx.fillStyle = "#fde047";
      pCtx.fillText("Preparando o desenho...", paintCanvas.width / 2, 474);
      pCtx.font = "800 18px Fredoka, sans-serif";
      pCtx.fillStyle = "#ffffff";
      pCtx.fillText(st && st.title ? st.title : "Só um instante!", paintCanvas.width / 2, 512, 368);
      pCtx.restore();
    }

    const paintUrl = (window.PINTURAS_B64 && window.PINTURAS_B64[st.seqPaint])
      ? window.PINTURAS_B64[st.seqPaint]
      : `./4_ASSETS_PINTURA/pintura_contorno_${st.seqPaint}.jpg?v=164`;
    const cachedPaint = (!paintUrl.startsWith("data:") && window._arcadePreloadedImages)
      ? window._arcadePreloadedImages[paintUrl]
      : null;

    if (cachedPaint && cachedPaint.complete && cachedPaint.naturalWidth > 0) {
      baseImg = cachedPaint;
      undoStack = [];
      resetDrawing(false);
      if (typeof window._notifyArcadeVisualReady === "function") {
        window._notifyArcadeVisualReady();
      }
      setTimeout(() => {
        if (typeof window.preloadArcadeLessonVisualAssets === "function") {
          window.preloadArcadeLessonVisualAssets(Number(phase || 1) + 1);
        }
      }, 600);
    } else {
      drawPaintingLoadingPlaceholder();
      baseImg.onload = () => {
        if (!paintUrl.startsWith("data:")) {
          window._arcadePreloadedImages = window._arcadePreloadedImages || {};
          window._arcadePreloadedImages[paintUrl] = baseImg;
        }
        undoStack = [];
        resetDrawing(false);
        if (typeof window._notifyArcadeVisualReady === "function") {
          window._notifyArcadeVisualReady();
        }
        setTimeout(() => {
          if (typeof window.preloadArcadeLessonVisualAssets === "function") {
            window.preloadArcadeLessonVisualAssets(Number(phase || 1) + 1);
          }
        }, 600);
      };
      baseImg.onerror = () => {
        if (typeof window._notifyArcadeVisualReady === "function") {
          window._notifyArcadeVisualReady();
        }
      };
      baseImg.src = paintUrl;
    }
  }

  // --- GERADOR 8x8 DIVERSIFICADO DO CAÇA-PALAVRAS (HORIZONTAL + VERTICAL EM TODAS AS 8 LINHAS 0..7!) ---
  function buildDiversifiedWordSearch8x8(rawWords) {
    const size = 8;
    const cleaned = [];
    (rawWords || []).forEach(w => {
      const s = String(w || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .slice(0, size);
      if (s.length >= 2 && !cleaned.includes(s)) cleaned.push(s);
    });
    const words = cleaned.length > 0 ? cleaned.slice(0, 6) : ["CRIACAO", "LUZ", "TERRA", "EDEN", "ADAO"];
    const byLen = [...words].sort((a, b) => b.length - a.length);

    function shuffleArr(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr;
    }

    let bestResult = null;
    let bestScore = -1;

    for (let attempt = 0; attempt < 90; attempt++) {
      const grid = Array.from({ length: size }, () => Array(size).fill(""));
      const placements = {};
      const dirsMap = {};
      let okAll = true;

      // Garante mistura equilibrada de palavras Horizontais e Verticais!
      const dirPlan = byLen.map((_, idx) => ((idx + (attempt % 2)) % 2 === 0 ? "H" : "V"));
      shuffleArr(dirPlan);

      for (let wi = 0; wi < byLen.length; wi++) {
        const w = byLen[wi];
        const prefDir = dirPlan[wi];
        const tryDirs = prefDir === "H" ? ["H", "V"] : ["V", "H"];
        let placed = false;

        for (let di = 0; di < tryDirs.length && !placed; di++) {
          const dir = tryDirs[di];
          const candidates = [];
          if (dir === "H") {
            for (let r = 0; r < size; r++) {
              for (let c = 0; c <= size - w.length; c++) {
                candidates.push({ r, c, boost: r >= 5 ? 2 : 0 });
              }
            }
          } else {
            for (let r = 0; r <= size - w.length; r++) {
              for (let c = 0; c < size; c++) {
                const reachesBottom = (r + w.length - 1) >= 5;
                candidates.push({ r, c, boost: reachesBottom ? 2 : 0 });
              }
            }
          }
          shuffleArr(candidates);
          // Prioriza ocupar também as linhas inferiores (5, 6 e 7) para nunca ficar vazio embaixo!
          if (wi <= 1) {
            candidates.sort((a, b) => b.boost - a.boost);
          }

          for (let ci = 0; ci < candidates.length; ci++) {
            const { r, c } = candidates[ci];
            const dr = dir === "V" ? 1 : 0;
            const dc = dir === "H" ? 1 : 0;
            let fits = true;
            let newCells = 0;
            for (let k = 0; k < w.length; k++) {
              const nr = r + k * dr;
              const nc = c + k * dc;
              const ch = grid[nr][nc];
              if (ch !== "" && ch !== w[k]) {
                fits = false;
                break;
              }
              if (ch === "") newCells++;
            }
            if (fits && newCells >= Math.min(2, w.length)) {
              const coords = [];
              for (let k = 0; k < w.length; k++) {
                const nr = r + k * dr;
                const nc = c + k * dc;
                grid[nr][nc] = w[k];
                coords.push(`${nr}-${nc}`);
              }
              placements[w] = coords;
              dirsMap[w] = dir;
              placed = true;
              break;
            }
          }
        }

        if (!placed) {
          okAll = false;
          break;
        }
      }

      if (okAll) {
        let hCount = 0, vCount = 0;
        const rowsUsed = new Set();
        const colsUsed = new Set();
        const bottomRowsUsed = new Set();
        Object.keys(placements).forEach(w => {
          if (dirsMap[w] === "H") hCount++; else vCount++;
          placements[w].forEach(cid => {
            const [rr, cc] = cid.split("-").map(Number);
            rowsUsed.add(rr);
            colsUsed.add(cc);
            if (rr >= 5) bottomRowsUsed.add(rr);
          });
        });
        const mixedBonus = (hCount >= 1 && vCount >= 1) ? 50 : 0;
        const extraMix = (hCount >= 2 && vCount >= 2) ? 30 : 0;
        const score = mixedBonus + extraMix + (bottomRowsUsed.size * 18) + (rowsUsed.size * 4) + (colsUsed.size * 3);
        if (score > bestScore) {
          bestScore = score;
          bestResult = { grid, placements, dirsMap, words };
          if (hCount >= 2 && vCount >= 2 && bottomRowsUsed.size >= 2 && rowsUsed.size >= 6) {
            break;
          }
        }
      }
    }

    if (!bestResult) {
      const grid = Array.from({ length: size }, () => Array(size).fill(""));
      const placements = {};
      const dirsMap = {};
      const rowOrder = [0, 7, 2, 5, 4, 6];
      words.forEach((w, idx) => {
        const r = rowOrder[idx % rowOrder.length];
        const startCol = Math.max(0, Math.min(size - w.length, (idx * 2) % Math.max(1, size - w.length + 1)));
        placements[w] = [];
        dirsMap[w] = "H";
        for (let k = 0; k < w.length; k++) {
          grid[r][startCol + k] = w[k];
          placements[w].push(`${r}-${startCol + k}`);
        }
      });
      bestResult = { grid, placements, dirsMap, words };
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!bestResult.grid[r][c]) {
          bestResult.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    return bestResult;
  }
  window._buildDiversifiedWordSearch8x8 = buildDiversifiedWordSearch8x8;

  // --- JOGO 19: CAÇA-PALAVRAS BÍBLICO EM TELA CHEIA (22 LIÇÕES • HORIZONTAL + VERTICAL • LINHAS 0 A 7) ---
  function runCacaPalavrasArcade(container, phase) {
    injectLessonArcadeV161Styles();
    const wk = ((Math.max(1, Math.floor(Number(phase) || 1)) - 1) % 22) + 1;
    const bank = window.WORD_SEARCH_LEVELS || [];
    const pack = bank.find(it => Number(it.lessonWeek) === wk) || bank[(wk - 1) % Math.max(1, bank.length)] || {
      words: ["CRIACAO", "LUZ", "TERRA", "EDEN", "ADAO"]
    };

    const puzzle = buildDiversifiedWordSearch8x8(pack.words);
    const { grid, placements, words } = puzzle;
    const foundWords = new Set();
    const tappedLitCells = new Set();

    let cellsHtml = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cid = `${r}-${c}`;
        cellsHtml += `<div class="arc-ws-cell" data-ws-cid="${cid}">${grid[r][c]}</div>`;
      }
    }

    container.innerHTML = `
      <div class="arc-v161-stage" style="padding:44px 10px 14px 10px; justify-content:space-evenly;">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_19_cacapalavras_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <!-- Grade 8x8 limpa solta no topo -->
        <div id="arcade-ws-board" class="arc-v161-rainbow-card" style="z-index:5; width:100%; max-width:400px; padding:8px; border-radius:20px; display:grid; grid-template-columns:repeat(8, 1fr); gap:5px; touch-action:none;">
          ${cellsHtml}
        </div>

        <!-- Palavras soltas embaixo (pílulas 3D sem bloco externo) -->
        <div id="arcade-ws-pills" style="position:relative; z-index:5; width:100%; max-width:420px; display:flex; flex-wrap:wrap; justify-content:center; gap:8px; padding:4px 2px;"></div>
      </div>
    `;

    const boardEl = container.querySelector("#arcade-ws-board");
    const pillsEl = container.querySelector("#arcade-ws-pills");
    const cellMap = {};
    boardEl.querySelectorAll(".arc-ws-cell").forEach(el => {
      cellMap[el.getAttribute("data-ws-cid")] = el;
    });

    function renderWordPills() {
      pillsEl.innerHTML = words.map(w => {
        const isFound = foundWords.has(w);
        return `
          <div class="arc-v161-rainbow-card" style="padding:7px 15px; border-radius:999px; ${isFound ? "background:linear-gradient(180deg, #00e676 0%, #00c853 100%);" : ""} display:inline-flex; align-items:center; gap:6px;">
            ${isFound ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}
            <span style="font-family:'Fredoka',sans-serif; font-size:clamp(14px, 3.8vw, 17px); font-weight:900; color:#ffffff; letter-spacing:0.6px; text-shadow:0 2px 4px rgba(0,0,0,0.75);">${w}</span>
          </div>
        `;
      }).join("");
    }
    renderWordPills();

    function markWordFound(w, customCoords) {
      if (foundWords.has(w)) return;
      foundWords.add(w);
      TronoAudio.play("coin");
      const coords = customCoords || placements[w] || [];
      coords.forEach(cid => {
        const el = cellMap[cid];
        if (el) {
          el.classList.remove("ws-tap-lit", "ws-swipe-preview");
          el.classList.add("ws-found");
        }
      });
      renderWordPills();

      if (foundWords.size >= words.length) {
        TronoAudio.play("success");
        if (window._arcadeWordSearchWinTimer) clearTimeout(window._arcadeWordSearchWinTimer);
        window._arcadeWordSearchWinTimer = setTimeout(() => {
          window._arcadeWordSearchWinTimer = null;
          triggerArcadeVictory();
        }, 780);
      }
    }

    function clearSwipePreview() {
      Object.values(cellMap).forEach(el => el.classList.remove("ws-swipe-preview"));
    }

    function checkLineMatch(lineCoords) {
      if (!lineCoords || lineCoords.length < 2) return false;
      const forwardStr = lineCoords.map(cid => {
        const [r, c] = cid.split("-").map(Number);
        return grid[r][c];
      }).join("");
      const reverseStr = forwardStr.split("").reverse().join("");

      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (foundWords.has(w)) continue;
        if (forwardStr === w || reverseStr === w) {
          markWordFound(w, lineCoords);
          return true;
        }
      }
      return false;
    }

    function cellFromClientXY(clientX, clientY) {
      const rect = boardEl.getBoundingClientRect();
      if (clientX < rect.left - 8 || clientX > rect.right + 8 || clientY < rect.top - 8 || clientY > rect.bottom + 8) {
        return null;
      }
      const c = Math.max(0, Math.min(7, Math.floor(((clientX - rect.left) / rect.width) * 8)));
      const r = Math.max(0, Math.min(7, Math.floor(((clientY - rect.top) / rect.height) * 8)));
      return { r, c };
    }

    let swipeStart = null;
    let swipePointerId = null;
    let currentLineCoords = [];
    let maxLineSeen = 0;

    boardEl.addEventListener("pointerdown", (ev) => {
      if (window._arcadeStageLockedForVovo || _isVictoryActive || foundWords.size >= words.length) return;
      if (swipeStart && swipePointerId !== null && ev.pointerId !== swipePointerId) return;
      const cell = cellFromClientXY(ev.clientX, ev.clientY);
      if (!cell) return;
      ev.preventDefault();
      swipeStart = cell;
      swipePointerId = ev.pointerId;
      currentLineCoords = [`${cell.r}-${cell.c}`];
      maxLineSeen = 1;
      clearSwipePreview();
      const startEl = cellMap[`${cell.r}-${cell.c}`];
      if (startEl) startEl.classList.add("ws-swipe-preview");
      try { boardEl.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    boardEl.addEventListener("pointermove", (ev) => {
      if (!swipeStart) return;
      if (swipePointerId !== null && ev.pointerId !== swipePointerId) return;
      ev.preventDefault();
      const cur = cellFromClientXY(ev.clientX, ev.clientY);
      if (!cur) return;

      const dr = cur.r - swipeStart.r;
      const dc = cur.c - swipeStart.c;
      const line = [];
      if (Math.abs(dc) >= Math.abs(dr)) {
        const step = dc >= 0 ? 1 : -1;
        const steps = Math.abs(dc);
        for (let k = 0; k <= steps; k++) line.push(`${swipeStart.r}-${swipeStart.c + k * step}`);
      } else {
        const step = dr >= 0 ? 1 : -1;
        const steps = Math.abs(dr);
        for (let k = 0; k <= steps; k++) line.push(`${swipeStart.r + k * step}-${swipeStart.c}`);
      }
      currentLineCoords = line;
      if (line.length > maxLineSeen) maxLineSeen = line.length;
      clearSwipePreview();
      line.forEach(cid => {
        if (cellMap[cid]) cellMap[cid].classList.add("ws-swipe-preview");
      });

      if (checkLineMatch(line)) {
        clearSwipePreview();
        swipeStart = null;
        swipePointerId = null;
      }
    });

    function finishSwipeOrTap(ev) {
      if (!swipeStart) return;
      if (ev && swipePointerId !== null && typeof ev.pointerId === "number" && ev.pointerId !== swipePointerId) return;
      const startCid = `${swipeStart.r}-${swipeStart.c}`;
      const line = [...currentLineCoords];
      const wasSingleTap = maxLineSeen <= 1;
      swipeStart = null;
      swipePointerId = null;
      currentLineCoords = [];
      clearSwipePreview();

      if (!wasSingleTap && checkLineMatch(line)) return;

      if (wasSingleTap) {
        let belongsToUnfound = false;
        words.forEach(w => {
          if (foundWords.has(w)) return;
          const coords = placements[w] || [];
          if (coords.includes(startCid)) belongsToUnfound = true;
        });

        const tappedEl = cellMap[startCid];
        if (belongsToUnfound) {
          tappedLitCells.add(startCid);
          if (tappedEl && !tappedEl.classList.contains("ws-found")) {
            tappedEl.classList.add("ws-tap-lit");
          }
          TronoAudio.play("click");

          words.forEach(w => {
            if (foundWords.has(w)) return;
            const coords = placements[w] || [];
            if (coords.length > 0 && coords.every(cid => tappedLitCells.has(cid) || (cellMap[cid] && cellMap[cid].classList.contains("ws-found")))) {
              markWordFound(w, coords);
            }
          });
        } else if (tappedEl && !tappedEl.classList.contains("ws-found")) {
          TronoAudio.play("error");
          tappedEl.classList.remove("arc-shake-err");
          void tappedEl.offsetWidth;
          tappedEl.classList.add("arc-shake-err");
        }
      }
    }

    boardEl.addEventListener("pointerup", finishSwipeOrTap);
    boardEl.addEventListener("pointercancel", finishSwipeOrTap);
  }

  // --- JOGO 20: PALAVRA SECRETA EM TELA CHEIA (22 LIÇÕES • PISTA ROXA + LETRINHAS 3D SOLTAS) ---
  function runPalavraSecretaArcade(container, phase) {
    injectLessonArcadeV161Styles();
    const wk = ((Math.max(1, Math.floor(Number(phase) || 1)) - 1) % 22) + 1;
    const bank = window.SECRET_WORD_BANK || [];
    const item = bank.find(it => Number(it.lessonWeek) === wk) || bank[(wk - 1) % Math.max(1, bank.length)] || {
      word: "CRIACAO",
      hint: "Tudo o que Deus fez no princípio: a luz, o céu, a terra, os animais e o ser humano!"
    };

    const cleanWord = String(item.word || "CRIACAO")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase();
    const cleanHint = stripLessonPrefixText(item.hint || "");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const guessed = new Set();
    let errors = 0;
    const maxErrors = 6;
    let solved = false;

    container.innerHTML = `
      <div class="arc-v161-stage" style="padding:44px 10px 14px 10px; justify-content:space-evenly;">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_20_palavrasecreta_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <!-- Card Roxo Superior com Margem Colorida e Pista Bíblica (Toque para ouvir a pista do Vovô novamente!) -->
        <div id="arcade-sw-hint-card" class="arc-v161-rainbow-card" style="z-index:5; width:100%; max-width:430px; padding:14px 15px; text-align:center; cursor:pointer;" title="Toque para ouvir a pista do Vovô">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;">
            <span style="background:rgba(15,23,42,0.88); color:#fde047; font-family:'Fredoka',sans-serif; font-size:11.5px; font-weight:900; padding:3px 10px; border-radius:999px; border:1.5px solid #fde047;">PISTA DA BÍBLIA</span>
            <span id="arcade-sw-chances" style="background:linear-gradient(180deg, #0284c7 0%, #0369a1 100%); color:#ffffff; font-family:'Fredoka',sans-serif; font-size:11.5px; font-weight:900; padding:3px 10px; border-radius:999px; border:1.5px solid #ffffff;">CHANCES: 6 / 6</span>
          </div>
          <div id="arcade-sw-hint-text" style="font-family:'Fredoka',sans-serif; font-size:clamp(15px, 4vw, 18.5px); font-weight:800; color:#ffffff; line-height:1.32; text-shadow:0 2px 5px rgba(0,0,0,0.8);">
            ${cleanHint}
          </div>
        </div>

        <!-- Caixinhas 3D da Palavra Escondida -->
        <div id="arcade-sw-slots" style="position:relative; z-index:5; width:100%; max-width:440px; display:flex; flex-wrap:wrap; justify-content:center; gap:6px; padding:4px 2px;"></div>

        <!-- Teclado A-Z Solto 3D (mesma estética do Caça-Palavras) -->
        <div id="arcade-sw-keyboard" style="position:relative; z-index:5; width:100%; max-width:416px; display:grid; grid-template-columns:repeat(7, 1fr); gap:6px;"></div>
      </div>
    `;

    const hintCardEl = container.querySelector("#arcade-sw-hint-card");
    const chancesEl = container.querySelector("#arcade-sw-chances");
    const hintTextEl = container.querySelector("#arcade-sw-hint-text");
    const slotsEl = container.querySelector("#arcade-sw-slots");
    const kbEl = container.querySelector("#arcade-sw-keyboard");

    if (hintCardEl) {
      hintCardEl.addEventListener("click", () => {
        if (window._arcadeStageLockedForVovo || solved || _isVictoryActive) return;
        if (typeof window.repeatVovoInstruction === "function") {
          window.repeatVovoInstruction();
        }
      });
    }

    setTimeout(() => {
      const nextWk = (wk % 22) + 1;
      window.preloadArcadeAudioUrl(`./6_ASSETS_AUDIO/palavra_secreta_vovo/palavra_secreta_vovo_${String(nextWk).padStart(2, "0")}.mp3?v=165`);
    }, 900);

    function updateSlotsAndHud() {
      const left = Math.max(0, maxErrors - errors);
      if (chancesEl) {
        chancesEl.textContent = `CHANCES: ${left} / ${maxErrors}`;
        chancesEl.style.background = left <= 2
          ? "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)"
          : "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)";
      }

      const slotW = cleanWord.length >= 10 ? "clamp(28px, 7.6vw, 36px)" : "clamp(34px, 9.2vw, 44px)";
      const slotH = cleanWord.length >= 10 ? "40px" : "46px";
      slotsEl.innerHTML = cleanWord.split("").map(ch => {
        const open = guessed.has(ch) || solved;
        return `
          <div style="width:${slotW}; height:${slotH}; border-radius:12px; background:${open ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)" : "linear-gradient(180deg, rgba(88,28,135,0.95) 0%, rgba(30,27,75,0.98) 100%)"}; border:2.5px solid ${open ? "#ffffff" : "#fde047"}; box-shadow:${open ? "0 0 14px rgba(0,230,118,0.8), 0 4px 10px rgba(0,0,0,0.6)" : "0 4px 10px rgba(0,0,0,0.65)"}; display:inline-flex; align-items:center; justify-content:center; font-family:'Fredoka',sans-serif; font-size:21px; font-weight:900; color:#ffffff; transition:transform 0.16s ease;">
            ${open ? ch : "_"}
          </div>
        `;
      }).join("");

      kbEl.innerHTML = alphabet.map(ch => {
        const isUsed = guessed.has(ch);
        const isHit = isUsed && cleanWord.includes(ch);
        const bg = !isUsed
          ? "linear-gradient(180deg, rgba(107, 33, 168, 0.94) 0%, rgba(59, 7, 100, 0.97) 100%)"
          : (isHit ? "linear-gradient(180deg, #00e676 0%, #00c853 100%)" : "rgba(30, 41, 59, 0.68)");
        const bCol = !isUsed ? "rgba(56, 189, 248, 0.88)" : (isHit ? "#ffffff" : "rgba(248, 113, 113, 0.55)");
        return `
          <button type="button" data-sw-ch="${ch}" ${isUsed || solved ? "disabled" : ""} style="height:40px; border-radius:11px; border:2px solid ${bCol}; background:${bg}; color:#ffffff; font-family:'Fredoka',sans-serif; font-size:16px; font-weight:900; opacity:${isUsed && !isHit ? "0.42" : "1"}; box-shadow:0 4px 9px rgba(0,0,0,0.55); cursor:pointer;">
            ${ch}
          </button>
        `;
      }).join("");

      kbEl.querySelectorAll("button[data-sw-ch]").forEach(btn => {
        btn.addEventListener("click", () => {
          if (window._arcadeStageLockedForVovo || solved || _isVictoryActive) return;
          const ch = btn.getAttribute("data-sw-ch");
          if (!ch || guessed.has(ch)) return;
          guessed.add(ch);

          if (cleanWord.includes(ch)) {
            TronoAudio.play("coin");
            const allDone = cleanWord.split("").every(c => guessed.has(c));
            if (allDone) {
              solved = true;
              if (hintTextEl) hintTextEl.textContent = `MUITO BEM! A PALAVRA É ${cleanWord}!`;
              TronoAudio.play("success");
              updateSlotsAndHud();
              if (window._arcadeSecretWordWinTimer) clearTimeout(window._arcadeSecretWordWinTimer);
              window._arcadeSecretWordWinTimer = setTimeout(() => {
                window._arcadeSecretWordWinTimer = null;
                triggerArcadeVictory();
              }, 850);
              return;
            }
          } else {
            errors++;
            TronoAudio.play("error");
            if (errors >= maxErrors) {
              // Reinício amigável infantil sem travar a criança: dá uma letrinha de ajuda e renova as chances!
              errors = 0;
              const missing = cleanWord.split("").find(c => !guessed.has(c));
              Array.from(guessed).forEach(g => {
                if (!cleanWord.includes(g)) guessed.delete(g);
              });
              if (missing && cleanWord.split("").filter(c => !guessed.has(c)).length > 1) {
                guessed.add(missing);
              }
            }
          }
          updateSlotsAndHud();
        });
      });
    }

    updateSlotsAndHud();
  }

  // --- JOGO 21: QUEM SOU EU NA BÍBLIA? EM TELA CHEIA (22 LIÇÕES • 3 PISTAS SOLTAS + 4 ALTERNATIVAS) ---
  function runQuemSouEuArcade(container, phase) {
    injectLessonArcadeV161Styles();
    const wk = ((Math.max(1, Math.floor(Number(phase) || 1)) - 1) % 22) + 1;
    const bank = window.WHO_AM_I_BANK || [];
    const item = bank.find(it => Number(it.lessonWeek) === wk) || bank[(wk - 1) % Math.max(1, bank.length)] || {
      answer: "Noé",
      clues: [
        "Eu amava e obedecia a Deus quando quase ninguém mais obedecia.",
        "Construí um grande barco de madeira chamado Arca.",
        "Deus colocou um lindo Arco-Íris no céu como sinal de aliança comigo!"
      ],
      options: ["Abraão", "Moisés", "Noé", "Pedro"]
    };

    const clues = (item.clues || []).slice(0, 3).map(stripLessonPrefixText);
    const options = [...(item.options || ["Abraão", "Moisés", "Noé", "Pedro"])].sort(() => Math.random() - 0.5);
    const openedClues = [true, false, false];
    let solved = false;

    container.innerHTML = `
      <div class="arc-v161-stage" style="padding:44px 12px 14px 12px; justify-content:space-evenly;">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_21_quemsoueu_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <!-- 3 Cartões de Pistas Soltos em Cima -->
        <div id="arcade-wai-clues" style="position:relative; z-index:5; width:100%; max-width:430px; display:flex; flex-direction:column; gap:8px;"></div>

        <!-- Grade 2x2 de Alternativas Soltas embaixo com Margem Colorida -->
        <div id="arcade-wai-opts" style="position:relative; z-index:5; width:100%; max-width:430px; display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
          ${options.map((opt, idx) => `
            <button type="button" data-wai-idx="${idx}" class="arc-v161-rainbow-card" style="min-height:64px; padding:12px 10px; border:none; color:#ffffff; font-family:'Fredoka',sans-serif; font-size:clamp(15.5px, 4.1vw, 18.5px); font-weight:900; text-shadow:0 2px 5px rgba(0,0,0,0.8); cursor:pointer; display:flex; align-items:center; justify-content:center; text-align:center; transition:transform 0.16s ease, opacity 0.18s ease;">
              ${opt}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    const cluesBox = container.querySelector("#arcade-wai-clues");
    const optBtns = container.querySelectorAll("button[data-wai-idx]");

    function renderClues() {
      cluesBox.innerHTML = clues.map((txt, idx) => {
        const isOpen = openedClues[idx];
        if (isOpen) {
          return `
            <div class="arc-v161-rainbow-card" style="padding:11px 14px; text-align:left;">
              <div style="font-family:'Fredoka',sans-serif; font-size:11px; font-weight:900; color:#fde047; letter-spacing:0.5px; margin-bottom:3px;">PISTA ${idx + 1}</div>
              <div style="font-family:'Fredoka',sans-serif; font-size:clamp(14px, 3.7vw, 16.5px); font-weight:800; color:#ffffff; line-height:1.28; text-shadow:0 1px 4px rgba(0,0,0,0.8);">${txt}</div>
            </div>
          `;
        }
        return `
          <button type="button" data-open-clue="${idx}" class="arc-v161-rainbow-card" style="padding:12px 14px; border:none; background:linear-gradient(180deg, rgba(30, 58, 138, 0.90) 0%, rgba(15, 23, 42, 0.95) 100%); color:#fde047; font-family:'Fredoka',sans-serif; font-size:14px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#fde047" stroke-width="2.6"/><path d="M20 20L16.2 16.2" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/></svg>
            <span>TOQUE PARA ABRIR A PISTA ${idx + 1}</span>
          </button>
        `;
      }).join("");

      cluesBox.querySelectorAll("button[data-open-clue]").forEach(b => {
        b.addEventListener("click", () => {
          if (window._arcadeStageLockedForVovo || solved || _isVictoryActive) return;
          const ci = Number(b.getAttribute("data-open-clue")) || 0;
          openedClues[ci] = true;
          TronoAudio.play("click");
          renderClues();
        });
      });
    }
    renderClues();

    optBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (window._arcadeStageLockedForVovo || solved || _isVictoryActive) return;
        const idx = Number(btn.getAttribute("data-wai-idx")) || 0;
        const chosen = options[idx];

        if (chosen === item.answer) {
          solved = true;
          TronoAudio.play("success");
          btn.style.background = "linear-gradient(180deg, #00e676 0%, #00c853 100%)";
          btn.style.boxShadow = "0 0 24px rgba(0, 230, 118, 0.95), 0 6px 14px rgba(0, 0, 0, 0.75)";
          btn.style.transform = "scale(1.05)";
          optBtns.forEach((other, oi) => {
            if (oi !== idx) {
              other.style.opacity = "0.42";
              other.style.pointerEvents = "none";
            }
          });
          if (window._arcadeWhoAmIWinTimer) clearTimeout(window._arcadeWhoAmIWinTimer);
          window._arcadeWhoAmIWinTimer = setTimeout(() => {
            window._arcadeWhoAmIWinTimer = null;
            triggerArcadeVictory();
          }, 850);
        } else {
          TronoAudio.play("error");
          const prevBg = btn.style.background;
          btn.style.background = "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)";
          btn.classList.remove("arc-shake-err");
          void btn.offsetWidth;
          btn.classList.add("arc-shake-err");
          // Revela automaticamente a próxima pista fechada para ajudar a criança!
          const nextClueIdx = openedClues.findIndex(v => !v);
          if (nextClueIdx >= 0) {
            openedClues[nextClueIdx] = true;
            renderClues();
          }
          setTimeout(() => {
            if (!solved && btn) btn.style.background = prevBg;
          }, 480);
        }
      });
    });
  }

  // --- JOGO 22: VERDADEIRO OU MITO EM TELA CHEIA (22 LIÇÕES • AFIRMAÇÃO ROXA + 2 BOTÕES 3D) ---
  function runVerdadeiroOuMitoArcade(container, phase) {
    injectLessonArcadeV161Styles();
    const wk = ((Math.max(1, Math.floor(Number(phase) || 1)) - 1) % 22) + 1;
    const bank = window.TRUE_OR_MYTH_BANK || [];
    const item = bank.find(it => Number(it.lessonWeek) === wk) || bank[(wk - 1) % Math.max(1, bank.length)] || {
      statement: "No 1º Dia da Criação, Deus disse 'Haja luz!', e no 7º Dia descansou e abençoou toda a Sua obra.",
      isTrue: true,
      explanation: "VERDADEIRO! Em Gênesis 1 e 2, Deus criou tudo em 6 dias com perfeição e descansou no 7º dia!"
    };

    const cleanStmt = stripLessonPrefixText(item.statement || "");
    let solved = false;

    container.innerHTML = `
      <div class="arc-v161-stage" style="padding:44px 14px 18px 14px; justify-content:space-evenly;">
        <img src="./2_ASSETS_UI_BOTOES/bg_jogo_22_verdadeiromito_v161.jpg?v=161" alt="" class="arc-v161-bg" decoding="async">
        <div class="arc-v161-vignette"></div>

        <!-- Card Roxo da Frase Bíblica com Margem Colorida -->
        <div class="arc-v161-rainbow-card" style="z-index:5; width:100%; max-width:430px; padding:20px 18px; text-align:center;">
          <div style="display:inline-block; background:rgba(15,23,42,0.88); color:#fde047; font-family:'Fredoka',sans-serif; font-size:12px; font-weight:900; padding:4px 12px; border-radius:999px; border:1.5px solid #fde047; margin-bottom:12px; letter-spacing:0.5px;">
            VERDADEIRO OU MITO?
          </div>
          <div style="font-family:'Fredoka',sans-serif; font-size:clamp(17px, 4.4vw, 21.5px); font-weight:900; color:#ffffff; line-height:1.36; text-shadow:0 2px 6px rgba(0,0,0,0.85);">
            "${cleanStmt}"
          </div>
        </div>

        <!-- Feedback Bíblico Curto Solto -->
        <div id="arcade-tm-feedback" class="arc-v161-rainbow-card" style="z-index:5; width:100%; max-width:430px; padding:12px 15px; text-align:center; background:linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,27,75,0.96) 100%); font-family:'Fredoka',sans-serif; font-size:clamp(13.5px, 3.6vw, 15.5px); font-weight:800; color:#fde047; line-height:1.32;">
          Toque em VERDADEIRO ou em MITO abaixo!
        </div>

        <!-- Dois Botões Gigantes 3D Soltos -->
        <div style="position:relative; z-index:5; width:100%; max-width:430px; display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
          <button type="button" id="arcade-tm-btn-true" style="height:74px; border-radius:22px; border:3px solid #ffffff; background:linear-gradient(180deg, #00e676 0%, #00c853 100%); color:#ffffff; font-family:'Fredoka',sans-serif; font-size:clamp(16px, 4.3vw, 19.5px); font-weight:900; box-shadow:0 8px 20px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:transform 0.16s ease, opacity 0.18s ease;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>VERDADEIRO</span>
          </button>
          <button type="button" id="arcade-tm-btn-false" style="height:74px; border-radius:22px; border:3px solid #ffffff; background:linear-gradient(180deg, #ff1744 0%, #b71c1c 100%); color:#ffffff; font-family:'Fredoka',sans-serif; font-size:clamp(16px, 4.3vw, 19.5px); font-weight:900; box-shadow:0 8px 20px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:transform 0.16s ease, opacity 0.18s ease;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/></svg>
            <span>MITO</span>
          </button>
        </div>
      </div>
    `;

    const fbEl = container.querySelector("#arcade-tm-feedback");
    const btnTrue = container.querySelector("#arcade-tm-btn-true");
    const btnFalse = container.querySelector("#arcade-tm-btn-false");

    function handleAnswer(choice) {
      if (window._arcadeStageLockedForVovo || solved || _isVictoryActive) return;
      const clicked = choice ? btnTrue : btnFalse;
      const other = choice ? btnFalse : btnTrue;

      if (choice === !!item.isTrue) {
        solved = true;
        TronoAudio.play("success");
        clicked.style.transform = "scale(1.05)";
        clicked.style.boxShadow = "0 0 24px rgba(253, 224, 71, 0.95), 0 8px 20px rgba(0,0,0,0.75)";
        other.style.opacity = "0.38";
        other.style.pointerEvents = "none";
        if (fbEl) {
          fbEl.style.color = "#86efac";
          fbEl.textContent = item.explanation || "Muito bem! Você acertou!";
        }
        if (window._arcadeTrueMythWinTimer) clearTimeout(window._arcadeTrueMythWinTimer);
        window._arcadeTrueMythWinTimer = setTimeout(() => {
          window._arcadeTrueMythWinTimer = null;
          triggerArcadeVictory();
        }, 1150);
      } else {
        TronoAudio.play("error");
        clicked.classList.remove("arc-shake-err");
        void clicked.offsetWidth;
        clicked.classList.add("arc-shake-err");
        if (fbEl) {
          fbEl.style.color = "#fde047";
          fbEl.textContent = `Pense um pouquinho na história: ${item.explanation || "Tente a outra resposta!"}`;
        }
      }
    }

    btnTrue.addEventListener("click", () => handleAnswer(true));
    btnFalse.addEventListener("click", () => handleAnswer(false));
  }

  // ==========================================================================
  // 7. INJEÇÃO LIMPA DOS 16 JOGOS NA SALA DE JOGOS (#screen-games-hub)
  // (Ícones 100% limpos: sem pílulas, sem emojis e sem banner duplicado de cards!)
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
          position: relative;
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

    setTimeout(() => {
      if (typeof window.preloadArcadeLessonVisualAssets === "function") {
        const pPaint = window.getArcadeGameProgress("pintura_magica");
        const pPuz = window.getArcadeGameProgress("puzzle_3d");
        window.preloadArcadeLessonVisualAssets((pPaint && pPaint.lastPhase) || 1);
        if (pPuz && pPuz.lastPhase && pPuz.lastPhase !== ((pPaint && pPaint.lastPhase) || 1)) {
          window.preloadArcadeLessonVisualAssets(pPuz.lastPhase);
        }
      }
    }, 120);
  };

  // Sobrescreve a abertura do Hub de Jogos para carregar os 16 jogos oficiais com fundo Jardim Real
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

  console.log("[Trono Kids] Super Arcade Audiovisual (16 Jogos Oficiais + 32 Super Cards 16:9) carregado.");

  // ==========================================================================
  // 8. TRAVA PARENTAL OBRIGATÓRIA (FAMÍLIA E PROFESSOR)
  // ==========================================================================
  function showParentalGate(onSuccess) {
    let modal = document.getElementById("trono-parental-gate-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "trono-parental-gate-modal";
      document.body.appendChild(modal);
    }
    modal.style.cssText = "position:fixed; inset:0; background:radial-gradient(circle at 50% 24%, #7e22ce 0%, #581c87 52%, #2e1065 100%); z-index:10000200; display:flex; align-items:center; justify-content:center; padding:20px 16px; overflow-y:auto;";

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
      <div style="max-width:350px; width:100%; text-align:center; display:flex; flex-direction:column; align-items:center;">
        <img src="./2_ASSETS_UI_BOTOES/ebd_icon_professor.png" alt="" style="width:58px; height:58px; object-fit:contain; margin-bottom:8px;">
        <div style="font-size:18px; font-weight:900; color:#fde047; text-shadow:0 3px 8px rgba(0,0,0,0.85); margin-bottom:6px;">PORTAL DA FAMÍLIA E PROFESSOR</div>
        <div style="font-size:13px; font-weight:700; color:#f8fafc; text-shadow:0 2px 5px rgba(0,0,0,0.8); margin-bottom:16px;">Área exclusiva para adultos. Resolva para entrar:</div>
        
        <div style="width:100%; background:linear-gradient(180deg, rgba(168,85,247,0.45) 0%, rgba(88,28,135,0.75) 100%); border:2px solid #fde047; border-radius:18px; padding:13px; font-size:24px; font-weight:900; color:#ffffff; box-shadow:0 6px 16px rgba(0,0,0,0.5); margin-bottom:18px;">
          Quanto é ${n1} + ${n2}?
        </div>

        <div style="width:100%; display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:20px;">
          ${opcoes.map(op => `
            <button class="btn-parent-opt" onclick="window._checkParentAns(${op}, ${correta})" style="padding:12px; background:linear-gradient(180deg,#00b0ff,#0066ff); border:2px solid #b3e5fc; border-radius:999px; font-size:18px; font-weight:900; color:#ffffff; box-shadow:0 5px 12px rgba(0,0,0,0.55); cursor:pointer;">
              ${op}
            </button>
          `).join("")}
        </div>

        <button onclick="document.getElementById('trono-parental-gate-modal').style.display='none'" style="width:100%; background:linear-gradient(180deg,#00e676,#00c853); border:2px solid #ffffff; border-radius:999px; padding:12px 18px; color:#ffffff; font-weight:900; font-size:15px; box-shadow:0 5px 12px rgba(0,0,0,0.55); cursor:pointer;">
          Voltar
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
        modal.style.display = "none";
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
