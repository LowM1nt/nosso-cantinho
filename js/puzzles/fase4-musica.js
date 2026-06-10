import { normalizeText } from '../normalize.js';

function stripFeat(s) { return s.replace(/\bfeat\b.*$/, '').replace(/\(.*?\)/g, ''); }

export function checkSong(userInput, respostaEsperada) {
  const norm = s => normalizeText(stripFeat(s)).replace(/\s/g, ''); // ignora feat, acento, caixa e espaços
  return norm(userInput) === norm(respostaEsperada);
}
