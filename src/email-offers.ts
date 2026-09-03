// HTML dos 3 emails de oferta novos (sexta 13h, sexta 19h, sábado 9h).
// Texto fornecido pelo cliente. {{ contact.FIRSTNAME }} é resolvido pelo Brevo.
// O rodapé de "cancelar inscrição" é anexado automaticamente pelo setup (withUnsubFooter).

const CTA_URL_SCHULE = 'https://inc.megamemory.online/?ds24tr=email_fr_schule';
const CTA_URL_FAMILIE = 'https://inc.megamemory.online/?ds24tr=email_fr_familie';
const CTA_URL_LETZTER = 'https://inc.megamemory.online/?ds24tr=email_sa_letztertag';
const CTA_LABEL = 'Jetzt für €249 sichern';

function para(text: string): string {
  return `<p style="margin:0 0 16px 0;">${text}</p>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0 8px 0;">
    <a href="${href}" style="display:inline-block;background:#E87722;color:#ffffff;text-decoration:none;padding:15px 28px;border-radius:6px;font-weight:700;font-size:17px;">${label}</a>
  </p>
  <p style="margin:0 0 16px 0;font-size:14px;color:#666;word-break:break-all;"><a href="${href}" style="color:#666;">${href}</a></p>`;
}

function wrap(inner: string): string {
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:17px;line-height:1.6;">
        <tr><td>
${inner}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Sexta 13h — "Was die Schule Ihnen nie über das Gedächtnis beigebracht hat"
export const OFFER_FRI_SCHULE_HTML = wrap(
  [
    para('{{ contact.FIRSTNAME }},'),
    para('Denken Sie an Ihre Schuljahre zurück.'),
    para(
      'Wie viele Jahre haben Sie damit verbracht, Geschichte, Mathematik, Grammatik und Geographie zu lernen?',
    ),
    para(
      'Und jetzt antworten Sie ehrlich: Hat Ihnen jemals jemand einen einzigen Tag damit verbracht, Ihnen beizubringen, wie Ihr Gehirn Informationen wirklich speichert?',
    ),
    para('Nicht was Sie sich merken sollen. Wie Sie es wirklich tun.'),
    para(
      'Für die meisten Menschen lautet die Antwort: nein. Und das ist keine Kleinigkeit. Das ist das eigentliche Problem.',
    ),
    para(
      'Sie haben jahrelang Inhalte gelernt mit einem Gehirn, dem nie eine Bedienungsanleitung gegeben wurde. Man hat Ihnen ein Ziel gegeben, aber keine Karte. Und irgendwann haben Sie angefangen zu glauben, dass das Vergessen einfach zu Ihnen gehört.',
    ),
    para('Es hat nie zu Ihnen gehört. Es war eine Lücke, die nie geschlossen wurde.'),
    para(
      'Die gute Nachricht: Eine Lücke, die nie geschlossen wurde, kann immer geschlossen werden. In jedem Alter. Mit der richtigen Methode.',
    ),
    para('Genau das ist megamemory.'),
    para(
      'Das Angebot ist noch bis Samstag um Mitternacht für €249 verfügbar. Danach geht der Preis zurück auf €450.',
    ),
    button(CTA_URL_SCHULE, CTA_LABEL),
    para('30-Tage-Garantie. Keine Fragen.'),
    para('Gregor Staub'),
  ].join('\n'),
);

// Sexta 19h — "Diese E-Mail ist nicht für Sie"
export const OFFER_FRI_FAMILIE_HTML = wrap(
  [
    para('{{ contact.FIRSTNAME }},'),
    para('Oder vielleicht doch. Lassen Sie mich erklären.'),
    para(
      'Die meisten Menschen, die zu Gregors Klasse kommen, kommen für sich selbst. Ein Name, der beim Abendessen verschwunden ist. Ein Wort, das mitten im Satz fehlte. Die stille Frustration eines Geistes, der früher anders funktioniert hat.',
    ),
    para('Aber manche denken dabei auch an jemand anderen.'),
    para(
      'An einen Partner, der denselben Abend zweimal erzählt. An einen Elternteil, dessen Pause vor Ihrem Namen ein bisschen länger geworden ist. An einen Freund, der lacht, aber Sie sehen, dass es ihn beschäftigt.',
    ),
    para('Wenn Ihnen gerade jemand in den Sinn gekommen ist, ist diese E-Mail auch für Sie.'),
    para(
      'megamemory enthält eine vollständige Familienlizenz. Ein Kauf. Jeder in Ihrem Haushalt erhält Zugang — auf seinem eigenen Gerät, in seinem eigenen Tempo, in seiner eigenen Zeit.',
    ),
    para(
      'Ein Ehepaar, das zusammen trainiert. Ein Elternteil und ein erwachsenes Kind. Eine Großmutter und ihre Enkelkinder.',
    ),
    para(
      'Die Methode funktioniert in jedem Alter. Gregors eigene Mutter hat in ihren Sechzigern angefangen. Mit 88 Jahren ist ihr Gedächtnis noch immer vollkommen scharf.',
    ),
    para('Das Angebot ist noch bis Samstag um Mitternacht für €249 verfügbar.'),
    button(CTA_URL_FAMILIE, CTA_LABEL),
    para('30-Tage-Garantie. Keine Fragen.'),
    para('Gregor Staub'),
  ].join('\n'),
);

// Sábado 9h — "Heute ist der letzte Tag"
export const OFFER_SA_LETZTER_HTML = wrap(
  [
    para('{{ contact.FIRSTNAME }},'),
    para('Heute um Mitternacht schließt das megamemory-Angebot.'),
    para('Der Preis geht zurück auf €450 und diese Seite verschwindet.'),
    para(
      'Wenn diese Woche etwas bei Ihnen angeklickt hat — in der Klasse, in der Aufzeichnung, in einer dieser E-Mails — dann ist heute der Moment, es umzusetzen.',
    ),
    para('Nicht wegen Druck. Weil das Fenster real ist.'),
    para('€249 bis heute Mitternacht.'),
    button(CTA_URL_LETZTER, CTA_LABEL),
    para(
      '30-Tage-Garantie. Keine Fragen. Wenn es für Sie nicht funktioniert, bekommen Sie jeden Euro zurück.',
    ),
    para('Gregor Staub'),
  ].join('\n'),
);
