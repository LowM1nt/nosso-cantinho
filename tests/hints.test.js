import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unlockedHintLevel, DEFAULT_THRESHOLDS } from '../js/engine/hints.js';

test('no hint at start', () => {
  assert.equal(unlockedHintLevel(0, 0), 0);
});
test('unlocks by attempts', () => {
  assert.equal(unlockedHintLevel(3, 0), 1);
  assert.equal(unlockedHintLevel(6, 0), 2);
  assert.equal(unlockedHintLevel(10, 0), 3);
});
test('unlocks by elapsed time (ms)', () => {
  assert.equal(unlockedHintLevel(0, 240000), 1);   // 4 min
  assert.equal(unlockedHintLevel(0, 480000), 2);   // 8 min
  assert.equal(unlockedHintLevel(0, 900000), 3);   // 15 min
});
test('caps at number of thresholds', () => {
  assert.equal(unlockedHintLevel(999, 9999999), DEFAULT_THRESHOLDS.length);
});
