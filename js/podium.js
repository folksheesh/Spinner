/**
 * PODIUM PAGE — 3-Session System
 * Session 1: Lucky Draw 1 (winners 1-3)
 * Session 2: Lucky Draw 2 (winners 4-6)
 * Session 3: Grand Prize  (winner 7)
 */
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('summary-content');
  if (!content) return;

  // ── Determine which session to show ──
  const urlParams   = new URLSearchParams(window.location.search);
  const session     = parseInt(urlParams.get('session')) || 1;
  const allWinners  = [...DB.winners]; // drawn in chronological order

  let sessionWinners, sessionTitle, sessionSubtitle, nextLabel, nextSession;

  if (session === 1) {
    sessionWinners  = allWinners.slice(0, 3);
    sessionTitle    = 'LUCKY DRAW';
    sessionSubtitle = 'Winners';
    nextLabel       = 'Lanjut ke Lucky Draw →';
    nextSession     = null; // back to index.html to continue drawing
  } else if (session === 2) {
    sessionWinners  = allWinners.slice(3, 6);
    sessionTitle    = 'LUCKY DRAW';
    sessionSubtitle = 'Winners';
    nextLabel       = 'Lanjut ke Grand Prize →';
    nextSession     = null;
  } else {
    sessionWinners  = allWinners.slice(6, 7);
    sessionTitle    = 'GRAND PRIZE';
    sessionSubtitle = '🏆 Pemenang Utama 🏆';
    nextLabel       = '← Kembali';
    nextSession     = null;
  }

  // ── Update page header ──
  const titleEl    = document.querySelector('.podium-title');
  const subtitleEl = document.querySelector('.podium-subtitle');
  const crownEl    = document.querySelector('.podium-crown');
  if (titleEl)    titleEl.textContent    = sessionTitle;
  if (subtitleEl) subtitleEl.textContent = sessionSubtitle;
  if (crownEl)    crownEl.textContent    = session === 3 ? '🏆' : '🎉';

  // ── Update close/back button ──
  const closeBtn = document.getElementById('close-summary');
  if (closeBtn) {
    closeBtn.title = nextLabel;
  }

  // ── Empty state ──
  if (sessionWinners.length === 0) {
    content.innerHTML = '<div class="podium-empty">Belum ada pemenang untuk sesi ini.</div>';
    return;
  }

  // ── GRAND PRIZE: special single-winner display ──
  if (session === 3) {
    const w = sessionWinners[0];
    content.innerHTML = `
      <div class="grand-prize-solo">
        <div class="gps-badge">GRAND PRIZE WINNER</div>
        <div class="gps-trophy">🏆</div>
        <div class="gps-id">${w.id}</div>
        <div class="gps-name">${w.name}</div>
        <div class="gps-dept">${w.department}</div>
      </div>
    `;
    return;
  }

  // ── LUCKY DRAW: 3-person podium (Equal Winners) ──
  // Display drawn winners from left to right equally
  const displayWinners = [...sessionWinners];
  const top3 = displayWinners.slice(0, 3);

  let html = '<div class="podium-top3">';
  top3.forEach((w, idx) => {
    if (!w) return;
    html += `
      <div class="podium-card place-equal" style="animation-delay: ${0.2 + idx * 0.15}s">
        <div class="podium-rank">🎉<span class="podium-rank-suffix"></span></div>
        <div class="podium-avatar">🏅</div>
        <div class="podium-card-id">${w.id}</div>
        <div class="podium-card-name">${w.name}</div>
        <div class="podium-card-dept">${w.department}</div>
      </div>`;
  });
  html += '</div>';
  content.innerHTML = html;

  // ── Export CSV ──
  document.getElementById('export-btn')?.addEventListener('click', () => {
    if (sessionWinners.length === 0) {
      alert('Belum ada data pemenang untuk diekspor.');
      return;
    }
    const label = session === 1 ? 'LuckyDraw1' : session === 2 ? 'LuckyDraw2' : 'GrandPrize';
    // Export in display order
    const exportList = [...sessionWinners];
    let csv = 'Status,ID,Nama,Departemen\n';
    
    exportList.forEach((w) => {
      csv += `Hadir (Winner),${w.id},"${w.name}","${w.department}"\n`;
    });

    if (DB && DB.absent && DB.absent.length > 0) {
      DB.absent.forEach((w) => {
        csv += `Gugur (Tidak Hadir),${w.id},"${w.name}","${w.department}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pemenang_${label}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
  
  // ── Play Podium Audio ──
  const podiumAudio = new Audio('assets/SFX/Podium.mp3');
  podiumAudio.loop = true;
  podiumAudio.volume = 0.6; // Adjust volume as needed
  
  // Try to play immediately (might be blocked by browser policy)
  podiumAudio.play().catch(e => {
    console.warn("Autoplay prevented. Audio will start on first interaction.", e);
    // If autoplay is prevented, play on first interaction
    document.addEventListener('click', () => {
      podiumAudio.play().catch(console.error);
    }, { once: true });
  });
});
