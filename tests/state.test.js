import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, loadState, saveState, collectFragment, markDayDone, recordWrongAttempt } from '../js/state.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
}

test('loadState returns default when empty', () => {
  const s = loadState(fakeStorage());
  assert.equal(s.versao, 1);
  assert.equal(s.faseAtual, 1);
  assert.deepEqual(s.fragmentosColetados, []);
  assert.equal(s.diasConcluidos.terca, false);
});

test('loadState recovers from corrupted JSON', () => {
  const st = fakeStorage();
  st.setItem('escapeRoomState', '{not valid json');
  const s = loadState(st);
  assert.deepEqual(s, defaultState());
});

test('saveState then loadState round-trips', () => {
  const st = fakeStorage();
  const s = defaultState();
  s.faseAtual = 3;
  saveState(st, s);
  assert.equal(loadState(st).faseAtual, 3);
});

test('collectFragment appends once and advances phase', () => {
  let s = defaultState();
  s = collectFragment(s, 1, 'HOT');
  assert.deepEqual(s.fragmentosColetados, ['HOT']);
  assert.equal(s.diasConcluidos.terca, true);
  assert.equal(s.faseAtual, 2);
  // idempotent: collecting the same phase again does nothing
  s = collectFragment(s, 1, 'HOT');
  assert.deepEqual(s.fragmentosColetados, ['HOT']);
});

test('recordWrongAttempt increments per phase', () => {
  let s = defaultState();
  s = recordWrongAttempt(s, 3);
  s = recordWrongAttempt(s, 3);
  assert.equal(s.tentativasErradas.fase3, 2);
});

test('markDayDone sets the right day', () => {
  let s = markDayDone(defaultState(), 2);
  assert.equal(s.diasConcluidos.quarta, true);
});
