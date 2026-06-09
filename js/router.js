export function showScreen(id, doc = document) {
  doc.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  const target = doc.getElementById(id);
  if (target) target.classList.remove('hidden');
}
