/**
 * SOUND ENGINE - Web Audio API
 * Generates all sounds procedurally — no external files needed
 */

const SoundEngine = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Tick sound — fast click during rolling
  function playTick(pitch = 1.0) {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = 800 * pitch;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.08, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.05);
    } catch (e) { }
  }

  // Lock sound — when a digit is confirmed
  function playLock() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.setValueAtTime(600, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.1);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.3);
    } catch (e) { }
  }

  // Winner fanfare — dramatic reveal
  function playWinner() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const startT = ac.currentTime + i * 0.12;
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0, startT);
        gain.gain.linearRampToValueAtTime(0.35, startT + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.5);
        osc.start(startT);
        osc.stop(startT + 0.6);
      });

      // Bass boom
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.connect(bassGain);
      bassGain.connect(ac.destination);
      bass.frequency.value = 80;
      bass.type = 'sine';
      bassGain.gain.setValueAtTime(0.5, ac.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);
      bass.start(ac.currentTime);
      bass.stop(ac.currentTime + 0.9);
    } catch (e) { }
  }

  // Countdown beep
  function playCountdown() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.2);
    } catch (e) { }
  }

  // Drum roll effect
  function playDrumRoll(duration = 2000) {
    if (!enabled) return;
    let elapsed = 0;
    let interval = 120;
    const roll = () => {
      if (elapsed >= duration) return;
      playTick(0.5 + Math.random() * 0.5);
      elapsed += interval;
      interval = Math.max(30, interval * 0.92);
      setTimeout(roll, interval);
    };
    roll();
  }

  return {
    playTick,
    playLock,
    playWinner,
    playCountdown,
    playDrumRoll,
    toggle() { enabled = !enabled; return enabled; },
    isEnabled() { return enabled; },
    // Required to unlock audio context on first user gesture
    unlock() { getCtx(); }
  };
})();
