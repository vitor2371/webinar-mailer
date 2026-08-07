// Helpers de fuso horario sem dependencias externas.
// Convertem "hora de parede" em Europe/Berlin para instantes UTC, com DST correto.

// Offset (em minutos) que o fuso esta a frente do UTC, para um instante especifico.
export function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // alguns ambientes formatam meia-noite como 24
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  );
  return (asUTC - date.getTime()) / 60000;
}

// Converte uma hora de parede (ano/mes/dia/hora/min no fuso dado) para o instante UTC correto.
// Duas passadas para acertar o offset em torno de trocas de horario de verao.
export function zonedWallTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const off1 = getTimeZoneOffsetMinutes(timeZone, new Date(guess));
  const utc1 = guess - off1 * 60000;
  const off2 = getTimeZoneOffsetMinutes(timeZone, new Date(utc1));
  return new Date(guess - off2 * 60000);
}

export function parseYmd(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

export function formatUtcYmd(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Soma dias a uma data "YYYY-MM-DD" (aritmetica de calendario, sem fuso), retorna "YYYY-MM-DD".
export function addDaysYmd(s: string, days: number): string {
  const { y, m, d } = parseYmd(s);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatUtcYmd(dt);
}

// Data de hoje (YYYY-MM-DD) no fuso dado.
export function todayYmdInTz(timeZone: string, date: Date = new Date()): string {
  // en-CA formata como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
