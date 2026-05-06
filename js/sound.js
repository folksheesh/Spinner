/**
 * SOUND ENGINE - Web Audio API
 * Generates all sounds procedurally — no external files needed
 * v4 — Suspenseful Heartbeat Drone + Casino Jackpot Win
 */

const SoundEngine = (() => {
  let ctx = null;
  let enabled = true;
  let tensionDrone = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── FAST SPINNING TIRE (TENSION) ──
  function startTension() {
    if (!enabled || tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. Motor/Tire Whir (Low hum pitching up)
      const motor = ac.createOscillator();
      const motorFilter = ac.createBiquadFilter();
      const motorGain = ac.createGain();
      
      motor.type = 'sawtooth';
      motor.frequency.setValueAtTime(20, t);
      motor.frequency.exponentialRampToValueAtTime(120, t + 2); // rev up
      
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(100, t);
      motorFilter.frequency.exponentialRampToValueAtTime(1000, t + 2);
      
      motorGain.gain.setValueAtTime(0, t);
      motorGain.gain.linearRampToValueAtTime(0.3, t + 1);

      motor.connect(motorFilter);
      motorFilter.connect(motorGain);
      motorGain.connect(ac.destination);
      motor.start(t);

      // 2. High-speed Treads/Clicking
      const flap = ac.createOscillator();
      const flapFilter = ac.createBiquadFilter();
      const flapGain = ac.createGain();

      flap.type = 'square';
      flap.frequency.setValueAtTime(10, t);
      flap.frequency.exponentialRampToValueAtTime(45, t + 2); // clicking gets faster

      flapFilter.type = 'bandpass';
      flapFilter.frequency.setValueAtTime(300, t);
      flapFilter.frequency.exponentialRampToValueAtTime(800, t + 2);

      flapGain.gain.setValueAtTime(0, t);
      flapGain.gain.linearRampToValueAtTime(0.25, t + 1);

      flap.connect(flapFilter);
      flapFilter.connect(flapGain);
      flapGain.connect(ac.destination);
      flap.start(t);

      // 3. Wind/Friction Noise
      const bufferSize = ac.sampleRate * 2;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(100, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(2000, t + 2);
      
      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.15, t + 1);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ac.destination);
      noise.start(t);

      tensionDrone = { motor, flap, noise, motorGain, flapGain, noiseGain };
    } catch (e) { }
  }

  function stopTension() {
    if (!tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      const { motor, flap, noise, motorGain, flapGain, noiseGain } = tensionDrone;

      // Quick fade out
      motorGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      flapGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.3);

      motor.stop(t + 0.4);
      flap.stop(t + 0.4);
      noise.stop(t + 0.4);

      tensionDrone = null;
    } catch (e) {
      tensionDrone = null;
    }
  }

  // ── Audio files (winner sounds only — no external brake file) ──
  const winnerAudio      = new Audio('assets/SFX/Winner.mp3');
  const grandPrizeAudio  = new Audio('assets/SFX/GrandPrizeWinner.mp3');
  winnerAudio.preload     = 'auto';
  grandPrizeAudio.preload = 'auto';
  winnerAudio.volume      = 1.0;
  grandPrizeAudio.volume  = 1.0;

  // ── F1 GEAR-SHIFT (procedural) ──────────────────────────────
  // Two-hit mechanical "jeg-jeg" sound.
  // slotIndex 0−6: each successive stop is faster, higher-pitched, more aggressive.
  function playScreech(slotIndex = 0) {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const now = ac.currentTime;

      // Scale factor: 0.0 (first stop) → 1.0 (sixth stop)
      const g = Math.min(slotIndex, 5) / 5;

      // Gap between two hits gets shorter as gear climbs (100ms → 55ms)
      const gapSec    = (100 - g * 45) / 1000;
      // Pitch multiplier climbs each gear (1.0x → 1.6x)
      const basePitch = 1.0 + g * 0.6;
      // Volume intensity climbs slightly
      const intensity = 0.85 + g * 0.35;

      function hit(startT, isSecond) {
        const pitch = basePitch * (isSecond ? 1.28 : 1.0);
        const vol   = intensity * (isSecond ? 1.2 : 1.0) * 1.5; // boosted volume

        // 1. Sharp noise transient (the mechanical 'crack')
        const noiseLen  = Math.round(ac.sampleRate * 0.08); // longer decay
        const noiseBuf  = ac.createBuffer(1, noiseLen, ac.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.2));
        }
        const noiseSrc = ac.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const nbpf = ac.createBiquadFilter();
        nbpf.type = 'bandpass';
        nbpf.frequency.value = 1100 * pitch;
        nbpf.Q.value = 1.2; // wider band

        const nGain = ac.createGain();
        nGain.gain.setValueAtTime(vol * 2.0, startT);
        nGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.07);

        noiseSrc.connect(nbpf);
        nbpf.connect(nGain);
        nGain.connect(ac.destination);
        noiseSrc.start(startT);

        // 2. Engine blip — sawtooth sweep (the 'engine' voice)
        const osc = ac.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300 * pitch, startT);
        osc.frequency.exponentialRampToValueAtTime(50 * pitch, startT + 0.08);

        const lpf = ac.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(4000, startT);
        lpf.frequency.exponentialRampToValueAtTime(200, startT + 0.08);

        const oGain = ac.createGain();
        oGain.gain.setValueAtTime(vol * 0.6, startT);
        oGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.09);

        osc.connect(lpf);
        lpf.connect(oGain);
        oGain.connect(ac.destination);
        osc.start(startT);
        osc.stop(startT + 0.1);

        // 3. Sub punch (body & weight)
        const sub = ac.createOscillator();
        sub.type = 'square';
        sub.frequency.setValueAtTime(150 * pitch, startT);
        sub.frequency.exponentialRampToValueAtTime(40, startT + 0.06);

        const sGain = ac.createGain();
        sGain.gain.setValueAtTime(vol * 0.8, startT);
        sGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.08);

        sub.connect(sGain);
        sGain.connect(ac.destination);
        sub.start(startT);
        sub.stop(startT + 0.09);
      }

      // Fire both hits
      hit(now,           false); // "jeg"
      hit(now + gapSec,  true);  // "jeg" (faster, higher)

    } catch (e) { }
  }

  // Silent stub — lock clunk removed to keep the gear-shift clean
  function playLock() {}

  // ── WINNER SOUND — uses real MP3 files ──
  // isGrandPrize = true  → GrandPrizeWinner.mp3
  // isGrandPrize = false → Winner.mp3
  function playWinner(isGrandPrize = false) {
    if (!enabled) return;
    stopTension();

    try {
      const audio = isGrandPrize ? grandPrizeAudio : winnerAudio;
      // Stop any currently playing winner sound first (safety)
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(e => console.warn('[Sound] Could not play winner audio:', e));
    } catch (e) {
      console.warn('[Sound] playWinner error:', e);
    }
  }

  // Preload / warm up winner audio files after user interaction
  function preloadAll() {
    [winnerAudio, grandPrizeAudio].forEach(a => {
      a.muted = true;
      const p = a.play();
      if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
    });
  }

  // Misc unused endpoints included for compatibility
  function playTick() {}
  function playCountdown() {}
  function playDrumRoll() {}

  return {
    playTick,
    playLock,
    playScreech,
    playWinner,
    playCountdown,
    playDrumRoll,
    startTension,
    stopTension,
    preloadAll,
    toggle() { enabled = !enabled; if (!enabled) { stopTension(); winnerAudio.pause(); grandPrizeAudio.pause(); } return enabled; },
    isEnabled() { return enabled; },
    unlock() { getCtx(); preloadAll(); }
  };
})();
