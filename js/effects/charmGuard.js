// PRD §13: dissuasor de charme. NUNCA trava o jogo.
export function installCharmGuard(doc = document) {
  doc.addEventListener('contextmenu', e => {
    e.preventDefault();
    flash('Ei, espiã! 👀 Sem trapacear no jardim secreto 🎀', doc);
  });
  doc.addEventListener('keydown', e => {
    const blocked = e.key === 'F12'
      || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
      || (e.ctrlKey && e.key.toUpperCase() === 'U');
    if (blocked) { e.preventDefault(); flash('Ei, espiã! 👀 Sem trapacear no jardim secreto 🎀', doc); }
  });
}

function flash(text, doc) {
  let t = doc.getElementById('charm-toast');
  if (!t) {
    t = doc.createElement('div');
    t.id = 'charm-toast';
    t.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-marfim text-cereja '
      + 'font-titulo rounded-full px-5 py-2 shadow-lg z-50 transition-opacity';
    doc.body.appendChild(t);
  }
  t.textContent = text; t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 1800);
}
