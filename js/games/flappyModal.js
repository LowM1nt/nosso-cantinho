import { renderFlappy } from './flappyGame.js';

// Abre o Flappy Kitty num modal (usado no Login e no Hub).
export function openFlappy(doc = document) {
  if (doc.getElementById('flappy-modal')) return;
  const modal = doc.createElement('div');
  modal.id = 'flappy-modal';
  modal.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4';
  modal.style.background = 'rgba(60,20,40,.45)';
  modal.innerHTML = `
    <div class="glass-strong rounded-3xl p-4 w-full max-w-xs text-center anim-fadeup">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-titulo text-cereja">Flappy Kitty 🐱</h3>
        <button id="flappy-close" class="rounded-full glass w-8 h-8 font-titulo text-cereja">✕</button>
      </div>
      <div id="flappy-host"></div>
    </div>`;
  doc.body.appendChild(modal);
  const cleanup = renderFlappy(doc.getElementById('flappy-host'), { doc });
  const close = () => { if (cleanup) cleanup(); modal.remove(); };
  doc.getElementById('flappy-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}
