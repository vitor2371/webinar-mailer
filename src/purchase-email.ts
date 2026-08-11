// Email de boas-vindas de COMPRA (disparado pelo webhook do Digistore, via Brevo).
// Nao faz parte da regua do webinario. Personalizacao por {{ params.FIRSTNAME }}
// (o webhook passa o primeiro nome do comprador, ou "Guten Tag" se vier vazio).

export const PURCHASE_TEMPLATE_NAME = 'Digistore Willkommen (Kauf)';
export const PURCHASE_SUBJECT = 'Willkommen bei megamemory — hier ist alles, was Sie brauchen';

export const PURCHASE_WELCOME_HTML = `<!doctype html>
<html lang="de">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2942;font-size:17px;line-height:1.6;">
            <tr><td style="padding:8px 24px;">
              <p style="margin:0 0 20px;">{{ params.FIRSTNAME }}</p>

              <p style="margin:0 0 16px;">Sie erhalten Ihren Zugangscode f&uuml;r MegaMemory innerhalb der n&auml;chsten 24 Stunden per E-Mail von Gregor Staub.</p>

              <p style="margin:0 0 16px;">Bei Fragen k&ouml;nnen Sie Gregor jederzeit unter der folgenden Nummer oder E-Mail-Adresse erreichen:</p>

              <p style="margin:0 0 6px;">&#128241; <a href="tel:+491735155691" style="color:#0b3d91;text-decoration:none;">+49 173 5155691</a></p>
              <p style="margin:0 0 20px;">&#128231; <a href="mailto:info@gregorstaub.com" style="color:#0b3d91;text-decoration:none;">info@gregorstaub.com</a></p>

              <p style="margin:0 0 4px;font-weight:700;">Team Gregor Staub</p>
              <p style="margin:0 0 4px;font-weight:700;">Gregor Staub — Ged&auml;chtnistraining &amp; mentale Fitness</p>
              <p style="margin:0;">&#128241; <a href="tel:+491735155691" style="color:#0b3d91;text-decoration:none;">+49 173 5155691</a> &middot; &#128231; <a href="mailto:info@gregorstaub.com" style="color:#0b3d91;text-decoration:none;">info@gregorstaub.com</a></p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
