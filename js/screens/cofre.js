import { CONFIG } from '../config.js';
import { validateVaultCombo } from '../fragments.js';
import { sendWhatsApp } from '../notify.js';

export function renderCofre(state, persist, doc = document) {
  const el = doc.getElementById('screen-cofre');
  el.className = 'screen min-h-screen p-6 flex flex-col items-center justify-center';

  // Pré-condição: 4 fragmentos (sábado já validado pelo roteador em main.js).
  // BYPASS-DEV: ?bypass deixa abrir o cofre sem os 4 fragmentos (só teste). Remover depois.
  const BYPASS = new URLSearchParams(window.location.search).has('bypass');
  if (state.fragmentosColetados.length < 4 && !BYPASS) {
    el.innerHTML = `<div class="text-center"><div class="text-6xl mb-3">🔐</div>
      <p>O cofre só abre com os 4 fragmentos, princesa 🎀</p></div>`;
    return;
  }

  el.innerHTML = `
    <div class="text-6xl mb-3 anim-float">💎🔐</div>
    <h2 class="font-titulo text-2xl text-cereja mb-1">Cofre Final</h2>
    <p class="text-sm mb-4">Monte a senha: 🎀 _ _ _ 🎀</p>
    <div class="grid grid-cols-4 gap-2 mb-3">
      ${['HOT','EL','DE','LUXO'].map((hint,i) =>
        `<input id="slot-${i}" maxlength="6" placeholder="${hint}" aria-label="fragmento ${i + 1}"
          class="w-full rounded-xl border-2 border-rosa px-2 py-3 text-center uppercase font-titulo" />`).join('')}
    </div>
    <button id="cofre-btn" class="rounded-full bg-cereja text-marfim font-titulo px-8 py-3 anim-bounce">Abrir 💖</button>
    <p id="cofre-msg" class="text-cereja mt-3 h-6"></p>
    <div id="voucher" class="hidden mt-6 bg-marfim rounded-3xl shadow-xl p-6 max-w-sm text-center"></div>`;

  const msg = doc.getElementById('cofre-msg');
  doc.getElementById('cofre-btn').addEventListener('click', () => {
    const inputs = [0,1,2,3].map(i => doc.getElementById(`slot-${i}`).value);
    if (!validateVaultCombo(inputs, CONFIG.fragmentos)) {
      msg.textContent = 'Hmm, faltou um laço! Confere os fragmentos 🎀';
      el.querySelector('.anim-float').classList.add('anim-shake');
      setTimeout(() => el.querySelector('.anim-float').classList.remove('anim-shake'), 400);
      return;
    }
    state.cofreAberto = true; persist();
    sendWhatsApp('🎉 Ela abriu o Cofre Final! HOTEL DE LUXO revelado 💖');
    revealVoucher(doc);
  });

  if (state.cofreAberto) revealVoucher(doc); // re-entrar já aberto
}

function revealVoucher(doc) {
  const v = CONFIG.voucher;
  const box = doc.getElementById('voucher');
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="text-5xl mb-2">🏨✨</div>
    <h3 class="font-titulo text-xl text-cereja mb-2">${v.titulo}</h3>
    <p class="mb-1"><strong>Hotel:</strong> ${v.hotel}</p>
    <p class="mb-1"><strong>Inclui:</strong> ${v.inclui}</p>
    <p class="mb-1"><strong>Validade:</strong> ${v.validade}</p>
    <p class="mt-3 italic">${v.dedicatoria}</p>`;
  if (window.confetti) {
    const heart = window.confetti.shapeFromText ? window.confetti.shapeFromText({ text: '❤️' }) : undefined;
    window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, shapes: heart ? [heart] : undefined });
  }
}
