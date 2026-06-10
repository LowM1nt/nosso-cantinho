import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerMatches } from '../js/engine/answer.js';

test('ignores accents/case/spaces', () => {
  assert.equal(answerMatches('  Iguatêmi ', 'iguatemi'), true);
  assert.equal(answerMatches('HELLO KITTY', 'hello kitty'), true);
});
test('accepts a list of valid answers', () => {
  assert.equal(answerMatches('2 anos', ['dois anos', '2 anos']), true);
  assert.equal(answerMatches('errado', ['dois anos', '2 anos']), false);
});
test('non-string input is safe', () => {
  assert.equal(answerMatches(null, 'x'), false);
});
