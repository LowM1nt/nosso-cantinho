const KEY = 'escapeRoomState';
const DAY_BY_PHASE = { 1: 'terca', 2: 'quarta', 3: 'quinta', 4: 'sexta' };

export function defaultState() {
  return {
    versao: 1,
    faseAtual: 1,
    fragmentosColetados: [],
    diasConcluidos: { terca: false, quarta: false, quinta: false, sexta: false },
    tentativasErradas: { fase1: 0, fase2: 0, fase3: 0, fase4: 0 },
    easterEggDestravado: false,
    scannerConcluido: false,
    cofreAberto: false,
    dataInicio: null,
  };
}

export function loadState(storage) {
  const raw = storage.getItem(KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return migrate({ ...defaultState(), ...parsed });
  } catch {
    return defaultState();
  }
}

function migrate(s) {
  // versao permite migração futura; por enquanto só garante v1.
  s.versao = 1;
  return s;
}

export function saveState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function collectFragment(state, fase, valor) {
  const day = DAY_BY_PHASE[fase];
  if (state.diasConcluidos[day]) return state; // already done -> idempotent
  return {
    ...state,
    fragmentosColetados: [...state.fragmentosColetados, valor],
    diasConcluidos: { ...state.diasConcluidos, [day]: true },
    faseAtual: Math.min(fase + 1, 5),
  };
}

export function markDayDone(state, fase) {
  const day = DAY_BY_PHASE[fase];
  return { ...state, diasConcluidos: { ...state.diasConcluidos, [day]: true } };
}

export function recordWrongAttempt(state, fase) {
  const k = `fase${fase}`;
  return { ...state, tentativasErradas: { ...state.tentativasErradas, [k]: (state.tentativasErradas[k] || 0) + 1 } };
}
