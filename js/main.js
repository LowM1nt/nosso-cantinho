import { CONFIG } from './config.js';
import { loadState, saveState, setPhaseStep } from './state.js';
import { showScreen } from './router.js';
import { fetchServerDate, saoPauloWeekday, mapWeekdayToPhase } from './timeGating.js';
import { renderLogin } from './screens/login.js';
import { renderHub } from './screens/hub.js';
import { renderBloqueio } from './screens/bloqueio.js';
import { renderEnigma } from './screens/enigma.js';
import { renderCofre } from './screens/cofre.js';
import { installCharmGuard } from './effects/charmGuard.js';
import { installStarfield } from './effects/starfield.js';
import { installTapHearts } from './effects/tapHearts.js';
import { installBgMusic } from './effects/bgMusic.js';
import { installImgFallback } from './ui-img.js';

const storage = window.localStorage;
// BYPASS-DEV: ?bypass na URL libera todas as fases (só pra teste). Remover depois.
const BYPASS = new URLSearchParams(window.location.search).has('bypass');

// Reset único por versão: ao subir uma versão nova, zera o progresso uma vez
// (pra pegar as atualizações e recomeçar do zero). Bump a string pra forçar reset.
const GAME_VERSION = 'v2-jogos-sequencial';
if (storage.getItem('gameVersion') !== GAME_VERSION) {
  storage.removeItem('escapeRoomState');
  storage.setItem('gameVersion', GAME_VERSION);
}

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
  if (!serverDate && !BYPASS) return showOffline();   // never release on offline (PRD §6.3)
  const phase = serverDate ? mapWeekdayToPhase(saoPauloWeekday(serverDate)) : { tipo: 'bypass' };
  const faseHoje = phase.tipo === 'fase' ? phase.fase : (phase.tipo === 'cofre' ? 5 : 0);

  // liberação sequencial + catch-up de dias perdidos
  const dayDone = f => (f === 5 ? state.cofreAberto : state.diasConcluidos[dayKey(f)]);
  const prevDone = f => [1, 2, 3, 4].slice(0, f - 1).every(x => state.diasConcluidos[dayKey(x)]);
  const dataChegou = f => faseHoje >= f && faseHoje > 0;

  renderHub(state, faseHoje, (fase) => {
    // BYPASS-DEV: libera qualquer dia/cofre sem checar data. Remover depois.
    if (BYPASS) return fase === 5 ? goCofre() : goEnigma(fase);
    if (dayDone(fase)) return fase === 5 ? goCofre() : goEnigma(fase, true);   // revisitar concluído
    if (!dataChegou(fase)) return goBloqueio('futuro');                         // a data ainda não chegou
    if (!prevDone(fase)) return goBloqueio('sequencia');                        // falta concluir dia anterior
    return fase === 5 ? goCofre() : goEnigma(fase);                            // pode jogar
  });
  showScreen('screen-hub');
}

function dayKey(fase) { return ['', 'terca', 'quarta', 'quinta', 'sexta'][fase]; }

function goBloqueio(motivo) { renderBloqueio(motivo, enterHub); showScreen('screen-bloqueio'); }

function goEnigma(fase, replay = false) {
  if (replay) { state = setPhaseStep(state, fase, 0); persist(); }   // revisita: reinicia as etapas
  renderEnigma(fase, state, persist, {
    // BYPASS ou revisita: volta pro jardim ao terminar (em vez de bloquear).
    onSolved: () => { state = loadState(storage); (BYPASS || replay) ? enterHub() : goBloqueio('concluido'); },
    onBack: enterHub,
  });
  showScreen('screen-enigma');
}

function goCofre() { renderCofre(state, persist); showScreen('screen-cofre'); }

// Entry point: always start at Login.
installImgFallback();   // habilita fallback de imagens antes de qualquer tela renderizar
installStarfield();     // estrelinhas no fundo
installTapHearts();     // coraçãozinho que sobe ao tocar nos botões
installBgMusic('audio/bg-music.mp3');  // música de fundo (chillpeach) em loop + botão de mudo
installCharmGuard();
renderLogin(enterHub);
showScreen('screen-login');
