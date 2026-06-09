import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText } from '../js/normalize.js';

test('lowercases and strips accents', () => {
  assert.equal(normalizeText('Coração'), 'coracao');
  assert.equal(normalizeText('ÁÉÍÓÚ'), 'aeiou');
});

test('trims and collapses internal whitespace', () => {
  assert.equal(normalizeText('  olhar   escrivaninha  '), 'olhar escrivaninha');
});

test('removes punctuation', () => {
  assert.equal(normalizeText('Hotel, de Luxo!'), 'hotel de luxo');
});

test('handles empty and non-string input', () => {
  assert.equal(normalizeText(''), '');
  assert.equal(normalizeText(null), '');
  assert.equal(normalizeText(undefined), '');
});
