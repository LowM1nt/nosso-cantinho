import { normalizeText } from '../normalize.js';

const HACK_WORDS = ['hackear', 'hack', 'sudo', 'cheat', 'trapacear'];

export function isHackAttempt(input) {
  const n = normalizeText(input);
  return HACK_WORDS.some(w => n.includes(w));
}

function matches(input, palavras) {
  const n = normalizeText(input);
  return palavras.some(p => n.includes(normalizeText(p)));
}

export function parseCommand(input, cfg) {
  if (matches(input, cfg.pistaFinal.palavrasChave)) return { tipo: 'pista', texto: cfg.pistaFinal.texto };
  for (const c of cfg.comandos) {
    if (matches(input, c.palavrasChave)) return { tipo: 'comando', texto: c.resposta };
  }
  return { tipo: 'nada' };
}
