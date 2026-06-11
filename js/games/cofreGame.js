// Minigame (desktop) do Cofre: trave o cursor na zona verde 4x pra arrombar o cofre.
// Vai ficando mais rápido. Ao abrir, chama onOpen().
export function renderCofreGame(host, { onOpen, doc = document }) {
  const W = 220, H = 150;
  host.innerHTML = `
    <div class="text-center mb-2">
      <div class="text-6xl mb-1 anim-float">💎🔐</div>
      <h2 class="font-titulo text-2xl text-cereja">Arrombe o cofre!</h2>
      <p class="text-sm">Trave o cursor na <b>faixa rosa</b> — <b>6 vezes</b> pra abrir (fica mais rápido!) 💝</p>
    </div>
    <canvas id="cofreg" width="${W}" height="${H}" class="pixel-canvas rounded-xl border-2 border-rosa mb-2"></canvas>
    <button id="cofreg-lock" class="w-full rounded-full bg-cereja text-marfim font-titulo py-3 btn-glow">🔒 Travar (espaço)</button>
    <p id="cofreg-msg" class="text-center text-cereja mt-2 h-5"></p>`;

  const canvas = host.querySelector('#cofreg');
  const S = 2; canvas.width = W * S; canvas.height = H * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);
  const msg = host.querySelector('#cofreg-msg');

  const BARX = 16, BARW = W - 32, BARY = 96, BARH = 16, LOCKS = 6;
  let cursor = BARX, dir = 1, speed = 2.4, locked = 0, raf = 0, done = false;
  let zoneX = 0, zoneW = 0;
  function newZone() { zoneW = Math.max(15, 44 - locked * 5); zoneX = BARX + 16 + ((locked * 67) % (BARW - 32 - zoneW)); }
  newZone();

  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  function draw() {
    px(0, 0, W, H, '#ffe3ec');
    // cofre
    px(60, 6, 100, 74, '#9aa3ad'); px(64, 10, 92, 66, '#b7bfc8');
    px(70, 16, 80, 54, '#cdd4db');
    g.strokeStyle = '#7c848d'; g.lineWidth = 2; g.beginPath(); g.arc(110, 43, 16, 0, Math.PI * 2); g.stroke();
    px(109, 27, 2, 16, '#7c848d'); px(110, 42, 14, 2, '#7c848d');
    // cadeados (progresso)
    for (let i = 0; i < LOCKS; i++) px(68 + i * 14, 72, 11, 8, i < locked ? '#34d399' : '#e79bb6');
    // barra
    px(BARX, BARY, BARW, BARH, '#fff');
    px(zoneX, BARY, zoneW, BARH, '#ff7aa8');          // zona alvo
    px(cursor - 2, BARY - 4, 4, BARH + 8, '#D72638'); // cursor
  }

  function update() {
    if (done) return;
    cursor += dir * speed;
    if (cursor >= BARX + BARW) { cursor = BARX + BARW; dir = -1; }
    if (cursor <= BARX) { cursor = BARX; dir = 1; }
  }

  function loop() {
    if (!canvas.isConnected) return cleanup();
    update(); draw(); raf = requestAnimationFrame(loop);
  }

  function lock() {
    if (done) return;
    if (cursor >= zoneX && cursor <= zoneX + zoneW) {
      locked++; speed += 0.6; msg.textContent = `Tranca ${locked}/${LOCKS} aberta! 💚`;
      if (locked >= LOCKS) { done = true; msg.textContent = 'Cofre aberto! 💖'; cleanup(); setTimeout(onOpen, 500); return; }
      newZone();
    } else {
      msg.textContent = 'Quase! Tenta de novo 🌸';
      canvas.classList.remove('anim-shake'); void canvas.offsetWidth; canvas.classList.add('anim-shake');
    }
  }

  function onKey(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lock(); } }
  window.addEventListener('keydown', onKey);
  host.querySelector('#cofreg-lock').addEventListener('click', lock);

  function cleanup() { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); }

  raf = requestAnimationFrame(loop);
}
