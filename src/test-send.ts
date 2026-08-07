import { readFileSync } from 'node:fs';
import { BrevoClient, sleep } from './brevo.js';
import { EMAILS, SEND_DELAY_MS } from './config.js';
import type { StepKey } from './schedule.js';

// Envia 1 email de cada step para TEST_EMAIL, ignorando a regua.
// Serve para validar visual e autenticacao (SPF/DKIM/DMARC).
async function main() {
  const to = process.env.TEST_EMAIL;
  if (!to) {
    console.error('ERRO: defina TEST_EMAIL no .env');
    process.exit(1);
  }

  let templates: Record<StepKey, number>;
  try {
    templates = JSON.parse(readFileSync('brevo-templates.json', 'utf8'));
  } catch {
    console.error('ERRO: brevo-templates.json nao encontrado. Rode `npm run setup` primeiro.');
    process.exit(1);
  }

  const brevo = new BrevoClient();
  console.log(`Enviando 1 email de cada step para ${to} ...`);
  for (const def of EMAILS) {
    const templateId = templates[def.key];
    if (!templateId) {
      console.warn(`  ! sem templateId para ${def.key}, pulei`);
      continue;
    }
    // params.FIRSTNAME nao preenche o token {{ contact.FIRSTNAME }} se TEST_EMAIL nao for contato;
    // enviamos assim mesmo (o objetivo aqui e visual + entregabilidade).
    await brevo.sendTransactional({
      to: [{ email: to }],
      templateId,
      params: { FIRSTNAME: 'Vitor' },
    });
    console.log(`  enviado: ${def.key.padEnd(8)} ${def.templateName}`);
    await sleep(SEND_DELAY_MS);
  }
  console.log('OK. Confira a caixa de entrada e o cabecalho (SPF/DKIM/DMARC = pass).');
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
