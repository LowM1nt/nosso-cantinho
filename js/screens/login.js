import { CONFIG } from '../config.js';
import { normalizeText } from '../normalize.js';
import { imgFb } from '../ui-img.js';
import { renderFlappy } from '../games/flappyGame.js';

// onSuccess() is called after the page-flip animation completes.
export function renderLogin(onSuccess, doc = document) {
  const el = doc.getElementById('screen-login');
  el.className = 'screen flex flex-col items-center justify-center min-h-screen p-6';
  el.innerHTML = `
    <div id="login-card" class="relative glass-strong rounded-3xl p-8 w-full max-w-sm text-center anim-float anim-fadeup hover-lift">
      <div class="absolute -top-16 left-1/2 -translate-x-1/2">
        ${imgFb('img/kitty-waving.png', { alt: 'gatinha acenando', cls: 'w-28 anim-float drop-shadow', fb: '🐱🎀', fbCls: 'text-5xl' })}
      </div>
      <div class="text-5xl mb-2 mt-6">🔒🎀</div>
      <h1 class="font-titulo text-2xl text-cereja mb-1">Diário Secreto</h1>
      <p class="text-sm mb-5">Sussurre a chavinha do nosso jardim 🌸</p>
      <input id="login-input" type="text" autocomplete="off" aria-label="senha do diário secreto"
        class="w-full rounded-full border-2 border-rosa px-4 py-3 text-center outline-none focus:border-cereja"
        placeholder="..." />
      <button id="login-btn"
        class="mt-4 w-full rounded-full bg-cereja text-marfim font-titulo py-3 anim-bounce btn-glow">🎀 Abrir 🎀</button>
      <p id="login-msg" class="text-sm text-cereja mt-3 h-5"></p>
    </div>
    <button id="open-flappy" class="mt-5 rounded-full glass px-5 py-2 font-titulo text-cereja hover-lift anim-fadeup">🎮 joguinho enquanto isso</button>`;

  doc.getElementById('open-flappy').addEventListener('click', () => openFlappy(doc));

  const input = doc.getElementById('login-input');
  const card  = doc.getElementById('login-card');
  const msg   = doc.getElementById('login-msg');

  // ignora acento, caixa E espaços ("meu amor" == "meuamor")
  const semEspaco = s => normalizeText(s).replace(/\s/g, '');
  function tryUnlock() {
    const guess = semEspaco(input.value);
    const ok = guess === semEspaco(CONFIG.senhaLogin)
            || guess === semEspaco(CONFIG.senhaRecuperacao);
    if (ok) {
      card.classList.add('anim-flip');
      setTimeout(onSuccess, 500);
    } else {
      card.classList.remove('anim-shake'); void card.offsetWidth; card.classList.add('anim-shake');
      msg.textContent = 'Hmm, essa chavinha não abriu 🔑 Tenta de novo!';
    }
  }

  doc.getElementById('login-btn').addEventListener('click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
}

// Modal com o jogo infinito (Flappy Kitty) pra passar o tempo.
function openFlappy(doc) {
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
