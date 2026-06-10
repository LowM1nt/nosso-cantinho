import { msUntilNextMidnightSP, formatHMS } from '../time-helpers.js';
import { imgFb } from '../ui-img.js';

let timer = null;

// motivo: 'futuro' (tentou dia futuro) | 'concluido' (terminou enigma do dia)
export function renderBloqueio(motivo, doc = document) {
  const el = doc.getElementById('screen-bloqueio');
  const msg = motivo === 'concluido'
    ? 'Que delícia de aventura! A Kitty foi dormir 😴 Volte amanhã!'
    : 'A Kitty ainda está sonhando com esse dia 💤 Volte quando o sol nascer!';
  el.className = 'screen flex flex-col items-center justify-center min-h-screen p-6 text-center';
  el.innerHTML = `
    <div class="text-6xl mb-2 anim-float">🌙⭐✨</div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">Hora do Soninho</h2>
    <p class="max-w-xs mb-10">${msg}</p>
    <div class="relative inline-block">
      <div class="absolute -top-16 left-1/2 -translate-x-1/2 anim-float">
        ${imgFb('img/kitty-sleeping.svg', { alt: 'gatinha dormindo', cls: 'w-24', fb: '😴🎀', fbCls: 'text-5xl' })}
      </div>
      <span class="absolute -top-7 -right-3 text-2xl anim-float">💤</span>
      <div id="bloqueio-timer" class="font-titulo text-3xl bg-marfim rounded-2xl px-6 py-3 shadow">--:--:--</div>
    </div>
    <p class="text-xs mt-3">Próxima aventura à meia-noite 🎀</p>`;

  const out = doc.getElementById('bloqueio-timer');
  function tick() {
    const ms = msUntilNextMidnightSP(new Date());
    out.textContent = formatHMS(ms);
  }
  tick();
  if (timer) clearInterval(timer);
  timer = setInterval(tick, 1000);
}

export function stopBloqueio() { if (timer) { clearInterval(timer); timer = null; } }
