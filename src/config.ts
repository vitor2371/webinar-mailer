import type { StepKey } from './schedule.js';
import { MONDAY_EMAIL_HTML } from './email-monday.js';
import {
  OFFER_FRI_SCHULE_HTML,
  OFFER_FRI_FAMILIE_HTML,
  OFFER_SA_LETZTER_HTML,
} from './email-offers.js';

// --- Brevo / negocio (valores fixos do brief) ---
export const BREVO_BASE = 'https://api.brevo.com/v3';
export const LIST_ID = 3;
export const SENDER = { name: 'Gregor Staub', email: 'support@gregorstaub.net' };
export const REPLY_TO_EMAIL = 'support@gregorstaub.net';
export const TZ = 'Europe/Berlin';

// Se o worker ficou fora do ar e um step ja passou ha mais de X horas, marca como enviado
// SEM disparar (evita mandar email muito atrasado).
export const STALE_SKIP_HOURS = 6;

// --- Ajustaveis por ambiente ---
export const SEND_DELAY_MS = Number(process.env.SEND_DELAY_MS ?? 150);
export const AUTO_ROLLOVER =
  process.env.AUTO_ROLLOVER === '1' || process.env.AUTO_ROLLOVER === 'true';

// --- Atributos de contato no Brevo ---
export const DATA_WEBINAR_ATTR = 'DATA_WEBINAR';
// CONFIRM_SENT_AT guarda o timestamp (ISO) do envio do CONFIRM.
// Brevo nao tem tipo "datetime" em atributo, entao usamos 'text'. Serve para agendar o WA (+3h).
export const CONFIRM_SENT_AT_ATTR = 'CONFIRM_SENT_AT';

export function wstepAttr(step: StepKey): string {
  return `WSTEP_${step}`;
}

// --- Definicao dos 9 emails (nome do template, assunto, URL do HTML) ---
export interface EmailDef {
  key: StepKey;
  templateName: string;
  subject: string;
  url?: string; // busca o HTML desta URL...
  html?: string; // ...ou usa este HTML inline (tem prioridade sobre url)
}

export const EMAILS: EmailDef[] = [
  {
    key: 'CONFIRM',
    templateName: 'Webinar 01 Confirmation',
    subject: 'Sie sind dabei — alles, was Sie für Mittwoch brauchen',
    url: 'https://webinar.megamemory.online/email-exports/webinar-confirmation.html',
  },
  {
    key: 'WA',
    templateName: 'Webinar 02 Montag',
    subject: 'Was die Schule Ihnen nie beigebracht hat',
    html: MONDAY_EMAIL_HTML,
  },
  {
    key: 'TUE',
    templateName: 'Webinar 07 Tuesday',
    subject: 'Morgen ist es soweit — der Link kommt in der WhatsApp-Gruppe',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-tuesday.html',
  },
  {
    key: 'WED10',
    templateName: 'Webinar 03 Wed10',
    subject: 'Heute, 19 Uhr — und etwas, das ich noch nie öffentlich erzählt habe',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-03.html',
  },
  {
    key: 'WED1830',
    templateName: 'Webinar 04 Wed1830',
    subject: 'In 30 Minuten beginnt Ihre MegaMemory-Klasse',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-04.html',
  },
  {
    key: 'WED19',
    templateName: 'Webinar 05 Live',
    subject: 'Es beginnt jetzt — Ihre MegaMemory-Klasse ist live',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-05.html',
  },
  {
    key: 'THU09',
    templateName: 'Webinar 06 Replay',
    subject: 'Falls Sie gestern Abend verpasst haben — die Aufzeichnung',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-06.html',
  },
  {
    key: 'FRI09',
    templateName: 'Webinar 08 Offer',
    subject: 'Was als nächstes kommt',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-friday.html',
  },
  {
    key: 'FRI20',
    templateName: 'Webinar 09 LastCall',
    subject: 'Heute Abend schließt es',
    url: 'https://webinar.megamemory.online/email-exports/webinar-seq-friday-evening.html',
  },
  {
    key: 'FRI13',
    templateName: 'Webinar 10 Fri Schule',
    subject: 'Was die Schule Ihnen nie über das Gedächtnis beigebracht hat',
    html: OFFER_FRI_SCHULE_HTML,
  },
  {
    key: 'FRI19',
    templateName: 'Webinar 11 Fri Familie',
    subject: 'Diese E-Mail ist nicht für Sie',
    html: OFFER_FRI_FAMILIE_HTML,
  },
  {
    key: 'SAT09',
    templateName: 'Webinar 12 Sa LetzterTag',
    subject: 'Heute ist der letzte Tag',
    html: OFFER_SA_LETZTER_HTML,
  },
];

export function getApiKey(): string {
  const k = process.env.BREVO_API_KEY;
  if (!k) {
    console.error(
      'ERRO: BREVO_API_KEY nao definido. Copie .env.example para .env e preencha a chave.',
    );
    process.exit(1);
  }
  return k;
}
