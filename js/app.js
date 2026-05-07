/**
 * MAIN APP v3 — Cinematic Stage Build
 */
const PHASE = { IDLE: 'idle', SPINNING: 'spinning', REVEALING: 'revealing', DONE: 'done', COOLDOWN: 'cooldown' };

const AppState = {
  phase: PHASE.IDLE,
  currentWinner: null,
  stoppedCount: 0,
  rollIntervals: [],
  tickInterval: null,
  prizeRound: 1,
  cursorHidden: false
};

const DOM = {
  get digitSlots()        { return document.querySelectorAll('.digit-slot'); },
  get digitsStage()       { return document.getElementById('digits-stage'); },
  get winnerPanel()       { return document.getElementById('winner-panel'); },
  get winnerName()        { return document.getElementById('winner-name'); },
  get winnerId()          { return document.getElementById('winner-id-display'); },
  get winnerDept()        { return document.getElementById('winner-dept'); },
  get winnerDismiss()     { return document.getElementById('winner-dismiss'); },
  get actionBtn()         { return document.getElementById('action-btn'); },
  get resetBtn()          { return document.getElementById('reset-btn'); },
  get soundBtn()          { return document.getElementById('sound-btn'); },
  get statsTotal()        { return document.getElementById('stat-total'); },
  get statsRemaining()    { return document.getElementById('stat-remaining'); },
  get statsWinners()      { return document.getElementById('stat-winners'); },
  get prizeRound()        { return document.getElementById('prize-round'); },
  get statusText()        { return document.getElementById('status-text'); },
  get confettiContainer() { return document.getElementById('confetti-container'); },
  get winnersList()       { return document.getElementById('winners-list'); },
  get particles()         { return document.getElementById('particles'); },
  get summaryBtn()        { return document.getElementById('summary-btn'); },
  get summaryPanel()      { return document.getElementById('summary-panel'); },
  get closeSummaryBtn()   { return document.getElementById('close-summary'); },
  get summaryContent()    { return document.getElementById('summary-content'); },
  get exportBtn()         { return document.getElementById('export-btn'); },
  get guideBtn()          { return document.getElementById('guide-btn'); },
  get guidePanel()        { return document.getElementById('guide-panel'); },
  get closeGuideBtn()     { return document.getElementById('close-guide'); },
};

// ── Particles (subtle, small) ──────────────────────────────
function initParticles() {
  const c = DOM.particles; if (!c) return;
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 1.5 + Math.random() * 2.5;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${20 + Math.random() * 70}%;
      width: ${size}px; height: ${size}px;
      animation-delay: ${Math.random() * 10}s;
      animation-duration: ${8 + Math.random() * 8}s;
      opacity: ${0.15 + Math.random() * 0.3};
    `;
    c.appendChild(p);
  }
}

// ── Confetti (winner celebration) ──────────────────────────
function launchConfetti() {
  const colors = ['#D4A843','#F0C45A','#3BE8A0','#60A5FA','#F472B6','#FBBF24','#A78BFA'];
  const c = DOM.confettiContainer; if (!c) return;
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const w = 5 + Math.random() * 10;
      const h = 5 + Math.random() * 10;
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${w}px; height: ${h}px;
        animation-duration: ${2 + Math.random() * 2.5}s;
        border-radius: ${Math.random() > 0.4 ? '50%' : '2px'};
      `;
      c.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, i * 18);
  }
}

// ── Helpers ────────────────────────────────────────────────
function setStatus(text, type = 'idle') {
  const el = DOM.statusText; if (!el) return;
  el.textContent = text;
  el.className = 'status-line' + (type !== 'idle' ? ' status-' + type : '');
}

// ── Session info (3-session system) ───────────────────────
// Session 1: Lucky Draw (draws 1-3)
// Session 2: Lucky Draw (draws 4-6)
// Session 3: Grand Prize  (draw 7)
function getSessionInfo(prizeRound) {
  if (prizeRound <= 3) {
    return {
      session: 1, name: 'Lucky Draw',
      sessionRound: prizeRound,
      isGrandPrize: false,
      isLastInSession: prizeRound === 3
    };
  }
  if (prizeRound <= 6) {
    return {
      session: 2, name: 'Lucky Draw',
      sessionRound: prizeRound - 3,
      isGrandPrize: false,
      isLastInSession: prizeRound === 6
    };
  }
  return {
    session: 3, name: 'Grand Prize',
    sessionRound: 1,
    isGrandPrize: true,
    isLastInSession: true
  };
}

function updateStats() {
  if (DOM.statsTotal)     DOM.statsTotal.textContent     = DB.getTotalParticipants();
  if (DOM.statsRemaining) DOM.statsRemaining.textContent = DB.getRemainingCount();
  if (DOM.statsWinners)   DOM.statsWinners.textContent   = DB.getWinnersCount();
  
  const info = getSessionInfo(AppState.prizeRound);
  
  if (DOM.prizeRound) {
    if (info.isGrandPrize) {
      DOM.prizeRound.textContent = '🏆 Grand Prize';
    } else {
      DOM.prizeRound.textContent = info.name;
    }
  }
  
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    if (info.isGrandPrize) {
      heroTitle.textContent = 'Grand Prize';
    } else {
      heroTitle.textContent = 'Lucky Draw';
    }
  }
}

function updateWinnersList() {
  const list = DOM.winnersList; if (!list) return;
  list.innerHTML = '';
  if (DB.winners.length === 0) {
    list.innerHTML = '<span class="empty-tray">No winners yet</span>';
    return;
  }
  [...DB.winners].reverse().forEach(w => {
    const chip = document.createElement('div');
    chip.className = 'wh-chip';
    chip.innerHTML = `<span class="wh-id">${w.id}</span><span class="wh-name">${w.name}</span>`;
    list.appendChild(chip);
  });
}

function resetDigitDisplay() {
  DOM.digitSlots.forEach(slot => {
    slot.classList.remove('revealed','rolling','locked','slowing');
    const d = slot.querySelector('.digit-display');
    if (d) d.textContent = '?';
  });
  DOM.digitsStage?.classList.remove('active');
}

// ── Button UI ──────────────────────────────────────────────
function updateButton() {
  const btn = DOM.actionBtn; if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const sub  = btn.querySelector('.btn-sub');

  if (AppState.phase === PHASE.IDLE) {
    btn.className = 'action-btn btn-start';
    text.textContent = AppState.prizeRound > 1 ? 'Next Draw' : 'Start Draw';
    sub.textContent  = 'Spin all digits';
    btn.disabled = false;
  } else if (AppState.phase === PHASE.DONE) {
    btn.className = 'action-btn btn-stop';
    text.textContent = 'Waiting...';
    sub.textContent  = 'Menunggu Keputusan Operator';
    btn.disabled = true;
  } else if (AppState.phase === PHASE.REVEALING || AppState.phase === PHASE.COOLDOWN) {
    btn.className = 'action-btn btn-stop';
    text.textContent = 'Wait';
    sub.textContent  = AppState.phase === PHASE.REVEALING ? 'Revealing winner...' : 'Ready for next draw...';
    btn.disabled = true;
  } else {
    btn.className = 'action-btn btn-stop';
    text.textContent = 'Stop';
    sub.textContent  = `Lock digit ${Math.min(AppState.stoppedCount + 1, 6)} of 6`;
    btn.disabled = false;
  }
}

// ── Presentation Mode ──────────────────────────────────────
function setPresentationMode(hidden) {
  AppState.cursorHidden = hidden;
  document.body.style.cursor = hidden ? 'none' : '';
  
  const uiState = hidden ? '0' : '1';
  const pointerState = hidden ? 'none' : 'auto';
  
  if (DOM.actionBtn) {
    DOM.actionBtn.style.opacity = uiState;
    DOM.actionBtn.style.pointerEvents = pointerState;
  }
  
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    topBar.style.transition = 'opacity 0.3s ease';
    topBar.style.opacity = uiState;
    topBar.style.pointerEvents = pointerState;
  }
  
  const bottomTray = document.querySelector('.bottom-tray');
  if (bottomTray) {
    bottomTray.style.transition = 'opacity 0.3s ease';
    bottomTray.style.opacity = uiState;
    bottomTray.style.pointerEvents = pointerState;
  }
}

// ── START ──────────────────────────────────────────────
function startAllSpinning() {
  // Guard: ignore if already spinning or in non-startable phase
  if (AppState.phase !== PHASE.IDLE) return;

  if (DB.winners.length >= 7) {
    const txt = document.getElementById('reset-modal-text');
    if (txt) txt.innerHTML = 'Sudah ada 7 pemenang terpilih.<br><br>Apakah Anda ingin mereset data dan memulai undian baru dari awal?';
    document.getElementById('reset-modal')?.classList.add('visible');
    if (AppState.cursorHidden) {
      setPresentationMode(false);
    }
    return;
  }

  const winner = DB.pickRandom();
  if (!winner) { setStatus('All participants have won!', 'warning'); return; }

  SoundEngine.unlock();
  // Stop any lingering tension sound from previous round
  SoundEngine.stopTension();

  // Clear any lingering intervals from a previous aborted round
  AppState.rollIntervals.forEach(id => { clearInterval(id); clearTimeout(id); });
  AppState.rollIntervals = [];

  AppState.currentWinner = winner;
  AppState.stoppedCount  = 0;
  AppState.phase         = PHASE.SPINNING;

  // Dismiss winner panel if visible
  DOM.winnerPanel?.classList.remove('visible');
  resetDigitDisplay();
  DOM.digitsStage?.classList.add('active');

  setStatus('Spinning...', 'spinning');

  // Start rolling all 6 slots
  DOM.digitSlots.forEach((slot, i) => {
    const display = slot.querySelector('.digit-display');
    slot.classList.add('rolling');
    slot.classList.remove('revealed', 'locked');
    const speed = 50 + i * 8;
    AppState.rollIntervals[i] = setInterval(() => {
      if (display) display.textContent = Math.floor(Math.random() * 10);
    }, speed);
  });

  // Fast spinning click sounds
  SoundEngine.startTension();

  updateButton();
  updateStats();
  SyncEngine.emit('phase_change', { phase: PHASE.SPINNING, stoppedCount: 0 });
}

// ── STOP (one slot) ────────────────────────────────────────
function stopNextSlot() {
  if (AppState.phase !== PHASE.SPINNING) return;
  if (!AppState.currentWinner) return;

  const idx = AppState.stoppedCount;
  if (idx >= 6) return;

  // Guard: if this slot is already being processed (double-click), skip BEFORE incrementing
  if (!AppState.rollIntervals[idx]) return;

  // Mark this interval as taken immediately to prevent race conditions
  const capturedInterval = AppState.rollIntervals[idx];
  AppState.rollIntervals[idx] = null;
  AppState.stoppedCount++;
  const isLastSlot = AppState.stoppedCount === 6;

  const slot    = DOM.digitSlots[idx];
  const display = slot.querySelector('.digit-display');

  // Switch to slowing phase
  slot.classList.remove('rolling');
  slot.classList.add('slowing');

  // Gradual slow down of the digit shuffling
  clearInterval(capturedInterval);
  SoundEngine.playScreech(idx);
  
  let slowDelay = 40;
  let slowsLeft = 4; // Number of slowing ticks
  
    const stage = DOM.digitsStage;
    if (!stage) return; // Guard: stage not in DOM
    const slotRect = slot.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const slotCenterX = slotRect.left - stageRect.left + slotRect.width / 2;
    const slotBottom  = slotRect.bottom - stageRect.top;

    const emitSmoke = (count) => {
      for (let i = 0; i < count; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.position = 'absolute';
        smoke.style.left = (slotCenterX + (Math.random() * 120 - 60)) + 'px';
        smoke.style.top  = (slotBottom - 25 - Math.random() * 50) + 'px';
        const size = Math.floor(12 + Math.random() * 24);
        smoke.style.setProperty('--size', size + 'px');
        smoke.style.setProperty('--smoke-x', (Math.random() * 200 - 100) + 'px');
        smoke.style.setProperty('--smoke-y', (-15 - Math.random() * 90) + 'px');
        smoke.style.animationDelay = (Math.random() * 0.15) + 's';
        if (Math.random() < 0.08) {
          smoke.style.zIndex = '3';
        }
        stage.appendChild(smoke);
        setTimeout(() => smoke.remove(), 2200);
      }
    };

    const emitSparks = (count) => {
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark-pixel';
        spark.style.position = 'absolute';
        spark.style.left = (slotCenterX + (Math.random() * 80 - 40)) + 'px';
        spark.style.top  = (slotBottom - 30 - Math.random() * 50) + 'px';
        const angle = Math.random() * Math.PI * 2;
        const dist  = 40 + Math.random() * 120;
        spark.style.setProperty('--spark-x', Math.cos(angle) * dist + 'px');
        spark.style.setProperty('--spark-y', Math.sin(angle) * dist + 'px');
        spark.style.animationDelay = (Math.random() * 0.2) + 's';
        const size = 3 + Math.random() * 5;
        spark.style.width  = size + 'px';
        spark.style.height = size + 'px';
        stage.appendChild(spark);
        setTimeout(() => spark.remove(), 1200);
      }
    };

    const emitDots = (count) => {
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'smoke-dot';
        dot.style.position = 'absolute';
        dot.style.left = (slotCenterX + (Math.random() * 100 - 50)) + 'px';
        dot.style.top  = (slotBottom - 30 - Math.random() * 40) + 'px';
        const angle = -Math.PI / 2 + (Math.random() * Math.PI - Math.PI / 2);
        const dist  = 20 + Math.random() * 80;
        dot.style.setProperty('--dot-x', Math.cos(angle) * dist + 'px');
        dot.style.setProperty('--dot-y', Math.sin(angle) * dist + 'px');
        dot.style.animationDelay = (Math.random() * 0.3) + 's';
        const sz = 1 + Math.random() * 2;
        dot.style.width  = sz + 'px';
        dot.style.height = sz + 'px';
        stage.appendChild(dot);
        setTimeout(() => dot.remove(), 1800);
      }
    };
  
  const tickSlow = () => {
    display.textContent = Math.floor(Math.random() * 10);
    slowsLeft--;
    slowDelay += 25; 
    
    if (slowsLeft % 2 === 0) {
      emitSmoke(8);
      emitDots(8);
      emitSparks(3);
    }
    
    if (slowsLeft > 0) {
      AppState.rollIntervals[idx] = setTimeout(tickSlow, slowDelay);
    } else {
      AppState.rollIntervals[idx] = null;
      const targetDigit = AppState.currentWinner.id[idx];
      display.textContent = targetDigit;
      slot.classList.remove('slowing');
      slot.classList.add('locked');
      SoundEngine.playLock();
      
      emitSmoke(25);
      emitSparks(20);
      emitDots(30);

    if (!isLastSlot) {
      setStatus(`Digit ${idx + 1} locked`, 'spinning');
      updateButton();
    }

    SyncEngine.emit('phase_change', { phase: PHASE.SPINNING, stoppedCount: idx + 1 });

    if (isLastSlot) {
      AppState.phase = PHASE.REVEALING;
      updateButton();
      DOM.digitsStage?.classList.remove('active');
      setTimeout(() => showWinner(AppState.currentWinner), 600);
    }
  } 
  }; 

  AppState.rollIntervals[idx] = setTimeout(tickSlow, slowDelay);
}

// ── WINNER REVEAL ──────────────────────────────────────────
function showWinner(winner) {
  if (!winner) return;
  DB.markWinner(winner);
  
  // Get session context BEFORE incrementing prizeRound
  const info = getSessionInfo(AppState.prizeRound);
  
  const eyebrow = document.querySelector('.winner-eyebrow');
  if (eyebrow) {
    if (info.isGrandPrize) {
      eyebrow.innerHTML = '<span>🏆 GRAND PRIZE 🏆</span>';
      DOM.winnerPanel?.classList.add('grand-prize');
    } else {
      eyebrow.innerHTML = `<span>${info.name}<br>WINNER</span>`;
      DOM.winnerPanel?.classList.remove('grand-prize');
    }
  }

  if (DOM.winnerId)   DOM.winnerId.textContent   = winner.id;
  if (DOM.winnerName) DOM.winnerName.textContent = winner.name;
  if (DOM.winnerDept) DOM.winnerDept.textContent = winner.department;
  DOM.winnerPanel?.classList.add('visible');

  SoundEngine.playWinner(info.isGrandPrize);
  launchConfetti();

  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 500);

  AppState.prizeRound++;
  
  const dismissBtn = document.getElementById('winner-dismiss');
  if (dismissBtn) dismissBtn.disabled = true;
  
  setTimeout(() => {
    AppState.phase = PHASE.DONE;
    if (dismissBtn) dismissBtn.disabled = false;
    updateButton();
  }, 1500);
  
  updateStats();
  updateWinnersList();
  updateButton();
  SyncEngine.emit('winner_revealed', { winner });
}

// ── Dismiss winner panel ───────────────────────────────────
function dismissWinner() {
  if (AppState.phase !== PHASE.DONE) return;

  DOM.winnerPanel?.classList.remove('visible');
  setStatus('Ready', 'idle');
  
  AppState.phase = PHASE.COOLDOWN;
  updateButton();
  
  setTimeout(() => {
    if (AppState.phase === PHASE.COOLDOWN) {
      AppState.phase = PHASE.IDLE;
      updateButton();
      SyncEngine.emit('phase_change', { phase: 'idle' });
    }
  }, 600);

  // Auto-show podium at the end of each session
  const winnerCount = DB.winners.length;
  if (winnerCount === 3) {
    // End of Lucky Draw 1 → show LD1 podium
    setTimeout(() => openSummary(1), 500);
  } else if (winnerCount === 6) {
    // End of Lucky Draw 2 → show LD2 podium
    setTimeout(() => openSummary(2), 500);
  } else if (winnerCount === 7) {
    // Grand Prize done → show Grand Prize screen
    setTimeout(() => openSummary(3), 500);
  }
}

// ── Disqualify/Absent winner ───────────────────────────────
function rejectWinner() {
  if (AppState.phase !== PHASE.DONE) return;
  if (!AppState.currentWinner) return;

  // Mark in DB
  DB.markAbsent(AppState.currentWinner);
  AppState.currentWinner = null;

  // Revert round counter so this slot can be drawn again
  AppState.prizeRound--;

  DOM.winnerPanel?.classList.remove('visible');
  setStatus('Ready (Redraw)', 'idle');
  
  AppState.phase = PHASE.COOLDOWN;
  updateButton();
  updateStats();
  updateWinnersList();
  
  setTimeout(() => {
    if (AppState.phase === PHASE.COOLDOWN) {
      AppState.phase = PHASE.IDLE;
      updateButton();
      SyncEngine.emit('phase_change', { phase: 'idle' });
    }
  }, 600);
}

// ── Action dispatcher ──────────────────────────────────────
function handleAction() {
  switch (AppState.phase) {
    case PHASE.IDLE:     startAllSpinning(); break;
    case PHASE.DONE:     dismissWinner();    break;
    case PHASE.SPINNING: stopNextSlot();     break;
    default: break;
  }
}

// ── Guide Panel ────────────────────────────────────────────
function openGuide() {
  const panel = DOM.guidePanel;
  if (panel) panel.classList.add('visible');
}

function closeGuide() {
  const panel = DOM.guidePanel;
  if (panel) panel.classList.remove('visible');
}

// ── Summary Panel ──────────────────────────────────────────
// session: 1 = Lucky Draw 1, 2 = Lucky Draw 2, 3 = Grand Prize
function openSummary(session) {
  if (!session) {
    // Determine from current winners count
    const count = DB.winners.length;
    if (count >= 7)      session = 3;
    else if (count >= 4) session = 2;
    else                 session = 1;
  }
  window.location.href = `podium.html?session=${session}`;
}

// ── Reset ──────────────────────────────────────────────
function resetAll() {
  // Stop all active intervals and timeouts
  AppState.rollIntervals.forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
  AppState.rollIntervals = [];

  if (AppState.tickInterval) {
    clearInterval(AppState.tickInterval);
    AppState.tickInterval = null;
  }

  // Stop any playing sounds
  SoundEngine.stopTension();

  // Remove any active smoke or particles from the stage
  document.querySelectorAll('.smoke-particle, .spark-pixel, .smoke-dot').forEach(el => el.remove());

  // Remove any lingering confetti
  const cc = DOM.confettiContainer;
  if (cc) cc.innerHTML = '';

  AppState.phase = PHASE.IDLE;
  AppState.stoppedCount = 0;
  AppState.currentWinner = null;
  AppState.prizeRound = 1;
  DB.resetWinners();
  resetDigitDisplay();
  DOM.winnerPanel?.classList.remove('visible');
  DOM.winnerPanel?.classList.remove('grand-prize');
  document.getElementById('reset-modal')?.classList.remove('visible');
  setStatus('Ready', 'idle');
  updateButton();
  updateStats();
  updateWinnersList();
}

// ── Bindings ───────────────────────────────────────────────
function bindEvents() {
  DOM.actionBtn?.addEventListener('click', () => { SoundEngine.unlock(); SyncEngine.emit('action'); });
  
  DOM.resetBtn?.addEventListener('click', () => {
    const txt = document.getElementById('reset-modal-text');
    if (txt) txt.innerHTML = 'Apakah Anda yakin ingin mereset data dan memulai undian baru dari awal?<br><br><b>Semua data pemenang saat ini akan terhapus.</b>';
    document.getElementById('reset-modal')?.classList.add('visible');
  });
  
  DOM.summaryBtn?.addEventListener('click', () => {
    document.getElementById('podium-modal')?.classList.add('visible');
  });

  document.getElementById('close-podium-modal')?.addEventListener('click', () => {
    document.getElementById('podium-modal')?.classList.remove('visible');
  });

  DOM.guideBtn?.addEventListener('click', openGuide);
  DOM.closeGuideBtn?.addEventListener('click', closeGuide);

  // Winner panel buttons have been moved to operator.html

  DOM.soundBtn?.addEventListener('click', () => {
    const on = SoundEngine.toggle();
    DOM.soundBtn.textContent = on ? '🔊' : '🔇';
  });

  document.getElementById('confirm-reset-btn')?.addEventListener('click', () => {
    document.getElementById('reset-modal')?.classList.remove('visible');
    resetAll();
  });
  
  document.getElementById('cancel-reset-btn')?.addEventListener('click', () => {
    document.getElementById('reset-modal')?.classList.remove('visible');
  });

  window.addEventListener('doorprize:action', handleAction);
  window.addEventListener('doorprize:reject', rejectWinner);

  // ── Click anywhere = Start/Stop (works with mouse, PPT remote, etc.) ──
  document.addEventListener('click', (e) => {
    // Don't trigger action for UI buttons / summary panel / winner panel
    const target = e.target;
    if (target.closest('.action-btn') ||
        target.closest('.top-bar') ||
        target.closest('.bottom-tray') ||
        target.closest('#reset-btn') ||
        target.closest('#sound-btn') ||
        target.closest('#summary-btn') ||
        target.closest('#summary-panel') ||
        target.closest('.podium-overlay') ||
        target.closest('#guide-btn') ||
        target.closest('#guide-panel') ||
        target.closest('#reset-modal') ||
        target.closest('#podium-modal') ||
        target.closest('.theme-dot') ||
        target.closest('.winner-panel') ||
        target.closest('#remote-pill')) return;

    if (AppState.phase === PHASE.DONE) return; // Block host from bypassing operator

    e.preventDefault();
    SoundEngine.unlock();
    SyncEngine.emit('action');
  });

  document.addEventListener('keydown', e => {
    const actionKeys = ['Space', 'PageDown', 'PageUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'];
    if (actionKeys.includes(e.code)) {
      e.preventDefault();
      if (AppState.phase === PHASE.DONE) return; // Block host from bypassing operator
      SoundEngine.unlock();
      SyncEngine.emit('action');
    }
    // X key for Absent/Disqualify
    if (e.code === 'KeyX' && AppState.phase === PHASE.DONE) {
      e.preventDefault();
      if (confirm('Yakin ingin membatalkan pemenang ini (TIDAK HADIR)?')) {
        rejectWinner();
      }
    }
    // F key toggles cursor visibility (display only)
    if (e.code === 'KeyF') {
      setPresentationMode(!AppState.cursorHidden);
    }
  });

  window.addEventListener('doorprize:pairing_code', e => {
    const pill = document.getElementById('remote-pill');
    const codeEl = document.getElementById('remote-code');
    if (pill && codeEl) {
      pill.style.display = 'flex';
      codeEl.textContent = 'Operator Ready';
      codeEl.style.color = 'var(--accent)';
    }
  });

  window.addEventListener('doorprize:remote_connected', () => {
    const codeEl = document.getElementById('remote-code');
    if (codeEl) {
      codeEl.textContent = 'Connected';
      codeEl.style.color = 'var(--green)';
    }
  });

  window.addEventListener('doorprize:remote_disconnected', () => {
    const codeEl = document.getElementById('remote-code');
    if (codeEl) {
      codeEl.textContent = 'Lost';
      codeEl.style.color = 'var(--red)';
    }
  });
}

// ── Init ───────────────────────────────────────────────────
function init() {
  SyncEngine.init('host');
  
  // Sync prizeRound with current winners so it doesn't reset to 1 on refresh
  AppState.prizeRound = DB.winners.length + 1;
  
  initParticles();
  updateStats();
  updateWinnersList();
  bindEvents();
  updateButton();
  setStatus('Ready', 'idle');
  setTimeout(() => document.body.classList.add('loaded'), 200);
}

document.addEventListener('DOMContentLoaded', init);
