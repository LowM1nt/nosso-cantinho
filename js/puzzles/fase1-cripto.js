import { normalizeText } from '../normalize.js';

export function decodeCipher(emojiString, legenda) {
  return [...emojiString].map(ch => legenda[ch] ?? ch).join('');
}

export function checkFase1(userInput, respostaEsperada) {
  const norm = s => normalizeText(s).replace(/\s/g, ''); // ignora acento, caixa e espaços
  return norm(userInput) === norm(respostaEsperada);
}
