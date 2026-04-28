/**
 * MAIN APP v3 — Cinematic Stage Build
 */
const PHASE = { IDLE: 'idle', SPINNING: 'spinning', DONE: 'done' };

const AppState = {
  phase: PHASE.IDLE,
  currentWinner: null,
  stoppedCount: 0,
  rollIntervals: [],
  tickInterval: null,
  prizeRound: 1,
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

function updateStats() {
  if (DOM.statsTotal)     DOM.statsTotal.textContent     = DB.getTotalParticipants();
  if (DOM.statsRemaining) DOM.statsRemaining.textContent = DB.getRemainingCount();
  if (DOM.statsWinners)   DOM.statsWinners.textContent   = DB.getWinnersCount();
  if (DOM.prizeRound)     DOM.prizeRound.textContent     = `Draw #${AppState.prizeRound}`;
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

  if (AppState.phase === PHASE.IDLE || AppState.phase === PHASE.DONE) {
    btn.className = 'action-btn btn-start';
    text.textContent = AppState.prizeRound > 1 ? 'Next Draw' : 'Start Draw';
    sub.textContent  = 'Spin all digits';
    btn.disabled = false;
  } else {
    btn.className = 'action-btn btn-stop';
    text.textContent = 'Stop';
    sub.textContent  = `Lock digit ${AppState.stoppedCount + 1} of 6`;
    btn.disabled = false;
  }
}

// ── START ──────────────────────────────────────────────────
function startAllSpinning() {
  const winner = DB.pickRandom();
  if (!winner) { setStatus('All participants have won!', 'warning'); return; }

  SoundEngine.unlock();
  AppState.currentWinner = winner;
  AppState.stoppedCount  = 0;
  AppState.phase         = PHASE.SPINNING;

  // Dismiss winner panel if visible
  DOM.winnerPanel.classList.remove('visible');
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
      display.textContent = Math.floor(Math.random() * 10);
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
  const idx = AppState.stoppedCount;
  if (idx >= 6 || AppState.phase !== PHASE.SPINNING) return;

  // Increment immediately so fast clicks register the next slot correctly
  AppState.stoppedCount++;
  const isLastSlot = AppState.stoppedCount === 6;

  const slot    = DOM.digitSlots[idx];
  const display = slot.querySelector('.digit-display');

  // Switch to slowing phase
  slot.classList.remove('rolling');
  slot.classList.add('slowing');

  // Gradual slow down of the digit shuffling
  clearInterval(AppState.rollIntervals[idx]);
  
  let slowDelay = 60;
  let slowsLeft = 7; // Number of slowing ticks
  
    const stage = DOM.digitsStage;
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
        // ~8% of smoke puffs appear IN FRONT of the tire for subtle depth
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
    slowDelay += 35; // 60, 95, 130, 165, 200, 235, 270...
    
    // Emit braking smoke gradually while slowing down
    if (slowsLeft % 2 === 0) {
      emitSmoke(8);
      emitDots(8);
      emitSparks(3);
    }
    
    if (slowsLeft > 0) {
      AppState.rollIntervals[idx] = setTimeout(tickSlow, slowDelay);
    } else {
      // Final lock
      AppState.rollIntervals[idx] = null;
      const targetDigit = AppState.currentWinner.id[idx];
      display.textContent = targetDigit;
      slot.classList.remove('slowing');
      slot.classList.add('locked');
      SoundEngine.playLock();
      
      // Emit the final big burst of smoke
      emitSmoke(25);
      emitSparks(20);
      emitDots(30);

    if (!isLastSlot) {
      setStatus(`Digit ${idx + 1} locked`, 'spinning');
      updateButton();
    }

    SyncEngine.emit('phase_change', { phase: PHASE.SPINNING, stoppedCount: idx + 1 });

    // All locked → winner
    if (isLastSlot) {
      clearInterval(AppState.tickInterval);
      AppState.tickInterval = null;
      AppState.phase = PHASE.DONE;
      DOM.digitsStage?.classList.remove('active');
      setTimeout(() => showWinner(AppState.currentWinner), 600);
    }
  } // end else
  }; // end tickSlow

  AppState.rollIntervals[idx] = setTimeout(tickSlow, slowDelay);
}

// ── WINNER REVEAL ──────────────────────────────────────────
function showWinner(winner) {
  DB.markWinner(winner);
  DOM.winnerId.textContent   = winner.id;
  DOM.winnerName.textContent = winner.name;
  DOM.winnerDept.textContent = winner.department;
  DOM.winnerPanel.classList.add('visible');

  SoundEngine.playWinner();
  launchConfetti();

  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 500);

  AppState.prizeRound++;
  updateStats();
  updateWinnersList();
  updateButton();
  SyncEngine.emit('winner_revealed', { winner });
}

// ── Dismiss winner panel ───────────────────────────────────
function dismissWinner() {
  DOM.winnerPanel.classList.remove('visible');
  setStatus('Ready', 'idle');
  AppState.phase = PHASE.IDLE;
  updateButton();
}

// ── Action dispatcher ──────────────────────────────────────
function handleAction() {
  if (AppState.phase === PHASE.IDLE) {
    startAllSpinning();
  } else if (AppState.phase === PHASE.DONE) {
    dismissWinner();
  } else if (AppState.phase === PHASE.SPINNING) {
    stopNextSlot();
  }
}

// ── Summary Panel ──────────────────────────────────────────
function openSummary() {
  const content = DOM.summaryContent;
  if (!content) return;
  
  if (DB.winners.length === 0) {
    content.innerHTML = '<div class="summary-empty">Belum ada pemenang yang diundi.</div>';
  } else {
    let html = '<div class="summary-list">';
    [...DB.winners].reverse().forEach((w, i) => {
      html += `
        <div class="summary-card" style="animation-delay: ${i * 0.04}s">
          <div class="sc-number">${String(i + 1).padStart(2, '0')}</div>
          <div class="sc-details">
            <div class="sc-id">${w.id}</div>
            <div class="sc-info">
              <span class="sc-name">${w.name}</span>
              <span class="sc-dot">•</span>
              <span class="sc-dept">${w.department}</span>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    content.innerHTML = html;
  }
  
  const footer = DOM.summaryPanel.querySelector('.summary-footer');
  let countEl = footer.querySelector('.summary-count');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.className = 'summary-count';
    footer.insertBefore(countEl, DOM.exportBtn);
  }
  countEl.innerHTML = `Total: <span>${DB.winners.length}</span> Winners`;

  DOM.summaryPanel.classList.add('visible');
}

function closeSummary() {
  DOM.summaryPanel.classList.remove('visible');
}

function exportCSV() {
  if (DB.winners.length === 0) {
    alert('Belum ada data pemenang untuk diekspor.');
    return;
  }
  let csv = 'No,ID,Nama,Departemen\\n';
  DB.winners.forEach((w, i) => {
    csv += `${i + 1},${w.id},"${w.name}","${w.department}"\\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Daftar_Pemenang_DoorPrize.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── Reset ──────────────────────────────────────────────────
function resetAll() {
  if (!confirm('Peringatan: Ini akan menghapus semua daftar pemenang. Lanjutkan?')) return;

  // Stop all active intervals and timeouts
  AppState.rollIntervals.forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
  AppState.rollIntervals = [];

  // Stop any playing sounds
  SoundEngine.stopTension();

  // Remove any active smoke or particles from the stage
  document.querySelectorAll('.smoke-particle, .spark-pixel, .smoke-dot').forEach(el => el.remove());

  AppState.phase = PHASE.IDLE;
  AppState.stoppedCount = 0;
  AppState.currentWinner = null;
  AppState.prizeRound = 1;
  DB.resetWinners();
  resetDigitDisplay();
  DOM.winnerPanel.classList.remove('visible');
  setStatus('Ready', 'idle');
  updateButton();
  updateStats();
  updateWinnersList();
}

// ── Bindings ───────────────────────────────────────────────
function bindEvents() {
  DOM.actionBtn?.addEventListener('click', () => { SoundEngine.unlock(); SyncEngine.emit('action'); });
  DOM.resetBtn?.addEventListener('click', resetAll);
  
  DOM.summaryBtn?.addEventListener('click', openSummary);
  DOM.closeSummaryBtn?.addEventListener('click', closeSummary);
  DOM.exportBtn?.addEventListener('click', exportCSV);

  DOM.soundBtn?.addEventListener('click', () => {
    const on = SoundEngine.toggle();
    DOM.soundBtn.textContent = on ? '🔊' : '🔇';
  });

  window.addEventListener('doorprize:action', handleAction);

  // ── Click anywhere = Start/Stop (works with mouse, PPT remote, etc.) ──
  let cursorHidden = false;
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
        target.closest('.theme-dot') ||
        target.closest('#remote-pill')) return;

    e.preventDefault();
    SoundEngine.unlock();
    SyncEngine.emit('action');
  });

  document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      SoundEngine.unlock();
      SyncEngine.emit('action');
    }
    // F key toggles cursor visibility (display only)
    if (e.code === 'KeyF') {
      cursorHidden = !cursorHidden;
      document.body.style.cursor = cursorHidden ? 'none' : '';
      if (DOM.actionBtn) {
        DOM.actionBtn.style.opacity = cursorHidden ? '0' : '1';
        DOM.actionBtn.style.pointerEvents = cursorHidden ? 'none' : 'auto';
      }
    }
  });

  window.addEventListener('doorprize:pairing_code', e => {
    const pill = document.getElementById('remote-pill');
    const codeEl = document.getElementById('remote-code');
    if (pill && codeEl) {
      pill.style.display = 'flex';
      codeEl.textContent = e.detail;
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
  initParticles();
  updateStats();
  updateWinnersList();
  bindEvents();
  updateButton();
  setStatus('Ready', 'idle');
  setTimeout(() => document.body.classList.add('loaded'), 200);
}

document.addEventListener('DOMContentLoaded', init);
