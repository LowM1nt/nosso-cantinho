// Coraçãozinho que sobe ao tocar nos botões principais (.btn-glow).
// Respeita "reduzir movimento" — não faz nada se o usuário pediu menos animação.
export function installTapHearts(win = window, doc = document) {
  const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const emojis = ['💖', '🎀', '💕', '✨', '🩷'];
  doc.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.btn-glow');
    if (!btn) return;
    const h = doc.createElement('span');
    h.className = 'tap-heart';
    h.textContent = emojis[(e.clientX + e.clientY) % emojis.length];
    h.style.left = e.clientX + 'px';
    h.style.top = e.clientY + 'px';
    doc.body.appendChild(h);
    setTimeout(() => h.remove(), 900);
  });
}
