export function showScreen(id, doc = document) {
  doc.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  const target = doc.getElementById(id);
  if (!target) return;
  target.classList.remove('hidden');
  // transição de entrada: reinicia a animação a cada troca de tela
  target.classList.remove('screen-enter');
  void target.offsetWidth;
  target.classList.add('screen-enter');
}
