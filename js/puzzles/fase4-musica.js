import { normalizeText } from '../normalize.js';

function stripFeat(s) { return s.replace(/\bfeat\b.*$/, '').replace(/\(.*?\)/g, ''); }

export function checkSong(userInput, respostaEsperada) {
  return normalizeText(stripFeat(userInput)) === normalizeText(stripFeat(respostaEsperada));
}
