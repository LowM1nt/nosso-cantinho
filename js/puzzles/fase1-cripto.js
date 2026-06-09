import { normalizeText } from '../normalize.js';

export function decodeCipher(emojiString, legenda) {
  return [...emojiString].map(ch => legenda[ch] ?? ch).join('');
}

export function checkFase1(userInput, respostaEsperada) {
  return normalizeText(userInput) === normalizeText(respostaEsperada);
}
