// Quanto destravar de dica: por tentativas OU tempo real (o que vier primeiro).
export const DEFAULT_THRESHOLDS = [
  { errors: 3, ms: 240000 },   // nível 1: 3 erros ou 4 min
  { errors: 6, ms: 480000 },   // nível 2: 6 erros ou 8 min
  { errors: 10, ms: 900000 },  // nível 3 (quase-resposta): 10 erros ou 15 min
];

export function unlockedHintLevel(attempts, elapsedMs, thresholds = DEFAULT_THRESHOLDS) {
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (attempts >= thresholds[i].errors || elapsedMs >= thresholds[i].ms) level = i + 1;
  }
  return level;
}
