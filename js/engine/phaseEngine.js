import { unlockedHintLevel } from './hints.js';
import { answerMatches } from './answer.js';
import { getPhaseStep, setPhaseStep } from '../state.js';

// Roda uma fase multi-etapa dentro de `host`.
// steps: [{ titulo, render(host, ctx) }]
// bonus: { titulo, render(host, ctx) } -> ao resolver chama onCollect()
// onCollect: chamado quando a fase é concluída (coleta o fragmento).
// onWrong: chamado a cada erro (pra contabilizar tentativas no state global).
export function runPhase(host, { fase, steps, bonus, state, persist, doc = document, onCollect, onWrong }) {
  let idx = Math.min(getPhaseStep(state, fase), steps.length); // retoma de onde parou
  const all = bonus ? [...steps, { ...bonus, _bonus: true }] : steps;

  function drawProgress() {
    const dots = all.map((_, i) =>
      `<span class="step-dot ${i < idx ? 'done' : i === idx ? 'current' : ''}"></span>`).join('');
    return `<div class="step-dots mb-3">${dots}</div>`;
  }

  function renderStep() {
    const step = all[idx];
    const rotulo = step._bonus ? '🎁 Baú secreto' : `Etapa ${idx + 1}/${steps.length}`;
    host.innerHTML = `${drawProgress()}
      <div class="text-center text-sm mb-2 opacity-70">${idx > 0 ? '<button id="step-back" class="underline mr-2">← etapa anterior</button>' : ''}${rotulo}</div>
      <h3 class="font-titulo text-cereja text-center mb-3">${step.titulo}</h3>
      <div id="step-host" class="anim-fadeup"></div>
      <div id="hint-zone" class="text-center mt-3"></div>
      <p id="step-msg" class="text-center text-cereja mt-2 h-6"></p>`;

    const stepHost = host.querySelector('#step-host');
    const hintZone = host.querySelector('#hint-zone');
    const msgEl = host.querySelector('#step-msg');
    const backBtn = host.querySelector('#step-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      idx = Math.max(0, idx - 1);
      Object.assign(state, setPhaseStep(state, fase, idx));
      persist();
      renderStep();   // o jogo/etapa anterior é re-renderizado; jogos com canvas se limpam sozinhos
    });
    let attempts = 0;
    const startedAt = Date.now();
    let hints = null;

    function refreshHint() {
      if (!hints || !hints.length) return;
      const lvl = unlockedHintLevel(attempts, Date.now() - startedAt);
      if (lvl <= 0) { hintZone.innerHTML = ''; return; }
      const maxLvl = Math.min(lvl, hints.length);
      hintZone.innerHTML = `<button id="hint-btn" class="text-xs underline opacity-80">🎀 pedir dicinha (${maxLvl})</button>
        <p id="hint-text" class="text-xs mt-1 opacity-80"></p>`;
      hintZone.querySelector('#hint-btn').addEventListener('click', () => {
        hintZone.querySelector('#hint-text').textContent = hints[maxLvl - 1];
      });
    }

    const timer = setInterval(refreshHint, 20000); // reavalia dicas por tempo

    const ctx = {
      say(t) { msgEl.textContent = t; },
      wrong() { attempts++; refreshHint(); if (onWrong) onWrong(); },
      hintButton(h) { hints = h; refreshHint(); },
      solved() {
        clearInterval(timer);
        if (step._bonus) return onCollect();
        idx++;
        Object.assign(state, setPhaseStep(state, fase, idx));
        persist();
        if (idx >= all.length) return onCollect(); // sem bônus: última etapa coleta
        renderStep();
      },
    };

    step.render(stepHost, ctx);
  }

  renderStep();
}

// Etapa de texto padrão.
// cfg: { titulo, prompt, resposta (string|array), hints:[], placeholder, decorHTML, okMsg, errMsg }
export function textStep({ titulo, prompt, resposta, hints = [], placeholder = 'resposta',
                           decorHTML = '', errMsg = 'Hmm, não foi dessa vez 🎀' }) {
  return {
    titulo,
    render(host, ctx) {
      host.innerHTML = `${decorHTML}
        <p class="mb-2">${prompt}</p>
        <input id="ts-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="${placeholder}" />
        <button id="ts-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2 btn-glow">Conferir</button>`;
      ctx.hintButton(hints);
      const input = host.querySelector('#ts-input');
      const go = () => {
        if (answerMatches(input.value, resposta)) return ctx.solved();
        ctx.wrong();
        ctx.say(errMsg);
      };
      host.querySelector('#ts-btn').addEventListener('click', go);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    },
  };
}
