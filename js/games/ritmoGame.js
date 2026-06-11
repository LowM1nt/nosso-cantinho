import { CONFIG } from '../config.js';
import { CONTENT } from '../content.js';

// Jogo de ritmo (desktop) da Fase 4: notas caem em 4 pistas ao som da música.
// Acerte tocando D F J K (ou clicando nas colunas). Tem atalho "prefiro digitar" (nunca trava).
export function renderRitmoGame(host, ctx) {
  const src = CONFIG.fase4.musicas[0].arquivo;
  const W = 220, H = 200, LANES = 4, laneW = W / LANES;
  const HITY = H - 26, HITWIN = 17, PPS = 92;
  const LANE_KEYS = ['d', 'f', 'j', 'k'];
  const LANE_SEQ = [0, 2, 1, 3, 2, 0, 3, 1, 1, 3, 0, 2, 3, 1, 2, 0];  // usa as 4 colunas
  const LANE_COR = ['#3a2440', '#2f1d2d', '#412a3b', '#33203a'];
  const TOTAL = 60, PASS = 22, AUDIO_START = 26;   // dura ~30s; 22 acertos pra passar; começa ~26s pra frente
  const BEAT = 0.5;                                 // intervalo regular entre notas (ritmo coerente)

  host.innerHTML = `
    <p class="mb-2 text-sm">🎵 As notas caem na batida! Toque <b>D F J K</b> (ou clique nas colunas) quando a nota chegar na linha. 💖</p>
    <canvas id="ritmo" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa mb-2"></canvas>
    <div class="flex items-center justify-between gap-2">
      <button id="ritmo-start" class="rounded-full bg-cereja text-marfim font-titulo px-5 py-2 btn-glow">▶ Tocar</button>
      <span id="ritmo-score" class="text-sm font-titulo">0 / ${TOTAL}</span>
      <button id="ritmo-skip" class="text-xs underline opacity-80">prefiro digitar 🎵</button>
    </div>
    <audio id="ritmo-audio" src="${src}" preload="auto"></audio>`;
  ctx.hintButton(CONTENT.fase4.hints1);

  const canvas = host.querySelector('#ritmo');
  const S = 2; canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);
  const audio = host.querySelector('#ritmo-audio');
  audio.volume = 0.9;
  const scoreEl = host.querySelector('#ritmo-score');

  const pattern = Array.from({ length: TOTAL }, (_, i) =>
    ({ t: 1.5 + i * BEAT, lane: LANE_SEQ[i % LANE_SEQ.length], y: -20, hit: false, dead: false }));
  let notes = [], playing = false, hits = 0, raf = 0, startAt = 0, finished = false;
  const flash = [0, 0, 0, 0];

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function draw() {
    px(0, 0, W, H, '#2b1b2b');
    for (let l = 0; l < LANES; l++) {
      px(l * laneW, 0, laneW - 1, H, LANE_COR[l]);
      if (flash[l] > 0) { g.fillStyle = `rgba(255,120,170,${flash[l] / 12})`; g.fillRect(l * laneW, 0, laneW - 1, H); flash[l]--; }
    }
    px(0, HITY - 2, W, 4, '#ff7aa8');
    g.font = '8px sans-serif'; g.textAlign = 'center';
    for (let l = 0; l < LANES; l++) { g.fillStyle = '#ffd1dc'; g.fillText(LANE_KEYS[l].toUpperCase(), l * laneW + laneW / 2, HITY + 12); }
    notes.forEach(n => {
      const x = n.lane * laneW + laneW / 2;
      px(x - 7, n.y - 6, 14, 12, n.hit ? '#9be29b' : '#ff5e8a');
      px(x - 4, n.y - 3, 8, 6, '#fff');
    });
  }

  function move() {
    const now = (Date.now() - startAt) / 1000;
    notes = pattern.filter(p => !p.dead).map(p => {
      const dt = p.t - now;
      p.y = HITY - dt * PPS;
      if (!p.hit && p.y > HITY + HITWIN) p.dead = true;  // passou: miss
      return p;
    }).filter(p => p.y > -14);
  }

  function tryHit(lane) {
    if (!playing) return;
    const cand = pattern.find(p => !p.hit && !p.dead && p.lane === lane && Math.abs(p.y - HITY) <= HITWIN);
    if (cand) { cand.hit = true; cand.dead = true; hits++; flash[lane] = 12; scoreEl.textContent = `${hits} / ${TOTAL}`; }
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();
    if (playing) move();
    draw();
    const now = (Date.now() - startAt) / 1000;
    if (playing && !finished && now > pattern[pattern.length - 1].t + 1.3) finish();
    raf = requestAnimationFrame(loop);
  }

  function finish() {
    finished = true; playing = false;
    try { audio.pause(); } catch { /* */ }
    if (hits >= PASS) { ctx.say(`Mandou bem! ${hits} acertos 💖`); cleanup(); setTimeout(() => ctx.solved(), 600); }
    else { ctx.say(`Quase! ${hits} acertos. Toca de novo? ▶`); ctx.wrong(); }
  }

  function start() {
    if (playing) return;
    pattern.forEach((p, i) => { p.hit = false; p.dead = false; p.t = 1.5 + i * BEAT; p.y = -20; });
    hits = 0; finished = false; scoreEl.textContent = `0 / ${TOTAL}`;
    playing = true; startAt = Date.now();
    try { audio.currentTime = AUDIO_START; } catch { /* */ }
    audio.play().catch(() => { /* */ });
  }

  const keyLane = e => LANE_KEYS.indexOf((e.key || '').toLowerCase());
  function onKeyDown(e) { const l = keyLane(e); if (l >= 0) { tryHit(l); e.preventDefault(); } }
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    const lane = Math.floor(((e.clientX - r.left) / r.width) * LANES);
    tryHit(Math.max(0, Math.min(LANES - 1, lane)));
  });
  host.querySelector('#ritmo-start').addEventListener('click', start);
  host.querySelector('#ritmo-skip').addEventListener('click', () => {
    cleanup();
    host.innerHTML = `
      <p class="mb-2">Sem problema! Qual é o nome da música? 🎧</p>
      <audio controls src="${src}" class="w-full mb-3"></audio>
      <input id="f4-alt" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="nome da música" />
      <button id="f4-altbtn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2 btn-glow">Conferir</button>`;
    const inp = host.querySelector('#f4-alt');
    const go = () => {
      if (inp.value.toLowerCase().replace(/\s/g, '') === 'slowdown') return ctx.solved();
      ctx.wrong(); ctx.say('Hmm, escuta de novo 🎶');
    };
    host.querySelector('#f4-altbtn').addEventListener('click', go);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });

  function cleanup() { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKeyDown); try { audio.pause(); } catch { /* */ } }

  raf = requestAnimationFrame(loop);
}
