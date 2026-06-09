// NUNCA usa new Date() local para liberar fases (PRD §6.1).

export function mapWeekdayToPhase(weekday) {
  switch (weekday) {
    case 2: return { tipo: 'fase', fase: 1 };
    case 3: return { tipo: 'fase', fase: 2 };
    case 4: return { tipo: 'fase', fase: 3 };
    case 5: return { tipo: 'fase', fase: 4 };
    case 6: return { tipo: 'cofre' };
    default: return { tipo: 'bloqueado' }; // domingo/segunda
  }
}

// Cascade: worldtimeapi -> timeapi.io -> null. Each parses its own shape.
export async function fetchServerDate(fetchFn = fetch) {
  // 1) worldtimeapi
  try {
    const r = await fetchFn('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
    if (r.ok) { const j = await r.json(); if (j.datetime || j.dateTime) return new Date(j.datetime || j.dateTime); }
  } catch { /* fall through */ }
  // 2) timeapi.io
  try {
    const r = await fetchFn('https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo');
    if (r.ok) { const j = await r.json(); if (j.dateTime) return new Date(j.dateTime); }
  } catch { /* fall through */ }
  return null; // offline -> caller shows cute screen, does NOT release a phase
}

// Returns the weekday (0..6) in America/Sao_Paulo for a given Date.
export function saoPauloWeekday(date) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' });
  const map = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return map[fmt.format(date)];
}
