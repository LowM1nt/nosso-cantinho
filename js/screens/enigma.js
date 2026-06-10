import { CONFIG } from '../config.js';
import { CONTENT } from '../content.js';
import { collectFragment, recordWrongAttempt } from '../state.js';
import { sendWhatsApp } from '../notify.js';
import { normalizeText } from '../normalize.js';
import { decodeCipher, checkFase1 } from '../puzzles/fase1-cripto.js';
import { checkFase2 } from '../puzzles/fase2-mapa.js';
import { isHackAttempt } from '../puzzles/fase3-quarto.js';
import { triggerCuteOverflow } from '../effects/cuteOverflow.js';
import { renderFadaScanner } from '../effects/fadaScanner.js';
import { runPhase, textStep } from '../engine/phaseEngine.js';
import { answerMatches } from '../engine/answer.js';
import { imgFb } from '../ui-img.js';

const NOMES = { 1: 'Receita Secreta', 2: 'Mapa dos Encontros', 3: 'Detetive do Amor', 4: 'Caixinha de Música' };

// handlers: { onSolved, onBack }; persist() saves the (closure-captured) state.
export function renderEnigma(fase, state, persist, handlers, doc = document) {
  const el = doc.getElementById('screen-enigma');
  el.className = 'screen min-h-screen p-6';
  el.innerHTML = `
    <header class="flex justify-between items-center mb-4 max-w-lg mx-auto">
      <button id="enigma-back" class="text-sm underline">← jardim</button>
      <h2 class="font-titulo text-cereja">${NOMES[fase]}</h2>
      <span class="text-sm">${state.fragmentosColetados.length}/4 🎀</span>
    </header>
    <div id="enigma-body" class="max-w-lg mx-auto glass-strong rounded-3xl p-6 anim-fadeup"></div>
    <p id="enigma-msg" class="text-center text-cereja mt-3 h-6"></p>`;
  doc.getElementById('enigma-back').addEventListener('click', handlers.onBack);

  const body = doc.getElementById('enigma-body');
  const msg = doc.getElementById('enigma-msg');

  function win() {
    const fragmento = CONFIG.fragmentos[`fase${fase}`];
    const next = collectFragment(state, fase, fragmento);
    Object.assign(state, next);
    persist();
    sendWhatsApp(`🎀 Ela passou da Fase ${fase} (${NOMES[fase]})!`);
    msg.textContent = `Fragmento ${fragmento} coletado! 🎉`;
    setTimeout(handlers.onSolved, 1200);
  }

  function wrong() {
    const next = recordWrongAttempt(state, fase);
    Object.assign(state, next);
    persist();
    const n = state.tentativasErradas[`fase${fase}`];
    if (n === 4) sendWhatsApp(`😅 Ela errou ${n}x na Fase ${fase}...`);
    return n;
  }

  if (fase === 1) renderFase1(body, msg, win, wrong);
  if (fase === 2) renderFase2(body, msg, win, wrong);
  if (fase === 3) renderFase3v2(body, state, persist, win, wrong);
  if (fase === 4) renderFase4v2(body, state, persist, win, wrong, doc);
}

// ---------- Fase 1: Criptografia (leve) ----------
function renderFase1(body, msg, win, wrong) {
  const { legenda, desafios } = CONFIG.fase1;
  const desafio = desafios[0];
  const legendaHTML = Object.entries(legenda).map(([e, l]) => `${e}=${l}`).join(' &nbsp; ');
  body.innerHTML = `
    <div class="float-right -mt-2 ml-2">
      ${imgFb('img/galeria/kitty-bolo.png', { alt: 'gatinha confeiteira', cls: 'w-20 anim-float drop-shadow', fb: '🍰', fbCls: 'text-4xl' })}
    </div>
    <p class="mb-2">Decifre o ingrediente secreto 🍰</p>
    <p class="text-xl mb-1">${desafio.dica}</p>
    <p id="f1-legenda" class="text-sm mb-3">${legendaHTML}</p>
    <input id="f1-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="palavra" />
    <button id="f1-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2 btn-glow">Conferir</button>`;
  body.querySelector('#f1-btn').addEventListener('click', () => {
    if (checkFase1(body.querySelector('#f1-input').value, desafio.resposta)) return win();
    const n = wrong();
    msg.textContent = 'Hmm, não foi dessa vez 🍓';
    if (n >= 3) {
      body.querySelector('#f1-legenda').textContent = `Dica: ${decodeCipher(desafio.dica, legenda)}`;
    }
  });
}

// ---------- Fase 2: Mapa (leve) ----------
function renderFase2(body, msg, win, wrong) {
  const { alvo, raioAcertoPct, nomeLocal } = CONFIG.fase2;
  body.innerHTML = `
    <div class="float-right -mt-2 ml-2">
      ${imgFb('img/galeria/kitty-bolsa-viagem.png', { alt: 'gatinha passeando', cls: 'w-20 anim-float drop-shadow', fb: '🗺️🎀', fbCls: 'text-4xl' })}
    </div>
    <p class="mb-2">Toque no coraçãozinho 💗 — foi ali ${nomeLocal} 🗺️👣</p>
    <div id="f2-map" class="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-rosa via-marfim to-rosa cursor-pointer overflow-hidden border-2 border-rosa">
      <span class="absolute text-3xl" style="left:18%;top:24%">🌳</span>
      <span class="absolute text-3xl" style="left:74%;top:70%">☕</span>
      <span class="absolute text-3xl" style="left:30%;top:74%">🌷</span>
      <span class="absolute text-2xl opacity-60" style="left:48%;top:50%">🛍️</span>
      <span id="f2-alvo" class="absolute text-4xl anim-bounce -translate-x-1/2 -translate-y-1/2"
            style="left:${alvo.x}%;top:${alvo.y}%">💗</span>
    </div>`;
  const map = body.querySelector('#f2-map');
  map.addEventListener('click', e => {
    const r = map.getBoundingClientRect();
    const click = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    if (checkFase2(click, alvo, raioAcertoPct)) return win();
    wrong();
    const d = Math.round(Math.hypot(click.x - alvo.x, click.y - alvo.y));
    msg.textContent = `Quase lá! Faltam ~${d} passos 👣`;
  });
}

// ---------- Fase 3: Detetive do Amor (difícil, multi-etapa) ----------
function renderFase3v2(body, state, persist, win, wrong) {
  const C = CONTENT.fase3;

  // Etapa 1: vasculhar o quarto -> achar o código
  const etapa1 = {
    titulo: '🔍 Vasculhe o quarto',
    render(host, ctx) {
      const chips = C.objetos.map((o, i) =>
        `<button data-i="${i}" class="rounded-full bg-rosa/60 px-3 py-1 text-sm">🔍 ${o.chaves[0]}</button>`).join('');
      host.innerHTML = `
        <p class="mb-2">Procure pistas pelo quarto e ache o <b>código de 4 números</b> que abre o diário. 🗝️</p>
        <div class="flex flex-wrap gap-2 mb-2">${chips}</div>
        <div id="f3-log" class="text-sm bg-white/40 rounded-xl p-3 h-28 overflow-y-auto mb-2"></div>
        <input id="f3-expl" class="w-full rounded-full border-2 border-rosa px-4 py-2 mb-3" placeholder="o que investigar? (ex: calendário)" />
        <p class="mb-1 text-sm">Achou o código? Digita aqui:</p>
        <input id="f3-code" class="w-full rounded-full border-2 border-cereja px-4 py-2 text-center font-titulo" placeholder="_ _ _ _" inputmode="numeric" />
        <button id="f3-codebtn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2 btn-glow">Abrir o diário 📔</button>`;
      ctx.hintButton(C.hints1);
      const log = host.querySelector('#f3-log');
      const append = t => { log.insertAdjacentHTML('beforeend', `<p>› ${t}</p>`); log.scrollTop = log.scrollHeight; };
      function explore(val) {
        if (isHackAttempt(val)) {
          append('Tentou hackear? 🍓 Que safadinha.');
          triggerCuteOverflow(() => { state.easterEggDestravado = true; persist(); });
          return;
        }
        const n = normalizeText(val);
        const o = C.objetos.find(obj => obj.chaves.some(k => n.includes(k)));
        append(o ? o.texto : 'Nada de interessante por aí... 🌸');
      }
      host.querySelectorAll('[data-i]').forEach(b =>
        b.addEventListener('click', () => explore(C.objetos[+b.dataset.i].chaves[0])));
      const expl = host.querySelector('#f3-expl');
      expl.addEventListener('keydown', e => { if (e.key === 'Enter') { explore(expl.value); expl.value = ''; } });
      const code = host.querySelector('#f3-code');
      const tryCode = () => {
        if (answerMatches(code.value, C.codigo)) return ctx.solved();
        ctx.wrong(); ctx.say('Esse código não abriu o cadeado 🔒');
      };
      host.querySelector('#f3-codebtn').addEventListener('click', tryCode);
      code.addEventListener('keydown', e => { if (e.key === 'Enter') tryCode(); });
    },
  };

  // Etapa 2: cifra -> viagem
  const legendaHTML = Object.entries(C.cifra.legenda).map(([e, l]) => `${e}=${l}`).join(' &nbsp; ');
  const etapa2 = textStep({
    titulo: '📔 O diário abriu — decifre',
    prompt: `Dentro do diário, uma frase cifrada:<br><span class="text-2xl">${C.cifra.cifrado}</span><br><span class="text-sm">${legendaHTML}</span>`,
    resposta: C.cifra.resposta, hints: C.hints2, placeholder: 'palavra',
  });

  // Bônus: fragmento DE
  const bonus = textStep({
    titulo: '🎁 Baú secreto — o fragmento',
    prompt: `Embaixo da cama, um bilhete cifrado: <b>${C.bonus.cifrado}</b>. Que pedacinho é esse?`,
    resposta: C.bonus.resposta, hints: [C.bonus.dica], placeholder: 'fragmento',
  });

  runPhase(body, { fase: 3, steps: [etapa1, etapa2], bonus, state, persist,
    onCollect: win, onWrong: () => wrong() });
}

// ---------- Fase 4: Caixinha de Música (difícil, multi-etapa) ----------
function renderFase4v2(body, state, persist, win, wrong, doc) {
  const C = CONTENT.fase4;
  const musica = CONFIG.fase4.musicas[0];

  // Etapa 1: identificar a música
  const etapa1 = {
    titulo: '🎵 Que música é essa, em caixinha?',
    render(host, ctx) {
      host.innerHTML = `
        <p class="mb-2">Ouça com carinho e diga o nome da música 🎧</p>
        <audio controls src="${musica.arquivo}" class="w-full mb-3"></audio>
        <input id="f4-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="nome da música" />
        <button id="f4-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2 btn-glow">Conferir</button>`;
      ctx.hintButton(C.hints1);
      const inp = host.querySelector('#f4-input');
      const go = () => {
        if (answerMatches(inp.value, C.musicaResposta)) return ctx.solved();
        ctx.wrong(); ctx.say('Hmm, escuta de novo 🎶');
      };
      host.querySelector('#f4-btn').addEventListener('click', go);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    },
  };

  // Etapa 2: acróstico -> AMOR
  const listaHTML = `<ul class="text-left inline-block my-1">`
    + C.acrostico.titulos.map(t => `<li>🎵 ${t}</li>`).join('')
    + `<li class="opacity-60">🎵 ${C.acrostico.decoy}</li></ul>`;
  const etapa2 = textStep({
    titulo: '💿 A playlist de você',
    prompt: `As músicas que tocam quando penso em você:${listaHTML}Junte a <b>primeira letra</b> de cada uma (ignore a engraçadinha 😜):`,
    resposta: C.acrostico.resposta, hints: C.hintsAcrostico, placeholder: 'palavra secreta',
  });

  // Etapa 3: completar o verso
  const etapa3 = textStep({
    titulo: '🎶 Complete o verso',
    prompt: `"${C.verso.texto}"`,
    resposta: C.verso.resposta, hints: C.hintsVerso, placeholder: 'palavra que falta',
  });

  // Bônus: fragmento LUXO
  const bonusHTML = C.bonus.acrostico.map(w => `<b>${w[0]}</b>${w.slice(1)}`).join(' · ');
  const bonus = textStep({
    titulo: '🎁 Baú secreto — o fragmento',
    prompt: `Um acróstico só seu: ${bonusHTML}. Junte as iniciais:`,
    resposta: C.bonus.resposta, hints: [C.bonus.dica], placeholder: 'fragmento',
  });

  runPhase(body, { fase: 4, steps: [etapa1, etapa2, etapa3], bonus, state, persist, doc,
    onCollect: () => {
      body.innerHTML = '<p class="text-center">Tudo certo! Falta só uma coisinha... ✨</p>';
      renderFadaScanner(win, doc);
    },
    onWrong: () => wrong() });
}
