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

  // Audio object for the brake sound
  const brakeAudio = new Audio('assets/SFX/Breaks.wav');

  // F1 High-Speed Braking (Using actual .wav file)
  function playScreech() {
    if (!enabled) return;
    try {
      brakeAudio.currentTime = 0;
      brakeAudio.play().catch(e => console.warn('Could not play Breaks.wav:', e));
    } catch (e) { }
  }

  // Mechanical Lock (Clunk when it fully stops)
  function playLock() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // HEAVY CLUNK
      const clunk = ac.createOscillator();
      const clunkGain = ac.createGain();
      
      clunk.type = 'square';
      clunk.frequency.setValueAtTime(120, t); 
      clunk.frequency.exponentialRampToValueAtTime(20, t + 0.1); // Deep impact
      
      clunkGain.gain.setValueAtTime(2.0, t); // Loud hit
      clunkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      clunk.connect(clunkGain);
      clunkGain.connect(ac.destination);
      clunk.start(t);
      clunk.stop(t + 0.2);

    } catch (e) { }
  }

  // WINNER JACKPOT - EXTREME THUNDEROUS EXPLOSION + Casino winning
  function playWinner() {
    if (!enabled) return;
    stopTension();

    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. MASSIVE EXPLOSION NOISE
      const bufferSize = ac.sampleRate * 4;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      // Generate heavy clipped noise
      for(let i=0; i<bufferSize; i++) {
        let n = (Math.random() * 2 - 1) * 5; // overdrive raw noise
        data[i] = Math.max(-1, Math.min(1, n)); // hard clip
      }
      
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(6000, t); // Crackling bright start
      noiseFilter.frequency.exponentialRampToValueAtTime(30, t + 2.5); // Sweeps down to an earthquake rumble
      
      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(2.0, t); // VERY LOUD
      noiseGain.gain.linearRampToValueAtTime(0.8, t + 0.2); // Quick decay
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 3.5); // Long rumble tail
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ac.destination);
      noise.start(t);

      // 2. EARTHQUAKE SUB-BASS (Square wave sweep)
      const boom = ac.createOscillator();
      const boomFilter = ac.createBiquadFilter();
      const boomGain = ac.createGain();
      
      boom.type = 'square'; // Gives it that tearing, explosive edge
      boom.frequency.setValueAtTime(200, t); // High punch
      boom.frequency.exponentialRampToValueAtTime(15, t + 1.0); // Dives into deep sub-bass
      
      boomFilter.type = 'lowpass';
      boomFilter.frequency.setValueAtTime(1000, t);
      boomFilter.frequency.exponentialRampToValueAtTime(30, t + 1.5);

      boomGain.gain.setValueAtTime(1.5, t); // Overdrive
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      
      boom.connect(boomFilter);
      boomFilter.connect(boomGain);
      boomGain.connect(ac.destination);
      boom.start(t);
      boom.stop(t + 2.1);

      // 3. Fast Happy Arpeggio (Jackpot Coins over the explosion)
      const arpeggio = [523, 659, 784, 1047, 1319, 1568]; // C Major
      let noteTime = t + 0.25; // delay so the explosion hits first
      
      for (let i = 0; i < 28; i++) {
        const freq = arpeggio[i % arpeggio.length];
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);
        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
        noteTime += 0.07; // faster arpeggio
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
        osc.type = 'sawtooth';
        
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, finalChordT);
        filter.frequency.linearRampToValueAtTime(4000, finalChordT + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        
        gain.gain.setValueAtTime(0, finalChordT);
        gain.gain.linearRampToValueAtTime(0.2, finalChordT + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, finalChordT + 3.5);
        osc.start(finalChordT);
        osc.stop(finalChordT + 3.6);
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
    playScreech,
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
