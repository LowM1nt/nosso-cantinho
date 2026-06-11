// Jogo infinito "Flappy Kitty" pra passar o tempo na tela inicial.
// Toque/clique/espaço pra a gatinha voar. Desvie dos canos. Recorde salvo.
// Retorna uma função de limpeza (pra fechar o modal).
export function renderFlappy(host, { doc = document, win = window } = {}) {
  const W = 220, H = 280, S = 2;
  const GRAV = 0.3, FLAP = -3.8, SPD = 1.5, PIPE_W = 30, GAP = 86;

  host.innerHTML = `
    <canvas id="flappy" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa"></canvas>
    <p class="text-center text-xs mt-1 opacity-80">espaço / clique pra voar 🐱</p>`;

  const canvas = host.querySelector('#flappy');
  canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);

  let best = 0;
  try { best = Number(win.localStorage?.getItem('flappyBest') || 0); } catch { /* */ }

  const kitty = { x: 56, y: H / 2, w: 16, h: 14, vy: 0 };
  let pipes = [], score = 0, state = 'ready', raf = 0, t = 0;

  function reset() {
    kitty.y = H / 2; kitty.vy = 0; pipes = []; score = 0; t = 0; state = 'ready';
  }

  function addPipe() {
    const gapY = 36 + Math.floor(((t * 53) % 1000) / 1000 * (H - GAP - 80));
    pipes.push({ x: W + 4, gapY, passed: false });
  }

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function drawKitty(x, y) {
    px(x + 1, y + 3, 14, 10, '#fff');
    px(x + 1, y, 3, 4, '#fff'); px(x + 11, y, 3, 4, '#fff');
    px(x + 10, y - 1, 5, 3, '#D72638');
    px(x + 5, y + 6, 1, 2, '#222'); px(x + 11, y + 6, 1, 2, '#222');
    px(x + 8, y + 8, 2, 1, '#f4b400');
    px(x - 2, y + 5, 3, 5, '#ffd1dc');   // asinha
  }

  function draw() {
    // céu
    px(0, 0, W, H, '#ffe3ec');
    px(0, 0, W, 40, '#ffd1dc');
    px(28, 18, 22, 8, '#fff'); px(120, 30, 26, 9, '#fff'); px(170, 14, 18, 7, '#fff'); // nuvens
    // canos
    pipes.forEach(p => {
      px(p.x, 0, PIPE_W, p.gapY, '#ff7aa8'); px(p.x - 2, p.gapY - 6, PIPE_W + 4, 6, '#ff5e8a');
      const by = p.gapY + GAP;
      px(p.x, by, PIPE_W, H - by - 12, '#ff7aa8'); px(p.x - 2, by, PIPE_W + 4, 6, '#ff5e8a');
    });
    px(0, H - 12, W, 12, '#e79bb6');   // chão
    drawKitty(kitty.x, kitty.y);
    // placar
    g.fillStyle = '#6B4F4F'; g.font = '12px sans-serif'; g.textAlign = 'left';
    g.fillText('🎀 ' + score, 8, 16); g.textAlign = 'right'; g.fillText('rec ' + best, W - 8, 16);
    if (state !== 'playing') {
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, H / 2 - 28, W, 50);
      g.fillStyle = '#fff'; g.font = '11px sans-serif'; g.textAlign = 'center';
      g.fillText(state === 'ready' ? 'toque pra voar 🐱' : 'Game over! toque pra recomeçar', W / 2, H / 2 - 8);
      if (state === 'over') g.fillText('placar: ' + score + '   recorde: ' + best, W / 2, H / 2 + 8);
    }
  }

  function hit(p) {
    const k = kitty;
    if (k.x + k.w < p.x || k.x > p.x + PIPE_W) return false;
    return k.y < p.gapY || k.y + k.h > p.gapY + GAP;
  }

  function update() {
    if (state !== 'playing') return;
    t++;
    kitty.vy += GRAV; kitty.y += kitty.vy;
    if (t % 96 === 0) addPipe();
    pipes.forEach(p => { p.x -= SPD; if (!p.passed && p.x + PIPE_W < kitty.x) { p.passed = true; score++; } });
    pipes = pipes.filter(p => p.x > -PIPE_W - 6);
    if (kitty.y + kitty.h >= H - 12 || kitty.y <= 0 || pipes.some(hit)) gameOver();
  }

  function gameOver() {
    state = 'over';
    if (score > best) { best = score; try { win.localStorage?.setItem('flappyBest', String(best)); } catch { /* */ } }
  }

  function flap() {
    if (state === 'ready') { state = 'playing'; kitty.vy = FLAP; }
    else if (state === 'playing') kitty.vy = FLAP;
    else { reset(); state = 'playing'; kitty.vy = FLAP; }
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();
    update(); draw(); raf = requestAnimationFrame(loop);
  }

  function onKey(e) { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); } }
  win.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); flap(); });

  function cleanup() { cancelAnimationFrame(raf); win.removeEventListener('keydown', onKey); }

  raf = requestAnimationFrame(loop);
  return cleanup;
}
