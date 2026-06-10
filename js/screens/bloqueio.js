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
    <div class="mb-1 anim-float">
      ${imgFb('img/kitty-sleeping-bed.png', { alt: 'gatinha dormindo na caminha', cls: 'w-56 max-w-[70%] mx-auto drop-shadow', fb: '🌙⭐😴🎀', fbCls: 'text-6xl' })}
    </div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">Hora do Soninho</h2>
    <p class="max-w-xs mb-8">${msg}</p>
    <div class="relative inline-block">
      <span class="absolute -top-5 -right-3 text-2xl anim-float">💤</span>
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
