// Jogo (desktop) da Fase 2: leve a gatinha (setas/WASD/dpad ou clique) até o lugar
// do nosso primeiro encontro 🛍️. Chega no certo -> onWin().
export function renderMapaGame(host, { onWin, onWrong, doc = document }) {
  const W = 220, H = 150;

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
    { id: 'shopping', x: 146, y: 24, w: 54, h: 38, label: 'shopping', cor: '#f4a8c4', win: true, txt: 'Aqui! Nosso primeiro encontro 💗' },
    { id: 'cafe',     x: 22,  y: 26, w: 24, h: 20, label: 'café',     cor: '#b98a5e', win: false, txt: 'Um cafézinho gostoso... mas não foi aqui ☕' },
    { id: 'parque',   x: 28,  y: 98, w: 20, h: 26, label: 'parque',   cor: '#7cc47c', win: false, txt: 'O parque é lindo, mas não 🌳' },
    { id: 'flores',   x: 110, y: 110, w: 18, h: 14, label: 'flores',  cor: '#ff8fb1', win: false, txt: 'Que cheirinho de flores 🌷 mas não é aqui' },
  ];

  const kitty = { x: 60, y: H - 22, w: 14, h: 14, speed: 1.5 };
  const keys = new Set();
  let raf = 0, done = false, near = null;

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function drawMap() {
    px(0, 0, W, H, '#bfe3a6');                              // grama
    for (let x = 0; x < W; x += 9) for (let y = 0; y < H; y += 9) if ((x + y) % 18 === 0) px(x, y, 4, 4, '#b2dd96');
    px(W / 2 - 6, 40, 12, H - 40, '#e8d8b0');               // caminho vertical
    px(20, 70, W - 40, 10, '#e8d8b0');                      // caminho horizontal
  }

  function drawLocal(l) {
    if (l === near) { g.strokeStyle = '#ffd400'; g.lineWidth = 2; g.strokeRect(l.x - 2, l.y - 2, l.w + 4, l.h + 4); }
    px(l.x, l.y, l.w, l.h, l.cor);
    if (l.id === 'shopping') { px(l.x + 4, l.y + 4, l.w - 8, 8, '#fff'); px(l.x + 8, l.y + l.h - 12, 10, 12, '#caa2b6'); }
    if (l.id === 'cafe') px(l.x + l.w / 2 - 2, l.y - 4, 4, 5, '#fff');     // fumacinha
    if (l.id === 'parque') { px(l.x + l.w / 2 - 2, l.y + l.h, 4, 6, '#7a5230'); }
    g.fillStyle = '#3b2b2b'; g.font = '6px sans-serif'; g.textAlign = 'center';
    g.fillText(l.label, l.x + l.w / 2, l.y - 4 < 8 ? l.y + l.h + 8 : l.y - 4);
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
