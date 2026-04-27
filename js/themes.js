/**
 * THEME SWITCHER
 * 5 themes: elegant (default), arcade, cosmic, ember, glacier
 */

const THEMES = [
  { id: 'elegant', name: 'Elegant',  colors: ['#D4A843', '#08081a'] },
  { id: 'arcade',  name: 'Arcade',   colors: ['#00FF88', '#050510'] },
  { id: 'cosmic',  name: 'Cosmic',   colors: ['#A78BFA', '#0a0620'] },
  { id: 'ember',   name: 'Ember',    colors: ['#FF6B00', '#0e0500'] },
  { id: 'glacier', name: 'Glacier',  colors: ['#60A5FA', '#060e1a'] },
];

function setTheme(id) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  document.body.classList.add('theme-' + id);
  localStorage.setItem('doorprize_theme', id);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === id);
  });
}

function buildSwitcher() {
  const container = document.getElementById('theme-switcher');
  if (!container) return;
  THEMES.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.dataset.theme = t.id;
    btn.title = t.name;
    btn.innerHTML = `<span class="theme-swatch" style="background:linear-gradient(135deg,${t.colors[0]},${t.colors[1]})"></span><span class="theme-label">${t.name}</span>`;
    btn.addEventListener('click', () => setTheme(t.id));
    container.appendChild(btn);
  });
}

function initThemes() {
  buildSwitcher();
  setTheme(localStorage.getItem('doorprize_theme') || 'elegant');
}

document.addEventListener('DOMContentLoaded', initThemes);
