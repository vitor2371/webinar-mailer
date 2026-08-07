// Verificacao rapida do calculo de horarios (nao usa Brevo, nao precisa de API key).
// Uso: npm run check-time  ou  node --import tsx scripts/check-time.ts 2026-08-12
import { STEP_ORDER, targetForStep } from '../src/schedule.js';
import { TZ } from '../src/config.js';

const dataWebinar = process.argv[2] ?? '2026-08-12'; // uma quarta qualquer

console.log(`DATA_WEBINAR (W) = ${dataWebinar}  |  fuso ${TZ}\n`);

const fmt = new Intl.DateTimeFormat('de-DE', {
  timeZone: TZ,
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

for (const step of STEP_ORDER) {
  const t = targetForStep(step, dataWebinar);
  if (t.kind === 'immediate') {
    console.log(`${step.padEnd(8)} imediato (ao existir o contato)`);
  } else {
    console.log(`${step.padEnd(8)} ${fmt.format(t.at)}  (UTC ${t.at.toISOString()})`);
  }
}
