import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distance, checkFase2 } from '../js/puzzles/fase2-mapa.js';

test('distance is euclidean', () => {
  assert.equal(distance({x:0,y:0}, {x:3,y:4}), 5);
});

test('checkFase2 true within radius, false outside', () => {
  const alvo = { x: 50, y: 50 };
  assert.equal(checkFase2({ x: 53, y: 52 }, alvo, 8), true);   // dist ~3.6 < 8
  assert.equal(checkFase2({ x: 70, y: 70 }, alvo, 8), false);  // dist ~28 > 8
});
