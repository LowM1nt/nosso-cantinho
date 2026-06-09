export function normalizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .normalize('NFD')                       // split accents from letters
    .replace(/[̀-ͯ]/g, '')        // drop combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')           // punctuation -> space
    .replace(/\s+/g, ' ')                   // collapse whitespace
    .trim();
}
