import { imgFb } from '../ui-img.js';
import { openFlappy } from '../games/flappyModal.js';

const DIAS = [
  { fase: 1, key: 'terca',  nome: 'Terça',  emoji: '🍓' },
  { fase: 2, key: 'quarta', nome: 'Quarta', emoji: '🗺️' },
  { fase: 3, key: 'quinta', nome: 'Quinta', emoji: '🎀' },
  { fase: 4, key: 'sexta',  nome: 'Sexta',  emoji: '🎵' },
  { fase: 5, key: 'sabado', nome: 'Sábado', emoji: '🔐' },
];

// onPickDay(fase, atual) called when she clicks a day. faseHoje = liberada pela API (1..5 or 0 if none).
export function renderHub(state, faseHoje, onPickDay, doc = document) {
  const el = doc.getElementById('screen-hub');
  el.className = 'screen min-h-screen p-6 flex flex-col items-center justify-center';
  // liberação sequencial: só joga o próximo dia se os anteriores estiverem concluídos
  const prevDone = f => [1, 2, 3, 4].slice(0, f - 1).every(x => state.diasConcluidos[DIAS[x - 1].key]);
  const cards = DIAS.map(d => {
    const concluido = (d.key !== 'sabado' && state.diasConcluidos[d.key])
      || (d.fase === 5 && state.cofreAberto); // sábado vira "concluído" após abrir o cofre
    const dataChegou = faseHoje >= d.fase && faseHoje > 0;
    const jogavel = !concluido && dataChegou && prevDone(d.fase);
    let visual, label;
    if (concluido)        { visual = 'glass border-4 border-emerald-300 cursor-pointer hover-lift'; label = '🌈 rever'; }
    else if (jogavel)     { visual = 'glass-strong border-4 border-cereja anim-shimmer cursor-pointer hover-lift'; label = '✨ jogar!'; }
    else if (dataChegou)  { visual = 'bg-white/30 text-gray-500 border border-white/50 cursor-pointer'; label = '🔒 anteriores'; }
    else                  { visual = 'bg-white/30 text-gray-400 border border-white/50'; label = '😴🔒'; }
    return `<button data-fase="${d.fase}"
        class="rounded-3xl p-6 sm:py-10 flex flex-col items-center justify-center anim-float anim-fadeup ${visual}">
        <span class="text-5xl sm:text-6xl mb-2">${d.emoji}</span>
        <span class="font-titulo text-lg">${d.nome}</span>
        <span class="text-sm mt-1">${label}</span>
      </button>`;
  }).join('');

  el.innerHTML = `
    <div class="flex items-center justify-center gap-2 mb-1">
      ${imgFb('img/kitty-waving.png', { alt: '', cls: 'w-14 drop-shadow', fb: '🐱', fbCls: 'text-3xl' })}
      <h1 class="font-titulo text-3xl sm:text-4xl text-cereja text-center">Jardim dos Laços 🎀</h1>
    </div>
    <p class="text-center text-sm mb-8">Fragmentos: ${state.fragmentosColetados.join(' ') || '—'}</p>
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-5 sm:gap-6 w-full max-w-6xl mx-auto">${cards}</div>
    <div class="text-center mt-10">
      <button id="hub-flappy" class="rounded-full glass px-6 py-3 font-titulo text-cereja hover-lift">🎮 joguinho enquanto isso</button>
    </div>`;

  el.querySelector('#hub-flappy').addEventListener('click', () => openFlappy(doc));
  el.querySelectorAll('button[data-fase]').forEach(btn => {
    btn.addEventListener('click', () => onPickDay(Number(btn.dataset.fase)));
  });
}
