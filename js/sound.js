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

  // ── CINEMATIC DREAD DRONE (Hans Zimmer / Inception style) ──
  function startTension() {
    if (!enabled || tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Master bus with compressor for loudness punch
      const compressor = ac.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-20, t);
      compressor.knee.setValueAtTime(5, t);
      compressor.ratio.setValueAtTime(8, t);
      compressor.attack.setValueAtTime(0.003, t);
      compressor.release.setValueAtTime(0.15, t);
      compressor.connect(ac.destination);

      const masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(0, t);
      masterGain.gain.linearRampToValueAtTime(0.85, t + 0.8);
      masterGain.connect(compressor);

      // ═══ 1. PULSING BASS DRONE — LFO-modulated for breathing dread ═══
      const bassOsc = ac.createOscillator();
      const bassOsc2 = ac.createOscillator();
      const bassGain = ac.createGain();
      const bassLFO = ac.createOscillator();
      const bassLFOGain = ac.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc2.type = 'square';
      bassOsc.frequency.setValueAtTime(40, t);
      bassOsc.frequency.exponentialRampToValueAtTime(55, t + 12);
      bassOsc2.frequency.setValueAtTime(40.3, t); // detuned for thickness
      bassOsc2.frequency.exponentialRampToValueAtTime(55.5, t + 12);

      // LFO creates the "breathing" pulse (speeds up over time)
      bassLFO.type = 'sine';
      bassLFO.frequency.setValueAtTime(1.5, t);
      bassLFO.frequency.exponentialRampToValueAtTime(6, t + 15);
      bassLFOGain.gain.setValueAtTime(0.35, t);
      bassLFOGain.gain.linearRampToValueAtTime(0.5, t + 10);

      bassLFO.connect(bassLFOGain);
      bassLFOGain.connect(bassGain.gain);

      bassGain.gain.setValueAtTime(0.3, t);

      const bassFilter = ac.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(150, t);
      bassFilter.frequency.exponentialRampToValueAtTime(600, t + 12);
      bassFilter.Q.value = 4;

      bassOsc.connect(bassFilter);
      bassOsc2.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(t);
      bassOsc2.start(t);
      bassLFO.start(t);

      // ═══ 2. DISSONANT TRITONE — The "devil's interval" for pure dread ═══
      const dread1 = ac.createOscillator();
      const dread2 = ac.createOscillator();
      const dreadGain = ac.createGain();
      const dreadFilter = ac.createBiquadFilter();

      dread1.type = 'sine';
      dread2.type = 'sine';
      // Tritone interval (B2 → F3) — most unsettling interval in music
      dread1.frequency.setValueAtTime(123.47, t); // B2
      dread1.frequency.exponentialRampToValueAtTime(185, t + 15);
      dread2.frequency.setValueAtTime(174.61, t); // F3 (tritone above B2)
      dread2.frequency.exponentialRampToValueAtTime(262, t + 15);

      dreadFilter.type = 'lowpass';
      dreadFilter.frequency.setValueAtTime(300, t);
      dreadFilter.frequency.exponentialRampToValueAtTime(2000, t + 12);

      dreadGain.gain.setValueAtTime(0, t);
      dreadGain.gain.linearRampToValueAtTime(0.12, t + 2);
      dreadGain.gain.linearRampToValueAtTime(0.3, t + 10);

      dread1.connect(dreadFilter);
      dread2.connect(dreadFilter);
      dreadFilter.connect(dreadGain);
      dreadGain.connect(masterGain);
      dread1.start(t);
      dread2.start(t);

      // ═══ 3. ACCELERATING HEARTBEAT IMPACTS ═══
      const heartbeats = [];
      let beatTime = t + 0.5;
      let interval = 0.9;

      for (let i = 0; i < 50; i++) {
        const progress = i / 50;
        const vol = 0.5 + progress * 0.7;

        // Primary BOOM
        const boom = ac.createOscillator();
        boom.type = 'sine';
        const boomGain = ac.createGain();
        boom.frequency.setValueAtTime(70, beatTime);
        boom.frequency.exponentialRampToValueAtTime(20, beatTime + 0.2);
        boomGain.gain.setValueAtTime(0, beatTime);
        boomGain.gain.linearRampToValueAtTime(vol, beatTime + 0.008);
        boomGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.25);
        boom.connect(boomGain);
        boomGain.connect(masterGain);
        boom.start(beatTime);
        boom.stop(beatTime + 0.3);
        heartbeats.push(boom);

        // Noise transient (punch/crack on each beat)
        const hitLen = Math.round(ac.sampleRate * 0.04);
        const hitBuf = ac.createBuffer(1, hitLen, ac.sampleRate);
        const hitData = hitBuf.getChannelData(0);
        for (let j = 0; j < hitLen; j++) hitData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (hitLen * 0.15));
        const hitSrc = ac.createBufferSource();
        hitSrc.buffer = hitBuf;
        const hitGain = ac.createGain();
        hitGain.gain.setValueAtTime(vol * 0.6, beatTime);
        hitGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.05);
        hitSrc.connect(hitGain);
        hitGain.connect(masterGain);
        hitSrc.start(beatTime);
        heartbeats.push(hitSrc);

        // Sub-beat echo (faint second hit)
        const echo = ac.createOscillator();
        echo.type = 'sine';
        const echoGain = ac.createGain();
        echo.frequency.setValueAtTime(55, beatTime + 0.1);
        echo.frequency.exponentialRampToValueAtTime(25, beatTime + 0.22);
        echoGain.gain.setValueAtTime(0, beatTime + 0.1);
        echoGain.gain.linearRampToValueAtTime(vol * 0.35, beatTime + 0.108);
        echoGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.28);
        echo.connect(echoGain);
        echoGain.connect(masterGain);
        echo.start(beatTime + 0.1);
        echo.stop(beatTime + 0.35);
        heartbeats.push(echo);

        beatTime += interval;
        interval = Math.max(0.22, interval * 0.92); // aggressive acceleration
      }

      // ═══ 4. RISING ALARM SIREN — Gets louder and higher ═══
      const siren = ac.createOscillator();
      const sirenGain = ac.createGain();
      const sirenFilter = ac.createBiquadFilter();
      const sirenLFO = ac.createOscillator();
      const sirenLFOGain = ac.createGain();

      siren.type = 'sine';
      siren.frequency.setValueAtTime(600, t);
      siren.frequency.exponentialRampToValueAtTime(1800, t + 15);

      // Vibrato on the siren
      sirenLFO.type = 'sine';
      sirenLFO.frequency.setValueAtTime(4, t);
      sirenLFO.frequency.linearRampToValueAtTime(8, t + 12);
      sirenLFOGain.gain.setValueAtTime(15, t);
      sirenLFOGain.gain.linearRampToValueAtTime(40, t + 12);
      sirenLFO.connect(sirenLFOGain);
      sirenLFOGain.connect(siren.frequency);

      sirenFilter.type = 'bandpass';
      sirenFilter.frequency.setValueAtTime(800, t);
      sirenFilter.frequency.exponentialRampToValueAtTime(2500, t + 12);
      sirenFilter.Q.value = 5;

      sirenGain.gain.setValueAtTime(0, t);
      sirenGain.gain.linearRampToValueAtTime(0.02, t + 3);
      sirenGain.gain.linearRampToValueAtTime(0.12, t + 10);
      sirenGain.gain.linearRampToValueAtTime(0.2, t + 14);

      siren.connect(sirenFilter);
      sirenFilter.connect(sirenGain);
      sirenGain.connect(masterGain);
      siren.start(t);
      sirenLFO.start(t);

      // ═══ 5. DARK NOISE WASH — Rumbling atmosphere ═══
      const bufferSize = ac.sampleRate * 2;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(3000, t + 12);
      noiseFilter.Q.value = 1;

      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.08, t + 1);
      noiseGain.gain.linearRampToValueAtTime(0.2, t + 10);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(t);

      tensionDrone = {
        motor: bassOsc, flap: bassOsc2, noise,
        shimmer: siren,
        extras: [dread1, dread2, bassLFO, sirenLFO],
        motorGain: bassGain, flapGain: dreadGain, noiseGain,
        heartbeats, masterGain
      };
    } catch (e) { }
  }

  function stopTension() {
    if (!tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      const { motor, flap, noise, shimmer, motorGain, flapGain, noiseGain, heartbeats, masterGain } = tensionDrone;

      // Fade out master gain for a smooth cut
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(t);
        masterGain.gain.setValueAtTime(masterGain.gain.value, t);
        masterGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      }

      // Stop all heartbeat oscillators
      if (heartbeats) {
        heartbeats.forEach(osc => { try { osc.stop(t + 0.35); } catch(e){} });
      }

      // Stop continuous oscillators
      try { motor.stop(t + 0.4); } catch(e){}
      try { flap.stop(t + 0.4); } catch(e){}
      try { noise.stop(t + 0.4); } catch(e){}
      try { if (shimmer) shimmer.stop(t + 0.4); } catch(e){}

      // Stop extra oscillators (dread tones, LFOs)
      if (tensionDrone.extras) {
        tensionDrone.extras.forEach(osc => { try { osc.stop(t + 0.4); } catch(e){} });
      }

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

  // ── EXTERNAL FILE STOP SOUND ─────────────────────
  const stopAudio = new Audio('assets/SFX/Stop.mp3');
  stopAudio.preload = 'auto';
  stopAudio.volume = 1.0;

  function playScreech(slotIndex = 0) {
    if (!enabled) return;
    try {
      // Bermain 3 instance sekaligus untuk menaikkan volume (melewati batas 1.0 bawaan browser)
      for (let i = 0; i < 3; i++) {
        const clone = stopAudio.cloneNode();
        clone.volume = 1.0;
        clone.play().catch(e => console.warn('[Sound] Could not play Stop.mp3:', e));
      }
    } catch (e) {
      console.warn('[Sound] playScreech error:', e);
    }
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
    [winnerAudio, grandPrizeAudio, stopAudio].forEach(a => {
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
