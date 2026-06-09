import { CONFIG } from '../config.js';
import { collectFragment, recordWrongAttempt } from '../state.js';
import { sendWhatsApp } from '../notify.js';
import { decodeCipher, checkFase1 } from '../puzzles/fase1-cripto.js';
import { checkFase2 } from '../puzzles/fase2-mapa.js';
import { parseCommand, isHackAttempt } from '../puzzles/fase3-quarto.js';
import { checkSong } from '../puzzles/fase4-musica.js';
import { triggerCuteOverflow } from '../effects/cuteOverflow.js';
import { renderFadaScanner } from '../effects/fadaScanner.js';

const NOMES = { 1: 'Receita Secreta', 2: 'Mapa dos Encontros', 3: 'Organizador de Laços', 4: 'Caixinha de Música' };

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
    <div id="enigma-body" class="max-w-lg mx-auto bg-marfim rounded-3xl p-6"></div>
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
  if (fase === 3) renderFase3(body, msg, win, wrong, state, persist);
  if (fase === 4) renderFase4(body, msg, win, wrong, handlers);
}

// ---------- Fase 1: Criptografia ----------
function renderFase1(body, msg, win, wrong) {
  const { legenda, desafios } = CONFIG.fase1;
  const desafio = desafios[0];
  const legendaHTML = Object.entries(legenda).map(([e, l]) => `${e}=${l}`).join(' &nbsp; ');
  body.innerHTML = `
    <p class="mb-2">Decifre o ingrediente secreto 🍰</p>
    <p class="text-xl mb-1">${desafio.dica}</p>
    <p id="f1-legenda" class="text-sm mb-3">${legendaHTML}</p>
    <input id="f1-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="palavra" />
    <button id="f1-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2">Conferir</button>`;
  body.querySelector('#f1-btn').addEventListener('click', () => {
    if (checkFase1(body.querySelector('#f1-input').value, desafio.resposta)) return win();
    const n = wrong();
    msg.textContent = 'Hmm, não foi dessa vez 🍓';
    if (n >= 3) {
      // dica de fallback: revela a decodificação completa (PRD §8.1)
      body.querySelector('#f1-legenda').textContent = `Dica: ${decodeCipher(desafio.dica, legenda)}`;
    }
  });
}

// ---------- Fase 2: Mapa ----------
function renderFase2(body, msg, win, wrong) {
  const { alvo, raioAcertoPct, nomeLocal } = CONFIG.fase2;
  body.innerHTML = `
    <p class="mb-2">Onde foi ${nomeLocal}? Toque no mapa 🗺️👣</p>
    <div id="f2-map" class="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-rosa to-marfim cursor-crosshair overflow-hidden">
      <span class="absolute inset-0 flex items-center justify-center text-5xl opacity-40">🗺️</span>
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

// ---------- Fase 3: Quarto ----------
function renderFase3(body, msg, win, wrong, state, persist) {
  body.innerHTML = `
    <p class="mb-2">Explore o quarto digitando comandos (ex: "olhar escrivaninha") 🎀</p>
    <div id="f3-log" class="text-sm bg-rosa/30 rounded-xl p-3 h-32 overflow-y-auto mb-2"></div>
    <input id="f3-input" class="w-full rounded-full border-2 border-rosa px-4 py-2" placeholder="o que fazer?" />`;
  const log = body.querySelector('#f3-log');
  const input = body.querySelector('#f3-input');
  function append(t) { log.insertAdjacentHTML('beforeend', `<p>› ${t}</p>`); log.scrollTop = log.scrollHeight; }

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const val = input.value; input.value = '';
    if (isHackAttempt(val)) {
      append('Tentou hackear? 🍓');
      triggerCuteOverflow(() => { state.easterEggDestravado = true; persist(); });
      return;
    }
    const r = parseCommand(val, CONFIG.fase3);
    if (r.tipo === 'pista') { append(r.texto); return win(); }
    if (r.tipo === 'comando') return append(r.texto);
    append('Não encontrei nada por aí... 🌸');
    wrong();
  });
}

// ---------- Fase 4: Caixinha de Música ----------
function renderFase4(body, msg, win, wrong, handlers) {
  const musica = CONFIG.fase4.musicas[0];
  body.innerHTML = `
    <p class="mb-2">Que música é essa, em caixinha? 🎵</p>
    <audio controls src="${musica.arquivo}" class="w-full mb-3"></audio>
    <input id="f4-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="nome da música" />
    <button id="f4-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2">Conferir</button>`;
  body.querySelector('#f4-btn').addEventListener('click', () => {
    if (checkSong(body.querySelector('#f4-input').value, musica.resposta)) {
      // scanner da fada antes de concluir (PRD §9.2)
      body.innerHTML = '<p class="text-center">Música certa! Falta só uma coisinha... ✨</p>';
      renderFadaScanner(win);
    } else {
      wrong();
      msg.textContent = 'Hmm, escuta de novo 🎶';
    }
  });
}
