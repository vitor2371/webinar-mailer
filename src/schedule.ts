import { TZ } from './config.js';
import { addDaysYmd, parseYmd, todayYmdInTz, zonedWallTimeToUtc } from './time.js';

export type StepKey =
  | 'CONFIRM'
  | 'WA'
  | 'TUE'
  | 'WED10'
  | 'WED1830'
  | 'WED19'
  | 'THU09'
  | 'FRI09'
  | 'FRI20';

// Ordem cronologica em que os steps sao avaliados.
export const STEP_ORDER: StepKey[] = [
  'CONFIRM',
  'WA',
  'TUE',
  'WED10',
  'WED1830',
  'WED19',
  'THU09',
  'FRI09',
  'FRI20',
];

// Steps ancorados no relogio, relativos a W (a quarta em DATA_WEBINAR), em Europe/Berlin.
interface TimeSpec {
  dayOffset: number; // dias a partir de W
  hour: number;
  minute: number;
}

const TIME_SPECS: Record<Exclude<StepKey, 'CONFIRM'>, TimeSpec> = {
  WA: { dayOffset: -2, hour: 19, minute: 0 }, // segunda, 19:00 (2 dias antes da quarta)
  TUE: { dayOffset: -1, hour: 9, minute: 0 },
  WED10: { dayOffset: 0, hour: 10, minute: 0 },
  WED1830: { dayOffset: 0, hour: 18, minute: 30 },
  WED19: { dayOffset: 0, hour: 19, minute: 0 },
  THU09: { dayOffset: 1, hour: 9, minute: 0 },
  FRI09: { dayOffset: 2, hour: 9, minute: 0 },
  FRI20: { dayOffset: 2, hour: 20, minute: 0 },
};

export type Target =
  | { kind: 'immediate' } // CONFIRM: vence assim que o contato existe
  | { kind: 'at'; at: Date }; // horario-alvo concreto (instante UTC)

// Calcula o alvo de um step para um contato. dataWebinar = "YYYY-MM-DD" (a quarta do contato).
export function targetForStep(step: StepKey, dataWebinar: string): Target {
  if (step === 'CONFIRM') return { kind: 'immediate' };
  const spec = TIME_SPECS[step];
  const ymd = addDaysYmd(dataWebinar, spec.dayOffset);
  const { y, m, d } = parseYmd(ymd);
  return { kind: 'at', at: zonedWallTimeToUtc(y, m, d, spec.hour, spec.minute, TZ) };
}

// A proxima quarta depois da quarta atual (usado na renovacao semanal opcional).
export function nextWednesday(dataWebinar: string): string {
  return addDaysYmd(dataWebinar, 7);
}

// A quarta do proximo webinario (YYYY-MM-DD, em Europe/Berlin) a partir de agora.
// Regra: se hoje for quarta E antes das 19:00 Berlim, e hoje; senao, a quarta seguinte.
// Usado para preencher DATA_WEBINAR automaticamente em contatos que ainda nao a tem.
export function nextWebinarWednesdayYmd(now: Date): string {
  const today = todayYmdInTz(TZ, now);
  const { y, m, d } = parseYmd(today);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Dom .. 6=Sab; quarta = 3
  if (dow === 3) {
    const webinar = zonedWallTimeToUtc(y, m, d, 19, 0, TZ);
    return now.getTime() < webinar.getTime() ? today : addDaysYmd(today, 7);
  }
  const daysUntilWed = (3 - dow + 7) % 7; // 1..6
  return addDaysYmd(today, daysUntilWed);
}
