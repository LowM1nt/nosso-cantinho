import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSong } from '../js/puzzles/fase4-musica.js';

test('checkSong ignores accents, case, and feat', () => {
  assert.equal(checkSong('Nossa Música', 'nossa musica'), true);
  assert.equal(checkSong('nossa musica (feat. alguem)', 'nossa musica'), true);
  assert.equal(checkSong('outra cancao', 'nossa musica'), false);
});
