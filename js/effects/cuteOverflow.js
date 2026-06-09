// Disparado por hack attempt na fase 3. Inunda a tela e revela estrela secreta.
export function triggerCuteOverflow(onEasterEgg, doc = document) {
  const overlay = doc.createElement('div');
  overlay.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
  doc.body.appendChild(overlay);

  for (let i = 0; i < 40; i++) {
    const drop = doc.createElement('div');
    drop.textContent = Math.random() < 0.5 ? '🍓' : '🎀';
    drop.style.position = 'absolute';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.top = '-40px';
    drop.style.fontSize = '28px';
    drop.style.transition = 'transform 3s linear, opacity 3s linear';
    overlay.appendChild(drop);
    requestAnimationFrame(() => {
      drop.style.transform = `translateY(${doc.documentElement.clientHeight + 80}px)`;
      drop.style.opacity = '0.2';
    });
  }

  const err = doc.createElement('div');
  err.className = 'fixed top-1/3 left-1/2 -translate-x-1/2 bg-marfim text-cereja font-titulo '
    + 'rounded-2xl shadow-xl p-5 text-center z-50 max-w-xs pointer-events-auto';
  err.innerHTML = `CUTE_OVERFLOW_ERROR 🍓🎀<br><span class="text-sm font-corpo">
    Nível de fofura excedeu os limites. Dê um abraço no namorado para reiniciar.</span>
    <button id="cute-star" class="block mx-auto mt-3 text-3xl anim-bounce">⭐</button>`;
  doc.body.appendChild(err);

  err.querySelector('#cute-star').addEventListener('click', () => {
    onEasterEgg();
    err.querySelector('#cute-star').insertAdjacentHTML('afterend',
      '<p class="text-sm mt-2">✨ Você achou a estrelinha secreta! Dica bônus desbloqueada 💕</p>');
  });

  setTimeout(() => overlay.remove(), 3200);
}
