import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeCipher, checkFase1 } from '../js/puzzles/fase1-cripto.js';

const legenda = { '🍓': 'A', '⭐': 'M', '🌸': 'R' };

test('decodeCipher maps emojis to letters', () => {
  assert.equal(decodeCipher('🍓⭐🍓🌸', legenda), 'AMAR');
});

test('checkFase1 accepts the right word ignoring case/accents', () => {
  assert.equal(checkFase1('Amar', 'amar'), true);
  assert.equal(checkFase1('AMAR', 'amar'), true);
  assert.equal(checkFase1('amor', 'amar'), false);
});
