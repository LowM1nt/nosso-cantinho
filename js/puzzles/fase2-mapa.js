export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// click & alvo em coordenadas 0..100; raio = % da largura.
export function checkFase2(click, alvo, raioPct) {
  return distance(click, alvo) <= raioPct;
}
