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

  // ── HEARTBEAT AND SUSPENSE DRONE ──
  function startTension() {
    if (!enabled || tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. Ominous Low Drone (rising pitch)
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.connect(bassGain);
      bassGain.connect(ac.destination);
      bass.frequency.setValueAtTime(40, t); // Very low rumble
      bass.frequency.linearRampToValueAtTime(70, t + 30); // Builds up slowly
      bass.type = 'sawtooth';
      bassGain.gain.setValueAtTime(0, t);
      bassGain.gain.linearRampToValueAtTime(0.15, t + 1);

      // 2. High frequency string-like tension (rising pitch)
      const string = ac.createOscillator();
      const stringGain = ac.createGain();
      string.connect(stringGain);
      stringGain.connect(ac.destination);
      string.frequency.setValueAtTime(800, t);
      string.frequency.exponentialRampToValueAtTime(1600, t + 30);
      string.type = 'sine';
      stringGain.gain.setValueAtTime(0, t);
      stringGain.gain.linearRampToValueAtTime(0.05, t + 2);

      // 3. Heartbeat Effect (using an interval for deep thumps)
      const heartbeatInterval = setInterval(() => {
        const hTime = ac.currentTime;
        const thump1 = ac.createOscillator();
        const thumpGain1 = ac.createGain();
        thump1.connect(thumpGain1);
        thumpGain1.connect(ac.destination);
        thump1.frequency.setValueAtTime(50, hTime);
        thump1.frequency.exponentialRampToValueAtTime(20, hTime + 0.1);
        thump1.type = 'sine';
        thumpGain1.gain.setValueAtTime(0.4, hTime);
        thumpGain1.gain.exponentialRampToValueAtTime(0.001, hTime + 0.15);
        thump1.start(hTime);
        thump1.stop(hTime + 0.2);

        // Second beat (da-DUM)
        const thump2 = ac.createOscillator();
        const thumpGain2 = ac.createGain();
        thump2.connect(thumpGain2);
        thumpGain2.connect(ac.destination);
        thump2.frequency.setValueAtTime(60, hTime + 0.15);
        thump2.frequency.exponentialRampToValueAtTime(30, hTime + 0.3);
        thump2.type = 'sine';
        thumpGain2.gain.setValueAtTime(0.5, hTime + 0.15);
        thumpGain2.gain.exponentialRampToValueAtTime(0.001, hTime + 0.4);
        thump2.start(hTime + 0.15);
        thump2.stop(hTime + 0.5);
      }, 1000); // 60 BPM heartbeat

      bass.start(t);
      string.start(t);

      tensionDrone = { bass, string, bassGain, stringGain, heartbeatInterval };
    } catch (e) { }
  }

  function stopTension() {
    if (!tensionDrone) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      const { bass, string, bassGain, stringGain, heartbeatInterval } = tensionDrone;

      clearInterval(heartbeatInterval);

      bassGain.gain.linearRampToValueAtTime(0.001, t + 0.2);
      stringGain.gain.linearRampToValueAtTime(0.001, t + 0.2);

      bass.stop(t + 0.3);
      string.stop(t + 0.3);

      tensionDrone = null;
    } catch (e) {
      tensionDrone = null;
    }
  }

  // Lock sound — heavy clank + ding
  function playLock() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Clank
      const clank = ac.createOscillator();
      const clankGain = ac.createGain();
      clank.connect(clankGain);
      clankGain.connect(ac.destination);
      clank.frequency.setValueAtTime(150, t);
      clank.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      clank.type = 'square';
      clankGain.gain.setValueAtTime(0.2, t);
      clankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      clank.start(t);
      clank.stop(t + 0.2);

      // Sharp Ding
      const ding = ac.createOscillator();
      const dingGain = ac.createGain();
      ding.connect(dingGain);
      dingGain.connect(ac.destination);
      ding.frequency.setValueAtTime(1200, t + 0.05);
      ding.type = 'sine';
      dingGain.gain.setValueAtTime(0.25, t + 0.05);
      dingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      ding.start(t + 0.05);
      ding.stop(t + 0.6);
    } catch (e) { }
  }

  // WINNER JACKPOT - Cheerful casino winning
  function playWinner() {
    if (!enabled) return;
    stopTension();

    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Heavy Boom (Release tension)
      const boom = ac.createOscillator();
      const boomGain = ac.createGain();
      boom.connect(boomGain);
      boomGain.connect(ac.destination);
      boom.frequency.setValueAtTime(80, t);
      boom.frequency.exponentialRampToValueAtTime(20, t + 0.8);
      boom.type = 'sine';
      boomGain.gain.setValueAtTime(0.8, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
      boom.start(t);
      boom.stop(t + 1.1);

      // Fast Happy Arpeggio (Jackpot Coins)
      const arpeggio = [523, 659, 784, 1047, 1319, 1568]; // C Major
      let noteTime = t + 0.1;
      
      for (let i = 0; i < 24; i++) {
        const freq = arpeggio[i % arpeggio.length];
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.08, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);
        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
        noteTime += 0.08;
      }

      // Grand Final Chord
      const finalChordT = noteTime + 0.1;
      const chord = [523, 659, 784, 1047]; // C major
      chord.forEach(freq => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.2, finalChordT);
        gain.gain.exponentialRampToValueAtTime(0.001, finalChordT + 2.5);
        osc.start(finalChordT);
        osc.stop(finalChordT + 2.6);
      });

    } catch (e) { }
  }

  // Misc unused endpoints included for compatibility
  function playTick() {}
  function playCountdown() {}
  function playDrumRoll() {}

  return {
    playTick,
    playLock,
    playWinner,
    playCountdown,
    playDrumRoll,
    startTension,
    stopTension,
    toggle() { enabled = !enabled; if (!enabled) stopTension(); return enabled; },
    isEnabled() { return enabled; },
    unlock() { getCtx(); }
  };
})();
