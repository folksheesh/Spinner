document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('summary-content');
  if (!content) return;
  
  // Clone current winners before potential reset and reverse so the last drawn is 1st place
  const currentWinners = [...DB.winners].reverse();

  if (currentWinners.length === 0) {
    content.innerHTML = '<div class="podium-empty">Belum ada pemenang yang diundi.</div>';
  } else {
    const avatarEmojis = ['🏆','🥈','🥉','⭐','🎯','🎪','🎲'];
    const ordinal = (n) => {
      const s = ['th','st','nd','rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Show up to 7 winners
    const winners = currentWinners.slice(0, 7);
    const top3 = winners.slice(0, 3);
    const rest = winners.slice(3, 7);

    let html = '';

    // Top 3 in podium layout: 2nd, 1st, 3rd
    if (top3.length > 0) {
      html += '<div class="podium-top3">';
      const order = top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];
      order.forEach(idx => {
        const w = top3[idx];
        const place = idx + 1;
        html += `
          <div class="podium-card place-${place}" style="animation-delay: ${0.3 + idx * 0.2}s">
            ${place === 1 ? '<div class="grand-prize-label">GRAND PRIZE</div>' : ''}
            <div class="podium-rank">${place}<span class="podium-rank-suffix">${ordinal(place).replace(place,'')}</span></div>
            <div class="podium-avatar">${avatarEmojis[idx]}</div>
            <div class="podium-card-id">${w.id}</div>
            <div class="podium-card-name">${w.name}</div>
            <div class="podium-card-dept">${w.department}</div>
          </div>`;
      });
      html += '</div>';
    }

    // 4th-7th
    if (rest.length > 0) {
      html += '<div class="podium-remaining">';
      rest.forEach((w, i) => {
        const rank = i + 4;
        html += `
          <div class="podium-remaining-card" style="animation-delay: ${0.8 + i * 0.1}s">
            <div class="podium-remaining-rank">${rank}</div>
            <div class="podium-remaining-info">
              <div class="podium-remaining-id">${w.id}</div>
              <div class="podium-remaining-name">${w.name}</div>
              <div class="podium-remaining-dept">${w.department}</div>
            </div>
          </div>`;
      });
      html += '</div>';
    }

    content.innerHTML = html;
  }

  // Handle Export CSV
  document.getElementById('export-btn')?.addEventListener('click', () => {
    if (currentWinners.length === 0) {
      alert('Belum ada data pemenang untuk diekspor.');
      return;
    }
    let csv = 'No,ID,Nama,Departemen\n';
    currentWinners.forEach((w, i) => {
      csv += `${i + 1},${w.id},"${w.name}","${w.department}"\n`;
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
  });
});
