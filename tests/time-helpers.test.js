import { test } from 'node:test';
import assert from 'node:assert/strict';
import { msUntilNextMidnightSP, formatHMS } from '../js/time-helpers.js';

test('formatHMS pads correctly', () => {
  assert.equal(formatHMS(0), '00:00:00');
  assert.equal(formatHMS(3661 * 1000), '01:01:01');
  assert.equal(formatHMS(5 * 1000), '00:00:05');
});

test('msUntilNextMidnightSP is positive and < 24h', () => {
  const now = new Date('2026-06-10T15:30:00-03:00');
  const ms = msUntilNextMidnightSP(now);
  assert.ok(ms > 0 && ms <= 24 * 3600 * 1000);
});
