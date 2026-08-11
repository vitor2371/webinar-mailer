// Rodape de descadastro anexado a TODOS os templates do Brevo.
// A tag {{ unsubscribe }} e resolvida pelo Brevo: ao clicar, o contato e marcado
// como descadastrado (blacklist). O worker ja ignora contatos com emailBlacklisted,
// entao a pessoa realmente para de receber.
export const UNSUB_FOOTER = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e5e7eb;">
  <tr>
    <td style="padding:16px 24px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a;">
      <p style="margin:0 0 6px;">Gregor Staub &middot; Ged&auml;chtnistraining &amp; mentale Fitness</p>
      <p style="margin:0;">Sie m&ouml;chten keine E-Mails mehr erhalten? <a href="{{ unsubscribe }}" style="color:#8a8a8a;text-decoration:underline;">Hier abmelden</a>.</p>
    </td>
  </tr>
</table>
`;

// Insere o rodape antes de </body> (ou no fim, se nao houver body).
export function withUnsubFooter(html: string): string {
  const idx = html.toLowerCase().lastIndexOf('</body>');
  if (idx !== -1) return html.slice(0, idx) + UNSUB_FOOTER + html.slice(idx);
  return html + UNSUB_FOOTER;
}
