import { normalizeText } from '../normalize.js';

const norm = s => normalizeText(String(s ?? '')).replace(/\s/g, '');

// Aceita uma resposta (string) ou várias (array). Ignora acento/caixa/espaço.
export function answerMatches(input, answer) {
  const got = norm(input);
  if (!got) return false;
  const list = Array.isArray(answer) ? answer : [answer];
  return list.some(a => got === norm(a));
}
