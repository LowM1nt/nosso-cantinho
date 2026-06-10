// Camada de estrelinhas no fundo (atrás do conteúdo). Animação via CSS; respeita prefers-reduced-motion.
export function installStarfield(doc = document, count = 45) {
  if (doc.getElementById('starfield')) return;
  const layer = doc.createElement('div');
  layer.id = 'starfield';
  layer.setAttribute('aria-hidden', 'true');

  const glyphs = ['✦', '✧', '⭐', '🌟', '·', '✩'];
  for (let i = 0; i < count; i++) {
    const s = doc.createElement('span');
    s.className = 'star';
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.fontSize = `${6 + Math.random() * 12}px`;
    // duas animações: twinkle (opacidade) + drift (subir devagar)
    s.style.animationDuration = `${3 + Math.random() * 4}s, ${12 + Math.random() * 12}s`;
    s.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 8}s`;
    layer.appendChild(s);
  }

  // algumas estrelas cadentes ocasionais
  for (let i = 0; i < 3; i++) {
    const sh = doc.createElement('span');
    sh.className = 'shooting-star';
    sh.style.top = `${5 + Math.random() * 40}%`;
    sh.style.animationDelay = `${2 + i * 5 + Math.random() * 3}s`;
    layer.appendChild(sh);
  }

  doc.body.appendChild(layer);
}
