import { CONFIG } from '../config.js';
import { normalizeText } from '../normalize.js';
import { imgFb } from '../ui-img.js';

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
    </div>`;

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
