// HTML do email 2 (segunda, 19:00): "Was die Schule Ihnen nie beigebracht hat".
// Conteudo fornecido pelo cliente. O token {{ contact.FIRSTNAME }} e resolvido pelo Brevo.
export const MONDAY_EMAIL_HTML = `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:17px;line-height:1.6;">
        <tr><td>
          <p style="margin:0 0 16px 0;">{{ contact.FIRSTNAME }}, eine kurze Frage vor Mittwoch.</p>
          <p style="margin:0 0 16px 0;">Denken Sie an Ihre Schuljahre zurück. Wie viele Jahre haben Sie damit verbracht, Geschichte, Mathematik, Grammatik und Geographie zu lernen?</p>
          <p style="margin:0 0 16px 0;">Und jetzt sagen Sie mir: Hat Ihnen jemals jemand einen einzigen Tag damit verbracht, Ihnen beizubringen, wie man sich Dinge merkt?</p>
          <p style="margin:0 0 16px 0;">Nicht was Sie lernen sollen. Sondern wie Sie etwas wirklich in Ihrem Gehirn speichern, sodass es dort bleibt.</p>
          <p style="margin:0 0 16px 0;">Für die meisten Menschen lautet die Antwort: nein. Und das ist keine Kleinigkeit. Das ist das eigentliche Problem.</p>
          <p style="margin:0 0 16px 0;">Sie haben jahrelang Inhalte gelernt mit einem Gehirn, dem nie eine Bedienungsanleitung gegeben wurde. Kein Wunder, dass manches nicht hängen geblieben ist.</p>
          <p style="margin:0 0 16px 0;">Das hat nichts mit Intelligenz zu tun. Nichts mit dem Alter. Es liegt daran, dass Ihnen niemand je gezeigt hat, wie das Instrument funktioniert.</p>
          <p style="margin:0 0 16px 0;"><strong>Am Mittwoch um 19 Uhr ändert sich das.</strong></p>
          <p style="margin:0 0 16px 0;">Bis dann.</p>
          <p style="margin:0 0 24px 0;">Gregor Staub</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 20px 0;"/>
          <p style="margin:0 0 16px 0;font-size:15px;color:#444;">P.S. Falls Sie unserer WhatsApp-Gruppe noch nicht beigetreten sind: Dort erhalten Sie den Webinar-Link und exklusive Inhalte vor Mittwoch.</p>
          <p style="margin:0 0 12px 0;">
            <a href="https://shift-url.lovable.app/r/whatsapp" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;font-size:17px;">👉 Zur WhatsApp-Gruppe</a>
          </p>
          <p style="margin:0;font-size:14px;color:#666;word-break:break-all;">https://shift-url.lovable.app/r/whatsapp</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
