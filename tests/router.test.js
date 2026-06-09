import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showScreen } from '../js/router.js';

function fakeDoc(ids) {
  const els = new Map(ids.map(id => [id, { id, classList: new Set(),
    add(c){this.classList.add(c);}, remove(c){this.classList.delete(c);} }]));
  // wire classList methods properly
  for (const el of els.values()) {
    el.classList = { _s: new Set(['hidden']),
      add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} };
  }
  return { querySelectorAll: () => [...els.values()], getElementById: id => els.get(id) };
}

test('showScreen reveals target and hides the rest', () => {
  const doc = fakeDoc(['screen-login', 'screen-hub']);
  showScreen('screen-hub', doc);
  assert.equal(doc.getElementById('screen-hub').classList.contains('hidden'), false);
  assert.equal(doc.getElementById('screen-login').classList.contains('hidden'), true);
});
