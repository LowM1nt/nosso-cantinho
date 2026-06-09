import { CONFIG } from './config.js';
import { loadState, saveState } from './state.js';
import { showScreen } from './router.js';
import { fetchServerDate, saoPauloWeekday, mapWeekdayToPhase } from './timeGating.js';
import { renderLogin } from './screens/login.js';
import { renderHub } from './screens/hub.js';
import { renderBloqueio } from './screens/bloqueio.js';
import { renderEnigma } from './screens/enigma.js';
import { renderCofre } from './screens/cofre.js';
import { installCharmGuard } from './effects/charmGuard.js';

const storage = window.localStorage;
let state = loadState(storage);
if (!state.dataInicio) { state.dataInicio = CONFIG.dataInicio; saveState(storage, state); }

function persist() { saveState(storage, state); }

function showOffline() {
  const el = document.getElementById('screen-hub');
  el.className = 'screen min-h-screen flex flex-col items-center justify-center p-6 text-center';
  el.innerHTML = `<div class="text-7xl mb-3 anim-float">☁️💤</div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">A nuvenzinha do tempo está dormindo 💤</h2>
    <p>Verifique sua internet e volte!</p>`;
  showScreen('screen-hub');
}

async function enterHub() {
  const serverDate = await fetchServerDate();
  if (!serverDate) return showOffline();          // never release on offline (PRD §6.3)
  const phase = mapWeekdayToPhase(saoPauloWeekday(serverDate));
  const faseHoje = phase.tipo === 'fase' ? phase.fase : (phase.tipo === 'cofre' ? 5 : 0);

  renderHub(state, faseHoje, (fase, atual) => {
    if (fase === 5 && phase.tipo === 'cofre') return goCofre();
    if (!atual) return goBloqueio('futuro');       // clicked a future/locked day
    if (state.diasConcluidos[dayKey(fase)]) return goBloqueio('concluido');
    goEnigma(fase);
  });
  showScreen('screen-hub');
}

function dayKey(fase) { return ['', 'terca', 'quarta', 'quinta', 'sexta'][fase]; }

function goBloqueio(motivo) { renderBloqueio(motivo); showScreen('screen-bloqueio'); }

function goEnigma(fase) {
  renderEnigma(fase, state, persist, {
    onSolved: () => { state = loadState(storage); goBloqueio('concluido'); },
    onBack: enterHub,
  });
  showScreen('screen-enigma');
}

function goCofre() { renderCofre(state, persist); showScreen('screen-cofre'); }

// Entry point: always start at Login.
installCharmGuard();
renderLogin(enterHub);
showScreen('screen-login');
