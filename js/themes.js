/**
 * THEME SWITCHER
 * 5 themes: elegant (default), arcade, cosmic, ember, glacier
 */

const THEMES = [
  {
    id:     'elegant',
    name:   'Elegant Night',
    emoji:  '✦',
    colors: ['#C9A84C', '#13131e', '#0b0b12'],
  },
  {
    id:     'arcade',
    name:   'Neon Arcade',
    emoji:  '⚡',
    colors: ['#00FF88', '#050508', '#0a0a10'],
  },
  {
    id:     'cosmic',
    name:   'Cosmic Dream',
    emoji:  '🌌',
    colors: ['#A78BFA', '#060410', '#0e0820'],
  },
  {
    id:     'ember',
    name:   'Ember Glow',
    emoji:  '🔥',
    colors: ['#FF6B00', '#0a0400', '#160800'],
  },
  {
    id:     'glacier',
    name:   'Glacier',
    emoji:  '❄',
    colors: ['#60A5FA', '#080c14', '#0f1520'],
  },
];

function setTheme(id) {
  // Remove existing theme classes
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  // Apply new theme
  document.body.classList.add('theme-' + id);
  // Persist
  localStorage.setItem('doorprize_theme', id);
  // Update switcher active state
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === id);
  });
}

function buildSwitcher() {
  const container = document.getElementById('theme-switcher');
  if (!container) return;
  THEMES.forEach(t => {
    const btn = document.createElement('button');
    btn.className   = 'theme-btn';
    btn.dataset.theme = t.id;
    btn.title       = t.name;
    btn.innerHTML = `
      <span class="theme-swatch" style="background:linear-gradient(135deg,${t.colors[0]},${t.colors[1]})"></span>
      <span class="theme-label">${t.emoji} ${t.name}</span>
    `;
    btn.addEventListener('click', () => setTheme(t.id));
    container.appendChild(btn);
  });
}

function initThemes() {
  buildSwitcher();
  const saved = localStorage.getItem('doorprize_theme') || 'elegant';
  setTheme(saved);
}

document.addEventListener('DOMContentLoaded', initThemes);
