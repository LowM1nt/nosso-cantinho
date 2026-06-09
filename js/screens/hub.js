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
  el.className = 'screen min-h-screen p-6';
  const cards = DIAS.map(d => {
    const concluido = d.key !== 'sabado' && state.diasConcluidos[d.key];
    const atual = d.fase === faseHoje;
    let visual, label;
    if (concluido)      { visual = 'bg-marfim border-4 border-emerald-300'; label = '🌈 💚'; }
    else if (atual)     { visual = 'bg-marfim border-4 border-cereja anim-shimmer cursor-pointer'; label = '✨ Hoje!'; }
    else                { visual = 'bg-gray-200 text-gray-400'; label = '😴🔒'; }
    return `<button data-fase="${d.fase}" data-atual="${atual}"
        class="rounded-3xl shadow p-5 flex flex-col items-center anim-float ${visual}">
        <span class="text-4xl mb-1">${d.emoji}</span>
        <span class="font-titulo">${d.nome}</span>
        <span class="text-sm mt-1">${label}</span>
      </button>`;
  }).join('');

  el.innerHTML = `
    <h1 class="font-titulo text-2xl text-cereja text-center mb-1">Jardim dos Laços 🎀</h1>
    <p class="text-center text-sm mb-5">Fragmentos: ${state.fragmentosColetados.join(' ') || '—'}</p>
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-3xl mx-auto">${cards}</div>`;

  el.querySelectorAll('button[data-fase]').forEach(btn => {
    btn.addEventListener('click', () => onPickDay(Number(btn.dataset.fase), btn.dataset.atual === 'true'));
  });
}
