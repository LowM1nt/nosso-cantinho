// Jogo (desktop) da Fase 2: leve a gatinha (setas/WASD/dpad ou clique) até o lugar
// do nosso primeiro encontro 🛍️. Chega no certo -> onWin().
export function renderMapaGame(host, { onWin, onWrong, doc = document }) {
  const W = 320, H = 230;

  host.innerHTML = `
    <p class="mb-2 text-sm">🗺️ Leve a gatinha até onde foi <b>nosso primeiro encontro</b> 👣 (setas/WASD ou clique no mapa).</p>
    <canvas id="mapa" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa mb-2"></canvas>
    <div id="dpad" class="flex justify-center gap-1 mb-2 select-none">
      <button data-k="left"  class="glass rounded-lg w-10 h-9 text-lg hover-lift">◀</button>
      <div class="flex flex-col gap-1">
        <button data-k="up"   class="glass rounded-lg w-10 h-9 text-lg hover-lift">▲</button>
        <button data-k="down" class="glass rounded-lg w-10 h-9 text-lg hover-lift">▼</button>
      </div>
      <button data-k="right" class="glass rounded-lg w-10 h-9 text-lg hover-lift">▶</button>
    </div>
    <p id="mapa-msg" class="text-center text-cereja mt-1 h-5">Pra onde será? 🤔</p>`;

  const canvas = host.querySelector('#mapa');
  const S = 2; canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);
  const msgEl = host.querySelector('#mapa-msg');

  const locais = [
    { id: 'shopping', x: 232, y: 30,  w: 74, h: 56, label: 'shopping',   cor: '#f4a8c4', win: true,  txt: 'Aqui! Nosso primeiro encontro 💗' },
    { id: 'cafe',     x: 24,  y: 32,  w: 36, h: 28, label: 'café',       cor: '#b98a5e', win: false, txt: 'Um cafézinho gostoso... mas não foi aqui ☕' },
    { id: 'sorvete',  x: 132, y: 28,  w: 36, h: 26, label: 'sorveteria', cor: '#ffd27a', win: false, txt: 'Sorvete! 🍦 mas não rolou aqui' },
    { id: 'parque',   x: 34,  y: 150, w: 30, h: 42, label: 'parque',     cor: '#7cc47c', win: false, txt: 'O parque é lindo, mas não 🌳' },
    { id: 'cinema',   x: 228, y: 150, w: 72, h: 48, label: 'cinema',     cor: '#9aa6e0', win: false, txt: 'Cinema com pipoca 🍿 mas não foi aqui' },
    { id: 'flores',   x: 150, y: 168, w: 28, h: 22, label: 'flores',     cor: '#ff8fb1', win: false, txt: 'Que cheirinho de flores 🌷 mas não é aqui' },
  ];

  const kitty = { x: 152, y: H - 28, w: 14, h: 14, speed: 1.9 };
  const keys = new Set();
  let raf = 0, done = false, near = null;

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  // cenário decorativo
  const tufos = [];
  for (let i = 0; i < 34; i++) tufos.push({ x: (i * 53) % W, y: 36 + ((i * 71) % (H - 54)), c: ['#ff5e8a', '#ffd400', '#9a7bff', '#fff'][i % 4] });
  const arvores = [[6, 124], [298, 70], [150, 200], [292, 204], [120, 60]];

  function path(x, y, w, h) {
    px(x, y, w, h, '#e7d3a6');
    px(x, y, w, 2, '#d6bd84'); px(x, y + h - 2, w, 2, '#d6bd84');
    for (let i = 0; i < w; i += 9) for (let j = 0; j < h; j += 9) px(x + i + 3, y + j + 3, 2, 2, '#dcc593');
  }
  function tree(x, y) { px(x + 4, y + 10, 3, 7, '#8a5a32'); px(x, y, 11, 12, '#5fa84f'); px(x + 1, y - 3, 9, 5, '#6fbf5c'); px(x + 3, y + 2, 2, 2, '#8fd47a'); }
  function awning(x, y, w, c) { for (let i = 0; i < w - 2; i += 6) { px(x + i, y, 3, 4, c); px(x + i + 3, y, 3, 4, '#fff'); } }
  function windows(x, y, w, h) {
    for (let c = 0; c * 11 < w - 9; c++) for (let r = 0; r * 11 < h - 4; r++) {
      px(x + 6 + c * 11, y + 3 + r * 11, 7, 7, '#bfe6ff'); px(x + 6 + c * 11, y + 3 + r * 11, 7, 2, '#fff');
    }
  }

  function drawMap() {
    for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6)
      px(x, y, 6, 6, ((x / 6 + y / 6) | 0) % 2 === 0 ? '#aedd8e' : '#a4d683');
    tufos.forEach(f => { px(f.x, f.y + 2, 1, 2, '#5a8a3a'); px(f.x - 1, f.y, 3, 2, f.c); });
    path(W / 2 - 9, 50, 18, H - 50);
    path(20, 98, W - 40, 16);
  }

  function drawScenery() { arvores.forEach(([x, y]) => tree(x, y)); }

  function drawLocal(l) {
    const { x, y, w, h } = l;
    if (l === near) { g.strokeStyle = '#ffd400'; g.lineWidth = 2; g.strokeRect(x - 3, y - 3, w + 6, h + 6); }
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 3, y + h, w, 3);
    if (l.id === 'parque') {
      tree(x + 2, y + 4); tree(x + 15, y + 16);
      px(x + 2, y + h - 7, w - 4, 4, '#9a6b3f'); px(x + 3, y + h - 12, 2, 6, '#7a5230'); px(x + w - 5, y + h - 12, 2, 6, '#7a5230');
    } else if (l.id === 'flores') {
      px(x, y + h - 6, w, 6, '#8a5a3c');
      for (let i = 0; i < 4; i++) { px(x + 3 + i * 6, y + 1, 1, h - 7, '#5a8a3a'); px(x + 2 + i * 6, y - 1, 3, 3, ['#ff5e8a', '#ffd400', '#9a7bff', '#ff8fb1'][i % 4]); }
    } else {
      px(x, y, w, h, l.cor);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, w, 5);
      g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x, y + 5, w, 2);
      windows(x, y + 8, w, h - 18);
      px(x + w / 2 - 5, y + h - 12, 10, 12, '#7c5a4a');
      px(x + w / 2 + 2, y + h - 6, 1, 2, '#ffd400');
      if (l.id === 'cafe') awning(x, y + 6, w, '#e23a52');
      if (l.id === 'sorvete') { awning(x, y + 6, w, '#ff8fb1'); px(x + w / 2 - 1, y - 8, 2, 6, '#e8b06a'); px(x + w / 2 - 2, y - 11, 4, 4, '#ff9ec0'); }
      if (l.id === 'shopping') px(x + 5, y - 7, w - 10, 6, '#fff');
      if (l.id === 'cinema') { px(x + 3, y - 6, w - 6, 5, '#2b2b3b'); for (let i = 0; i < 4; i++) px(x + 7 + i * ((w - 14) / 3), y - 5, 2, 2, '#ffd400'); }
    }
    g.fillStyle = '#3b2b2b'; g.font = '7px sans-serif'; g.textAlign = 'center';
    g.fillText(l.label, x + w / 2, y + h + 9);
  }

  function drawKitty(x, y) {
    px(x + 1, y + 3, 12, 10, '#fff');
    px(x + 1, y, 3, 4, '#fff'); px(x + 10, y, 3, 4, '#fff');
    px(x + 9, y - 1, 5, 3, '#D72638');
    px(x + 4, y + 6, 1, 2, '#222'); px(x + 9, y + 6, 1, 2, '#222');
    px(x + 6, y + 8, 2, 1, '#f4b400');
  }

  function render() {
    drawMap();
    drawScenery();
    locais.forEach(drawLocal);
    drawKitty(kitty.x, kitty.y);
  }

  function update() {
    if (done) return;
    let dx = 0, dy = 0;
    if (keys.has('left')) dx -= 1; if (keys.has('right')) dx += 1;
    if (keys.has('up')) dy -= 1; if (keys.has('down')) dy += 1;
    if (dx || dy) { const m = Math.hypot(dx, dy) || 1; kitty.x += (dx / m) * kitty.speed; kitty.y += (dy / m) * kitty.speed; }
    kitty.x = Math.max(4, Math.min(W - kitty.w - 4, kitty.x));
    kitty.y = Math.max(4, Math.min(H - kitty.h - 4, kitty.y));
    const cx = kitty.x + kitty.w / 2, cy = kitty.y + kitty.h / 2;
    near = locais.find(l => cx > l.x - 8 && cx < l.x + l.w + 8 && cy > l.y - 8 && cy < l.y + l.h + 8) || null;
    if (near) {
      msgEl.textContent = near.txt;
      if (near.win) { done = true; cleanup(); setTimeout(onWin, 700); }
      else if (onWrong) { /* só feedback, sem punir muito */ }
    }
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();
    update(); render(); raf = requestAnimationFrame(loop);
  }

  const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  const kd = e => { const k = map[(e.key || '').toLowerCase()]; if (k) { keys.add(k); e.preventDefault(); } };
  const ku = e => { const k = map[(e.key || '').toLowerCase()]; if (k) keys.delete(k); };
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  host.querySelectorAll('#dpad [data-k]').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(k); });
    b.addEventListener('pointerup', e => { e.preventDefault(); keys.delete(k); });
    b.addEventListener('pointerleave', () => keys.delete(k));
  });
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    kitty.x = Math.max(4, Math.min(W - kitty.w - 4, ((e.clientX - r.left) / r.width) * W - kitty.w / 2));
    kitty.y = Math.max(4, Math.min(H - kitty.h - 4, ((e.clientY - r.top) / r.height) * H - kitty.h / 2));
  });

  function cleanup() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); }

  raf = requestAnimationFrame(loop);
}
