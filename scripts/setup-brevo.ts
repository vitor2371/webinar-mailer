import { writeFileSync } from 'node:fs';
import { BrevoClient } from '../src/brevo.js';
import {
  CONFIRM_SENT_AT_ATTR,
  DATA_WEBINAR_ATTR,
  EMAILS,
  REPLY_TO_EMAIL,
  SENDER,
  wstepAttr,
} from '../src/config.js';
import { STEP_ORDER } from '../src/schedule.js';

async function ensureAttribute(
  brevo: BrevoClient,
  name: string,
  type: 'date' | 'text',
): Promise<void> {
  try {
    await brevo.createAttribute(name, type);
    console.log(`  + atributo criado: ${name} (${type})`);
  } catch (e: any) {
    // Brevo devolve 400 quando o atributo ja existe: tratamos como OK (idempotente).
    if (e?.status === 400) {
      console.log(`  = atributo ja existe: ${name}`);
    } else {
      throw e;
    }
  }
}

async function fetchHtml(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e: any) {
    console.error(`\nERRO de rede ao buscar ${url}: ${e?.message ?? e}`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`\nERRO: ${url} retornou HTTP ${res.status}.`);
    console.error(
      'As URLs de HTML precisam estar PUBLICADAS antes do setup. Publique o app no Lovable e rode de novo.',
    );
    process.exit(1);
  }
  return res.text();
}

async function loadExistingTemplates(brevo: BrevoClient): Promise<Map<string, number>> {
  const byName = new Map<string, number>();
  const limit = 50;
  let offset = 0;
  while (true) {
    const page = await brevo.listTemplates(limit, offset);
    const list = page?.templates ?? [];
    for (const t of list) byName.set(t.name, t.id);
    if (list.length < limit) break;
    offset += limit;
  }
  return byName;
}

async function main() {
  const brevo = new BrevoClient();

  console.log('1) Atributos de contato');
  await ensureAttribute(brevo, DATA_WEBINAR_ATTR, 'date');
  await ensureAttribute(brevo, CONFIRM_SENT_AT_ATTR, 'text');
  for (const step of STEP_ORDER) await ensureAttribute(brevo, wstepAttr(step), 'date');

  console.log('2) Templates transacionais');
  const existing = await loadExistingTemplates(brevo);
  const mapping: Record<string, number> = {};

  for (const def of EMAILS) {
    const htmlContent = def.html ?? (await fetchHtml(def.url!));
    const payload = {
      templateName: def.templateName,
      subject: def.subject,
      htmlContent,
      sender: SENDER,
      replyTo: REPLY_TO_EMAIL,
      isActive: true,
    };

    const existingId = existing.get(def.templateName);
    if (existingId) {
      await brevo.updateTemplate(existingId, payload);
      mapping[def.key] = existingId;
      console.log(`  = atualizado: ${def.templateName} (id ${existingId})`);
    } else {
      const r = await brevo.createTemplate(payload);
      mapping[def.key] = r.id;
      console.log(`  + criado: ${def.templateName} (id ${r.id})`);
    }
  }

  writeFileSync('brevo-templates.json', JSON.stringify(mapping, null, 2) + '\n');
  console.log('\nOK. brevo-templates.json gravado:');
  console.log(JSON.stringify(mapping, null, 2));
  console.log('\nProximo passo: commit do brevo-templates.json e rode `npm run dry-run`.');
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
