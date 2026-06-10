import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unlockedHintLevel, DEFAULT_THRESHOLDS } from '../js/engine/hints.js';

test('no hint at start', () => {
  assert.equal(unlockedHintLevel(0, 0), 0);
});
test('unlocks by attempts', () => {
  assert.equal(unlockedHintLevel(5, 0), 1);
  assert.equal(unlockedHintLevel(9, 0), 2);
  assert.equal(unlockedHintLevel(14, 0), 3);
});
test('unlocks by elapsed time (ms)', () => {
  assert.equal(unlockedHintLevel(0, 480000), 1);    // 8 min
  assert.equal(unlockedHintLevel(0, 900000), 2);    // 15 min
  assert.equal(unlockedHintLevel(0, 1500000), 3);   // 25 min
});
test('caps at number of thresholds', () => {
  assert.equal(unlockedHintLevel(999, 9999999), DEFAULT_THRESHOLDS.length);
});
