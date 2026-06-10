import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, getPhaseStep, setPhaseStep } from '../js/state.js';

test('default step is 0', () => {
  assert.equal(getPhaseStep(defaultState(), 3), 0);
});
test('setPhaseStep is immutable and persists index', () => {
  const s0 = defaultState();
  const s1 = setPhaseStep(s0, 3, 2);
  assert.equal(getPhaseStep(s1, 3), 2);
  assert.equal(getPhaseStep(s0, 3), 0); // original unchanged
});
