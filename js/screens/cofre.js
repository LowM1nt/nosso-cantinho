import { CONFIG } from '../config.js';
import { CONTENT } from '../content.js';
import { validateVaultCombo } from '../fragments.js';
import { sendWhatsApp } from '../notify.js';
import { answerMatches } from '../engine/answer.js';
import { unlockedHintLevel } from '../engine/hints.js';
import { imgFb, polaroidWall } from '../ui-img.js';

export function renderCofre(state, persist, doc = document) {
  const el = doc.getElementById('screen-cofre');
  el.className = 'screen min-h-screen p-6 flex flex-col items-center justify-center';

  // BYPASS-DEV: ?bypass deixa abrir o cofre sem os 4 fragmentos / sem charadas (só teste).
  const BYPASS = new URLSearchParams(window.location.search).has('bypass');
  if (state.fragmentosColetados.length < 4 && !BYPASS) {
    el.innerHTML = `<div class="text-center"><div class="text-6xl mb-3">🔐</div>
      <p>O cofre só abre com os 4 fragmentos, princesa 🎀</p></div>`;
    return;
  }

  // Já aberto, ou modo teste: vai direto pra senha. Senão, passa pelas 4 charadas.
  if (state.cofreAberto || BYPASS) return renderVault(el, state, persist, doc);
  renderCadeados(el, state, persist, doc, () => renderVault(el, state, persist, doc));
}

// 4 charadas (difícil) que destravam o cofre. Cada uma com dicas progressivas.
function renderCadeados(el, state, persist, doc, onAllSolved) {
  const cads = CONTENT.fase5.cadeados;
  el.innerHTML = `
    <div class="text-6xl mb-3 anim-float">🔐✨</div>
    <h2 class="font-titulo text-2xl text-cereja mb-1">Cofre Final</h2>
    <p class="text-sm mb-4 text-center max-w-sm">Quatro perguntas guardam o cofre. Responda todas pra liberar a senha 💝</p>
    <div id="cads" class="w-full max-w-md grid gap-3"></div>`;
  const host = doc.getElementById('cads');
  let solved = 0;

  cads.forEach((c, i) => {
    const card = doc.createElement('div');
    card.className = 'glass rounded-2xl p-4 anim-fadeup';
    card.innerHTML = `
      <p class="mb-2 text-sm">🔒 ${c.charada}</p>
      <div class="flex gap-2">
        <input id="cad-${i}" class="flex-1 rounded-full border-2 border-rosa px-3 py-2 text-center" placeholder="resposta" />
        <button id="cadbtn-${i}" class="rounded-full bg-cereja text-marfim font-titulo px-4 btn-glow">✓</button>
      </div>
      <div id="cadhint-${i}" class="text-center mt-1"></div>
      <p id="cadmsg-${i}" class="text-center text-cereja text-sm mt-1 h-5"></p>`;
    host.appendChild(card);

    const input = card.querySelector(`#cad-${i}`);
    const btn = card.querySelector(`#cadbtn-${i}`);
    const hintZone = card.querySelector(`#cadhint-${i}`);
    const msg = card.querySelector(`#cadmsg-${i}`);
    let attempts = 0;
    const startedAt = Date.now();
    let done = false;

    function refreshHint() {
      if (done) return;
      const lvl = unlockedHintLevel(attempts, Date.now() - startedAt);
      if (lvl <= 0) return;
      const max = Math.min(lvl, c.hints.length);
      hintZone.innerHTML = `<button class="text-xs underline opacity-80">🎀 dicinha (${max})</button><p class="text-xs mt-1 opacity-80"></p>`;
      hintZone.querySelector('button').addEventListener('click', () => {
        hintZone.querySelector('p').textContent = c.hints[max - 1];
      });
    }
    const timer = setInterval(refreshHint, 20000);

    function go() {
      if (done) return;
      if (answerMatches(input.value, c.resposta)) {
        done = true; clearInterval(timer);
        card.classList.add('border-4', 'border-emerald-300');
        input.disabled = true; btn.disabled = true; hintZone.innerHTML = '';
        msg.textContent = 'Isso! 💚';
        solved++;
        if (solved === cads.length) setTimeout(onAllSolved, 700);
      } else {
        attempts++; refreshHint(); msg.textContent = 'Hmm, não é essa 🌸';
      }
    }
    btn.addEventListener('click', go);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

// Senha final (montar os 4 fragmentos) + revelação.
function renderVault(el, state, persist, doc) {
  el.innerHTML = `
    <div class="text-6xl mb-3 anim-float">💎🔐</div>
    <h2 class="font-titulo text-2xl text-cereja mb-1">Cofre Final</h2>
    <p class="text-sm mb-4 text-center max-w-sm">${CONTENT.fase5.montagem.dica}</p>
    <div class="grid grid-cols-4 gap-2 mb-3">
      ${[0,1,2,3].map(i =>
        `<input id="slot-${i}" maxlength="6" placeholder="🎀" aria-label="fragmento ${i + 1}"
          class="w-full rounded-xl glass border-2 border-rosa px-2 py-3 text-center uppercase font-titulo" />`).join('')}
    </div>
    <button id="cofre-btn" class="rounded-full bg-cereja text-marfim font-titulo px-8 py-3 anim-bounce btn-glow">Abrir 💖</button>
    <p id="cofre-msg" class="text-cereja mt-3 h-6"></p>
    <div id="voucher" class="hidden mt-6 glass-strong rounded-3xl p-6 max-w-sm text-center anim-fadeup"></div>
    <div id="mural-fotos" class="hidden mt-8 w-full max-w-2xl"></div>`;

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
    <div class="-mt-2 mb-1">
      ${imgFb('img/kitty-waving.png', { alt: 'gatinha comemorando', cls: 'w-24 mx-auto anim-float drop-shadow', fb: '🐱🎉', fbCls: 'text-5xl' })}
    </div>
    <div class="text-5xl mb-2">🏨✨</div>
    <h3 class="font-titulo text-xl text-cereja mb-2">${v.titulo}</h3>
    <p class="mb-1"><strong>Hotel:</strong> ${v.hotel}</p>
    <p class="mb-1"><strong>Inclui:</strong> ${v.inclui}</p>
    <p class="mb-1"><strong>Validade:</strong> ${v.validade}</p>
    <p class="mt-3 italic">${v.dedicatoria}</p>`;

  // mural de Polaroids do casal (clímax: as nossas fotos 🎀)
  const mural = doc.getElementById('mural-fotos');
  if (mural && CONFIG.fotos?.length) {
    mural.classList.remove('hidden');
    mural.innerHTML = `
      <h3 class="font-titulo text-xl text-cereja text-center mb-4">📸 Nossas memórias 🎀</h3>
      ${polaroidWall(CONFIG.fotos)}`;
  }

  if (window.confetti) {
    const heart = window.confetti.shapeFromText ? window.confetti.shapeFromText({ text: '❤️' }) : undefined;
    window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, shapes: heart ? [heart] : undefined });
  }
}
