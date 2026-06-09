import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapWeekdayToPhase, fetchServerDate } from '../js/timeGating.js';

test('mapWeekdayToPhase maps Tue..Sat to phases, blocks Sun/Mon', () => {
  // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  assert.deepEqual(mapWeekdayToPhase(1), { tipo: 'bloqueado' });          // segunda
  assert.deepEqual(mapWeekdayToPhase(2), { tipo: 'fase', fase: 1 });      // terça
  assert.deepEqual(mapWeekdayToPhase(3), { tipo: 'fase', fase: 2 });
  assert.deepEqual(mapWeekdayToPhase(4), { tipo: 'fase', fase: 3 });
  assert.deepEqual(mapWeekdayToPhase(5), { tipo: 'fase', fase: 4 });
  assert.deepEqual(mapWeekdayToPhase(6), { tipo: 'cofre' });              // sábado
  assert.deepEqual(mapWeekdayToPhase(0), { tipo: 'bloqueado' });          // domingo
});

test('fetchServerDate falls back to secondary API when primary fails', async () => {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    if (url.includes('worldtimeapi')) throw new Error('down');
    return { ok: true, json: async () => ({ dateTime: '2026-06-10T10:00:00-03:00' }) };
  };
  const d = await fetchServerDate(fakeFetch);
  assert.ok(d instanceof Date);
  assert.equal(calls.length, 2); // tried primary then secondary
});

test('fetchServerDate returns null when everything fails (never local clock)', async () => {
  const fakeFetch = async () => { throw new Error('offline'); };
  assert.equal(await fetchServerDate(fakeFetch), null);
});
