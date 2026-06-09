// Slots fixos e ordenados (PRD §10): HOT | EL | DE | LUXO -> "HOTEL DE LUXO".
export function validateVaultCombo(inputs, esperado) {
  const want = [esperado.fase1, esperado.fase2, esperado.fase3, esperado.fase4];
  return inputs.length === 4 && want.every((w, i) =>
    String(inputs[i] ?? '').trim().toUpperCase() === w.toUpperCase());
}
