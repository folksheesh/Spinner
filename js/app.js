/**
 * MAIN APP v2 — Semua slot berputar, STOP mengunci satu per satu
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
  get winnerPanel()       { return document.getElementById('winner-panel'); },
  get winnerName()        { return document.getElementById('winner-name'); },
  get winnerId()          { return document.getElementById('winner-id-display'); },
  get winnerDept()        { return document.getElementById('winner-dept'); },
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
};

// ── Particles ──────────────────────────────────────────────
function initParticles() {
  const c = DOM.particles; if (!c) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*8}s;animation-duration:${6+Math.random()*6}s;width:${2+Math.random()*4}px;height:${2+Math.random()*4}px;opacity:${0.1+Math.random()*0.4}`;
    c.appendChild(p);
  }
}

// ── Confetti ───────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#FFEAA7','#DDA0DD'];
  const c = DOM.confettiContainer; if (!c) return;
  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};width:${6+Math.random()*10}px;height:${6+Math.random()*10}px;animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;border-radius:${Math.random()>.5?'50%':'2px'};transform:rotate(${Math.random()*360}deg)`;
      c.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 15);
  }
}

// ── Helpers ────────────────────────────────────────────────
function setStatus(text, type = 'idle') {
  const el = DOM.statusText; if (!el) return;
  el.textContent = text;
  el.className = 'status-text status-' + type;
}

function updateStats() {
  if (DOM.statsTotal)     DOM.statsTotal.textContent     = DB.getTotalParticipants();
  if (DOM.statsRemaining) DOM.statsRemaining.textContent = DB.getRemainingCount();
  if (DOM.statsWinners)   DOM.statsWinners.textContent   = DB.getWinnersCount();
  if (DOM.prizeRound)     DOM.prizeRound.textContent     = `Undian ke-${AppState.prizeRound}`;
}

function updateWinnersList() {
  const list = DOM.winnersList; if (!list) return;
  list.innerHTML = '';
  [...DB.winners].reverse().forEach((w, i) => {
    const item = document.createElement('div');
    item.className = 'winners-list-item';
    item.innerHTML = `<span class="wl-round">#${DB.winners.length - i}</span><span class="wl-id">${w.id}</span><span class="wl-name">${w.name}</span>`;
    list.appendChild(item);
  });
}

function resetDigitDisplay() {
  DOM.digitSlots.forEach(slot => {
    slot.classList.remove('revealed','rolling','locked');
    const d = slot.querySelector('.digit-display');
    if (d) d.textContent = '?';
  });
}

// ── Button State ───────────────────────────────────────────
function updateButton() {
  const btn = DOM.actionBtn; if (!btn) return;
  const textEl = btn.querySelector('.btn-text');
  const subEl  = btn.querySelector('.btn-sub');

  if (AppState.phase === PHASE.IDLE || AppState.phase === PHASE.DONE) {
    btn.className = 'action-btn btn-start';
    if (textEl) textEl.textContent = AppState.phase === PHASE.DONE ? '▶ UNDIAN BERIKUTNYA' : '▶ MULAI UNDIAN';
    if (subEl)  subEl.textContent  = 'Klik untuk memutar semua slot';
    btn.disabled = false;
  } else {
    btn.className = 'action-btn btn-stop';
    if (textEl) textEl.textContent = '⏹ STOP';
    if (subEl)  subEl.textContent  = `Kunci digit ke-${AppState.stoppedCount + 1} dari 6`;
    btn.disabled = false;
  }
}

// ── START — semua slot berputar ────────────────────────────
function startAllSpinning() {
  const winner = DB.pickRandom();
  if (!winner) { setStatus('⚠️ Semua peserta sudah menang!', 'warning'); return; }

  SoundEngine.unlock();
  AppState.currentWinner = winner;
  AppState.stoppedCount  = 0;
  AppState.phase         = PHASE.SPINNING;

  DOM.winnerPanel.classList.remove('visible');
  resetDigitDisplay();
  setStatus('🎰 Semua slot berputar! Tekan STOP untuk mengunci digit.', 'spinning');

  // Putar semua 6 slot sekaligus
  DOM.digitSlots.forEach((slot, i) => {
    const display = slot.querySelector('.digit-display');
    slot.classList.add('rolling');
    slot.classList.remove('revealed','locked');
    display.textContent = Math.floor(Math.random() * 10);
    const speed = 55 + i * 7; // sedikit berbeda tiap slot
    AppState.rollIntervals[i] = setInterval(() => {
      display.textContent = Math.floor(Math.random() * 10);
    }, speed);
  });

  // Suara tick bersama (bukan per slot — supaya tidak terlalu berisik)
  AppState.tickInterval = setInterval(() => {
    SoundEngine.playTick(0.7 + Math.random() * 0.5);
  }, 110);

  updateButton();
  updateStats();
  SyncEngine.emit('phase_change', { phase: PHASE.SPINNING, stoppedCount: 0 });
}

// ── STOP — kunci 1 slot ────────────────────────────────────
function stopNextSlot() {
  const idx = AppState.stoppedCount;
  if (idx >= 6 || AppState.phase !== PHASE.SPINNING) return;

  const targetDigit = AppState.currentWinner.id[idx];

  // Hentikan interval slot ini
  clearInterval(AppState.rollIntervals[idx]);
  AppState.rollIntervals[idx] = null;

  // Set digit akhir + animasi lock
  const slot    = DOM.digitSlots[idx];
  const display = slot.querySelector('.digit-display');
  display.textContent = targetDigit;
  slot.classList.remove('rolling');
  slot.classList.add('revealed');
  setTimeout(() => { slot.classList.add('locked'); SoundEngine.playLock(); }, 60);

  AppState.stoppedCount++;

  if (AppState.stoppedCount < 6) {
    setStatus(`🔒 Digit ${AppState.stoppedCount} terkunci! Tekan STOP lagi...`, 'spinning');
    updateButton();
  }

  SyncEngine.emit('phase_change', { phase: PHASE.SPINNING, stoppedCount: AppState.stoppedCount });

  // Semua terkunci → tampilkan pemenang
  if (AppState.stoppedCount === 6) {
    clearInterval(AppState.tickInterval);
    AppState.tickInterval = null;
    AppState.phase = PHASE.DONE;
    setTimeout(() => showWinner(AppState.currentWinner), 700);
  }
}

// ── Show Winner ────────────────────────────────────────────
function showWinner(winner) {
  DB.markWinner(winner);
  DOM.winnerName.textContent = winner.name;
  DOM.winnerId.textContent   = winner.id;
  DOM.winnerDept.textContent = winner.department;
  DOM.winnerPanel.classList.add('visible');
  SoundEngine.playWinner();
  launchConfetti();
  setStatus('🏆 SELAMAT KEPADA PEMENANG!', 'winner');
  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 600);
  AppState.prizeRound++;
  updateStats();
  updateWinnersList();
  updateButton();
  SyncEngine.emit('winner_revealed', { winner });
}

// ── Main action dispatcher ─────────────────────────────────
function handleAction() {
  if (AppState.phase === PHASE.IDLE || AppState.phase === PHASE.DONE) {
    startAllSpinning();
  } else if (AppState.phase === PHASE.SPINNING) {
    stopNextSlot();
  }
}

// ── Reset semua ────────────────────────────────────────────
function stopAllIntervals() {
  AppState.rollIntervals.forEach(id => clearInterval(id));
  AppState.rollIntervals = [];
  clearInterval(AppState.tickInterval);
  AppState.tickInterval = null;
}

function resetAll() {
  stopAllIntervals();
  if (!confirm('Reset semua data pemenang? Semua peserta kembali ke pool.')) return;
  AppState.phase        = PHASE.IDLE;
  AppState.stoppedCount = 0;
  AppState.currentWinner = null;
  AppState.prizeRound    = 1;
  DB.resetWinners();
  resetDigitDisplay();
  DOM.winnerPanel.classList.remove('visible');
  setStatus('✨ Siap untuk memulai undian!', 'idle');
  updateButton();
  updateStats();
  updateWinnersList();
}

// ── QR Code ────────────────────────────────────────────────
function generateQR() {
  const qrContainer = document.getElementById('qr-container'); if (!qrContainer) return;
  const url = SyncEngine.getRemoteURL();
  qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}" alt="QR Remote" class="qr-image"><p class="qr-url">${url}</p>`;
}

// ── Event Bindings ─────────────────────────────────────────
function bindEvents() {
  DOM.actionBtn?.addEventListener('click', () => { SoundEngine.unlock(); SyncEngine.emit('action'); });
  DOM.resetBtn?.addEventListener('click', resetAll);
  DOM.soundBtn?.addEventListener('click', () => {
    const on = SoundEngine.toggle();
    DOM.soundBtn.textContent = on ? '🔊' : '🔇';
  });
  window.addEventListener('doorprize:action', handleAction);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); SoundEngine.unlock(); SyncEngine.emit('action'); }
  });
}

// ── Init ───────────────────────────────────────────────────
function init() {
  SyncEngine.init('host');
  initParticles();
  updateStats();
  updateWinnersList();
  bindEvents();
  generateQR();
  updateButton();
  setStatus('✨ Siap untuk memulai undian!', 'idle');
  setTimeout(() => document.body.classList.add('loaded'), 300);
}

document.addEventListener('DOMContentLoaded', init);
