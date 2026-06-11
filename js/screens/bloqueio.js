import { msUntilNextMidnightSP, formatHMS } from '../time-helpers.js';
import { imgFb } from '../ui-img.js';

let timer = null;

// motivo: 'futuro' (dia ainda não chegou) | 'concluido' (terminou o dia) | 'sequencia' (falta dia anterior)
// onBack: opcional — volta pro jardim (hub).
export function renderBloqueio(motivo, onBack, doc = document) {
  const el = doc.getElementById('screen-bloqueio');
  const seq = motivo === 'sequencia';
  const titulo = seq ? 'Um de cada vez 🧩' : 'Hora do Soninho';
  const msg = motivo === 'concluido'
    ? 'Que delícia de aventura! A Kitty foi dormir 😴 Volte amanhã!'
    : seq
    ? 'Os dias abrem em ordem, princesa! Volte e jogue o dia anterior que falta pra liberar este 🧩💗'
    : 'A Kitty ainda está sonhando com esse dia 💤 Volte quando o sol nascer!';
  el.className = 'screen flex flex-col items-center justify-center min-h-screen p-6 text-center';
  el.innerHTML = `
    <div class="mb-1 anim-float">
      ${imgFb('img/kitty-sleeping-bed.png', { alt: 'gatinha dormindo na caminha', cls: 'w-56 max-w-[70%] mx-auto drop-shadow', fb: '🌙⭐😴🎀', fbCls: 'text-6xl' })}
    </div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">${titulo}</h2>
    <p class="max-w-xs mb-8">${msg}</p>
    ${seq ? '' : `
    <div class="relative inline-block">
      <span class="absolute -top-5 -right-3 text-2xl anim-float">💤</span>
      <div id="bloqueio-timer" class="font-titulo text-3xl glass-strong rounded-2xl px-6 py-3">--:--:--</div>
    </div>
    <p class="text-xs mt-3">Próxima aventura à meia-noite 🎀</p>`}
    <button id="bloqueio-back" class="mt-5 rounded-full glass px-6 py-2 font-titulo text-cereja hover-lift">← voltar ao jardim 🌸</button>`;

  const back = doc.getElementById('bloqueio-back');
  if (back) back.addEventListener('click', () => { stopBloqueio(); if (onBack) onBack(); });

  if (timer) { clearInterval(timer); timer = null; }
  const out = doc.getElementById('bloqueio-timer');
  if (out) {
    const tick = () => { out.textContent = formatHMS(msUntilNextMidnightSP(new Date())); };
    tick();
    timer = setInterval(tick, 1000);
  }
}

export function stopBloqueio() { if (timer) { clearInterval(timer); timer = null; } }
