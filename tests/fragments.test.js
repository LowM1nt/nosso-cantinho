import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateVaultCombo } from '../js/fragments.js';

const esperado = { fase1: 'HOT', fase2: 'EL', fase3: 'DE', fase4: 'LUXO' };

test('accepts correct slots (case/space-insensitive)', () => {
  assert.equal(validateVaultCombo([' hot ', 'el', 'De', 'luxo'], esperado), true);
});

test('rejects wrong or out-of-order entries', () => {
  assert.equal(validateVaultCombo(['EL', 'HOT', 'DE', 'LUXO'], esperado), false);
  assert.equal(validateVaultCombo(['HOT', 'EL', 'DE', ''], esperado), false);
});
