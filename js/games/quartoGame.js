import { CONTENT } from '../content.js';
import { answerMatches } from '../engine/answer.js';

// Jogo pixel (desktop) da Fase 3: a gatinha anda pelo quarto (setas/WASD ou clique),
// olha objetos pra achar as pistas e digita o código. Mesmo resultado do puzzle mobile.
export function renderQuartoGame(host, ctx, doc = document) {
  const C = CONTENT.fase3;
  const clueFor = key => (C.objetos.find(o => o.chaves.includes(key)) || {}).texto || '...';
  const W = 300, H = 210;

  host.innerHTML = `
    <p class="mb-2 text-sm">🎮 Ande pelo quarto (<b>setas/WASD</b> ou clique nos objetos). Perto de algo, aperte <b>espaço</b> pra olhar. Ache o <b>código de 4 números</b>. 🗝️</p>
    <canvas id="quarto" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa mb-2"></canvas>
    <div id="dpad" class="flex justify-center gap-1 mb-2 select-none">
      <button data-k="left"  class="glass rounded-lg w-10 h-9 text-lg hover-lift">◀</button>
      <div class="flex flex-col gap-1">
        <button data-k="up"   class="glass rounded-lg w-10 h-9 text-lg hover-lift">▲</button>
        <button data-k="down" class="glass rounded-lg w-10 h-9 text-lg hover-lift">▼</button>
      </div>
      <button data-k="right" class="glass rounded-lg w-10 h-9 text-lg hover-lift">▶</button>
    </div>
    <div id="quarto-clue" class="text-sm bg-white/50 rounded-xl p-3 min-h-[3.5rem] mb-2">Explore o quarto, detetive... 🔍</div>
    <div class="flex gap-2">
      <input id="quarto-code" inputmode="numeric" maxlength="4"
        class="flex-1 rounded-full border-2 border-cereja px-4 py-2 text-center font-titulo" placeholder="código _ _ _ _" />
      <button id="quarto-go" class="rounded-full bg-cereja text-marfim font-titulo px-5 btn-glow">📔</button>
    </div>`;
  ctx.hintButton(C.hints1);

  const canvas = host.querySelector('#quarto');
  const S = 2; canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);
  const cluePanel = host.querySelector('#quarto-clue');
  const codeInput = host.querySelector('#quarto-code');

  const objetos = [
    { key: 'calendario', x: 24,  y: 28,  w: 24, h: 24, label: 'calendário' },
    { key: 'espelho',    x: 132, y: 26,  w: 18, h: 30, label: 'espelho' },
    { key: 'retrato',    x: 196, y: 30,  w: 26, h: 20, label: 'retrato' },
    { key: 'guarda',     x: 20,  y: 112, w: 32, h: 64, label: 'guarda-roupa' },
    { key: 'meia',       x: 96,  y: 150, w: 30, h: 20, label: 'gaveta' },
    { key: 'cama',       x: 212, y: 130, w: 70, h: 50, label: 'cama' },
    { key: 'quadro',     x: 250, y: 26,  w: 30, h: 24, label: 'quadro',  flavor: 'Um quadro tortinho. Você endireita — satisfação 🖼️ (sem pista)' },
    { key: 'planta',     x: 150, y: 150, w: 22, h: 30, label: 'planta',  flavor: 'Uma plantinha meio murcha. Precisa de água (e de amor) 🌱' },
    { key: 'abajur',     x: 72,  y: 62,  w: 16, h: 28, label: 'abajur',  flavor: 'Um abajur fofo. Ilumina o quarto, mas não revela nada 💡' },
    { key: 'tapete',     x: 116, y: 112, w: 44, h: 26, label: 'tapete',  flavor: 'Você olha embaixo do tapete... clássico! Mas só poeira ✨' },
  ];

  const kitty = { x: W / 2 - 7, y: H / 2, w: 14, h: 14, speed: 1.7 };
  const keys = new Set();
  let near = null;
  let raf = 0;

  // ---- desenho pixel ----
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function drawRoom() {
    px(0, 0, W, H, '#ffe3ec');                 // fundo
    px(0, 0, W, 22, '#f6c0d3');                // parede
    for (let x = 0; x < W; x += 8) for (let y = 22; y < H; y += 8)
      px(x, y, 7, 7, (x + y) % 16 === 0 ? '#ffd7e4' : '#ffe9f0'); // piso xadrez
    px(0, 20, W, 2, '#e79bb6');                // rodapé
  }

  function drawObj(o, active) {
    const { x, y, w, h, key } = o;
    if (active) { g.strokeStyle = '#ffd400'; g.lineWidth = 2; g.strokeRect(x - 2, y - 2, w + 4, h + 4); }
    if (key === 'calendario') {
      px(x, y, w, h, '#fff'); px(x, y, w, 5, '#D72638');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) px(x + 3 + i * 6, y + 8 + j * 4, 3, 2, '#f6a8c0');
    } else if (key === 'espelho') {
      px(x, y, w, h, '#caa56a'); px(x + 2, y + 2, w - 4, h - 4, '#dff3ff'); px(x + 4, y + 4, 4, h - 10, '#fff');
    } else if (key === 'retrato') {
      px(x, y, w, h, '#8a5a3c'); px(x + 2, y + 2, w - 4, h - 4, '#ffd7e4'); px(x + w / 2 - 1, y + h / 2 - 1, 3, 3, '#D72638');
    } else if (key === 'guarda') {
      px(x, y, w, h, '#a9744f'); px(x + 1, y + 1, w / 2 - 2, h - 2, '#bb8560'); px(x + w / 2 + 1, y + 1, w / 2 - 2, h - 2, '#bb8560');
      px(x + w / 2 - 2, y + h / 2, 2, 6, '#5e3b25'); px(x + w / 2 + 1, y + h / 2, 2, 6, '#5e3b25');
    } else if (key === 'meia') {
      px(x, y, w, h, '#b07f57'); px(x + 4, y + h / 2 - 1, w - 8, 2, '#5e3b25');
    } else if (key === 'cama') {
      px(x, y + h - 12, w, 12, '#a9744f');               // estrutura
      px(x + 2, y, w - 4, h - 10, '#ff9ec0');            // colchão
      px(x + 3, y + 2, 16, 10, '#fff');                  // travesseiro
      px(x + 2, y + h - 18, w - 4, 6, '#ff7aa8');        // dobra do edredom
    } else if (key === 'quadro') {
      px(x, y, w, h, '#8a5a3c'); px(x + 2, y + 2, w - 4, h - 4, '#cfe8f0'); px(x + 5, y + 5, 6, 6, '#ffd1dc');
    } else if (key === 'planta') {
      px(x + w / 2 - 2, y + h - 10, 4, 10, '#8a5a3c'); px(x + 2, y, w - 4, h - 10, '#7cc47c');
    } else if (key === 'abajur') {
      px(x + 1, y, w - 2, 8, '#ffe08a'); px(x + w / 2 - 1, y + 8, 2, h - 8, '#a9744f');
    } else if (key === 'tapete') {
      px(x, y + h / 2, w, h / 2, '#f3b6cf'); px(x + 4, y + h / 2 + 3, w - 8, 2, '#fff');
    }
    // rótulo
    g.fillStyle = '#6B4F4F'; g.font = '6px sans-serif'; g.textAlign = 'center';
    g.fillText(o.label, x + w / 2, y - 4 < 8 ? y + h + 8 : y - 4);
  }

  function drawKitty(x, y) {
    px(x + 1, y + 3, 12, 10, '#fff');
    px(x, y + 5, 1, 6, '#fff'); px(x + 13, y + 5, 1, 6, '#fff');   // bracinhos
    px(x + 1, y, 3, 4, '#fff'); px(x + 10, y, 3, 4, '#fff');        // orelhas
    px(x + 9, y - 1, 5, 3, '#D72638'); px(x + 11, y, 1, 1, '#fff'); // laço
    px(x + 4, y + 6, 1, 2, '#222'); px(x + 9, y + 6, 1, 2, '#222'); // olhos
    px(x + 6, y + 8, 2, 1, '#f4b400');                              // narizinho
  }

  function render() {
    drawRoom();
    objetos.forEach(o => drawObj(o, o === near));
    drawKitty(kitty.x, kitty.y);
    if (near) {
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, H - 12, W, 12);
      g.fillStyle = '#fff'; g.font = '7px sans-serif'; g.textAlign = 'center';
      g.fillText('espaço / clique: olhar ' + near.label, W / 2, H - 4);
    }
  }

  function update() {
    let dx = 0, dy = 0;
    if (keys.has('left')) dx -= 1; if (keys.has('right')) dx += 1;
    if (keys.has('up')) dy -= 1; if (keys.has('down')) dy += 1;
    if (dx || dy) { const m = Math.hypot(dx, dy) || 1; kitty.x += (dx / m) * kitty.speed; kitty.y += (dy / m) * kitty.speed; }
    kitty.x = Math.max(6, Math.min(W - kitty.w - 4, kitty.x));
    kitty.y = Math.max(24, Math.min(H - kitty.h - 4, kitty.y));
    const cx = kitty.x + kitty.w / 2, cy = kitty.y + kitty.h / 2;
    near = objetos.find(o => Math.hypot((o.x + o.w / 2) - cx, (o.y + o.h / 2) - cy) < 28) || null;
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();   // saiu da tela: encerra
    update(); render(); raf = requestAnimationFrame(loop);
  }

  function inspect(o) { if (o) cluePanel.textContent = o.flavor || clueFor(o.key); }

  // ---- controles ----
  const keymap = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
                   ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  function onKeyDown(e) {
    if (doc.activeElement === codeInput) return;           // digitando o código: ignora movimento
    const k = keymap[e.key] || keymap[e.key?.toLowerCase?.()];
    if (k) { keys.add(k); e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && near) { inspect(near); e.preventDefault(); }
  }
  function onKeyUp(e) {
    const k = keymap[e.key] || keymap[e.key?.toLowerCase?.()];
    if (k) keys.delete(k);
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  host.querySelectorAll('#dpad [data-k]').forEach(b => {
    const k = b.dataset.k;
    const down = e => { e.preventDefault(); keys.add(k); };
    const up = e => { e.preventDefault(); keys.delete(k); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
  });

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * W, my = ((e.clientY - r.top) / r.height) * H;
    const o = objetos.find(o => mx >= o.x - 2 && mx <= o.x + o.w + 2 && my >= o.y - 2 && my <= o.y + o.h + 2);
    if (o) { inspect(o); kitty.x = Math.max(6, Math.min(W - kitty.w - 4, o.x)); kitty.y = Math.min(o.y + o.h, H - kitty.h - 4); }
  });

  const go = () => {
    if (answerMatches(codeInput.value, C.codigo)) { cleanup(); return ctx.solved(); }
    ctx.wrong(); ctx.say('Esse código não abriu o cadeado 🔒');
    canvas.classList.remove('anim-shake'); void canvas.offsetWidth; canvas.classList.add('anim-shake');
  };
  host.querySelector('#quarto-go').addEventListener('click', go);
  codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); go(); } });

  function cleanup() {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  raf = requestAnimationFrame(loop);
}
