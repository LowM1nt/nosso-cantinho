// Quanto destravar de dica: por tentativas OU tempo real (o que vier primeiro).
export const DEFAULT_THRESHOLDS = [
  { errors: 5, ms: 480000 },    // nível 1: 5 erros ou 8 min
  { errors: 9, ms: 900000 },    // nível 2: 9 erros ou 15 min
  { errors: 14, ms: 1500000 },  // nível 3 (quase-resposta): 14 erros ou 25 min
];

export function unlockedHintLevel(attempts, elapsedMs, thresholds = DEFAULT_THRESHOLDS) {
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (attempts >= thresholds[i].errors || elapsedMs >= thresholds[i].ms) level = i + 1;
  }
  return level;
}
