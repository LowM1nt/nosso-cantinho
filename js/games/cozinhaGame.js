// Jogo (desktop) da Fase 1: pegue os ingredientes fofos na tigela (setas/A-D ou mouse),
// evite os estranhos. Encha a receita pra passar. Chama onWin() no fim.
export function renderCozinhaGame(host, { onWin, onWrong, doc = document }) {
  const W = 220, H = 170, GOAL = 8;
  const GOOD = ['🍓', '⭐', '🎀', '🌸', '🍰', '💖'];
  const BAD = ['🌶️', '🧦', '🦴', '🧅'];

  host.innerHTML = `
    <p class="mb-2 text-sm">🍰 A receita secreta! Pegue os <b>fofos</b> (🍓⭐🎀🌸🍰💖) e evite os estranhos. Setas/A-D ou mouse.</p>
    <canvas id="cozinha" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa mb-2"></canvas>
    <div class="flex items-center justify-between">
      <span id="cozinha-score" class="text-sm font-titulo">Receita: 0/${GOAL}</span>
      <span class="text-xs opacity-70">← → mover</span>
    </div>
    <p id="cozinha-msg" class="text-center text-cereja mt-1 h-5"></p>
    <button id="cozinha-restart" class="hidden mx-auto mt-1 block rounded-full bg-cereja text-marfim font-titulo px-5 py-2 btn-glow">💀 Recomeçar</button>`;

  const canvas = host.querySelector('#cozinha');
  const S = 2; canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);
  const scoreEl = host.querySelector('#cozinha-score');
  const msgEl = host.querySelector('#cozinha-msg');

  const bowl = { x: W / 2 - 18, y: H - 18, w: 36, h: 12, speed: 3 };
  const keys = new Set();
  let items = [], meter = 0, raf = 0, frame = 0, spawnCount = 0, done = false, lost = false;
  const restartBtn = host.querySelector('#cozinha-restart');

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function spawn() {
    spawnCount++;
    const bad = (spawnCount % 2 === 0);                 // metade estranhos (mais difícil de mirar)
    const set = bad ? BAD : GOOD;
    const e = set[spawnCount % set.length];
    items.push({ x: 12 + ((spawnCount * 47) % (W - 24)), y: -8, e, bad, spd: 1.2 + ((spawnCount % 4) * 0.18) });
  }

  function draw() {
    px(0, 0, W, H, '#fff4f8');
    for (let x = 0; x < W; x += 10) px(x, 0, 5, H, '#ffeaf2'); // listras de cozinha
    // tigela
    px(bowl.x, bowl.y, bowl.w, bowl.h, '#ff9ec0');
    px(bowl.x + 2, bowl.y - 3, bowl.w - 4, 4, '#ffd1dc');
    px(bowl.x - 3, bowl.y + 2, 3, 6, '#ff7aa8'); px(bowl.x + bowl.w, bowl.y + 2, 3, 6, '#ff7aa8');
    g.font = '15px serif'; g.textAlign = 'center';
    items.forEach(it => g.fillText(it.e, it.x, it.y));
  }

  function update() {
    if (done || lost) return;
    if (keys.has('left')) bowl.x -= bowl.speed;
    if (keys.has('right')) bowl.x += bowl.speed;
    bowl.x = Math.max(2, Math.min(W - bowl.w - 2, bowl.x));
    frame++;
    if (frame % 42 === 0) spawn();
    items.forEach(it => { it.y += it.spd; });
    // colisão com a tigela
    items = items.filter(it => {
      if (it.y >= bowl.y - 2 && it.y <= bowl.y + bowl.h && it.x >= bowl.x - 4 && it.x <= bowl.x + bowl.w + 4) {
        if (it.bad) { die(); return false; }
        meter++; flash('#34d399'); msgEl.textContent = 'Hmm, delícia 😋';
        scoreEl.textContent = `Receita: ${meter}/${GOAL}`;
        if (meter >= GOAL) win();
        return false;
      }
      return it.y < H + 10;
    });
  }

  let flashC = null, flashT = 0;
  function flash(c) { flashC = c; flashT = 8; }

  function render() {
    draw();
    if (flashT > 0) { g.fillStyle = flashC + ''; g.globalAlpha = flashT / 20; g.fillRect(0, 0, W, H); g.globalAlpha = 1; flashT--; }
    if (lost) {
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, H / 2 - 16, W, 32);
      g.fillStyle = '#fff'; g.font = '12px sans-serif'; g.textAlign = 'center';
      g.fillText('💀 Receita perdida!', W / 2, H / 2 + 4);
    }
  }

  function win() {
    if (done) return;
    done = true; msgEl.textContent = 'Receita pronta! 🍰💖';
    cleanup(); setTimeout(onWin, 700);
  }

  function die() {
    if (lost || done) return;
    lost = true; meter = 0; flash('#D72638');
    msgEl.textContent = 'Eca! Ingrediente estranho 💀 Receita perdida!';
    scoreEl.textContent = `Receita: 0/${GOAL}`;
    restartBtn.classList.remove('hidden');
    if (onWrong) onWrong();
  }

  function restart() {
    lost = false; meter = 0; items = []; frame = 0; spawnCount = 0;
    msgEl.textContent = ''; scoreEl.textContent = `Receita: 0/${GOAL}`;
    restartBtn.classList.add('hidden');
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();
    update(); render(); raf = requestAnimationFrame(loop);
  }

  const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
  const kd = e => { const k = map[(e.key || '').toLowerCase()]; if (k) { keys.add(k); e.preventDefault(); } };
  const ku = e => { const k = map[(e.key || '').toLowerCase()]; if (k) keys.delete(k); };
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    bowl.x = Math.max(2, Math.min(W - bowl.w - 2, ((e.clientX - r.left) / r.width) * W - bowl.w / 2));
  });
  restartBtn.addEventListener('click', restart);

  function cleanup() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); }

  raf = requestAnimationFrame(loop);
}
