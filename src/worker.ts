import { readFileSync } from 'node:fs';
import { BrevoClient, sleep } from './brevo.js';
import {
  AUTO_ROLLOVER,
  CONFIRM_SENT_AT_ATTR,
  DATA_WEBINAR_ATTR,
  LIST_ID,
  SEND_DELAY_MS,
  STALE_SKIP_HOURS,
  TZ,
  wstepAttr,
} from './config.js';
import {
  STEP_ORDER,
  nextWebinarWednesdayYmd,
  nextWednesday,
  targetForStep,
  type StepKey,
} from './schedule.js';

const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

type TemplateMap = Record<StepKey, number>;

function loadTemplateMap(): TemplateMap {
  try {
    return JSON.parse(readFileSync('brevo-templates.json', 'utf8'));
  } catch {
    console.error(
      'ERRO: brevo-templates.json nao encontrado. Rode `npm run setup` (com o app de HTML publicado) primeiro.',
    );
    process.exit(1);
  }
}

interface Plan {
  email: string;
  step: StepKey;
  action: 'send' | 'skip-stale';
  dataWebinar: string;
}

async function fetchAllContacts(brevo: BrevoClient): Promise<any[]> {
  const contacts: any[] = [];
  const limit = 500;
  let offset = 0;
  while (true) {
    const page = await brevo.getListContacts(LIST_ID, limit, offset);
    const list = page?.contacts ?? [];
    contacts.push(...list);
    if (list.length < limit) break;
    offset += limit;
  }
  return contacts;
}

async function main() {
  const brevo = new BrevoClient();
  const templates = loadTemplateMap();
  const now = new Date();
  const berlinNow = new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(now);

  console.log(
    `[worker] ${DRY_RUN ? 'DRY-RUN ' : ''}iniciando ${now.toISOString()} (Berlim: ${berlinNow})`,
  );

  const contacts = await fetchAllContacts(brevo);
  console.log(`[worker] ${contacts.length} contatos na lista ${LIST_ID}`);

  const plans: Plan[] = [];
  const rollovers: Array<{ email: string; from: string; to: string }> = [];
  const stamps: Array<{ email: string; date: string }> = [];
  let skippedBlocked = 0;

  for (const c of contacts) {
    if (c.emailBlacklisted) {
      skippedBlocked++;
      continue;
    }
    const attrs = c.attributes ?? {};
    let dataWebinar: string | undefined = attrs[DATA_WEBINAR_ATTR];
    if (!dataWebinar) {
      // Contato sem data: carimba a proxima quarta automaticamente.
      dataWebinar = nextWebinarWednesdayYmd(now);
      stamps.push({ email: c.email, date: dataWebinar });
    }
    for (const step of STEP_ORDER) {
      const flag = attrs[wstepAttr(step)];
      if (flag && flag === dataWebinar) continue; // ja enviado nesta semana

      const target = targetForStep(step, dataWebinar);
      if (target.kind === 'immediate') {
        plans.push({ email: c.email, step, action: 'send', dataWebinar });
        continue;
      }
      // kind === 'at'
      if (now < target.at) continue; // ainda nao chegou a hora
      const stale = now.getTime() > target.at.getTime() + STALE_SKIP_HOURS * 3600_000;
      plans.push({ email: c.email, step, action: stale ? 'skip-stale' : 'send', dataWebinar });
    }

    if (AUTO_ROLLOVER) {
      const fri20 = targetForStep('FRI20', dataWebinar);
      const fri20Flag = attrs[wstepAttr('FRI20')];
      if (fri20.kind === 'at' && fri20Flag === dataWebinar && now.getTime() > fri20.at.getTime()) {
        rollovers.push({ email: c.email, from: dataWebinar, to: nextWednesday(dataWebinar) });
      }
    }
  }

  const sends = plans.filter((p) => p.action === 'send');
  const skips = plans.filter((p) => p.action === 'skip-stale');
  console.log(
    `[worker] plano: ${stamps.length} carimbo(s) de DATA_WEBINAR, ${sends.length} envio(s), ` +
      `${skips.length} marcacao(oes) sem enviar (atrasados > ${STALE_SKIP_HOURS}h), ` +
      `${rollovers.length} rollover(s)`,
  );
  console.log(`[worker] ignorados: ${skippedBlocked} bloqueados/unsub`);

  // 1) Carimba DATA_WEBINAR nos contatos sem data (antes dos envios).
  for (const s of stamps) {
    console.log(`  CARIMBAR${DRY_RUN ? '(dry)' : '   '} ${s.email}  DATA_WEBINAR=${s.date}`);
    if (!DRY_RUN) await brevo.updateContact(s.email, { [DATA_WEBINAR_ATTR]: s.date });
  }

  // 2) Envios e marcacoes.
  for (const p of plans) {
    const tag = p.action === 'send' ? 'ENVIAR       ' : 'PULAR(atras.)';
    console.log(`  ${tag} ${p.step.padEnd(8)} ${p.email}  (semana ${p.dataWebinar})`);
    if (DRY_RUN) continue;

    if (p.action === 'send') {
      const templateId = templates[p.step];
      if (!templateId) {
        console.error(`  ! sem templateId para ${p.step}; rode o setup. Pulando.`);
        continue;
      }

      // ANOTA PRIMEIRO: grava o flag "ja enviei" ANTES de mandar.
      const upd: Record<string, unknown> = { [wstepAttr(p.step)]: p.dataWebinar };
      if (p.step === 'CONFIRM') upd[CONFIRM_SENT_AT_ATTR] = now.toISOString();
      await brevo.updateContact(p.email, upd);

      // CONFERE que a anotacao colou de verdade (defesa contra o Brevo
      // aceitar a gravacao mas nao persistir, como ocorreu na instabilidade de IP).
      const check = await brevo.getContact(p.email);
      if (check.attributes?.[wstepAttr(p.step)] !== p.dataWebinar) {
        console.error(
          `  ! flag ${wstepAttr(p.step)} NAO persistiu para ${p.email}; NAO envio ${p.step} para evitar duplicata. Tento na proxima rodada.`,
        );
        continue;
      }

      // So agora envia. Se o envio falhar, no maximo perde-se 1 email (raro), nunca duplica.
      try {
        await brevo.sendTransactional({ to: [{ email: p.email }], templateId });
      } catch (e: any) {
        console.error(
          `  ! ${p.step} para ${p.email} falhou no ENVIO apos anotar (${e?.message ?? e}). Ja marcado; verifique manualmente.`,
        );
      }
      await sleep(SEND_DELAY_MS);
    } else {
      // atrasado demais: marca como enviado sem disparar
      await brevo.updateContact(p.email, { [wstepAttr(p.step)]: p.dataWebinar });
    }
  }

  for (const r of rollovers) {
    console.log(`  ROLLOVER${DRY_RUN ? '(dry)' : '     '} ${r.email}  ${r.from} -> ${r.to}`);
    if (!DRY_RUN) await brevo.updateContact(r.email, { [DATA_WEBINAR_ATTR]: r.to });
  }

  console.log('[worker] concluido.');
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
