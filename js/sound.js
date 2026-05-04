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

  // Lock sound — heavy clank + ding
  function playLock() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Heavy Brake Clank
      const clank = ac.createOscillator();
      const clankGain = ac.createGain();
      clank.connect(clankGain);
      clankGain.connect(ac.destination);
      clank.frequency.setValueAtTime(200, t);
      clank.frequency.exponentialRampToValueAtTime(30, t + 0.15);
      clank.type = 'square';
      clankGain.gain.setValueAtTime(0.4, t);
      clankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      clank.start(t);
      clank.stop(t + 0.25);

      // Sharp Ding
      const ding = ac.createOscillator();
      const dingGain = ac.createGain();
      ding.connect(dingGain);
      dingGain.connect(ac.destination);
      ding.frequency.setValueAtTime(1200, t);
      ding.type = 'sine';
      dingGain.gain.setValueAtTime(0.3, t);
      dingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      ding.start(t);
      ding.stop(t + 0.6);
    } catch (e) { }
  }

  // WINNER JACKPOT - THUNDEROUS EXPLOSION + Casino winning
  function playWinner() {
    if (!enabled) return;
    stopTension();

    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. THUNDEROUS EXPLOSION (Noise burst)
      const bufferSize = ac.sampleRate * 3;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(3000, t); // Starts bright
      noiseFilter.frequency.exponentialRampToValueAtTime(40, t + 1.5); // Rolls down to deep rumble
      
      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(1.2, t); // VERY LOUD
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ac.destination);
      noise.start(t);

      // 2. Heavy Sub-Bass Boom
      const boom = ac.createOscillator();
      const boomGain = ac.createGain();
      boom.connect(boomGain);
      boomGain.connect(ac.destination);
      boom.frequency.setValueAtTime(100, t);
      boom.frequency.exponentialRampToValueAtTime(20, t + 1.2);
      boom.type = 'sine';
      boomGain.gain.setValueAtTime(1, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      boom.start(t);
      boom.stop(t + 1.6);

      // 3. Fast Happy Arpeggio (Jackpot Coins over the explosion)
      const arpeggio = [523, 659, 784, 1047, 1319, 1568]; // C Major
      let noteTime = t + 0.2; // slight delay after explosion hits
      
      for (let i = 0; i < 24; i++) {
        const freq = arpeggio[i % arpeggio.length];
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);
        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
        noteTime += 0.08;
      }

      // 4. Grand Final Epic Chord
      const finalChordT = noteTime + 0.1;
      const chord = [261.63, 523, 659, 784, 1047]; // HUGE C major
      chord.forEach(freq => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'sawtooth'; // Sawtooth for majestic brassy feel
        
        // Lowpass to make it swell and smooth out
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, finalChordT);
        filter.frequency.linearRampToValueAtTime(3000, finalChordT + 0.5);
        
        osc.connect(filter);
        filter.connect(gain);
        
        gain.gain.setValueAtTime(0, finalChordT);
        gain.gain.linearRampToValueAtTime(0.15, finalChordT + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, finalChordT + 3.0);
        osc.start(finalChordT);
        osc.stop(finalChordT + 3.1);
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
