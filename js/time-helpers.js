export function formatHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Milliseconds from `now` until the next 00:00 in America/Sao_Paulo.
export function msUntilNextMidnightSP(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now);
  const get = t => Number(parts.find(p => p.type === t).value);
  let h = get('hour'); if (h === 24) h = 0;
  const secsIntoDay = h * 3600 + get('minute') * 60 + get('second');
  return (24 * 3600 - secsIntoDay) * 1000;
}
