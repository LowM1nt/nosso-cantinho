import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand, isHackAttempt } from '../js/puzzles/fase3-quarto.js';

const cfg = {
  pistaFinal: { palavrasChave: ['caixinha', 'caixa'], texto: 'achou o fragmento DE' },
  comandos: [
    { palavrasChave: ['escrivaninha', 'mesa'], resposta: 'um bilhete' },
    { palavrasChave: ['cama', 'embaixo'], resposta: 'poeira fofa' },
  ],
};

test('matches keyword regardless of accent/case/extra words', () => {
  assert.deepEqual(parseCommand('Olhar a ESCRIVANINHA', cfg), { tipo: 'comando', texto: 'um bilhete' });
  assert.deepEqual(parseCommand('abrir a caixinha', cfg),      { tipo: 'pista', texto: 'achou o fragmento DE' });
});

test('unknown command returns nada', () => {
  assert.deepEqual(parseCommand('voar pela janela', cfg), { tipo: 'nada' });
});

test('isHackAttempt detects hack words', () => {
  assert.equal(isHackAttempt('hackear o sistema'), true);
  assert.equal(isHackAttempt('olhar mesa'), false);
});
